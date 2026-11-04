import { createSeedDb } from '@/lib/seed';
import {
  ICON_KEYS,
  SIZE_KEYS,
  STAGES,
  type AppDb,
  BankAccount,
  CatalogItem,
  ColorItem,
  Fabric,
  PortfolioItem,
  ShopSettings,
  ShopStat,
  Sizes,
  SpkRecord,
} from '@/lib/schema';

type Obj = Record<string, unknown>;

const isObj = (value: unknown): value is Obj =>
  typeof value === 'object' && value !== null && !Array.isArray(value);
const isStr = (value: unknown): value is string => typeof value === 'string';
const isNum = (value: unknown): value is number => typeof value === 'number' && Number.isFinite(value);
const isStrArr = (value: unknown): value is string[] => Array.isArray(value) && value.every(isStr);
const strOr = (value: unknown, fallback: string) => (isStr(value) ? value : fallback);
const numOr = (value: unknown, fallback: number) => (isNum(value) && value >= 0 ? value : fallback);
const list = <T>(value: unknown, guard: (item: unknown) => item is T): T[] =>
  Array.isArray(value) ? value.filter(guard) : [];

const isBank = (v: unknown): v is BankAccount => isObj(v) && isStr(v.bank) && isStr(v.number) && isStr(v.owner);
const isStat = (v: unknown): v is ShopStat => isObj(v) && isStr(v.label) && isNum(v.value) && isStr(v.suffix);
const isCatalog = (v: unknown): v is CatalogItem =>
  isObj(v) && isStr(v.id) && isStr(v.name) && isNum(v.basePrice) && isNum(v.minOrder) &&
  isStr(v.description) && isStrArr(v.highlights) && isStrArr(v.fabricIds) &&
  ICON_KEYS.includes(v.iconKey as (typeof ICON_KEYS)[number]);
const isFabric = (v: unknown): v is Fabric =>
  isObj(v) && isStr(v.id) && isStr(v.name) && isNum(v.gsm) && isNum(v.addOnPerPcs) && isStr(v.note);
const isColor = (v: unknown): v is ColorItem =>
  isObj(v) && isStr(v.id) && isStr(v.name) && isStr(v.code) && /^#[0-9a-fA-F]{6}$/.test(String(v.hex));
const isPortfolio = (v: unknown): v is PortfolioItem =>
  isObj(v) && isStr(v.id) && isStr(v.client) && isStr(v.garment) && isNum(v.quantity) &&
  isNum(v.year) && isStr(v.photoUrl) && isStr(v.note);
const isSizes = (v: unknown): v is Sizes =>
  isObj(v) && SIZE_KEYS.every((key) => v[key] === undefined || isNum(v[key]));
const isSpk = (v: unknown): v is SpkRecord =>
  isObj(v) && isStr(v.id) && /^SPK-\d+$/.test(v.id) && isStr(v.createdAt) &&
  STAGES.some((s) => s.id === v.stage) && typeof v.dpPaid === 'boolean' && typeof v.fullyPaid === 'boolean' &&
  isObj(v.customer) && isStr(v.customer.name) && isStr(v.customer.wa) &&
  isObj(v.item) && isStr(v.item.productName) && isSizes(v.item.sizes) &&
  isNum(v.item.totalPcs) && isNum(v.item.total) && isNum(v.item.dp) && isNum(v.item.remaining);

function sanitizeSettings(raw: unknown, fallback: ShopSettings): ShopSettings {
  if (!isObj(raw)) return fallback;
  const pin = isStr(raw.adminPin) && /^\d{4,8}$/.test(raw.adminPin) ? raw.adminPin : fallback.adminPin;
  return {
    shopName: strOr(raw.shopName, fallback.shopName),
    tagline: strOr(raw.tagline, fallback.tagline),
    sinceYear: numOr(raw.sinceYear, fallback.sinceYear),
    description: strOr(raw.description, fallback.description),
    address: strOr(raw.address, fallback.address),
    waNumber: isStr(raw.waNumber) && /^62\d{8,13}$/.test(raw.waNumber) ? raw.waNumber : fallback.waNumber,
    accounts: Array.isArray(raw.accounts) ? raw.accounts.filter(isBank) : fallback.accounts,
    stats: Array.isArray(raw.stats) ? raw.stats.filter(isStat) : fallback.stats,
    adminPin: pin,
    spkCounter: numOr(raw.spkCounter, fallback.spkCounter),
  };
}

export function sanitizeDb(raw: unknown): AppDb | null {
  if (!isObj(raw)) return null;
  const seed = createSeedDb();
  return {
    shopSettings: sanitizeSettings(raw.shopSettings, seed.shopSettings),
    catalogItems: list(raw.catalogItems, isCatalog),
    fabricList: list(raw.fabricList, isFabric),
    colorList: list(raw.colorList, isColor),
    portfolioList: list(raw.portfolioList, isPortfolio),
    spkList: list(raw.spkList, isSpk),
  };
}
