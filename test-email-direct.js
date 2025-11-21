// Direct test of Resend email sending
const { Resend } = require('resend');
require('dotenv').config({ path: '.env.local' });

async function testEmail() {
  console.log('🔍 Testing Email Configuration...\n');
  
  const apiKey = process.env.RESEND_API_KEY;
  const fromEmail = process.env.RESEND_FROM_EMAIL;
  
  console.log('Configuration Check:');
  console.log('  RESEND_API_KEY:', apiKey ? `${apiKey.substring(0, 15)}...` : '❌ MISSING');
  console.log('  RESEND_FROM_EMAIL:', fromEmail || '❌ MISSING');
  console.log('');
  
  if (!apiKey || !fromEmail) {
    console.error('❌ Missing required environment variables!');
    process.exit(1);
  }
  
  const resend = new Resend(apiKey);
  
  // Use a test email - replace with your actual email
  const testEmail = 'test@example.com';
  
  console.log('📧 Attempting to send test email...');
  console.log('  To:', testEmail);
  console.log('  From:', fromEmail);
  console.log('');
  
  try {
    const { data, error } = await resend.emails.send({
      from: fromEmail,
      to: testEmail,
      subject: 'Test Email from Minka',
      html: '<p>This is a test email to verify the configuration.</p>',
    });
    
    if (error) {
      console.error('❌ Resend API Error:');
      console.error(JSON.stringify(error, null, 2));
      
      if (error.message) {
        console.error('\nError Message:', error.message);
      }
      
      // Common error messages
      if (error.message?.includes('Invalid API key')) {
        console.error('\n💡 Solution: Check your API key in Resend dashboard');
      } else if (error.message?.includes('domain')) {
        console.error('\n💡 Solution: Use onboarding@resend.dev for testing');
      }
    } else {
      console.log('✅ Email sent successfully!');
      console.log('  Email ID:', data?.id);
      console.log('\nNote: The email was sent to test@example.com (this will fail delivery, but API is working)');
      console.log('To test with a real email, update the testEmail variable in this script.');
    }
  } catch (err) {
    console.error('❌ Exception:', err.message);
    console.error('Stack:', err.stack);
  }
}

testEmail().catch(console.error);

