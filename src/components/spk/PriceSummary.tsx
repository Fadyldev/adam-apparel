import { formatRupiah } from '@/lib/format';
import type { calculatePricing } from '@/lib/pricing';

type Pricing = ReturnType<typeof calculatePricing>;

interface PriceSummaryProps {
  pricing: Pricing | null;
  productName: string;
  minOrder: number;
}

function Row({ label, value, strong = false }: { label: string; value: string; strong?: boolean }) {
  return (
    <div className="flex items-baseline justify-between gap-4 text-sm">
      <span className="text-slate-600">{label}</span>
      <span className={strong ? 'font-extrabold text-slate-900' : 'font-semibold text-slate-800'}>{value}</span>
    </div>
  );
}

export default function PriceSummary({ pricing, productName, minOrder }: PriceSummaryProps) {
  if (!pricing) {
    return (
      <div className="rounded-2xl border border-dashed border-slate-300 bg-white/80 p-6 text-sm text-slate-600">
        Pilih produk untuk melihat estimasi harga.
      </div>
    );
  }

  const belowMin = pricing.totalPcs < minOrder;

  return (
    <div className="rounded-2xl border border-slate-200 bg-white/95 p-6 shadow-lg shadow-slate-900/5 backdrop-blur-xl">
      <div className="flex items-center justify-between">
        <p className="text-sm font-extrabold uppercase tracking-wider text-slate-900">Ringkasan Biaya</p>
        <span className="text-xs font-semibold text-slate-500">{productName}</span>
      </div>

      <div className="mt-5 space-y-3">
        <Row label="Total Pcs" value={`${pricing.totalPcs} pcs`} />
        <Row label="Harga Satuan" value={formatRupiah(pricing.unitPrice)} />
        <Row label="Tier Harga" value={pricing.tier.label} />
        <Row label="Biaya Big Size" value={formatRupiah(pricing.bigSizeFee)} />
      </div>

      <div className="mt-5 space-y-3 border-t border-slate-200 pt-5">
        <Row label="Total Estimasi Biaya" value={formatRupiah(pricing.total)} strong />
        <div className="rounded-xl border-2 border-emerald-600 bg-emerald-50 p-4 ring-4 ring-emerald-500/15">
          <div className="flex items-baseline justify-between gap-4">
            <span className="text-sm font-extrabold text-emerald-900">WAJIB DP 50%</span>
            <span className="text-xl font-extrabold text-emerald-900">{formatRupiah(pricing.dp)}</span>
          </div>
        </div>
        <Row label="Sisa Pelunasan 50%" value={formatRupiah(pricing.remaining)} />
      </div>

      {belowMin && (
        <p className="mt-5 rounded-xl bg-amber-50 px-4 py-3 text-xs font-semibold text-amber-900">
          Minimal order {minOrder} pcs untuk produk ini.
        </p>
      )}
    </div>
  );
}
