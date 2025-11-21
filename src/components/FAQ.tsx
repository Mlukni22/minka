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
    <section id="faq" className="bg-[#fff09b] py-[clamp(40px,6vw,96px)]">
      <div className="mx-auto max-w-4xl px-4 sm:px-6">
        <div className="text-center">
          <h2 className="text-[clamp(1.75rem,5vw,2.5rem)] font-semibold text-[#111111] leading-tight sm:leading-normal px-2 sm:px-0">{content.title}</h2>
        </div>

        <div className="mt-8 sm:mt-12 space-y-3 sm:space-y-4">
          {content.items.map((item, index) => {
            const isOpen = openIndex === index;
            return (
              <div
                key={item.question}
                className="rounded-xl sm:rounded-2xl border border-[#0000000D] bg-white/90 p-4 sm:p-6 shadow-[0_12px_24px_rgba(17,17,17,0.06)] sm:shadow-[0_20px_40px_rgba(17,17,17,0.06)]"
              >
                <button
                  type="button"
                  onClick={() => setOpenIndex(isOpen ? null : index)}
                  className="flex w-full items-center justify-between text-left min-h-[44px]"
                  aria-expanded={isOpen}
                >
                  <span className="text-base sm:text-lg font-semibold text-[#111111] pr-4">{item.question}</span>
                  <span className="ml-4 h-7 w-7 sm:h-6 sm:w-6 flex-shrink-0 flex items-center justify-center rounded-full border border-[#111111]/20 text-sm text-[#111111]">
                    {isOpen ? '–' : '+'}
                  </span>
                </button>
                {isOpen && (
                  <div className="mt-3 sm:mt-4">
                    <p className="text-xs sm:text-sm leading-relaxed text-[#4C515A]">
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
