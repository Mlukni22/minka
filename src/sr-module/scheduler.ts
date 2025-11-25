/**
 * Scheduler for finding and processing due cards
 * Designed to run with cron or as a worker process
 */

import { dbGetDueCards } from './db/adapter';
import { Card } from './srAlgorithm';

export interface SchedulerCallback {
  (dueCards: Card[], date: Date): void | Promise<void>;
}

/**
 * Default callback that logs due cards
 */
function defaultCallback(dueCards: Card[], date: Date): void {
  if (dueCards.length === 0) {
    console.log(`[${date.toISOString()}] No cards due for review`);
    return;
  }

  console.log(`[${date.toISOString()}] Found ${dueCards.length} due card(s):`);
  dueCards.forEach((card, index) => {
    console.log(`  ${index + 1}. ${card.front} → ${card.back} (due: ${card.nextReview})`);
  });
}

/**
 * Run scheduler to find due cards and execute callback
 * @param callback - Function to call with due cards (defaults to console logging)
 * @param date - Date to check (defaults to now)
 * @param userId - Optional user ID to filter cards
 */
export async function scheduleRunner(
  callback?: SchedulerCallback,
  date?: Date,
  userId?: string
): Promise<Card[]> {
  const checkDate = date || new Date();
  const cb = callback || defaultCallback;

  try {
    const dueCards = await dbGetDueCards(checkDate, userId);
    await cb(dueCards, checkDate);
    return dueCards;
  } catch (error) {
    console.error('Error in schedule runner:', error);
    throw error;
  }
}

/**
 * Run scheduler and send notifications (example implementation)
 * This can be extended to send emails, push notifications, etc.
 */
export async function scheduleRunnerWithNotifications(
  date?: Date,
  userId?: string
): Promise<Card[]> {
  return scheduleRunner(async (dueCards, checkDate) => {
    if (dueCards.length === 0) {
      return;
    }

    // Log notification
    console.log(`📬 Notification: ${dueCards.length} card(s) due for review`);
    
    // TODO: Add email notification
    // TODO: Add push notification
    // TODO: Add in-app notification
    
    // For now, just log
    dueCards.forEach(card => {
      console.log(`  - ${card.front} → ${card.back}`);
    });
  }, date, userId);
}

/**
 * Example cron job function
 * Can be used with node-cron or similar
 * 
 * Example cron config (hourly):
 *   const cron = require('node-cron');
 *   cron.schedule('0 * * * *', () => scheduleRunner());
 * 
 * Example cron config (daily at 9 AM):
 *   cron.schedule('0 9 * * *', () => scheduleRunner());
 */
export function setupCronJob(cronExpression: string, userId?: string): void {
  // This is a placeholder - actual implementation would require node-cron
  console.log(`Cron job setup requested: ${cronExpression}`);
  console.log('To use this, install node-cron and implement:');
  console.log(`
    import cron from 'node-cron';
    import { scheduleRunner } from './scheduler';
    
    cron.schedule('${cronExpression}', () => {
      scheduleRunner(undefined, undefined, '${userId || 'all-users'}');
    });
  `);
}


