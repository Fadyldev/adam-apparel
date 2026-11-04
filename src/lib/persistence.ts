import { STORAGE_KEY } from '@/lib/constants';
import { sanitizeDb } from '@/lib/validate';
import { createSeedDb } from '@/lib/seed';
import type { AppDb } from '@/lib/schema';

const RECOVERY_KEY = `${STORAGE_KEY}.recovered`;

export function loadDb(): AppDb {
  const raw = window.localStorage.getItem(STORAGE_KEY);
  if (!raw) return createSeedDb();
  try {
    const db = sanitizeDb(JSON.parse(raw));
    if (db) return db;
  } catch {
    // unreadable JSON falls through to recovery
  }
  window.localStorage.setItem(RECOVERY_KEY, raw);
  return createSeedDb();
}

export function saveDb(db: AppDb): boolean {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(db));
    return true;
  } catch {
    return false;
  }
}
