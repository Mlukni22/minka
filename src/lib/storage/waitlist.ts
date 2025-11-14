import { writeFile, readFile, mkdir } from 'fs/promises';
import { join } from 'path';

const WAITLIST_FILE = join(process.cwd(), 'data', 'waitlist.json');

interface WaitlistEntry {
  email: string;
  subscribedAt: string;
}

async function ensureDataDir() {
  const dataDir = join(process.cwd(), 'data');
  try {
    await mkdir(dataDir, { recursive: true });
  } catch (error) {
    // Directory might already exist
  }
}

export async function saveEmail(email: string): Promise<void> {
  await ensureDataDir();

  let entries: WaitlistEntry[] = [];
  
  try {
    const fileContent = await readFile(WAITLIST_FILE, 'utf-8');
    entries = JSON.parse(fileContent);
  } catch (error) {
    // File doesn't exist yet, start with empty array
    entries = [];
  }

  // Check if email already exists
  const exists = entries.some((entry) => entry.email.toLowerCase() === email.toLowerCase());
  if (exists) {
    throw new Error('Email already subscribed');
  }

  // Add new entry
  entries.push({
    email: email.toLowerCase(),
    subscribedAt: new Date().toISOString(),
  });

  // Save to file
  await writeFile(WAITLIST_FILE, JSON.stringify(entries, null, 2), 'utf-8');
}

export async function getAllEmails(): Promise<WaitlistEntry[]> {
  try {
    const fileContent = await readFile(WAITLIST_FILE, 'utf-8');
    return JSON.parse(fileContent);
  } catch (error) {
    return [];
  }
}

