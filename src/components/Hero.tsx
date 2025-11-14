'use client';

import Image from 'next/image';
import { useRef, useState, useTransition, FormEvent } from 'react';
import { motion, Variants } from 'framer-motion';
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

const ease = [0.22, 0.61, 0.36, 1] as const;

const fadeIn: Variants = {
  hidden: { opacity: 0, y: 24 },
  visible: ({ delay = 0 }: { delay?: number } = { delay: 0 }) => ({
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.7,
      delay,
      ease,
    },
  }),
};

export default function Hero({ content }: HeroProps) {
  const ref = useRef<HTMLDivElement>(null);
  
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
    <section ref={ref} className="relative overflow-hidden pb-[clamp(56px,8vw,96px)] pt-[clamp(88px,12vw,140px)]">
      <div className="mx-auto flex max-w-6xl flex-col gap-14 px-6 py-12 md:flex-row md:items-center">
        <div className="max-w-2xl space-y-6 text-center text-[#111111] md:max-w-xl md:text-left">
          <motion.h1
            variants={fadeIn}
            initial="hidden"
            animate="visible"
            custom={{ delay: 0.1 }}
            className="text-[clamp(3rem,6vw,4.5rem)] font-semibold"
          >
            {content.title}
          </motion.h1>
          <motion.p
            variants={fadeIn}
            initial="hidden"
            animate="visible"
            custom={{ delay: 0.2 }}
            className="text-base leading-relaxed text-[#4C515A] md:text-lg"
          >
            {content.description}
          </motion.p>
          {content.secondary && (
            <motion.p
              variants={fadeIn}
              initial="hidden"
              animate="visible"
              custom={{ delay: 0.25 }}
              className="text-base font-medium text-[#293033] md:text-lg"
            >
              {content.secondary}
            </motion.p>
          )}
          <motion.form
            variants={fadeIn}
            initial="hidden"
            animate="visible"
            custom={{ delay: 0.35 }}
            onSubmit={handleSubmit}
            className="flex w-full max-w-md flex-col gap-3 sm:flex-row sm:justify-center md:justify-start"
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
              className="flex-1 rounded-full border border-[#0000001a] bg-white/90 px-6 py-3.5 text-sm text-[#111111] placeholder:text-[#6B7280] focus:border-[#111111] focus:outline-none focus:ring-2 focus:ring-[#111111]/30 transition-colors"
              required
              disabled={isPending}
              aria-invalid={status === 'error'}
            />
            <Button type="submit" disabled={isPending} size="lg" variant="accent" className="whitespace-nowrap">
              {isPending ? 'Joining...' : 'Join Waitlist'}
            </Button>
          </motion.form>
          
          {message && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`text-sm text-center md:text-left ${
                status === 'error' ? 'text-[#dc2626]' : 'text-[#16a34a]'
              }`}
              role="alert"
              aria-live="polite"
            >
              {message}
            </motion.div>
          )}
          {content.banner && (
            <motion.div
              variants={fadeIn}
              initial="hidden"
              animate="visible"
              custom={{ delay: 0.4 }}
              className="flex justify-center sm:justify-start"
            >
              <div className="rounded-full border border-[#F7D4D9] bg-[#F7D4D9]/40 px-5 py-2 text-sm text-[#7A4252]">
                <span className="font-semibold">{content.banner.title}</span>
                <span className="ml-2 opacity-80">• {content.banner.detail}</span>
              </div>
            </motion.div>
          )}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0, transition: { duration: 0.7, delay: 0.3, ease } }}
          className="relative w-full max-w-xl"
        >
          <div className="overflow-hidden rounded-3xl border border-[#0000000D] bg-white/80 shadow-[0_24px_48px_rgba(17,17,17,0.08)] ring-1 ring-[#0000000D] backdrop-blur">
            <Image
              src="/images/hero-friends.png"
              alt="Minka the cat studying with forest friends in the village"
              width={720}
              height={720}
              className="h-full w-full object-cover"
              priority
            />
          </div>
        </motion.div>
      </div>
    </section>
  );
}
