'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface PricingPlan {
  name: string;
  tagline: string;
  priceMonthly: number;
  priceYearly: number;
  features: string[];
  ctaLabel: string;
  highlighted: boolean;
  badge?: string;
  note?: string;
}

interface PricingProps {
  content: {
    kicker: string;
    title: string;
    description: string;
    toggleLabels: { monthly: string; yearly: string };
    plans: PricingPlan[];
  };
}

export default function Pricing({ content }: PricingProps) {
  const [billing, setBilling] = useState<'monthly' | 'yearly'>('yearly');

  return (
    <section id="pricing" className="bg-white py-[clamp(56px,8vw,96px)]">
      <div className="mx-auto max-w-6xl px-4">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.4 }}
          transition={{ duration: 0.6 }}
          className="mx-auto max-w-3xl text-center"
        >
          <div className="flex items-center justify-center gap-3 mb-4">
            <span className="inline-flex items-center rounded-md border bg-[#CFE9F6] px-4 py-1.5 text-sm font-bold text-[#0e4f5a]">
              {content.kicker}
            </span>
            <h2 className="text-[clamp(2rem,4vw,2.8rem)] font-semibold text-[#111111]">{content.title}</h2>
          </div>
          <p className="mt-4 text-base text-[#4C515A]">{content.description}</p>

          <div className="mt-8 inline-flex rounded-full border border-[#111111]/10 bg-[#FFF9F3] p-1">
            {(['monthly', 'yearly'] as const).map((option) => (
              <button
                key={option}
                type="button"
                onClick={() => setBilling(option)}
                className={cn(
                  'rounded-full px-6 py-2 text-sm font-semibold transition-colors',
                  billing === option ? 'bg-[#111111] text-white shadow-sm' : 'text-[#6B7280] hover:text-[#111111]',
                )}
                aria-pressed={billing === option}
              >
                {content.toggleLabels[option]}
              </button>
            ))}
          </div>
        </motion.div>

        <div className="mt-16 grid gap-6 md:grid-cols-3">
          {content.plans.map((plan, index) => {
            const price = billing === 'monthly' ? plan.priceMonthly : plan.priceYearly;
            const isFree = price === 0;
            const priceLabel = isFree
              ? 'Free'
              : billing === 'monthly'
              ? plan.priceMonthly === 0
                ? `€${plan.priceYearly}/yr`
                : `€${price}/mo`
              : `€${price}/yr`;

            return (
              <motion.div
                key={plan.name}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.25 }}
                transition={{ duration: 0.5, delay: index * 0.08 }}
              >
                <Card
                  className={cn(
                    'h-full rounded-2xl border-[#0000000D] bg-white shadow-[0_24px_48px_rgba(17,17,17,0.08)]',
                    plan.highlighted && 'border-[#111111] shadow-[0_32px_64px_rgba(17,17,17,0.12)]',
                  )}
                >
                  <CardHeader className="gap-3">
                    <div className="flex items-center justify-between gap-2">
                      <CardTitle className="text-2xl">{plan.name}</CardTitle>
                      {plan.badge && (
                        <span className="rounded-full bg-[#F7D4D9] px-3 py-1 text-xs font-semibold text-[#111111]">
                          {plan.badge}
                        </span>
                      )}
                    </div>
                    <CardDescription>{plan.tagline}</CardDescription>
                    <div className="mt-4 text-left">
                      <div className="text-3xl font-semibold text-[#111111]">{priceLabel}</div>
                      {!isFree && billing === 'monthly' && plan.priceMonthly !== 0 && (
                        <p className="text-xs text-[#6B7280]">Billed monthly, cancel anytime.</p>
                      )}
                      {!isFree && billing === 'yearly' && (
                        <p className="text-xs text-[#6B7280]">Paid annually. Save compared to monthly.</p>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-3 text-sm text-[#4C515A]">
                      {plan.features.map((feature) => (
                        <li key={feature} className="flex items-start gap-2">
                          <span aria-hidden className="mt-1 h-2 w-2 rounded-full bg-[#111111]" />
                          <span>{feature}</span>
                        </li>
                      ))}
                    </ul>
                    {plan.note && <p className="mt-4 text-xs text-[#6B7280]">{plan.note}</p>}
                  </CardContent>
                  <CardFooter className="mt-8 flex justify-start">
                    <Button className="w-full" variant={plan.highlighted ? 'primary' : 'secondary'}>
                      {plan.ctaLabel}
                    </Button>
                  </CardFooter>
                </Card>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
