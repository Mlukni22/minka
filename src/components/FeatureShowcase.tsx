'use client';

import Image from 'next/image';
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
    <section className="pt-[clamp(32px,5vw,56px)] pb-[clamp(40px,6vw,96px)] bg-[#fff09b]" id="fun-showcase">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="text-[clamp(2rem,6vw,3.75rem)] font-semibold text-[#111111] leading-tight sm:leading-normal px-2 sm:px-0">
            {content.title}
          </h2>
          <p className="mt-3 sm:mt-4 text-sm sm:text-base text-[#4C515A] px-2 sm:px-0">{content.description}</p>
        </div>

        <div className="mt-10 sm:mt-16 grid gap-8 sm:gap-10 md:grid-cols-3">
            {content.items.map((item) => (
              <div
                key={item.title}
                className="flex h-full flex-col items-center gap-4 sm:gap-5 text-center"
              >
                <div
                  className="relative w-full overflow-hidden rounded-2xl sm:rounded-[2.5rem]"
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
                <div className="space-y-2 sm:space-y-3 px-2">
                  <h3 className="text-lg sm:text-xl font-semibold text-[#111111]">{item.title}</h3>
                  <p className="text-xs sm:text-sm text-[#4C515A] leading-relaxed">{item.description}</p>
                </div>
              </div>
            ))}
        </div>

        <div className="mt-10 sm:mt-14 flex justify-center">
          <Button asChild size="lg" variant="accent" className="min-h-[44px]">
            <a href={content.cta.href}>{content.cta.label}</a>
          </Button>
        </div>
      </div>
    </section>
  );
}
