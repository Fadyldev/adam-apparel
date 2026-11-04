import { useContext } from 'react';
import { DbContext } from '@/store/context';

export function useDb() {
  const value = useContext(DbContext);
  if (!value) throw new Error('useDb must be used inside DbProvider');
  return value;
}
