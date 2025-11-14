'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
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
  const selectedSteps = content.steps.filter((step) => [1, 2, 3, 6].includes(step.number));

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImageIndex((prev) => (prev + 1) % slideshowImages.length);
    }, 4000); // Change image every 4 seconds

    return () => clearInterval(interval);
  }, []);

  return (
    <section id="system" className="bg-[#fff09b] py-[clamp(56px,8vw,96px)]">
      <div className="mx-auto max-w-6xl px-4">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.4 }}
          transition={{ duration: 0.6 }}
          className="mx-auto max-w-3xl text-center space-y-4"
        >
          <h2 className="text-[clamp(2rem,4vw,2.8rem)] font-semibold text-[#111111]">{content.title}</h2>
          <p className="text-base text-[#4C515A]">{content.intro}</p>
          <p className="text-base text-[#4C515A]">{content.description}</p>
        </motion.div>

        <div className="mt-16 grid gap-10 lg:grid-cols-2 lg:items-start">
          {/* Left side - Steps */}
          <div className="space-y-8">
            {selectedSteps.map((step, index) => (
              <motion.div
                key={step.number}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.3 }}
                transition={{
                  duration: 0.45,
                  delay: index * 0.1,
                }}
                className="flex gap-4"
              >
                <span className="mt-1 h-10 w-10 flex-shrink-0 rounded-full bg-[#EBD3FF] text-center text-lg font-semibold leading-[2.5rem] text-[#111111]">
                  {step.number}
                </span>
                <div>
                  <h3 className="text-lg font-semibold text-[#111111]">{step.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-[#4C515A]">{step.description}</p>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Right side - Slideshow */}
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="relative aspect-[3/2] w-full overflow-hidden rounded-2xl border border-[#0000000D] bg-white shadow-[0_24px_48px_rgba(17,17,17,0.08)] group"
          >
            <AnimatePresence mode="wait">
              <motion.div
                key={currentImageIndex}
                initial={{ opacity: 0, x: 30 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -30 }}
                transition={{
                  duration: 0.7,
                  ease: [0.22, 1, 0.36, 1],
                }}
                className="relative h-full w-full"
              >
                <Image
                  src={slideshowImages[currentImageIndex]}
                  alt={`Slideshow image ${currentImageIndex + 1}`}
                  fill
                  sizes="(min-width: 1024px) 50vw, 100vw"
                  className="object-contain"
                />
              </motion.div>
            </AnimatePresence>

            {/* Navigation dots */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="absolute bottom-4 left-1/2 flex -translate-x-1/2 gap-2"
            >
              {slideshowImages.map((_, index) => (
                <motion.button
                  key={index}
                  onClick={() => setCurrentImageIndex(index)}
                  whileHover={{ scale: 1.2 }}
                  whileTap={{ scale: 0.9 }}
                  initial={{ opacity: 0.5 }}
                  animate={{
                    opacity: index === currentImageIndex ? 1 : 0.5,
                    scale: index === currentImageIndex ? 1.1 : 1,
                  }}
                  transition={{ duration: 0.2 }}
                  className={`h-2 rounded-full ${
                    index === currentImageIndex ? 'w-8 bg-[#111111]' : 'w-2 bg-[#111111]/30'
                  }`}
                  aria-label={`Go to slide ${index + 1}`}
                />
              ))}
            </motion.div>

          </motion.div>
        </div>
      </div>
    </section>
  );
}
