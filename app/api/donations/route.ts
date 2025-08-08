// import { getClient, InsertQuery, SelectQuery, UpdateQuery } from '@/lib/database';
// import { NextRequest, NextResponse } from 'next/server';

// // GET donations with filtering
// export async function GET(request: NextRequest) {
//   try {
//     const { searchParams } = new URL(request.url);
//     const campaign_id = searchParams.get('campaign_id');
//     const user_id = searchParams.get('user_id');
//     const donation_type = searchParams.get('donation_type');
//     const page = parseInt(searchParams.get('page') || '1');
//     const limit = parseInt(searchParams.get('limit') || '10');
//     const offset = (page - 1) * limit;

//     let whereClause = '';
//     const params: any[] = [];
//     let paramIndex = 1;

//     if (campaign_id) {
//       whereClause += ` AND d.campaign_id = $${paramIndex}`;
//       params.push(parseInt(campaign_id));
//       paramIndex++;
//     }

//     if (user_id) {
//       whereClause += ` AND d.user_id = $${paramIndex}`;
//       params.push(parseInt(user_id));
//       paramIndex++;
//     }

//     if (donation_type) {
//       whereClause += ` AND d.donation_type = $${paramIndex}`;
//       params.push(donation_type);
//       paramIndex++;
//     }

//     const donationsQuery = `
//       SELECT 
//         d.*,
//         u.full_name as donor_name,
//         u.email as donor_email,
//         c.title as campaign_title,
//         dpr.razorpay_order_id,
//         dpr.status as payment_status
//       FROM donations d
//       LEFT JOIN users u ON d.user_id = u.id
//       LEFT JOIN campaigns c ON d.campaign_id = c.id
//       LEFT JOIN donation_payment_requests dpr ON d.donation_payment_request_id = dpr.id
//       WHERE 1=1 ${whereClause}
//       ORDER BY d.donation_date DESC
//       LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
//     `;

//     params.push(limit, offset);

//     const result = await SelectQuery(donationsQuery, params);

//     // Get donation items for product-based donations
//     const donationIds:any = result?.map(d => d.id);
//     let donationItems: any[] = [];

//     if (donationIds.length > 0) {
//       const itemsQuery = `
//         SELECT 
//           di.*,
//           inp.name as product_name,
//           cp.description as product_description
//         FROM donation_items di
//         LEFT JOIN campaign_products cp ON di.campaign_product_id = cp.id
//         LEFT JOIN indipendent_products inp ON cp.indipendent_product_id = inp.id
//         WHERE di.donation_id = ANY($1)
//         ORDER BY di.donation_id, cp.name
//       `;

//       const itemsResult = await SelectQuery(itemsQuery, [donationIds]);
//       donationItems = itemsResult;
//     }

//     // Attach items to donations
//     const donationsWithItems = result?.map(donation => ({
//       ...donation,
//       items: donationItems.filter(item => item.donation_id === donation.id)
//     }));

//     // Get total count for pagination
//     const countQuery = `
//       SELECT COUNT(*) as total
//       FROM donations d
//       WHERE 1=1 ${whereClause}
//     `;
//     const countResult = await SelectQuery(countQuery, params.slice(0, -2));

//     return NextResponse.json({
//       donations: donationsWithItems,
//       pagination: {
//         page,
//         limit,
//         total: parseInt(countResult[0]?.total),
//         totalPages: Math.ceil(countResult[0]?.total / limit)
//       }
//     });
//   } catch (error) {
//     console.error('Error fetching donations:', error);
//     return NextResponse.json(
//       { error: 'Failed to fetch donations' },
//       { status: 500 }
//     );
//   }
// }

// // POST create donation (for manual entry or testing)
// export async function POST(request: NextRequest) {
//   const client = await getClient();
  
//   try {
//     await client.query('BEGIN');
    
//     const body = await request.json();
//     const {
//       user_id,
//       campaign_id,
//       donation_amount,
//       tip_amount = 0,
//       donation_type = 'direct',
//       is_public = false,
//       donated_on_behalf_of,
//       donor_message,
//       donation_items = [], // For product-based donations
//       personalization = null
//     } = body;

//     // Create payment request first
//     const paymentRequestResult = await InsertQuery(`
//       INSERT INTO donation_payment_requests (
//         campaign_id, user_id, razorpay_order_id, amount, donation_type, status
//       ) VALUES ($1, $2, $3, $4, $5, $6)
//       RETURNING *
//     `, [
//       campaign_id, 
//       user_id, 
//       `manual_${Date.now()}`, // For manual entries
//       donation_amount + tip_amount,
//       donation_type,
//       'paid'
//     ]);

//     const paymentRequest = paymentRequestResult.rows[0];

//     // Create donation
//     const donationResult = await InsertQuery(`
//       INSERT INTO donations (
//         user_id, campaign_id, donation_payment_request_id, donation_amount,
//         tip_amount, donation_type, is_public, donation_date,
//         donated_on_behalf_of, donor_message
//       ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
//       RETURNING *
//     `, [
//       user_id, campaign_id, paymentRequest.id, donation_amount,
//       tip_amount, donation_type, is_public, new Date(),
//       donated_on_behalf_of, donor_message
//     ]);

//     const donation = donationResult.rows[0];

//     // Create donation items if product-based
//     if (donation_type === 'product_based' && donation_items.length > 0) {
//       for (const item of donation_items) {
//         const itemResult = await InsertQuery(`
//           INSERT INTO donation_items (
//             donation_id, campaign_product_id, quantity, price_per_unit, total_price
//           ) VALUES ($1, $2, $3, $4, $5)
//           RETURNING *
//         `, [
//           donation.id, item.campaign_product_id, item.quantity,
//           item.price_per_unit, item.total_price
//         ]);

//         // Add personalization if provided
//         if (personalization) {
//           await InsertQuery(`
//             INSERT INTO personalization_options (
//               donation_item_id, donor_name, donor_country, custom_message,
//               donation_purpose, special_instructions
//             ) VALUES ($1, $2, $3, $4, $5, $6)
//           `, [
//             itemResult.rows[0].id, personalization.donor_name,
//             personalization.donor_country, personalization.custom_message,
//             personalization.donation_purpose, personalization.special_instructions
//           ]);
//         }
//       }
//     } else if (personalization) {
//       // Add personalization for direct donations
//       await InsertQuery(`
//         INSERT INTO personalization_options (
//           donation_id, donor_name, donor_country, custom_message,
//           donation_purpose, special_instructions
//         ) VALUES ($1, $2, $3, $4, $5, $6)
//       `, [
//         donation.id, personalization.donor_name,
//         personalization.donor_country, personalization.custom_message,
//         personalization.donation_purpose, personalization.special_instructions
//       ]);
//     }

//     // Update campaign totals
//     await UpdateQuery(`
//       UPDATE campaigns SET
//         total_raised = total_raised + $1,
//         total_donors_till_now = total_donors_till_now + 1,
//         total_progress_percentage = (total_raised + $1) / donation_goal * 100
//       WHERE id = $2
//     `, [donation_amount, campaign_id]);

//     await client.query('COMMIT');

//     return NextResponse.json(donation, { status: 201 });
//   } catch (error) {
//     await client.query('ROLLBACK');
//     console.error('Error creating donation:', error);
//     return NextResponse.json(
//       { error: 'Failed to create donation' },
//       { status: 500 }
//     );
//   } finally {
//     client.release();
//   }
// }

// app/api/donations/create-payment-order/route.ts
import { NextRequest, NextResponse } from 'next/server'
import Razorpay from 'razorpay'
import { SelectQuery } from '@/lib/database' // Adjust import path as needed

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID!,
  key_secret: process.env.RAZORPAY_KEY_SECRET!,
})

interface CartItem {
  productId: number
  campaignId: number
  campaignTitle: string
  name: string
  price: number
  quantity: number
  unit?: string
  image?: string
  maxQty?: number
  stock?: number
  description?: string
}

interface DonationFormData {
  donorName?: string
  donorCountry: string
  mobileNumber: string
  customMessage?: string
  donationPurpose?: string
  specialInstructions?: string
  donatedOnBehalfOf?: string
  donorMessage?: string
  isPublic: boolean
  isAnonymous: boolean
  customAmount?: number
  tipAmount: number
  tipPercentage?: number
  customImage?: File
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { cartItems, formData, totalAmount, donationAmount, tipAmount, userId } = body

    // Validation
    if (!totalAmount || totalAmount <= 0) {
      return NextResponse.json(
        { error: 'Invalid total amount' },
        { status: 400 }
      )
    }

    if (!cartItems || (!Array.isArray(cartItems) && !donationAmount)) {
      return NextResponse.json(
        { error: 'Cart items or donation amount required' },
        { status: 400 }
      )
    }

    // Determine donation type
    const donationType = cartItems && cartItems.length > 0 ? 'product_based' : 'direct'

    // Get campaign ID (for direct donations, use the first available campaign or a default one)
    let campaignId = cartItems && cartItems.length > 0 ? cartItems[0].campaignId : null
    
    if (!campaignId) {
      // For direct donations, get an active campaign or create a default one
      const defaultCampaignQuery = `
        SELECT id FROM campaigns 
        WHERE status = 'Active' AND is_active = true 
        ORDER BY created_at DESC LIMIT 1
      `
      const defaultCampaign = await SelectQuery(defaultCampaignQuery, [])
      
      if (defaultCampaign.length > 0) {
        campaignId = defaultCampaign[0].id
      } else {
        return NextResponse.json(
          { error: 'No active campaigns found' },
          { status: 400 }
        )
      }
    }

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

    const razorpayOrder = await razorpay.orders.create(orderOptions)

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
    // You might want to use Redis or a temporary table for this
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

// You'll also need to create the donation_temp_data table:
/*
CREATE TABLE donation_temp_data (
    id BIGSERIAL PRIMARY KEY,
    payment_request_id BIGINT NOT NULL,
    cart_items JSONB NOT NULL,
    form_data JSONB NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT fk_temp_data_payment_request FOREIGN KEY (payment_request_id) REFERENCES donation_payment_requests(id) ON DELETE CASCADE
);
*/