'use server';

import { saveEmail } from '@/lib/storage/waitlist';
import { sendWaitlistConfirmation } from '@/lib/email/send';

export async function subscribe(formData: FormData) {
  const email = String(formData.get('email') ?? '').trim();

  if (!email) {
    throw new Error('Email is required');
  }

  // Validate email format
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    throw new Error('Invalid email address');
  }

  try {
    // Save email to storage
    await saveEmail(email);
    console.log('[waitlist] new subscriber saved:', email);

    // Send confirmation email (non-blocking - don't fail subscription if email fails)
    try {
      await sendWaitlistConfirmation({ to: email, email });
      console.log('[waitlist] Confirmation email sent successfully to:', email);
    } catch (emailError) {
      // Log but don't throw - subscription was successful
      const errorMessage = emailError instanceof Error ? emailError.message : 'Unknown error';
      console.error('[waitlist] Failed to send confirmation email, but subscription succeeded:', errorMessage);
      console.error('[waitlist] Full error:', emailError);
      
      // If it's a configuration error, log it prominently
      if (errorMessage.includes('not configured')) {
        console.error('═══════════════════════════════════════════════════════════');
        console.error('⚠️  EMAIL CONFIGURATION MISSING ⚠️');
        console.error('To enable email sending, add these to your .env.local file:');
        console.error('RESEND_API_KEY=re_xxxxxxxxxxxxxxxxxxxxxxxxxxxxx');
        console.error('RESEND_FROM_EMAIL=onboarding@resend.dev');
        console.error('See EMAIL_SETUP.md for detailed instructions.');
        console.error('═══════════════════════════════════════════════════════════');
      }
      
      // If it's a Resend testing limitation, log it
      if (errorMessage.includes('only send testing emails to your own email')) {
        const userEmail = errorMessage.match(/\(([^)]+)\)/)?.[1] || 'your verified email';
        console.error('═══════════════════════════════════════════════════════════');
        console.error('⚠️  RESEND TESTING LIMITATION ⚠️');
        console.error(`When using onboarding@resend.dev, emails can only be sent to: ${userEmail}`);
        console.error('To send to any email, verify your domain in Resend dashboard.');
        console.error('See EMAIL_LIMITATION_FIX.md for details.');
        console.error('═══════════════════════════════════════════════════════════');
      }
    }
  } catch (error) {
    if (error instanceof Error && error.message === 'Email already subscribed') {
      throw new Error('This email is already on the waitlist');
    }
    console.error('[waitlist] error saving email:', error);
    throw new Error('Failed to subscribe. Please try again later.');
  }
}
