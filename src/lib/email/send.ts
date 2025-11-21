import { Resend } from 'resend';

interface SendWaitlistConfirmationParams {
  to: string;
  email: string;
}

// Lazy-load Resend instance only when needed (to avoid build errors)
function getResend() {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    throw new Error('RESEND_API_KEY is not configured');
  }
  return new Resend(apiKey);
}

export async function sendWaitlistConfirmation({ to, email }: SendWaitlistConfirmationParams) {
  // Check for required environment variables
  const apiKey = process.env.RESEND_API_KEY;
  const fromEmail = process.env.RESEND_FROM_EMAIL;

  if (!apiKey || !fromEmail) {
    const missing = [];
    if (!apiKey) missing.push('RESEND_API_KEY');
    if (!fromEmail) missing.push('RESEND_FROM_EMAIL');
    
    const errorMsg = `[email] Missing required environment variables: ${missing.join(', ')}. Please add them to your .env.local file. See .env.example for a template.`;
    console.error('═══════════════════════════════════════════════════════════');
    console.error('⚠️  EMAIL CONFIGURATION MISSING ⚠️');
    console.error(errorMsg);
    console.error('═══════════════════════════════════════════════════════════');
    throw new Error(`Email service not configured. Missing: ${missing.join(', ')}`);
  }

  try {
    const { getWaitlistConfirmationEmailHtml } = await import('./templates');
    const html = getWaitlistConfirmationEmailHtml(email);

    console.log('[email] Attempting to send email to:', to);
    console.log('[email] From:', fromEmail);
    console.log('[email] API Key present:', !!apiKey);

    // Create Resend instance only when needed
    const resend = getResend();
    const { data, error } = await resend.emails.send({
      from: fromEmail,
      to,
      subject: 'You\'re on the list! 🎉 Welcome to Minka 🐱✨',
      html,
    });

    if (error) {
      console.error('[email] Resend API error:', JSON.stringify(error, null, 2));
      console.error('[email] Error type:', error.constructor.name);
      if (error.message) {
        console.error('[email] Error message:', error.message);
      }
      
      // Handle specific Resend errors
      if (error.message?.includes('only send testing emails to your own email')) {
        const userEmail = error.message.match(/\(([^)]+)\)/)?.[1] || 'your verified email';
        console.error('═══════════════════════════════════════════════════════════');
        console.error('⚠️  RESEND TESTING LIMITATION ⚠️');
        console.error(`When using onboarding@resend.dev, you can only send to: ${userEmail}`);
        console.error('To send to any email address, verify your domain in Resend dashboard.');
        console.error('See DNS_SETUP_RESEND.md for instructions.');
        console.error('═══════════════════════════════════════════════════════════');
      }
      
      throw new Error(`Failed to send email: ${error.message || 'Unknown error'}`);
    }

    if (data?.id) {
      console.log('[email] ✅ Confirmation email sent successfully!');
      console.log('[email] Email ID:', data.id);
    } else {
      console.warn('[email] ⚠️ Email sent but no ID returned:', data);
    }
    
    return data;
  } catch (error) {
    console.error('[email] ❌ Exception caught while sending email:');
    console.error('[email] Error:', error);
    if (error instanceof Error) {
      console.error('[email] Error message:', error.message);
      console.error('[email] Error stack:', error.stack);
    }
    // Re-throw so the caller can handle it (subscribe action will catch and log)
    throw error;
  }
}

