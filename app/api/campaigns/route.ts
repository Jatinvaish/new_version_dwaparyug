import { getClient, InsertQuery, SelectQuery } from '@/lib/database';
import { NextRequest, NextResponse } from 'next/server';

// GET all campaigns with filtering
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const status = searchParams.get('status');
    const category_id = searchParams.get('category_id');
    const offset = (page - 1) * limit;

    let whereClause = '';
    const params: any[] = [];
    let paramIndex = 1;

    if (status) {
      whereClause += ` AND c.status = $${paramIndex}`;
      params.push(status);
      paramIndex++;
    }

    if (category_id) {
      whereClause += ` AND c.category_id = $${paramIndex}`;
      params.push(parseInt(category_id));
      paramIndex++;
    }

    const campaignQuery = `
      SELECT 
        c.*,
        cc.name as category_name,
        u1.full_name as created_by_name,
        u2.full_name as updated_by_name
      FROM campaigns c
      LEFT JOIN campaign_categories cc ON c.category_id = cc.id
      LEFT JOIN users u1 ON c.created_by = u1.id
      LEFT JOIN users u2 ON c.updated_by = u2.id
      WHERE 1=1 ${whereClause}
      ORDER BY c.created_at DESC
      LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
    `;

    params.push(limit, offset);

    const result = await SelectQuery(campaignQuery, params);

    // Get total count for pagination
    const countQuery = `
      SELECT COUNT(*) as total
      FROM campaigns c
      WHERE 1=1 ${whereClause}
    `;
    const countResult = await SelectQuery(countQuery, params.slice(0, -2));

    return NextResponse.json({
      campaigns: result,
      pagination: {
        page,
        limit,
        total: parseInt(countResult[0].total),
        totalPages: Math.ceil(countResult[0].total / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching campaigns:', error);
    return NextResponse.json(
      { error: 'Failed to fetch campaigns' },
      { status: 500 }
    );
  }
}

// POST create new campaign
export async function POST(request: NextRequest) {
  const client = await getClient();
  
  try {
    await client.query('BEGIN');
    
    const body = await request.json();
    const {
      title,
      category_id,
      festival_type,
      overview,
      details,
      about_campaign,
      donation_goal,
      image,
      images_array = [],
      status = 'Draft',
      priority = 'medium',
      urgency,
      location,
      organizer,
      verified = false,
      total_beneficiary = 0,
      end_date,
      created_by,
      assignedProducts = [],
      faq_questions = [],
      videoLinks = []
    } = body;

    // Validate required fields
    if (!title || !category_id || !overview || !details || !donation_goal || !image || !end_date) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Insert campaign
    const campaignResult = await InsertQuery(`
      INSERT INTO campaigns (
        title, category_id, festival_type, overview, details, about_campaign,
        donation_goal, image, images_array, status, priority, urgency,
        location, organizer, verified, total_beneficiary, end_date, created_by
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18)
      RETURNING *
    `, [
      title, category_id, festival_type, overview, details, about_campaign,
      donation_goal, image, images_array, status, priority, urgency,
      location, organizer, verified, total_beneficiary, end_date, created_by
    ]);

    const campaign = campaignResult.rows[0];

    // Insert campaign products if any
    if (assignedProducts.length > 0) {
      for (const product of assignedProducts) {
        await InsertQuery(`
          INSERT INTO campaign_products (
            campaign_id, name, description, price, image, stock, 
            min_qty, max_qty, increment_count, created_by
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
        `, [
          campaign.id, product.name, product.description || '', product.price, 
          product.image || '', product.stock || 0, product.min_qty || 1, 
          product.max_qty, product.increment_count || 1, created_by
        ]);
      }
    }

    // Insert FAQ questions if any
    if (faq_questions.length > 0) {
      for (let i = 0; i < faq_questions.length; i++) {
        const faq = faq_questions[i];
        await InsertQuery(`
          INSERT INTO campaign_faq (
            campaign_id, question, answer, sequence, created_by
          ) VALUES ($1, $2, $3, $4, $5)
        `, [campaign.id, faq.question, faq.answer, i + 1, created_by]);
      }
    }

    // Insert video links if any
    if (videoLinks.length > 0) {
      for (let i = 0; i < videoLinks.length; i++) {
        const videoUrl = videoLinks[i];
        await InsertQuery(`
          INSERT INTO campaign_videos (
            campaign_id, video_url, sequence, created_by
          ) VALUES ($1, $2, $3, $4)
        `, [campaign.id, videoUrl, i + 1, created_by]);
      }
    }

    await client.query('COMMIT');

    return NextResponse.json(campaign, { status: 201 });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error creating campaign:', error);
    return NextResponse.json(
      { error: 'Failed to create campaign' },
      { status: 500 }
    );
  } finally {
    client.release();
  }
}