// app/api/donations/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { SelectQuery } from '@/lib/database'


// GET - Get donation detail by ID
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const donationId = parseInt(params.id)
    
    if (isNaN(donationId)) {
      return NextResponse.json(
        { error: 'Invalid donation ID' },
        { status: 400 }
      )
    }
    
    // Get donation details with related data
    const donationQuery = `
      SELECT 
        d.*,
        c.title as campaign_title,
        c.overview as campaign_overview,
        c.details as campaign_details,
        c.image as campaign_image,
        c.donation_goal,
        c.total_raised as campaign_total_raised,
        c.total_progress_percentage,
        c.total_beneficiary,
        c.location as campaign_location,
        c.organizer as campaign_organizer,
        c.status as campaign_status,
        cc.name as campaign_category,
        cc.description as campaign_category_description,
        dpr.razorpay_order_id,
        dpr.status as payment_status,
        dpr.created_at as payment_created_at,
        dpr.currency as payment_currency,
        u.full_name as user_name,
        u.first_name as user_first_name,
        u.last_name as user_last_name,
        u.email as user_email,
        u.mobile_no as user_mobile
      FROM donations d
      LEFT JOIN campaigns c ON c.id = d.campaign_id
      LEFT JOIN campaign_categories cc ON c.category_id = cc.id
      LEFT JOIN donation_payment_requests dpr ON dpr.id = d.donation_payment_request_id
      LEFT JOIN users u ON u.id = d.user_id
      WHERE d.id = $1
    `;
    
    const donationResult = await SelectQuery(donationQuery, [donationId])
    
    if (donationResult.length === 0) {
      return NextResponse.json(
        { error: 'Donation not found' },
        { status: 404 }
      )
    }

    const donation = donationResult[0]

    // Get donation items if it's a product-based donation
    let donationItems: any = []
    if (donation.donation_type === 'product_based') {
      const itemsQuery = `
        SELECT 
          di.*,
          cp.description as campaign_product_description,
          cp.price as campaign_product_price,
          cp.stock as campaign_product_stock,
          ip.id as independent_product_id,
          ip.name as product_name,
          ip.description as product_description,
          ip.image as product_image,
          ip.min_qty,
          ip.max_qty,
          ip.increment_count,
          ip.is_flexible_increment_count,
          ip.allows_personalization,
          ip.status as product_status,
          cpu.name as unit_name,
          cpu.abbreviation as unit_abbreviation
        FROM donation_items di
        LEFT JOIN campaign_products cp ON cp.id = di.campaign_product_id
        LEFT JOIN indipendent_products ip ON cp.indipendent_product_id = ip.id
        LEFT JOIN campaign_product_units cpu ON ip.unit_id = cpu.id
        WHERE di.donation_id = $1
        ORDER BY di.id
      `
      
      donationItems = await SelectQuery(itemsQuery, [donationId])
    }

    // Get personalization options
    const personalizationQuery = `
      SELECT * FROM personalization_options 
      WHERE donation_id = $1 OR donation_item_id IN (
        SELECT id FROM donation_items WHERE donation_id = $1
      )
      ORDER BY id
    `
    
    const personalization = await SelectQuery(personalizationQuery, [donationId])

    // Get impact stories if donation has generated impact
    let impactStories: any = []
    if (donation.impact_generated) {
      const impactQuery = `
        SELECT 
          dit.*,
          ist.title as story_title,
          ist.story_content,
          ist.impact_summary,
          ist.image_urls as story_images,
          ist.video_urls as story_videos,
          ist.people_helped as story_people_helped,
          ist.families_helped,
          ist.communities_helped,
          ist.location as story_location,
          ist.impact_date,
          ist.is_published,
          ist.featured,
          db.batch_name,
          db.actual_distribution_date,
          db.actual_location as batch_location,
          db.status as batch_status
        FROM donation_impact_tracking dit
        LEFT JOIN impact_stories ist ON dit.impact_story_id = ist.id
        LEFT JOIN distribution_batches db ON dit.batch_id = db.id
        WHERE dit.donation_id = $1
        ORDER BY dit.created_at DESC
      `
      
      impactStories = await SelectQuery(impactQuery, [donationId])
    }

    // Format the response with better structure
    const response = {
      // Basic donation info
      id: donation.id,
      donation_amount: parseFloat(donation.donation_amount),
      tip_amount: parseFloat(donation.tip_amount || 0),
      total_amount: parseFloat(donation.total_amount),
      donation_type: donation.donation_type,
      is_public: donation.is_public,
      donation_date: donation.donation_date,
      donated_on_behalf_of: donation.donated_on_behalf_of,
      donor_message: donation.donor_message,
      impact_generated: donation.impact_generated,
      beneficiaries_reached: donation.beneficiaries_reached || 0,
      created_at: donation.created_at,
      updated_at: donation.updated_at,
      
      // Payment info
      razorpay_payment_id: donation.razorpay_payment_id,
      razorpay_signature: donation.razorpay_signature,
      razorpay_order_id: donation.razorpay_order_id,
      payment_status: donation.payment_status,
      payment_created_at: donation.payment_created_at,
      payment_currency: donation.payment_currency || 'INR',
      
      // Formatted amounts
      total_amount_formatted: parseFloat(donation.total_amount).toLocaleString('en-IN', {
        style: 'currency',
        currency: donation.payment_currency || 'INR'
      }),
      donation_amount_formatted: parseFloat(donation.donation_amount).toLocaleString('en-IN', {
        style: 'currency',
        currency: donation.payment_currency || 'INR'
      }),
      tip_amount_formatted: parseFloat(donation.tip_amount || 0).toLocaleString('en-IN', {
        style: 'currency',
        currency: donation.payment_currency || 'INR'
      }),
      
      // User/Donor info
      user: donation.user_id ? {
        id: donation.user_id,
        name: donation.user_name,
        first_name: donation.user_first_name,
        last_name: donation.user_last_name,
        email: donation.user_email,
        mobile: donation.user_mobile
      } : null,
      
      // Campaign info
      campaign: {
        id: donation.campaign_id,
        title: donation.campaign_title,
        overview: donation.campaign_overview,
        details: donation.campaign_details,
        image: donation.campaign_image,
        donation_goal: parseFloat(donation.donation_goal || 0),
        total_raised: parseFloat(donation.campaign_total_raised || 0),
        progress_percentage: parseFloat(donation.total_progress_percentage || 0),
        total_beneficiary: donation.total_beneficiary || 0,
        location: donation.campaign_location,
        organizer: donation.campaign_organizer,
        status: donation.campaign_status,
        category: {
          name: donation.campaign_category,
          description: donation.campaign_category_description
        }
      },
      
      // Donation items (for product-based donations)
      items: donationItems.map((item: any) => ({
        id: item.id,
        campaign_product_id: item.campaign_product_id,
        quantity: item.quantity,
        price_per_unit: parseFloat(item.price_per_unit),
        total_price: parseFloat(item.total_price),
        fulfillment_status: item.fulfillment_status,
        product: {
          independent_product_id: item.independent_product_id,
          name: item.product_name,
          description: item.product_description,
          campaign_description: item.campaign_product_description,
          image: item.product_image,
          current_campaign_price: parseFloat(item.campaign_product_price || 0),
          stock: item.campaign_product_stock || 0,
          min_qty: item.min_qty || 1,
          max_qty: item.max_qty,
          increment_count: item.increment_count || 1,
          is_flexible_increment_count: item.is_flexible_increment_count,
          allows_personalization: item.allows_personalization,
          status: item.product_status,
          unit: {
            name: item.unit_name,
            abbreviation: item.unit_abbreviation
          }
        },
        created_at: item.created_at,
        updated_at: item.updated_at
      })),
      
      // Personalization options
      personalization: personalization.map((p: any) => ({
        id: p.id,
        donation_id: p.donation_id,
        donation_item_id: p.donation_item_id,
        donor_name: p.donor_name,
        donor_country: p.donor_country,
        custom_image: p.custom_image,
        is_image_available: p.is_image_available,
        custom_message: p.custom_message,
        donation_purpose: p.donation_purpose,
        special_instructions: p.special_instructions,
        created_at: p.created_at
      })),
      
      // Impact stories
      impact_stories: impactStories.map((impact: any) => ({
        tracking_id: impact.id,
        contribution_percentage: parseFloat(impact.contribution_percentage || 0),
        people_helped_by_this_donation: impact.people_helped_by_this_donation || 0,
        impact_description: impact.impact_description,
        story: {
          id: impact.impact_story_id,
          title: impact.story_title,
          content: impact.story_content,
          summary: impact.impact_summary,
          images: impact.story_images || [],
          videos: impact.story_videos || [],
          people_helped: impact.story_people_helped || 0,
          families_helped: impact.families_helped || 0,
          communities_helped: impact.communities_helped || 0,
          location: impact.story_location,
          impact_date: impact.impact_date,
          is_published: impact.is_published,
          featured: impact.featured
        },
        batch: impact.batch_name ? {
          name: impact.batch_name,
          distribution_date: impact.actual_distribution_date,
          location: impact.batch_location,
          status: impact.batch_status
        } : null,
        created_at: impact.created_at
      }))
    }

    return NextResponse.json({
      success: true,
      donation: response
    }, { status: 200 })

  } catch (error) {
    console.error('Error fetching donation details:', error)
    
    return NextResponse.json(
      { 
        error: 'Failed to fetch donation details', 
        details: error instanceof Error ? error.message : 'Unknown error' 
      },
      { status: 500 }
    )
  }
}

// GET all donations for a user
export async function POST(request: NextRequest) {
  try {
    const { userId, page = 1, limit = 10, status } = await request.json()
    
    const offset = (page - 1) * limit
    
    let whereClause = 'WHERE 1=1'
    const queryParams: any[] = []
    let paramCount = 0
    
    if (userId) {
      paramCount++
      whereClause += ` AND d.user_id = $${paramCount}`
      queryParams.push(userId)
    }
    
    if (status) {
      paramCount++
      whereClause += ` AND dpr.status = $${paramCount}`
      queryParams.push(status)
    }
    
    // Add pagination parameters
    queryParams.push(limit, offset)
    
    const donationsQuery = `
      SELECT 
        d.*,
        c.title as campaign_title,
        c.image as campaign_image,
        dpr.status as payment_status,
        dpr.created_at as payment_created_at,
        COUNT(di.id) as item_count
      FROM donations d
      LEFT JOIN campaigns c ON c.id = d.campaign_id
      LEFT JOIN donation_payment_requests dpr ON dpr.id = d.donation_payment_request_id
      LEFT JOIN donation_items di ON di.donation_id = d.id
      ${whereClause}
      GROUP BY d.id, c.title, c.image, dpr.status, dpr.created_at
      ORDER BY d.created_at DESC
      LIMIT $${paramCount + 1} OFFSET $${paramCount + 2}
    `
    
    const donations = await SelectQuery(donationsQuery, queryParams)
    
    // Get total count
    const countQuery = `
      SELECT COUNT(DISTINCT d.id) as total
      FROM donations d
      LEFT JOIN donation_payment_requests dpr ON dpr.id = d.donation_payment_request_id
      ${whereClause}
    `
    
    const countResult = await SelectQuery(countQuery, queryParams.slice(0, paramCount))
    const total = parseInt(countResult[0].total)
    
    return NextResponse.json({
      success: true,
      donations,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
        hasNext: page * limit < total,
        hasPrev: page > 1
      }
    }, { status: 200 })

  } catch (error) {
    console.error('Error fetching donations:', error)
    
    return NextResponse.json(
      { 
        error: 'Failed to fetch donations', 
        details: error instanceof Error ? error.message : 'Unknown error' 
      },
      { status: 500 }
    )
  }
}