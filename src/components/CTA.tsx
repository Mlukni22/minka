'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';

interface CTAProps {
  content: {
    kicker?: string;
    title: string;
    description: string;
    buttonLabel: string;
    buttonHref: string;
  };
}

export default function CTA({ content }: CTAProps) {
  return (
    <section id="cta" className="bg-[#fff09b] py-[clamp(40px,6vw,96px)] text-[#111111]">
      <div className="mx-auto max-w-4xl px-4 sm:px-6">
        <div className="rounded-2xl sm:rounded-[2.5rem] bg-white/90 p-6 sm:p-8 md:p-10 shadow-[0_20px_40px_rgba(0,0,0,0.12)] sm:shadow-[0_40px_80px_rgba(0,0,0,0.15)] backdrop-blur">
          {content.kicker && (
            <div className="mb-3 sm:mb-4 inline-flex items-center rounded-md border border-[#111111]/20 bg-[#111111]/10 px-3 sm:px-4 py-1.5 text-xs sm:text-sm font-semibold text-[#111111]">
              {content.kicker}
            </div>
          )}
          <h2 className="text-[clamp(1.75rem,5vw,2.8rem)] font-semibold text-[#111111] leading-tight sm:leading-normal">{content.title}</h2>
          <p className="mt-2 sm:mt-3 text-sm sm:text-base text-[#4C515A]">{content.description}</p>
          <div className="mt-6 sm:mt-8 flex justify-center md:justify-start">
            <Button asChild size="lg" variant="accent" className="min-h-[44px] w-full sm:w-auto">
              <Link href={content.buttonHref}>{content.buttonLabel}</Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
