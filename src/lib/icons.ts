import {
  Award,
  Briefcase,
  Flame,
  Layers,
  Shirt,
  Trophy,
  type LucideIcon,
} from 'lucide-react';
import type { IconKey } from '@/lib/schema';

export const CATALOG_ICONS: Record<IconKey, LucideIcon> = {
  shirt: Shirt,
  briefcase: Briefcase,
  award: Award,
  flame: Flame,
  trophy: Trophy,
  layers: Layers,
};
