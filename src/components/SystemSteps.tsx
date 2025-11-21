'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';

interface SystemStepsProps {
  content: {
    title: string;
    intro: string;
    description: string;
    steps: Array<{ number: number; title: string; description: string }>;
  };
}

// Add your slideshow images to public/images/ and update these paths
// Example: if you add system-1.png, system-2.png, etc., update the paths below
const slideshowImages = [
  '/images/system-1.png',
  '/images/system-2.png',
  '/images/system-3.png',
  '/images/system-4.png',
];

export default function SystemSteps({ content }: SystemStepsProps) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const selectedSteps = content.steps.filter((step) => [1, 2, 3, 4].includes(step.number));

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImageIndex((prev) => (prev + 1) % slideshowImages.length);
    }, 4000); // Change image every 4 seconds

    return () => clearInterval(interval);
  }, []);

  return (
    <section id="system" className="bg-[#fff09b] py-[clamp(40px,6vw,96px)]">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="mx-auto max-w-3xl text-center space-y-3 sm:space-y-4">
          <h2 className="text-[clamp(1.75rem,5vw,2.8rem)] font-semibold text-[#111111] leading-tight sm:leading-normal px-2 sm:px-0">{content.title}</h2>
          <p className="text-sm sm:text-base text-[#4C515A] px-2 sm:px-0">{content.intro}</p>
          <p className="text-sm sm:text-base text-[#4C515A] px-2 sm:px-0">{content.description}</p>
        </div>

        <div className="mt-10 sm:mt-16 grid gap-8 sm:gap-10 lg:grid-cols-2 lg:items-start">
          {/* Left side - Steps */}
          <div className="space-y-6 sm:space-y-8 order-2 lg:order-1">
            {selectedSteps.map((step) => (
              <div
                key={step.number}
                className="flex gap-3 sm:gap-4"
              >
                <span className="mt-1 h-9 w-9 sm:h-10 sm:w-10 flex-shrink-0 rounded-full bg-[#8C6BFF] text-center text-base sm:text-lg font-semibold leading-[2.25rem] sm:leading-[2.5rem] text-white">
                  {step.number}
                </span>
                <div className="flex-1">
                  <h3 className="text-base sm:text-lg font-semibold text-[#111111]">{step.title}</h3>
                  <p className="mt-1 sm:mt-2 text-xs sm:text-sm leading-relaxed text-[#4C515A]">{step.description}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Right side - Slideshow */}
          <div className="relative aspect-[3/2] w-full overflow-hidden rounded-xl sm:rounded-2xl border border-[#0000000D] bg-white shadow-[0_16px_32px_rgba(17,17,17,0.08)] sm:shadow-[0_24px_48px_rgba(17,17,17,0.08)] group order-1 lg:order-2">
            <div className="relative h-full w-full">
              <Image
                src={slideshowImages[currentImageIndex]}
                alt={`Slideshow image ${currentImageIndex + 1}`}
                fill
                sizes="(min-width: 1024px) 50vw, 100vw"
                className="object-contain"
              />
            </div>

            {/* Navigation dots */}
            <div className="absolute bottom-4 left-1/2 flex -translate-x-1/2 gap-2">
              {slideshowImages.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentImageIndex(index)}
                  className={`h-2 rounded-full transition-opacity ${
                    index === currentImageIndex ? 'w-8 bg-[#111111]' : 'w-2 bg-[#111111]/30'
                  }`}
                  aria-label={`Go to slide ${index + 1}`}
                />
              ))}
            </div>

          </div>
        </div>
      </div>
    </section>
  );
}
