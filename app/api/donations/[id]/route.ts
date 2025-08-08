// app/api/donations/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { SelectQuery } from '@/lib/database'

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
        c.description as campaign_description,
        c.image as campaign_image,
        dpr.razorpay_order_id,
        dpr.status as payment_status,
        dpr.created_at as payment_created_at,
        u.name as user_name,
        u.email as user_email
      FROM donations d
      LEFT JOIN campaigns c ON c.id = d.campaign_id
      LEFT JOIN donation_payment_requests dpr ON dpr.id = d.donation_payment_request_id
      LEFT JOIN users u ON u.id = d.user_id
      WHERE d.id = $1
    `
    
    const donationResult = await SelectQuery(donationQuery, [donationId])
    
    if (donationResult.length === 0) {
      return NextResponse.json(
        { error: 'Donation not found' },
        { status: 404 }
      )
    }

    const donation = donationResult[0]

    // Get donation items if it's a product-based donation
    let donationItems:any = []
    if (donation.donation_type === 'product_based') {
      const itemsQuery = `
        SELECT 
          di.*,
          cp.name as product_name,
          cp.description as product_description,
          cp.image as product_image,
          cp.unit as product_unit
        FROM donation_items di
        LEFT JOIN campaign_products cp ON cp.id = di.campaign_product_id
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
    `
    
    const personalization = await SelectQuery(personalizationQuery, [donationId])

    // Combine all data
    const response = {
      ...donation,
      items: donationItems,
      personalization: personalization.length > 0 ? personalization[0] : null,
      total_amount_formatted: parseFloat(donation.total_amount).toLocaleString('en-IN', {
        style: 'currency',
        currency: 'INR'
      }),
      donation_amount_formatted: parseFloat(donation.donation_amount).toLocaleString('en-IN', {
        style: 'currency',
        currency: 'INR'
      }),
      tip_amount_formatted: parseFloat(donation.tip_amount || 0).toLocaleString('en-IN', {
        style: 'currency',
        currency: 'INR'
      })
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