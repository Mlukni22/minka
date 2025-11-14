'use server';

import { saveEmail } from '@/lib/storage/waitlist';

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
  } catch (error) {
    if (error instanceof Error && error.message === 'Email already subscribed') {
      throw new Error('This email is already on the waitlist');
    }
    console.error('[waitlist] error saving email:', error);
    throw new Error('Failed to subscribe. Please try again later.');
  }
}
