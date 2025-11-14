'use client';

import { motion } from 'framer-motion';

interface KnowledgeBandProps {
  content: {
    title: string;
    description: string;
    chips: string[];
    bullets: string[];
  };
}

export default function KnowledgeBand({ content }: KnowledgeBandProps) {
  return (
    <section id="knowledge" className="bg-[#fff09b] py-[clamp(56px,8vw,96px)]">
      <div className="mx-auto max-w-6xl rounded-2xl bg-[#FFF9F3] p-10 shadow-[0_24px_48px_rgba(17,17,17,0.08)]">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.4 }}
          transition={{ duration: 0.6 }}
          className="grid gap-10 md:grid-cols-[1.1fr,0.9fr] md:items-center"
        >
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-[#6B7280]">Knowledge layer</p>
            <h2 className="mt-3 text-[clamp(2rem,4vw,2.8rem)] font-semibold text-[#111111]">{content.title}</h2>
            <p className="mt-4 max-w-xl text-base text-[#4C515A]">{content.description}</p>
            <div className="mt-6 flex flex-wrap gap-3">
              {content.chips.map((chip, index) => {
                const chipBg = ['bg-[#EBD3FF]/80', 'bg-[#CFE9F6]/80', 'bg-[#F7D4D9]/80', 'bg-white/80'][
                  index % 4
                ];
                return (
                  <motion.span
                    key={chip}
                    initial={{ opacity: 0, y: 16 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, amount: 0.5 }}
                    transition={{ duration: 0.4, delay: index * 0.08 }}
                    className={`rounded-full px-5 py-2 text-sm font-semibold text-[#111111] ${chipBg}`}
                  >
                    {chip}
                  </motion.span>
                );
              })}
            </div>
          </div>
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.4 }}
            transition={{ duration: 0.6, delay: 0.12 }}
            className="space-y-4 rounded-2xl border border-[#0000000D] bg-white/85 p-6 shadow-[0_20px_40px_rgba(17,17,17,0.06)]"
          >
            <h3 className="text-lg font-semibold text-[#111111]">How the layer works</h3>
            <ul className="space-y-3 text-sm leading-relaxed text-[#4C515A]">
              {content.bullets.map((bullet) => (
                <li key={bullet} className="flex gap-3">
                  <span aria-hidden className="mt-1 h-2 w-2 flex-shrink-0 rounded-full bg-[#111111]" />
                  <span>{bullet}</span>
                </li>
              ))}
            </ul>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
