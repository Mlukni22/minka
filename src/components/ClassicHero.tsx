'use client';

import Image from 'next/image';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';

export default function ClassicHero() {
  return (
    <section
      className="relative overflow-hidden"
      aria-labelledby="classic-hero-title"
    >
      <div className="mx-auto flex min-h-[min(640px,80vh)] max-w-5xl flex-col items-center justify-center gap-8 px-6 py-[clamp(64px,12vw,140px)] text-center text-[#111111]">
        <motion.div
          initial={{ opacity: 0, y: 32 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.6 }}
          transition={{ duration: 0.6 }}
          className="space-y-4"
        >
          <p className="text-xs uppercase tracking-[0.3em] text-[#6B7280]">Welcome to Minka</p>
          <h1 id="classic-hero-title" className="text-[clamp(2rem,5vw,3.2rem)] font-semibold">
            Learn German by following Minka&apos;s adventures.
          </h1>
          <p className="mx-auto max-w-2xl text-base text-[#4C515A]">
            Step into Minka&apos;s cozy world and learn naturally through short, heart-warming stories and spaced
            repetition.
          </p>
          <div className="flex justify-center">
            <Button asChild size="lg" variant="accent">
              <a href="/waitlist">Join Waitlist</a>
            </Button>
          </div>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.5 }}
          transition={{ duration: 0.6, delay: 0.1 }}
        >
          <motion.div animate={{ y: [0, -18, 0] }} transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}>
            <Image
              src="/images/minka-cat.png"
              alt="Illustration of Minka the cat sitting on a forest path"
              width={360}
              height={320}
              priority
            />
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
