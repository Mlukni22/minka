'use client';

import { motion } from 'framer-motion';
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
    <section id="cta" className="bg-[#fff09b] py-[clamp(56px,8vw,96px)] text-[#111111]">
      <div className="mx-auto max-w-4xl px-4">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.6 }}
          className="rounded-[2.5rem] bg-white/90 p-10 shadow-[0_40px_80px_rgba(0,0,0,0.15)] backdrop-blur"
        >
          {content.kicker && (
            <div className="mb-4 inline-flex items-center rounded-md border border-[#111111]/20 bg-[#111111]/10 px-4 py-1.5 text-sm font-semibold text-[#111111]">
              {content.kicker}
            </div>
          )}
          <h2 className="text-[clamp(2rem,4vw,2.8rem)] font-semibold text-[#111111]">{content.title}</h2>
          <p className="mt-3 text-base text-[#4C515A]">{content.description}</p>
          <div className="mt-8 flex justify-center md:justify-start">
            <Button asChild size="lg" variant="accent">
              <Link href={content.buttonHref}>{content.buttonLabel}</Link>
            </Button>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
