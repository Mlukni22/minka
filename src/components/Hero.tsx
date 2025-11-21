'use client';

import Image from 'next/image';
import { useState, useTransition, FormEvent } from 'react';
import { Button } from '@/components/ui/button';
import { subscribe } from '@/app/actions/subscribe';

interface HeroProps {
  content: {
    title: string;
    description: string;
    secondary?: string;
    primaryCta: { label: string; href: string };
    secondaryCta: { label: string; href: string };
    banner?: { title: string; detail: string };
  };
}

export default function Hero({ content }: HeroProps) {
  
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
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
        setMessage('You\'re on the list! We\'ll be in touch soon.');
        setEmail('');
      } catch (error) {
        console.error(error);
        setStatus('error');
        setMessage(error instanceof Error ? error.message : 'Something went wrong. Please try again later.');
      }
    });
  };

  return (
    <section className="relative overflow-hidden pb-[clamp(40px,6vw,96px)] pt-[clamp(60px,10vw,140px)]">
      <div className="mx-auto flex max-w-6xl flex-col gap-8 sm:gap-12 md:gap-14 px-4 sm:px-6 py-8 sm:py-12 md:flex-row md:items-center">
        <div className="max-w-2xl space-y-5 sm:space-y-6 text-center text-[#111111] md:max-w-xl md:text-left w-full">
          <h1 className="text-[clamp(2rem,7vw,4.5rem)] font-semibold leading-tight sm:leading-normal">
            {content.title}
          </h1>
          <p className="text-sm sm:text-base leading-relaxed text-[#4C515A] md:text-lg px-2 sm:px-0">
            {content.description}
          </p>
          {content.secondary && (
            <p className="text-sm sm:text-base leading-relaxed text-[#4C515A] md:text-lg px-2 sm:px-0">
              {content.secondary}
            </p>
          )}
          <form
            onSubmit={handleSubmit}
            className="flex w-full max-w-md mx-auto md:mx-0 flex-col gap-3 sm:flex-row sm:justify-center md:justify-start"
          >
            <label className="sr-only" htmlFor="hero-email">
              Email address
            </label>
            <input
              id="hero-email"
              type="email"
              value={email}
              onChange={(event) => {
                setEmail(event.target.value);
                if (status !== 'idle') {
                  setStatus('idle');
                  setMessage(null);
                }
              }}
              placeholder="Enter your email"
              className="flex-1 rounded-full border border-[#0000001a] bg-white/90 px-5 sm:px-6 py-3 sm:py-3.5 text-sm sm:text-base text-[#111111] placeholder:text-[#6B7280] focus:border-[#111111] focus:outline-none focus:ring-2 focus:ring-[#111111]/30 transition-colors min-h-[44px]"
              required
              disabled={isPending}
              aria-invalid={status === 'error'}
            />
            <Button type="submit" disabled={isPending} size="lg" variant="accent" className="whitespace-nowrap min-h-[44px]">
              {isPending ? 'Joining...' : 'Join Waitlist'}
            </Button>
          </form>
          
          {message && (
            <div
              className={`text-xs sm:text-sm text-center md:text-left px-2 sm:px-0 ${
                status === 'error' ? 'text-[#dc2626]' : 'text-[#16a34a]'
              }`}
              role="alert"
              aria-live="polite"
            >
              {message}
            </div>
          )}
          {content.banner && (
            <div className="flex justify-center sm:justify-start px-2 sm:px-0 mt-4 sm:mt-6">
              <div className="rounded-full border-2 border-[#8C6BFF] bg-gradient-to-r from-[#8C6BFF] to-[#7a59ef] px-6 sm:px-8 py-3 sm:py-4 text-sm sm:text-base text-white shadow-lg">
                <span className="font-bold text-base sm:text-lg">🎉 {content.banner.title} 🎉</span>
                <span className="ml-2 opacity-90 hidden sm:inline">• {content.banner.detail}</span>
              </div>
            </div>
          )}
        </div>

        <div className="relative w-full max-w-xl mx-auto md:mx-0 mt-4 md:mt-0">
          <div className="overflow-hidden rounded-2xl sm:rounded-3xl border border-[#0000000D] bg-white/80 shadow-[0_16px_32px_rgba(17,17,17,0.08)] sm:shadow-[0_24px_48px_rgba(17,17,17,0.08)] ring-1 ring-[#0000000D] backdrop-blur">
            <Image
              src="/images/hero-friends.png"
              alt="Minka the cat studying with forest friends in the village"
              width={720}
              height={720}
              className="h-full w-full object-cover"
              priority
              sizes="(max-width: 768px) 100vw, 50vw"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
