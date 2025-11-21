'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { onAuthChange } from '@/lib/auth';

export default function StoriesPage() {
  const router = useRouter();
  
  useEffect(() => {
    const unsubscribe = onAuthChange(async (firebaseUser) => {
      if (!firebaseUser) {
        router.push('/auth/login');
        return;
      }
      // Redirect to dashboard
      router.push('/dashboard');
    });

    return () => unsubscribe();
  }, [router]);

  return null;
}
