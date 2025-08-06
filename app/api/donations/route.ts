import { getClient, InsertQuery, SelectQuery, UpdateQuery } from '@/lib/database';
import { NextRequest, NextResponse } from 'next/server';

// GET donations with filtering
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const campaign_id = searchParams.get('campaign_id');
    const user_id = searchParams.get('user_id');
    const donation_type = searchParams.get('donation_type');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const offset = (page - 1) * limit;

    let whereClause = '';
    const params: any[] = [];
    let paramIndex = 1;

    if (campaign_id) {
      whereClause += ` AND d.campaign_id = $${paramIndex}`;
      params.push(parseInt(campaign_id));
      paramIndex++;
    }

    if (user_id) {
      whereClause += ` AND d.user_id = $${paramIndex}`;
      params.push(parseInt(user_id));
      paramIndex++;
    }

    if (donation_type) {
      whereClause += ` AND d.donation_type = $${paramIndex}`;
      params.push(donation_type);
      paramIndex++;
    }

    const donationsQuery = `
      SELECT 
        d.*,
        u.full_name as donor_name,
        u.email as donor_email,
        c.title as campaign_title,
        dpr.razorpay_order_id,
        dpr.status as payment_status
      FROM donations d
      LEFT JOIN users u ON d.user_id = u.id
      LEFT JOIN campaigns c ON d.campaign_id = c.id
      LEFT JOIN donation_payment_requests dpr ON d.donation_payment_request_id = dpr.id
      WHERE 1=1 ${whereClause}
      ORDER BY d.donation_date DESC
      LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
    `;

    params.push(limit, offset);

    const result = await SelectQuery(donationsQuery, params);

    // Get donation items for product-based donations
    const donationIds:any = result?.map(d => d.id);
    let donationItems: any[] = [];

    if (donationIds.length > 0) {
      const itemsQuery = `
        SELECT 
          di.*,
          cp.name as product_name,
          cp.description as product_description
        FROM donation_items di
        LEFT JOIN campaign_products cp ON di.campaign_product_id = cp.id
        WHERE di.donation_id = ANY($1)
        ORDER BY di.donation_id, cp.name
      `;

      const itemsResult = await SelectQuery(itemsQuery, [donationIds]);
      donationItems = itemsResult;
    }

    // Attach items to donations
    const donationsWithItems = result?.map(donation => ({
      ...donation,
      items: donationItems.filter(item => item.donation_id === donation.id)
    }));

    // Get total count for pagination
    const countQuery = `
      SELECT COUNT(*) as total
      FROM donations d
      WHERE 1=1 ${whereClause}
    `;
    const countResult = await SelectQuery(countQuery, params.slice(0, -2));

    return NextResponse.json({
      donations: donationsWithItems,
      pagination: {
        page,
        limit,
        total: parseInt(countResult[0]?.total),
        totalPages: Math.ceil(countResult[0]?.total / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching donations:', error);
    return NextResponse.json(
      { error: 'Failed to fetch donations' },
      { status: 500 }
    );
  }
}

// POST create donation (for manual entry or testing)
export async function POST(request: NextRequest) {
  const client = await getClient();
  
  try {
    await client.query('BEGIN');
    
    const body = await request.json();
    const {
      user_id,
      campaign_id,
      donation_amount,
      tip_amount = 0,
      donation_type = 'direct',
      is_public = false,
      donated_on_behalf_of,
      donor_message,
      donation_items = [], // For product-based donations
      personalization = null
    } = body;

    // Create payment request first
    const paymentRequestResult = await InsertQuery(`
      INSERT INTO donation_payment_requests (
        campaign_id, user_id, razorpay_order_id, amount, donation_type, status
      ) VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *
    `, [
      campaign_id, 
      user_id, 
      `manual_${Date.now()}`, // For manual entries
      donation_amount + tip_amount,
      donation_type,
      'paid'
    ]);

    const paymentRequest = paymentRequestResult.rows[0];

    // Create donation
    const donationResult = await InsertQuery(`
      INSERT INTO donations (
        user_id, campaign_id, donation_payment_request_id, donation_amount,
        tip_amount, donation_type, is_public, donation_date,
        donated_on_behalf_of, donor_message
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
      RETURNING *
    `, [
      user_id, campaign_id, paymentRequest.id, donation_amount,
      tip_amount, donation_type, is_public, new Date(),
      donated_on_behalf_of, donor_message
    ]);

    const donation = donationResult.rows[0];

    // Create donation items if product-based
    if (donation_type === 'product_based' && donation_items.length > 0) {
      for (const item of donation_items) {
        const itemResult = await InsertQuery(`
          INSERT INTO donation_items (
            donation_id, campaign_product_id, quantity, price_per_unit, total_price
          ) VALUES ($1, $2, $3, $4, $5)
          RETURNING *
        `, [
          donation.id, item.campaign_product_id, item.quantity,
          item.price_per_unit, item.total_price
        ]);

        // Add personalization if provided
        if (personalization) {
          await InsertQuery(`
            INSERT INTO personalization_options (
              donation_item_id, donor_name, donor_country, custom_message,
              donation_purpose, special_instructions
            ) VALUES ($1, $2, $3, $4, $5, $6)
          `, [
            itemResult.rows[0].id, personalization.donor_name,
            personalization.donor_country, personalization.custom_message,
            personalization.donation_purpose, personalization.special_instructions
          ]);
        }
      }
    } else if (personalization) {
      // Add personalization for direct donations
      await InsertQuery(`
        INSERT INTO personalization_options (
          donation_id, donor_name, donor_country, custom_message,
          donation_purpose, special_instructions
        ) VALUES ($1, $2, $3, $4, $5, $6)
      `, [
        donation.id, personalization.donor_name,
        personalization.donor_country, personalization.custom_message,
        personalization.donation_purpose, personalization.special_instructions
      ]);
    }

    // Update campaign totals
    await UpdateQuery(`
      UPDATE campaigns SET
        total_raised = total_raised + $1,
        total_donors_till_now = total_donors_till_now + 1,
        total_progress_percentage = (total_raised + $1) / donation_goal * 100
      WHERE id = $2
    `, [donation_amount, campaign_id]);

    await client.query('COMMIT');

    return NextResponse.json(donation, { status: 201 });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error creating donation:', error);
    return NextResponse.json(
      { error: 'Failed to create donation' },
      { status: 500 }
    );
  } finally {
    client.release();
  }
}