'use client';

import { motion } from 'framer-motion';

interface OutcomesProps {
  content: {
    kicker: string;
    title: string;
    items: Array<{ emphasis: string; description: string }>;
    note?: string;
  };
}

export default function Outcomes({ content }: OutcomesProps) {
  return (
    <section id="outcomes" className="bg-[#FFF9F3] py-[clamp(56px,8vw,96px)]">
      <div className="mx-auto max-w-6xl px-4">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.4 }}
          transition={{ duration: 0.6 }}
          className="mx-auto max-w-3xl text-center"
        >
          <div className="flex items-center justify-center gap-3 mb-6">
            <span className="inline-flex items-center rounded-md border bg-[#EBD3FF] px-4 py-1.5 text-sm font-bold text-[#4b2c6f]">
              {content.kicker}
            </span>
            <h2 className="text-[clamp(2rem,4vw,2.8rem)] font-semibold text-[#111111]">
              {content.title}
            </h2>
          </div>
          <p className="text-base text-[#4C515A]">
            {content.title}
          </p>
        </motion.div>

        <div className="mt-12 grid gap-12 md:grid-cols-3">
          {content.items.map((item, index) => (
            <motion.div
              key={item.emphasis}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.5, delay: index * 0.08 }}
              className="space-y-4 rounded-2xl border border-[#0000000D] bg-white/85 p-6 text-left shadow-[0_20px_40px_rgba(17,17,17,0.06)]"
            >
              <h3 className="text-xl font-semibold text-[#111111]">
                <span className="bg-gradient-to-r from-[#8C6BFF] to-[#CFE9F6] bg-clip-text text-transparent">
                  {item.emphasis}
                </span>
              </h3>
              <p className="text-sm leading-relaxed text-[#4C515A]">{item.description}</p>
            </motion.div>
          ))}
        </div>

        {content.note && (
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.4 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="mt-12 text-center text-lg text-[#4C515A]"
          >
            {content.note}
          </motion.p>
        )}
      </div>
    </section>
  );
}
