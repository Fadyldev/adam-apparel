export const STORAGE_KEY = 'adam-apparel.db';
export const BACKUP_APP_ID = 'adam-apparel';
export const BACKUP_VERSION = 2;
export const MIN_PIN_LENGTH = 4;
export const DEFAULT_PIN = '1234';

export const BIG_SIZE_FEE: Record<string, number> = { XXL: 5000, '3XL': 10000 };

export const PRICE_TIERS = [
  { min: 100, discount: 0.15, label: 'Harga Pabrik (>=100 pcs, diskon 15%)' },
  { min: 50, discount: 0.1, label: 'Diskon Grosir 10% (50-99 pcs)' },
  { min: 24, discount: 0.05, label: 'Diskon 5% (24-49 pcs)' },
  { min: 0, discount: 0, label: 'Harga Normal (12-23 pcs)' },
] as const;

export const VARIATIONS = ['Sablon Plastisol', 'Sablon DTF', 'Bordir Komputer', 'Polos (Tanpa Sablon)'] as const;

export const COURIERS = ['JNE', 'J&T', 'SiCepat', 'Anteraja', 'Ambil Sendiri'] as const;

export const SIZE_CHART = [
  { size: 'S', width: 48, length: 68 },
  { size: 'M', width: 50, length: 70 },
  { size: 'L', width: 52, length: 72 },
  { size: 'XL', width: 54, length: 74 },
  { size: 'XXL', width: 57, length: 76 },
  { size: '3XL', width: 60, length: 78 },
] as const;
