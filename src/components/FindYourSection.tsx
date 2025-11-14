'use client';

import { motion } from 'framer-motion';

interface FindYourSectionProps {
  content: {
    kicker: string;
    title: string;
    items: Array<{ label: string; description: string }>;
    closing: string;
  };
}

export default function FindYourSection({ content }: FindYourSectionProps) {
  return (
    <section className="bg-white py-[clamp(56px,8vw,96px)]" id="find-your">
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

          <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-3">
            {content.items.map((item, index) => (
              <motion.div
                key={item.label}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.3 }}
                transition={{ duration: 0.45, delay: index * 0.05 }}
                className="space-y-3 rounded-2xl border border-[#0000000D] bg-white/85 p-6 shadow-[0_20px_40px_rgba(17,17,17,0.06)]"
              >
                <span className="inline-flex items-center rounded-md bg-[#EBD3FF]/60 px-3 py-1 text-sm font-semibold text-[#4B2D7F]">
                  {item.label}
                </span>
                <p className="text-sm leading-relaxed text-[#4C515A]">{item.description}</p>
              </motion.div>
            ))}
          </div>

          <p className="text-center text-lg font-semibold text-[#111111]">{content.closing}</p>
        </motion.div>
      </div>
    </section>
  );
}



