import { createContext } from 'react';
import type { AppDb } from '@/lib/schema';

export interface Selection {
  catalogId: string;
  fabricId: string;
  colorId: string;
}

export interface DbContextValue {
  db: AppDb;
  update: (recipe: (db: AppDb) => AppDb) => void;
  saveFailed: boolean;
  selection: Selection;
  setSelection: (patch: Partial<Selection>) => void;
}

export const DbContext = createContext<DbContextValue | null>(null);
