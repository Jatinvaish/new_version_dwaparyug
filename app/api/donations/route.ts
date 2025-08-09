// app/api/donations/create-payment-order/route.ts
import { NextRequest, NextResponse } from 'next/server'
import Razorpay from 'razorpay'
import { SelectQuery } from '@/lib/database' // Adjust import path as needed

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID!,
  key_secret: process.env.RAZORPAY_KEY_SECRET!,
})

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

    // Determine donation type
    const donationType = cartItems && cartItems.length > 0 ? 'product_based' : 'direct'

    // Get campaign ID (for direct donations, use the first available campaign or a default one)
    let campaignId = cartItems && cartItems.length > 0 ? cartItems[0].campaignId : null

    if (!campaignId) {
      // For direct donations, get an active campaign or create a default one
      const defaultCampaignQuery = `
        SELECT id FROM campaigns 
        WHERE status = 'Active'  
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
    console.log("🚀 ~ POST ~ userId:", userId)

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
