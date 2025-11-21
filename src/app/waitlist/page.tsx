'use client';

import { FormEvent, useState, useTransition } from 'react';
import Link from 'next/link';
import { subscribe } from '@/app/actions/subscribe';
import { Button } from '@/components/ui/button';

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function WaitlistPage() {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!emailRegex.test(email.trim())) {
      setStatus('error');
      setMessage('Please enter a valid email address.');
      return;
    }

    setStatus('idle');
    setMessage(null);

    const formData = new FormData();
    formData.append('email', email.trim());

    startTransition(async () => {
      try {
        await subscribe(formData);
        setStatus('success');
        setMessage('You are on the list! Watch your inbox for our next chapter.');
        setEmail('');
      } catch (error) {
        console.error(error);
        setStatus('error');
        setMessage('Something went wrong. Please try again later.');
      }
    });
  };

  return (
    <main className="min-h-screen bg-[#bbdd6d] py-12 sm:py-16 md:py-24 px-4 sm:px-6">
      <div className="mx-auto max-w-3xl rounded-2xl sm:rounded-[3rem] bg-white/80 px-6 sm:px-8 py-10 sm:py-12 md:py-16 text-center shadow-[0_20px_40px_rgba(46,125,50,0.2)] sm:shadow-[0_40px_80px_rgba(46,125,50,0.25)] backdrop-blur">
        <p className="text-xs sm:text-sm uppercase tracking-[0.2em] sm:tracking-[0.3em] text-[#3f6212]">Join Minka early</p>
        <h1 className="mt-3 sm:mt-4 text-[clamp(1.75rem,7vw,3.75rem)] font-semibold text-[#1f2f16] leading-tight sm:leading-normal px-2 sm:px-0">
          Waitlist opens the village gates first.
        </h1>
        <p className="mt-3 sm:mt-4 text-sm sm:text-base text-[#425142] px-2 sm:px-0">
          Drop your email to receive behind-the-scenes chapters, beta invites, and founding-member perks as soon as they launch.
        </p>

        <form onSubmit={handleSubmit} className="mt-8 sm:mt-10 flex flex-col gap-3 sm:gap-4 sm:flex-row sm:justify-center">
          <label htmlFor="waitlist-email" className="sr-only">
            Email address
          </label>
          <input
            id="waitlist-email"
            type="email"
            value={email}
            onChange={(event) => {
              setEmail(event.target.value);
              if (status !== 'idle') {
                setStatus('idle');
                setMessage(null);
              }
            }}
            placeholder="you@email.com"
            required
            aria-invalid={status === 'error'}
            className="w-full rounded-full border border-[#1f2f16]/20 bg-white/70 px-5 sm:px-6 py-3 text-sm sm:text-base text-[#1f2f16] placeholder:text-[#1f2f16]/50 focus:border-[#3f6212] focus:outline-none focus:ring-2 focus:ring-[#3f6212]/30 min-h-[44px]"
          />
          <Button type="submit" disabled={isPending} size="lg" variant="accent" className="w-full sm:w-auto min-h-[44px]">
            {isPending ? 'Joining...' : 'Join the Waitlist'}
          </Button>
        </form>

        <div className="mt-3 sm:mt-4 text-xs sm:text-sm" aria-live="polite">
          {message && (
            <p className={status === 'error' ? 'text-[#9f1239]' : 'text-[#1f2f16]'}>{message}</p>
          )}
        </div>

        <p className="mt-6 sm:mt-8 text-[10px] sm:text-xs uppercase tracking-[0.15em] sm:tracking-[0.2em] text-[#1f2f16]/60 px-2 sm:px-0">
          We send one thoughtful update per week. No spam, ever.
        </p>

        <Link href="/" className="mt-8 sm:mt-10 inline-block text-xs sm:text-sm font-semibold text-[#1f2f16] underline-offset-4 hover:underline min-h-[32px] flex items-center justify-center">
          Back to homepage
        </Link>
      </div>
    </main>
  );
}