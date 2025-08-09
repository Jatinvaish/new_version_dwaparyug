
import { SelectQuery, InsertQuery } from '@/lib/database';
import { NextRequest, NextResponse } from 'next/server';

// POST - Verify OTP and update user verification status
export async function POST(request: NextRequest) {
  try {
    const { email, otp } = await request.json();

    if (!email || !otp) {
      return NextResponse.json(
        { error: 'Email and OTP are required' },
        { status: 400 }
      );
    }

    // Get OTP from database
    const otpResult = await SelectQuery(
      'SELECT user_id, otp, expires_at FROM otp_verifications WHERE email = $1 ORDER BY created_at DESC LIMIT 1',
      [email]
    );

    if (!otpResult || otpResult.length === 0) {
      return NextResponse.json(
        { error: 'No OTP found for this email' },
        { status: 404 }
      );
    }

    const otpRecord = otpResult[0];

    // Check if OTP is expired
    if (new Date() > new Date(otpRecord.expires_at)) {
      return NextResponse.json(
        { error: 'OTP has expired. Please request a new one.' },
        { status: 400 }
      );
    }

    // Verify OTP
    if (otpRecord.otp !== otp) {
      return NextResponse.json(
        { error: 'Invalid OTP' },
        { status: 400 }
      );
    }

    // Update user verification status
    await InsertQuery(
      'UPDATE users SET is_verified = true, updated_at = CURRENT_TIMESTAMP WHERE id = $1',
      [otpRecord.user_id]
    );

    // Delete used OTP
    await InsertQuery(
      'DELETE FROM otp_verifications WHERE email = $1',
      [email]
    );

    // Get user details for response
    const userResult = await SelectQuery(
      'SELECT id, first_name, last_name, email, is_verified FROM users WHERE id = $1',
      [otpRecord.user_id]
    );

    return NextResponse.json({
      message: 'Email verified successfully',
      user: userResult[0]
    });

  } catch (error) {
    console.error('Error verifying OTP:', error);
    return NextResponse.json(
      { error: 'Failed to verify OTP' },
      { status: 500 }
    );
  }
}