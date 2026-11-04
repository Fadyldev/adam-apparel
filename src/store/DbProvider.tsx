import { useCallback, useEffect, useState, type ReactNode } from 'react';
import { DbContext, type Selection } from '@/store/context';
import { loadDb, saveDb } from '@/lib/persistence';
import type { AppDb } from '@/lib/schema';

export default function DbProvider({ children }: { children: ReactNode }) {
  const [db, setDb] = useState<AppDb>(loadDb);
  const [saveFailed, setSaveFailed] = useState(false);
  const [selection, setSelectionState] = useState<Selection>({ catalogId: '', fabricId: '', colorId: '' });

  useEffect(() => {
    setSaveFailed(!saveDb(db));
  }, [db]);

  const update = useCallback((recipe: (current: AppDb) => AppDb) => {
    setDb((current) => recipe(current));
  }, []);

  const setSelection = useCallback((patch: Partial<Selection>) => {
    setSelectionState((current) => ({ ...current, ...patch }));
  }, []);

  return (
    <DbContext.Provider value={{ db, update, saveFailed, selection, setSelection }}>
      {children}
    </DbContext.Provider>
  );
}
