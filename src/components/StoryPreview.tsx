'use client';

import { motion } from 'framer-motion';

interface StoryPreviewProps {
  content: {
    quote: string;
    caption: string;
  };
}

export default function StoryPreview({ content }: StoryPreviewProps) {
  return (
    <section id="story" className="bg-[#FFF9F3] py-[clamp(56px,8vw,96px)]">
      <div className="mx-auto max-w-4xl px-4">
        <motion.figure
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.5 }}
          transition={{ duration: 0.6 }}
          className="rounded-2xl border border-[#0000000D] bg-white/85 p-10 text-center shadow-[0_20px_40px_rgba(17,17,17,0.06)] backdrop-blur"
        >
          <blockquote className="text-[clamp(1.4rem,3vw,1.8rem)] font-medium leading-relaxed text-[#111111]">
            {content.quote}
          </blockquote>
          <figcaption className="mt-6 text-sm uppercase tracking-[0.3em] text-[#6B7280]">
            {content.caption}
          </figcaption>
        </motion.figure>
      </div>
    </section>
  );
}
