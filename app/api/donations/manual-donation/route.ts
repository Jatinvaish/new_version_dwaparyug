import { NextRequest, NextResponse } from 'next/server'
import { SelectQuery } from '@/lib/database'

// Normalize mobile number (last 10 digits)
function normalizeMobileNumber(mobile: string): string {
  const digitsOnly = mobile.replace(/\D/g, '');
  return digitsOnly.length >= 10 ? digitsOnly.slice(-10) : digitsOnly;
}

// Find user by mobile number
async function findUserByMobile(mobileNumber: string): Promise<number | null> {
  const normalizedMobile = normalizeMobileNumber(mobileNumber);

  if (normalizedMobile.length !== 10) {
    throw new Error('Invalid mobile number format');
  }

  const query = `
    SELECT id 
    FROM users 
    WHERE RIGHT(REGEXP_REPLACE(mobile_no, '[^0-9]', '', 'g'), 10) = $1
    ORDER BY created_at DESC
    LIMIT 1
  `;

  const result = await SelectQuery(query, [normalizedMobile]);
  return result.length > 0 ? result[0].id : null;
}

// Get campaign by code
async function getCampaignByCode(code: string): Promise<number | null> {
  const query = `
    SELECT id 
    FROM campaigns 
    WHERE UPPER(code) = UPPER($1) AND status = 'Active'
    LIMIT 1
  `;

  const result = await SelectQuery(query, [code]);
  return result.length > 0 ? result[0].id : null;
}

// Process single donation
async function processSingleDonation(
  donation: { mobileNumber: string; amount: number; message?: string },
  campaignCode: string
) {
  const { mobileNumber, amount, message } = donation;

  // Validations
  if (!mobileNumber || !amount) {
    throw new Error(`Invalid data: mobile and amount required`);
  }

  if (amount <= 0) {
    throw new Error(`Amount must be greater than 0`);
  }

  // Find user
  const userId = await findUserByMobile(mobileNumber);
  if (!userId) {
    throw new Error(`User not found: ${mobileNumber}`);
  }

  // Get campaign
  const campaignId = await getCampaignByCode(campaignCode);
  if (!campaignId) {
    throw new Error(`Campaign '${campaignCode}' not found or inactive`);
  }

  // Generate unique order ID
  const orderIdSuffix = `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  const razorpayOrderId = `manual_${orderIdSuffix}`;

  // Insert payment request
  const paymentRequestQuery = `
    INSERT INTO donation_payment_requests (
      campaign_id, user_id, razorpay_order_id, amount, 
      currency, donation_type, status, created_at, updated_at
    ) VALUES ($1, $2, $3, $4, $5, $6, $7, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
    RETURNING id
  `;

  const paymentRequestResult = await SelectQuery(paymentRequestQuery, [
    campaignId,
    userId,
    razorpayOrderId,
    amount,
    'INR',
    'direct',
    'paid'
  ]);

  const paymentRequestId = paymentRequestResult[0].id;

  // Insert donation
  const donationQuery = `
    INSERT INTO donations (
      user_id, campaign_id, donation_payment_request_id,
      razorpay_payment_id, donation_amount, tip_amount,
      donation_type, is_public, donation_date,
      donor_message, impact_generated, beneficiaries_reached,
      created_at, updated_at
    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
    RETURNING id
  `;

  const donationResult = await SelectQuery(donationQuery, [
    userId,
    campaignId,
    paymentRequestId,
    `manual_${orderIdSuffix}_payment`,
    amount,
    0,
    'direct',
    false,
    new Date(),
    message || null,
    false,
    0
  ]);

  const donationId = donationResult[0].id;

  // Update campaign totals
  const updateCampaignQuery = `
    UPDATE campaigns 
    SET 
      total_raised = total_raised + $1,
      total_donors_till_now = total_donors_till_now + 1,
      total_progress_percentage = LEAST(
        ROUND(((total_raised + $1) / NULLIF(donation_goal, 0)) * 100, 2), 
        100
      ),
      updated_at = CURRENT_TIMESTAMP
    WHERE id = $2
  `;

  await SelectQuery(updateCampaignQuery, [amount, campaignId]);

  return {
    donationId,
    paymentRequestId,
    userId,
    campaignId,
    amount,
    mobileNumber
  };
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { donations, campaignCode = 'BVP' } = body;

    // Check if array or single donation
    const donationsArray = Array.isArray(donations) ? donations : [body];

    if (donationsArray.length === 0) {
      return NextResponse.json(
        { error: 'No donations provided' },
        { status: 400 }
      );
    }

    const results = [];
    const errors = [];

    // Process each donation
    for (let i = 0; i < donationsArray.length; i++) {
      try {
        const result = await processSingleDonation(donationsArray[i], campaignCode);
        results.push({
          success: true,
          index: i,
          ...result
        });
      } catch (error) {
        errors.push({
          success: false,
          index: i,
          mobileNumber: donationsArray[i].mobileNumber,
          error: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    }

    const totalAmount = results.reduce((sum, r) => sum + r.amount, 0);

    return NextResponse.json({
      success: errors.length === 0,
      totalProcessed: results.length,
      totalFailed: errors.length,
      totalAmount,
      results,
      errors: errors.length > 0 ? errors : undefined
    }, { status: errors.length === donationsArray.length ? 400 : 200 });

  } catch (error) {
    console.error('Manual donation error:', error);
    return NextResponse.json(
      {
        error: 'Failed to process manual donations',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}