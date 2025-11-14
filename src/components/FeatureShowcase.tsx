'use client';

import Image from 'next/image';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';

interface FeatureItem {
  image: string;
  title: string;
  description: string;
}

interface FeatureShowcaseProps {
  content: {
    title: string;
    description: string;
    items: FeatureItem[];
    cta: { label: string; href: string };
  };
}

export default function FeatureShowcase({ content }: FeatureShowcaseProps) {
  return (
    <section className="pt-[clamp(32px,5vw,56px)] pb-[clamp(56px,8vw,96px)] bg-[#fff09b]" id="fun-showcase">
      <div className="mx-auto max-w-6xl px-4">
        <motion.div
          initial={{ opacity: 0, y: 32 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.4 }}
          transition={{ duration: 0.6 }}
          className="mx-auto max-w-3xl text-center"
        >
          <h2 className="text-[clamp(2.5rem,5vw,3.75rem)] font-semibold text-[#111111]">
            {content.title}
          </h2>
          <p className="mt-4 text-base text-[#4C515A]">{content.description}</p>
        </motion.div>

        <div className="mt-16 grid gap-10 md:grid-cols-3">
            {content.items.map((item, index) => (
              <motion.div
                key={item.title}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.3 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="flex h-full flex-col items-center gap-5 text-center"
              >
                <div
                  className="relative w-full overflow-hidden rounded-[2.5rem]"
                  style={{ aspectRatio: '5 / 3' }}
                >
                  <Image
                    src={item.image}
                    alt={item.title}
                    fill
                    sizes="(min-width: 1280px) 580px, (min-width: 1024px) 420px, (min-width: 768px) 50vw, 92vw"
                    className="object-cover"
                  />
                </div>
                <div className="space-y-3">
                  <h3 className="text-xl font-semibold text-[#111111]">{item.title}</h3>
                  <p className="text-sm text-[#4C515A]">{item.description}</p>
                </div>
              </motion.div>
            ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.4 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="mt-14 flex justify-center"
        >
          <Button asChild size="lg" variant="accent">
            <a href={content.cta.href}>{content.cta.label}</a>
          </Button>
        </motion.div>
      </div>
    </section>
  );
}
