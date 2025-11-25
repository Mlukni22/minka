/**
 * Seed script for SR module database
 * Run with: npx tsx prisma/seed.ts
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding SR module database...');

  // Create sample cards
  const card1 = await prisma.card.create({
    data: {
      front: 'Das Haus',
      back: 'The house',
      easeFactor: 2.5,
      intervalDays: 0,
      lastIntervalDays: 0,
      reps: 0,
      nextReview: new Date(),
      tags: JSON.stringify(['A1', 'house']),
      userId: 'demo-user-1',
    },
  });

  const card2 = await prisma.card.create({
    data: {
      front: 'Guten Tag',
      back: 'Good day / Hello',
      easeFactor: 2.5,
      intervalDays: 0,
      lastIntervalDays: 0,
      reps: 0,
      nextReview: new Date(),
      tags: JSON.stringify(['A1', 'greeting']),
      userId: 'demo-user-1',
    },
  });

  console.log('✅ Created sample cards:', { card1: card1.id, card2: card2.id });
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });


