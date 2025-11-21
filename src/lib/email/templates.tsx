import React from 'react';

interface WaitlistConfirmationEmailProps {
  email: string;
}

/**
 * Extracts a friendly name from an email address
 * e.g., "john.doe@example.com" -> "John"
 */
function getFirstNameFromEmail(email: string): string {
  const namePart = email.split('@')[0];
  // Remove dots, numbers, and common separators, then capitalize first letter
  const cleaned = namePart.split(/[._0-9-]/)[0];
  return cleaned.charAt(0).toUpperCase() + cleaned.slice(1).toLowerCase();
}

export function WaitlistConfirmationEmail({ email }: WaitlistConfirmationEmailProps) {
  const firstName = getFirstNameFromEmail(email);
  
  return (
    <html>
      <body style={{ fontFamily: 'system-ui, -apple-system, sans-serif', lineHeight: '1.6', color: '#111111', maxWidth: '600px', margin: '0 auto', padding: '20px', backgroundColor: '#f5f5f5' }}>
        <div style={{ backgroundColor: '#ffffff', padding: '40px 30px', borderRadius: '12px', border: '1px solid #e5e5e5' }}>
          <p style={{ fontSize: '16px', marginBottom: '20px' }}>
            Hi {firstName},
          </p>
          
          <p style={{ fontSize: '16px', marginBottom: '20px' }}>
            Thank you for joining the Minka waitlist! We're so excited to have you here.
          </p>
          
          <p style={{ fontSize: '16px', marginBottom: '20px' }}>
            You're officially on the list, and you'll be among the first to get access when we open the doors. 🎉
          </p>
          
          <p style={{ fontSize: '16px', marginBottom: '10px', fontWeight: '600' }}>
            What happens next?
          </p>
          
          <p style={{ fontSize: '16px', marginBottom: '10px' }}>
            Over the next weeks, we'll share:
          </p>
          
          <ul style={{ fontSize: '16px', margin: '10px 0 20px 0', paddingLeft: '20px', color: '#4C515A' }}>
            <li style={{ marginBottom: '8px' }}>Early sneak peeks into the world of Minka and Friends</li>
            <li style={{ marginBottom: '8px' }}>Behind-the-scenes progress on our story-based German lessons</li>
            <li style={{ marginBottom: '8px' }}>Exclusive early-bird access and bonuses for waitlist members</li>
            <li style={{ marginBottom: '8px' }}>Opportunities to test features before anyone else</li>
          </ul>
          
          <p style={{ fontSize: '16px', marginBottom: '20px' }}>
            We created Minka to make language learning feel magical — cozy stories, real progress, and a world you'll actually want to come back to.
          </p>
          
          <p style={{ fontSize: '16px', marginBottom: '20px' }}>
            We're so happy you're joining us on this journey. ✨
          </p>
          
          <p style={{ fontSize: '16px', marginBottom: '20px' }}>
            If you have any questions, suggestions, or just want to say hi, you can reply directly to this email.
          </p>
          
          <p style={{ fontSize: '16px', marginBottom: '5px' }}>
            Talk soon,
          </p>
          <p style={{ fontSize: '16px', marginTop: '0', marginBottom: '30px' }}>
            The Minka Team 🐱🌿
          </p>
          
          <p style={{ fontSize: '14px', color: '#6B7280', textAlign: 'center', margin: '30px 0 0 0' }}>
            <a href="https://minkastory.com" style={{ color: '#6B7280', textDecoration: 'none' }}>minkastory.com</a>
          </p>
        </div>
      </body>
    </html>
  );
}

export function getWaitlistConfirmationEmailHtml(email: string): string {
  const firstName = getFirstNameFromEmail(email);
  
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="font-family: system-ui, -apple-system, sans-serif; line-height: 1.6; color: #111111; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f5f5f5;">
  <div style="background-color: #ffffff; padding: 40px 30px; border-radius: 12px; border: 1px solid #e5e5e5;">
    <p style="font-size: 16px; margin-bottom: 20px;">
      Hi ${firstName},
    </p>
    
    <p style="font-size: 16px; margin-bottom: 20px;">
      Thank you for joining the Minka waitlist! We're so excited to have you here.
    </p>
    
    <p style="font-size: 16px; margin-bottom: 20px;">
      You're officially on the list, and you'll be among the first to get access when we open the doors. 🎉
    </p>
    
    <p style="font-size: 16px; margin-bottom: 10px; font-weight: 600;">
      What happens next?
    </p>
    
    <p style="font-size: 16px; margin-bottom: 10px;">
      Over the next weeks, we'll share:
    </p>
    
    <ul style="font-size: 16px; margin: 10px 0 20px 0; padding-left: 20px; color: #4C515A;">
      <li style="margin-bottom: 8px;">Early sneak peeks into the world of Minka and Friends</li>
      <li style="margin-bottom: 8px;">Behind-the-scenes progress on our story-based German lessons</li>
      <li style="margin-bottom: 8px;">Exclusive early-bird access and bonuses for waitlist members</li>
      <li style="margin-bottom: 8px;">Opportunities to test features before anyone else</li>
    </ul>
    
    <p style="font-size: 16px; margin-bottom: 20px;">
      We created Minka to make language learning feel magical — cozy stories, real progress, and a world you'll actually want to come back to.
    </p>
    
    <p style="font-size: 16px; margin-bottom: 20px;">
      We're so happy you're joining us on this journey. ✨
    </p>
    
    <p style="font-size: 16px; margin-bottom: 20px;">
      If you have any questions, suggestions, or just want to say hi, you can reply directly to this email.
    </p>
    
    <p style="font-size: 16px; margin-bottom: 5px;">
      Talk soon,
    </p>
    <p style="font-size: 16px; margin-top: 0; margin-bottom: 30px;">
      The Minka Team 🐱🌿
    </p>
    
    <p style="font-size: 14px; color: #6B7280; text-align: center; margin: 30px 0 0 0;">
      <a href="https://minkastory.com" style="color: #6B7280; text-decoration: none;">minkastory.com</a>
    </p>
  </div>
</body>
</html>
  `.trim();
}

