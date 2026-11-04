import { BIG_SIZE_FEE, PRICE_TIERS } from '@/lib/constants';
import { SIZE_KEYS, type Sizes } from '@/lib/schema';

export function countPcs(sizes: Sizes): number {
  return SIZE_KEYS.reduce((sum, key) => sum + (sizes[key] || 0), 0);
}

export function getTier(totalPcs: number) {
  return PRICE_TIERS.find((tier) => totalPcs >= tier.min) ?? PRICE_TIERS[PRICE_TIERS.length - 1];
}

export function calculatePricing(basePrice: number, fabricAddOn: number, sizes: Sizes) {
  const totalPcs = countPcs(sizes);
  const tier = getTier(totalPcs);
  const unitPrice = Math.round(((basePrice + fabricAddOn) * (1 - tier.discount)) / 100) * 100;
  const bigSizeFee = SIZE_KEYS.reduce((sum, key) => sum + (sizes[key] || 0) * (BIG_SIZE_FEE[key] ?? 0), 0);
  const total = unitPrice * totalPcs + bigSizeFee;
  const dp = Math.round(total * 0.5);
  return { totalPcs, tier, unitPrice, bigSizeFee, total, dp, remaining: total - dp };
}
