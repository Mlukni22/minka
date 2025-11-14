'use client';

import { motion } from 'framer-motion';
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

interface ValueGridProps {
  content: {
    kicker: string;
    title: string;
    paragraphs: string[];
    items: Array<{ label: string; tone: 'blue' | 'purple' | 'green' | 'yellow'; description: string }>;
  };
}

export default function ValueGrid({ content }: ValueGridProps) {
  return (
    <section id="values" className="bg-white py-[clamp(56px,8vw,96px)]">
      <div className="mx-auto max-w-6xl px-4">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.4 }}
          transition={{ duration: 0.6 }}
          className="mx-auto max-w-3xl text-center"
        >
          <div className="flex items-center justify-center gap-3 mb-6">
            <span className="inline-flex items-center rounded-md border bg-[#CFE9F6] px-4 py-1.5 text-sm font-bold text-[#0e4f5a]">
              {content.kicker}
            </span>
            <h2 className="text-[clamp(2.2rem,4vw,3rem)] font-semibold text-[#111111]">{content.title}</h2>
          </div>
          <div className="space-y-3 text-base text-[#4C515A]">
            {content.paragraphs.map((paragraph) => (
              <p key={paragraph}>{paragraph}</p>
            ))}
          </div>
        </motion.div>

        <div className="mt-16 grid gap-8 md:grid-cols-2 lg:max-w-4xl lg:mx-auto">
          {content.items.map((item, index) => {
            const toneClasses: Record<string, string> = {
              blue: 'bg-[#E0F2FE] text-[#0F4C75]',
              purple: 'bg-[#E8D8FF] text-[#4C2D7F]',
              green: 'bg-[#D7F5E6] text-[#1E5B3C]',
              yellow: 'bg-[#FFF4CE] text-[#7B5E1A]',
            };

            return (
              <motion.div
                key={item.label}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.3 }}
                transition={{ duration: 0.45, delay: index * 0.08 }}
              >
                <Card className="h-full rounded-2xl border-[#0000000D] bg-white shadow-[0_20px_40px_rgba(17,17,17,0.06)]">
                  <CardHeader className="space-y-3">
                    <div className={`inline-flex w-fit items-center rounded-full px-3 py-1 text-sm font-semibold ${toneClasses[item.tone]}`}>
                      {item.label}
                    </div>
                    <CardDescription className="text-base text-[#293033]">
                      {item.description}
                    </CardDescription>
                  </CardHeader>
                </Card>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
