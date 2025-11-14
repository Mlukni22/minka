'use client';

import { useState } from 'react';

interface FAQItem {
  question: string;
  answer: string;
}

interface FAQProps {
  content: {
    title: string;
    items: FAQItem[];
  };
}

export default function FAQ({ content }: FAQProps) {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <section id="faq" className="bg-[#fff09b] py-[clamp(56px,8vw,96px)]">
      <div className="mx-auto max-w-4xl px-4">
        <div className="text-center">
          <h2 className="text-[clamp(2rem,4vw,2.5rem)] font-semibold text-[#111111]">{content.title}</h2>
        </div>

        <div className="mt-12 space-y-4">
          {content.items.map((item, index) => {
            const isOpen = openIndex === index;
            return (
              <div
                key={item.question}
                className="rounded-2xl border border-[#0000000D] bg-white/90 p-6 shadow-[0_20px_40px_rgba(17,17,17,0.06)]"
              >
                <button
                  type="button"
                  onClick={() => setOpenIndex(isOpen ? null : index)}
                  className="flex w-full items-center justify-between text-left"
                  aria-expanded={isOpen}
                >
                  <span className="text-lg font-semibold text-[#111111]">{item.question}</span>
                  <span className="ml-4 h-6 w-6 flex items-center justify-center rounded-full border border-[#111111]/20 text-sm text-[#111111]">
                    {isOpen ? '–' : '+'}
                  </span>
                </button>
                {isOpen && (
                  <div className="mt-4">
                    <p className="text-sm leading-relaxed text-[#4C515A]">
                      {item.answer}
                    </p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
