import { SelectQuery, InsertQuery } from '@/lib/database';
import { NextRequest, NextResponse } from 'next/server';
import { hashPassword } from '../[...nextauth]/route';

// POST - Reset Password with OTP verification
export async function POST(request: NextRequest) {
  try {
    const { email, otp, newPassword } = await request.json();

    // Validate required fields
    if (!email || !otp || !newPassword) {
      return NextResponse.json(
        { error: 'Email, OTP, and new password are required' },
        { status: 400 }
      );
    }

    // Validate password strength
    if (newPassword.length < 6) {
      return NextResponse.json(
        { error: 'Password must be at least 6 characters long' },
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
        { error: 'No password reset request found for this email' },
        { status: 404 }
      );
    }

    const otpRecord = otpResult[0];

    // Check if OTP is expired
    if (new Date() > new Date(otpRecord.expires_at)) {
      return NextResponse.json(
        { error: 'OTP has expired. Please request a new password reset.' },
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

    // Hash the new password
    const hashedPassword = await hashPassword(newPassword);

    // Update user password
    await InsertQuery(
      'UPDATE users SET password = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2',
      [hashedPassword, otpRecord.user_id]
    );

    // Delete used OTP
    await InsertQuery(
      'DELETE FROM otp_verifications WHERE email = $1',
      [email]
    );

    // Get updated user details for confirmation
    const userResult = await SelectQuery(
      'SELECT id, first_name, last_name, email FROM users WHERE id = $1',
      [otpRecord.user_id]
    );

    return NextResponse.json({
      message: 'Password reset successfully',
      user: {
        id: userResult[0].id,
        name: `${userResult[0].first_name} ${userResult[0].last_name}`,
        email: userResult[0].email
      }
    });

  } catch (error) {
    console.error('Error resetting password:', error);
    return NextResponse.json(
      { error: 'Failed to reset password' },
      { status: 500 }
    );
  }
}