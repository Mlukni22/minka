'use client';

import Image from 'next/image';
import { Button } from '@/components/ui/button';

export default function ClassicHero() {
  return (
    <section
      className="relative overflow-hidden"
      aria-labelledby="classic-hero-title"
    >
      <div className="mx-auto flex min-h-[min(500px,75vh)] sm:min-h-[min(640px,80vh)] max-w-5xl flex-col items-center justify-center gap-6 sm:gap-8 px-4 sm:px-6 py-[clamp(40px,8vw,140px)] text-center text-[#111111]">
        <div className="space-y-3 sm:space-y-4 w-full">
          <p className="text-[10px] sm:text-xs uppercase tracking-[0.2em] sm:tracking-[0.3em] text-[#6B7280]">Welcome to Minka</p>
          <h1 id="classic-hero-title" className="text-[clamp(1.75rem,6vw,3.2rem)] font-semibold leading-tight sm:leading-normal px-2">
            Learn German by following Minka&apos;s adventures.
          </h1>
          <p className="mx-auto max-w-2xl text-sm sm:text-base text-[#4C515A] px-4 sm:px-0">
            Step into Minka&apos;s cozy world and learn naturally through short, heart-warming stories and spaced
            repetition.
          </p>
          <div className="flex justify-center pt-2">
            <Button asChild size="lg" variant="accent" className="min-h-[44px] px-6 sm:px-8">
              <a href="/waitlist">Join Waitlist</a>
            </Button>
          </div>
        </div>
        <div
          className="w-full flex justify-center"
          style={{ marginLeft: '20px' }}
        >
          <div className="w-[240px] sm:w-[300px] md:w-[360px] h-auto">
            <Image
              src="/images/minka-cat.png"
              alt="Illustration of Minka the cat sitting on a forest path"
              width={360}
              height={320}
              priority
              className="w-full h-auto"
              style={{ width: 'auto', height: 'auto' }}
              sizes="(max-width: 640px) 240px, (max-width: 768px) 300px, 360px"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
