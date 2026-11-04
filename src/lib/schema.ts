export const SIZE_KEYS = ['S', 'M', 'L', 'XL', 'XXL', '3XL'] as const;
export type SizeKey = (typeof SIZE_KEYS)[number];
export type Sizes = Record<SizeKey, number>;

export const STAGES = [
  { id: 'antrean', label: 'Antrean Masuk' },
  { id: 'cutting', label: 'Cutting Bahan' },
  { id: 'sablon', label: 'Sablon/Bordir' },
  { id: 'jahit', label: 'Jahit' },
  { id: 'finishing', label: 'Finishing & QC' },
  { id: 'siap', label: 'Siap Ambil/Kirim' },
] as const;
export type StageId = (typeof STAGES)[number]['id'];

export const ICON_KEYS = ['shirt', 'briefcase', 'award', 'flame', 'trophy', 'layers'] as const;
export type IconKey = (typeof ICON_KEYS)[number];

export interface BankAccount {
  bank: string;
  number: string;
  owner: string;
}

export interface ShopStat {
  label: string;
  value: number;
  suffix: string;
}

export interface ShopSettings {
  shopName: string;
  tagline: string;
  sinceYear: number;
  description: string;
  address: string;
  waNumber: string;
  accounts: BankAccount[];
  stats: ShopStat[];
  adminPin: string;
  spkCounter: number;
}

export interface CatalogItem {
  id: string;
  name: string;
  iconKey: IconKey;
  basePrice: number;
  minOrder: number;
  description: string;
  highlights: string[];
  fabricIds: string[];
}

export interface Fabric {
  id: string;
  name: string;
  gsm: number;
  addOnPerPcs: number;
  note: string;
}

export interface ColorItem {
  id: string;
  name: string;
  code: string;
  hex: string;
}

export interface PortfolioItem {
  id: string;
  client: string;
  garment: string;
  quantity: number;
  year: number;
  photoUrl: string;
  note: string;
}

export interface SpkCustomer {
  name: string;
  instansi: string;
  wa: string;
  alamat: string;
  courier: string;
  deadline: string;
  notes: string;
}

export interface SpkItem {
  catalogId: string;
  productName: string;
  fabricName: string;
  isCustomFabric: boolean;
  colorName: string;
  colorCode: string;
  variation: string;
  variationDetail: string;
  designLink: string;
  sizes: Sizes;
  totalPcs: number;
  unitPrice: number;
  bigSizeFee: number;
  total: number;
  dp: number;
  remaining: number;
  tierLabel: string;
}

export interface SpkRecord {
  id: string;
  createdAt: string;
  stage: StageId;
  dpPaid: boolean;
  fullyPaid: boolean;
  customer: SpkCustomer;
  item: SpkItem;
}

export interface AppDb {
  shopSettings: ShopSettings;
  catalogItems: CatalogItem[];
  fabricList: Fabric[];
  colorList: ColorItem[];
  portfolioList: PortfolioItem[];
  spkList: SpkRecord[];
}
