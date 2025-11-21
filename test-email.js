// Quick test script to check email configuration
const { Resend } = require('resend');
require('dotenv').config({ path: '.env.local' });

const resend = new Resend(process.env.RESEND_API_KEY);

async function testEmail() {
  console.log('🔍 Testing Email Configuration...\n');
  
  // Check env vars
  console.log('Environment Variables:');
  console.log('  RESEND_API_KEY:', process.env.RESEND_API_KEY ? `${process.env.RESEND_API_KEY.substring(0, 10)}...` : '❌ MISSING');
  console.log('  RESEND_FROM_EMAIL:', process.env.RESEND_FROM_EMAIL || '❌ MISSING');
  console.log('');
  
  if (!process.env.RESEND_API_KEY || !process.env.RESEND_FROM_EMAIL) {
    console.error('❌ Missing required environment variables!');
    console.error('Please check your .env.local file.');
    process.exit(1);
  }
  
  // Test sending
  console.log('📧 Attempting to send test email...');
  try {
    const { data, error } = await resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL,
      to: 'test@example.com', // This will fail but we'll see the error
      subject: 'Test Email',
      html: '<p>Test</p>',
    });
    
    if (error) {
      console.error('❌ Error:', error);
      if (error.message) {
        console.error('   Message:', error.message);
      }
    } else {
      console.log('✅ Email API is working!');
      console.log('   Response:', data);
    }
  } catch (err) {
    console.error('❌ Exception:', err.message);
  }
}

testEmail();

