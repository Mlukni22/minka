import { NextRequest, NextResponse } from 'next/server';
import { sendWaitlistConfirmation } from '@/lib/email/send';

/**
 * Test endpoint to verify email configuration
 * Usage: POST /api/test-email with { "email": "your@email.com" }
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email } = body;

    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Invalid email address' },
        { status: 400 }
      );
    }

    // Check environment variables
    const hasApiKey = !!process.env.RESEND_API_KEY;
    const hasFromEmail = !!process.env.RESEND_FROM_EMAIL;

    if (!hasApiKey || !hasFromEmail) {
      return NextResponse.json(
        {
          error: 'Email service not configured',
          details: {
            hasApiKey,
            hasFromEmail,
            message: 'Please add RESEND_API_KEY and RESEND_FROM_EMAIL to your .env.local file',
          },
        },
        { status: 500 }
      );
    }

    // Try to send email
    const result = await sendWaitlistConfirmation({ to: email, email });

    return NextResponse.json({
      success: true,
      message: 'Test email sent successfully',
      emailId: result?.id,
      config: {
        hasApiKey: true,
        hasFromEmail: true,
        fromEmail: process.env.RESEND_FROM_EMAIL,
      },
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    
    return NextResponse.json(
      {
        error: 'Failed to send test email',
        message: errorMessage,
        config: {
          hasApiKey: !!process.env.RESEND_API_KEY,
          hasFromEmail: !!process.env.RESEND_FROM_EMAIL,
        },
      },
      { status: 500 }
    );
  }
}

