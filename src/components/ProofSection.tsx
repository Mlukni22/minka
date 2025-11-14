'use client';

import Image from 'next/image';
import { motion } from 'framer-motion';

interface ProofSectionProps {
  content: {
    kicker: string;
    title: string;
    founder: {
      name: string;
      role: string;
      image: string;
      quote: string;
      story: string[];
    };
  };
}

export default function ProofSection({ content }: ProofSectionProps) {
  const { founder } = content;

  return (
    <section className="bg-white py-[clamp(56px,8vw,96px)]" id="proof">
      <div className="mx-auto max-w-6xl px-4">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.4 }}
          transition={{ duration: 0.6 }}
          className="space-y-12"
        >
          <div className="flex flex-wrap items-center gap-3">
            <span className="inline-flex items-center rounded-md border bg-[#CFE9F6] px-4 py-1.5 text-sm font-bold text-[#0e4f5a]">
              {content.kicker}
            </span>
            <h2 className="text-[clamp(2rem,4vw,2.8rem)] font-semibold text-[#111111]">
              {content.title}
            </h2>
          </div>

          <div className="grid gap-12 lg:grid-cols-[1fr,2fr] lg:items-start">
            <div className="space-y-4">
              <div className="relative h-64 w-full overflow-hidden rounded-2xl border border-[#0000000D] bg-white shadow-[0_24px_48px_rgba(17,17,17,0.08)]">
                <Image
                  src={founder.image}
                  alt={founder.name}
                  fill
                  sizes="(min-width: 1024px) 320px, 100vw"
                  className="object-cover"
                />
              </div>
              <div>
                <p className="text-lg font-semibold text-[#111111]">{founder.name}</p>
                <p className="text-sm text-[#4C515A]">{founder.role}</p>
              </div>
              <blockquote className="rounded-2xl border border-[#EBD3FF] bg-[#EBD3FF]/20 p-6 text-sm italic text-[#4B2D7F]">
                “{founder.quote}”
              </blockquote>
            </div>

            <div className="space-y-6 text-base leading-relaxed text-[#4C515A]">
              {founder.story.map((paragraph) => (
                <p key={paragraph}>{paragraph}</p>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}


