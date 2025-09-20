// app/api/donations/route.ts
import { NextRequest, NextResponse } from 'next/server'
import Razorpay from 'razorpay'
import { SelectQuery } from '@/lib/database' // Adjust import path as needed

// Create Razorpay instance inside function to avoid build-time initialization
function getRazorpayInstance() {
  const keyId = process.env.RAZORPAY_KEY_ID;
  const keySecret = process.env.RAZORPAY_KEY_SECRET;

  if (!keyId || !keySecret) {
    throw new Error('Razorpay credentials not found. Please check RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET environment variables.');
  }

  return new Razorpay({
    key_id: keyId,
    key_secret: keySecret,
  });
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { cartItems, customDonationId, formData, totalAmount, donationAmount, tipAmount, userId } = body
    console.log("🚀 ~ PQWEOST ~ uasddwaawdWQEWEQserId:", userId)
    console.log("🚀 ~ POST ~ formData:", formData)
    
    // Validation
    if (!totalAmount || totalAmount <= 0) {
      return NextResponse.json(
        { error: 'Invalid total amount' },
        { status: 400 }
      )
    }
    if (!userId || userId <= 0) {
      return NextResponse.json(
        { error: 'Authorization failed! Please login and continue you donations♥️' },
        { status: 400 }
      )
    }
    if (!cartItems || (!Array.isArray(cartItems) && !donationAmount)) {
      return NextResponse.json(
        { error: 'Cart items or donation amount required' },
        { status: 400 }
      )
    }
    console.log("🚀 ~ PQWEOST ~ 098765433ERFGV:", userId)
    
    // Determine donation type
    const donationType = cartItems && cartItems.length > 0 ? 'product_based' : 'direct'
    
    // Get campaign ID (for direct donations, use the first available campaign or a default one)
    let campaignId = cartItems && cartItems.length > 0 ? cartItems[0].campaignId : null
    if(!campaignId || campaignId<=0 && Number(customDonationId) >0){
      campaignId = customDonationId
    }
    if (!campaignId) {
      // For direct donations, get an active campaign or create a default one
      const defaultCampaignQuery = `
        SELECT id FROM campaigns 
        WHERE status = 'Active'  
        ORDER BY created_at DESC LIMIT 1
      `
      const defaultCampaign = await SelectQuery(defaultCampaignQuery, [])
      // if (defaultCampaign.length > 0) {
      //   campaignId = defaultCampaign[0].id
      // } else {
      //   return NextResponse.json(
      //     { error: 'No active campaigns found' },
      //     { status: 400 }
      //   )
      // }
    }
    
    // Get Razorpay instance
    const razorpay = getRazorpayInstance();
    console.log("🚀 ~ PQWEOST ~ SAEDFAERRHRJYT786687786:", userId)
    
    // Create Razorpay order
    const orderOptions = {
      amount: Math.round(totalAmount * 100), // Amount in paise
      currency: 'INR',
      receipt: `donation_${Date.now()}`,
      notes: {
        donation_type: donationType,
        campaign_id: campaignId.toString(),
        user_id: userId?.toString() || 'anonymous',
        tip_amount: tipAmount.toString(),
        donation_amount: donationAmount.toString()
      }
    }
    console.log("🚀 ~ POST ~ orderOptions:", orderOptions)
    
    const razorpayOrder = await razorpay.orders.create(orderOptions)
    console.log("🚀 ~ POST ~ userIDDDDDDDDDd:", userId)
    
    // Insert payment request into database
    const insertPaymentRequestQuery = `
      INSERT INTO donation_payment_requests (
        campaign_id, user_id, razorpay_order_id, amount, currency, 
        donation_type, status
      ) VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING id
    `
    const paymentRequestParams = [
      campaignId,
      userId || null,
      razorpayOrder.id,
      totalAmount,
      'INR',
      donationType,
      'created'
    ]
    
    const paymentRequestResult = await SelectQuery(insertPaymentRequestQuery, paymentRequestParams)
    const paymentRequestId = paymentRequestResult[0].id
    
    // Store temporary data for processing after payment success
    const tempDataQuery = `
      INSERT INTO donation_temp_data (
        payment_request_id, cart_items, form_data, created_at
      ) VALUES ($1, $2, $3, CURRENT_TIMESTAMP)
    `
    await SelectQuery(tempDataQuery, [
      paymentRequestId,
      JSON.stringify(cartItems || []),
      JSON.stringify(formData || {})
    ])
    
    return NextResponse.json({
      success: true,
      orderId: razorpayOrder.id,
      amount: totalAmount,
      currency: razorpayOrder.currency,
      paymentRequestId: paymentRequestId,
      key: process.env.RAZORPAY_KEY_ID
    }, { status: 200 })
    
  } catch (error) {
    console.error('Error creating payment order:', error)
    return NextResponse.json(
      {
        error: 'Failed to create payment order',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

// GET - List donations with search, pagination, sorting, and filtering
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    
    // Pagination parameters
    const page = parseInt(searchParams.get('page') || '1');
    const pageSize = parseInt(searchParams.get('pageSize') || '10');
    const offset = (page - 1) * pageSize;
    
    // Search and filter parameters
    const search = searchParams.get('search'); // Search in donor name, campaign title
    const campaignId = searchParams.get('campaign_id');
    const userId = searchParams.get('user_id');
    const donationType = searchParams.get('donation_type');
    const minAmount = searchParams.get('min_amount');
    const maxAmount = searchParams.get('max_amount');
    const isPublic = searchParams.get('is_public');
    const impactGenerated = searchParams.get('impact_generated');
    
    // Date filters
    const startDate = searchParams.get('start_date');
    const endDate = searchParams.get('end_date');
    
    // Sorting parameters
    const sortBy = searchParams.get('sortBy') || 'donation_date';
    const sortOrder = searchParams.get('sortOrder') || 'DESC';
    
    // Build WHERE clause
    let whereClause = '';
    const params: any[] = [];
    let paramIndex = 1;
    
    // Global search across donor name and campaign title
    if (search) {
      whereClause += ` AND (u.full_name ILIKE $${paramIndex} OR c.title ILIKE $${paramIndex})`;
      params.push(`%${search}%`);
      paramIndex++;
    }
    
    // Specific field filters
    if (campaignId) {
      whereClause += ` AND d.campaign_id = $${paramIndex}`;
      params.push(parseInt(campaignId));
      paramIndex++;
    }
    
    if (userId) {
      whereClause += ` AND d.user_id = $${paramIndex}`;
      params.push(parseInt(userId));
      paramIndex++;
    }
    
    if (donationType) {
      whereClause += ` AND d.donation_type = $${paramIndex}`;
      params.push(donationType);
      paramIndex++;
    }
    
    if (minAmount) {
      whereClause += ` AND d.donation_amount >= $${paramIndex}`;
      params.push(parseFloat(minAmount));
      paramIndex++;
    }
    
    if (maxAmount) {
      whereClause += ` AND d.donation_amount <= $${paramIndex}`;
      params.push(parseFloat(maxAmount));
      paramIndex++;
    }
    
    if (isPublic !== null && isPublic !== '') {
      whereClause += ` AND d.is_public = $${paramIndex}`;
      params.push(isPublic === 'true');
      paramIndex++;
    }
    
    if (impactGenerated !== null && impactGenerated !== '') {
      whereClause += ` AND d.impact_generated = $${paramIndex}`;
      params.push(impactGenerated === 'true');
      paramIndex++;
    }
    
    if (startDate) {
      whereClause += ` AND d.donation_date >= $${paramIndex}`;
      params.push(startDate);
      paramIndex++;
    }
    
    if (endDate) {
      whereClause += ` AND d.donation_date <= $${paramIndex}`;
      params.push(endDate);
      paramIndex++;
    }
    
    // Validate sort column
    const allowedSortColumns = [
      'id', 'donation_amount', 'tip_amount', 'total_amount', 'donation_date', 
      'donation_type', 'is_public', 'impact_generated', 'beneficiaries_reached',
      'donor_name', 'campaign_title', 'created_at'
    ];
    const validSortBy = allowedSortColumns.includes(sortBy) ? sortBy : 'donation_date';
    const validSortOrder = ['ASC', 'DESC'].includes(sortOrder.toUpperCase()) ? sortOrder.toUpperCase() : 'DESC';
    
    // Main query to get donations with campaign and donor details
    const donationsQuery = `
      SELECT 
        d.id,
        d.user_id,
        u.full_name as donor_name,
        u.email as donor_email,
        d.campaign_id,
        c.title as campaign_title,
        c.image as campaign_image,
        cc.name as campaign_category,
        d.donation_amount,
        d.tip_amount,
        d.total_amount,
        d.donation_type,
        d.is_public,
        d.donation_date,
        d.donated_on_behalf_of,
        d.donor_message,
        d.impact_generated,
        d.beneficiaries_reached,
        d.razorpay_payment_id,
        
        -- Count of donation items for product-based donations
        COALESCE(di_count.item_count, 0) as product_items_count,
        COALESCE(di_count.total_quantity, 0) as total_product_quantity,
        
        -- Impact stories count
        COALESCE(impact_count.stories_count, 0) as impact_stories_count,
        
        d.created_at,
        d.updated_at
        
      FROM donations d
      LEFT JOIN users u ON d.user_id = u.id
      LEFT JOIN campaigns c ON d.campaign_id = c.id
      LEFT JOIN campaign_categories cc ON c.category_id = cc.id
      LEFT JOIN (
        SELECT 
          donation_id,
          COUNT(*) as item_count,
          SUM(quantity) as total_quantity
        FROM donation_items
        GROUP BY donation_id
      ) di_count ON d.id = di_count.donation_id
      LEFT JOIN (
        SELECT 
          donation_id,
          COUNT(*) as stories_count
        FROM donation_impact_tracking
        GROUP BY donation_id
      ) impact_count ON d.id = impact_count.donation_id
      
      WHERE 1=1 ${whereClause}
      ORDER BY 
        CASE 
          WHEN '${validSortBy}' = 'donor_name' THEN u.full_name
          WHEN '${validSortBy}' = 'campaign_title' THEN c.title
          ELSE NULL
        END ${validSortOrder},
        CASE 
          WHEN '${validSortBy}' = 'donation_amount' THEN d.donation_amount
          WHEN '${validSortBy}' = 'tip_amount' THEN d.tip_amount
          WHEN '${validSortBy}' = 'total_amount' THEN d.total_amount
          WHEN '${validSortBy}' = 'beneficiaries_reached' THEN d.beneficiaries_reached
          ELSE NULL
        END ${validSortOrder},
        CASE 
          WHEN '${validSortBy}' = 'donation_date' THEN d.donation_date
          WHEN '${validSortBy}' = 'created_at' THEN d.created_at
          ELSE NULL
        END ${validSortOrder},
        d.donation_date DESC
      LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
    `;
    
    params.push(pageSize, offset);
    
    // Count query for pagination
    const countQuery = `
      SELECT COUNT(*) as total
      FROM donations d
      LEFT JOIN users u ON d.user_id = u.id
      LEFT JOIN campaigns c ON d.campaign_id = c.id
      LEFT JOIN campaign_categories cc ON c.category_id = cc.id
      WHERE 1=1 ${whereClause}
    `;
    
    const countParams = params.slice(0, -2); // Remove limit and offset for count
    
    // Summary statistics query
    const statsQuery = `
      SELECT 
        COUNT(*) as total_donations,
        COALESCE(SUM(d.donation_amount), 0) as total_donation_amount,
        COALESCE(SUM(d.tip_amount), 0) as total_tip_amount,
        COALESCE(SUM(d.total_amount), 0) as total_amount,
        COUNT(CASE WHEN d.donation_type = 'direct' THEN 1 END) as direct_donations,
        COUNT(CASE WHEN d.donation_type = 'product_based' THEN 1 END) as product_based_donations,
        COUNT(CASE WHEN d.is_public = true THEN 1 END) as public_donations,
        COUNT(CASE WHEN d.impact_generated = true THEN 1 END) as donations_with_impact,
        COALESCE(SUM(d.beneficiaries_reached), 0) as total_beneficiaries_reached
      FROM donations d
      LEFT JOIN users u ON d.user_id = u.id
      LEFT JOIN campaigns c ON d.campaign_id = c.id
      LEFT JOIN campaign_categories cc ON c.category_id = cc.id
      WHERE 1=1 ${whereClause}
    `;
    
    // Execute queries
    const [donations, countResult, statsResult] = await Promise.all([
      SelectQuery(donationsQuery, params),
      SelectQuery(countQuery, countParams),
      SelectQuery(statsQuery, countParams)
    ]);
    
    const total = parseInt(countResult[0]?.total || '0');
    const totalPages = Math.ceil(total / pageSize);
    const stats = statsResult[0] || {};
    
    return NextResponse.json({
      donations,
      pagination: {
        page,
        pageSize,
        total,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1
      },
      statistics: {
        totalDonations: parseInt(stats.total_donations || '0'),
        totalDonationAmount: parseFloat(stats.total_donation_amount || '0'),
        totalTipAmount: parseFloat(stats.total_tip_amount || '0'),
        totalAmount: parseFloat(stats.total_amount || '0'),
        directDonations: parseInt(stats.direct_donations || '0'),
        productBasedDonations: parseInt(stats.product_based_donations || '0'),
        publicDonations: parseInt(stats.public_donations || '0'),
        donationsWithImpact: parseInt(stats.donations_with_impact || '0'),
        totalBeneficiariesReached: parseInt(stats.total_beneficiaries_reached || '0')
      }
    });
    
  } catch (error) {
    console.error('Error fetching donations:', error);
    return NextResponse.json(
      { 
        error: 'Failed to fetch donations', 
        details: error instanceof Error ? error.message : 'Unknown error' 
      },
      { status: 500 }
    );
  }
}