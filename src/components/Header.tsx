'use client';

import { useEffect, useState } from 'react';
import { motion, useScroll } from 'framer-motion';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface HeaderProps {
  brand: string;
  links: Array<{ label: string; href: string }>;
  cta: { label: string; href: string };
}

const variants = {
  hidden: { opacity: 0, y: -12 },
  visible: { opacity: 1, y: 0 },
};

export default function Header({ brand, links, cta }: HeaderProps) {
  const [isScrolled, setIsScrolled] = useState(false);
  const { scrollY } = useScroll();

  useEffect(() => {
    const unsubscribe = scrollY.on('change', (value) => {
      setIsScrolled(value > 24);
    });
    return () => unsubscribe();
  }, [scrollY]);

  return (
    <motion.header
      initial="hidden"
      animate="visible"
      variants={variants}
      className={cn(
        'fixed inset-x-0 top-0 z-50 transition-colors duration-300',
        isScrolled
          ? 'bg-white/95 text-[#111111] backdrop-blur border-b border-[#0000000D] shadow-[0_10px_40px_rgba(17,17,17,0.08)]'
          : 'bg-transparent text-[#111111]',
      )}
      role="banner"
    >
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4 text-sm">
        <a
          href="/"
          className="flex items-center gap-2 transition-opacity hover:opacity-80"
        >
          <Image
            src="/images/logo.jpg"
            alt={brand}
            width={120}
            height={40}
            className="h-8 w-auto object-contain"
            priority
            onError={(e) => {
              // Fallback: hide image and show text if logo fails to load
              e.currentTarget.style.display = 'none';
            }}
          />
          <span className="font-semibold tracking-[0.3em] uppercase text-[#111111] ml-2">{brand}</span>
        </a>
        <nav className="hidden items-center gap-8 text-[#6B7280] md:flex" aria-label="Primary">
          {links.map((link) => (
            <a
              key={`${link.href}-${link.label}`}
              href={link.href}
              className={cn(
                'transition-colors',
                isScrolled ? 'text-[#6B7280] hover:text-[#111111]' : 'text-[#293033] hover:text-[#111111]',
              )}
            >
              {link.label}
            </a>
          ))}
        </nav>
        <Button
          asChild
          size="sm"
          variant="accent"
          className="hidden md:inline-flex"
        >
          <a href={cta.href}>{cta.label}</a>
        </Button>
        <Button
          asChild
          size="sm"
          variant="accent"
          className="md:hidden"
        >
          <a href={cta.href}>{cta.label}</a>
        </Button>
      </div>
    </motion.header>
  );
}
