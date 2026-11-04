import { useState } from 'react';
import { Minus, Plus, Ruler } from 'lucide-react';
import { SIZE_CHART } from '@/lib/constants';
import { SIZE_KEYS, type SizeKey } from '@/lib/schema';
import { countPcs } from '@/lib/pricing';
import type { Sizes } from '@/lib/schema';
import Modal from '@/components/ui/Modal';
import { inputClass } from '@/components/ui/Field';

interface SizeGridProps {
  sizes: Sizes;
  onChange: (key: SizeKey, value: number) => void;
}

export default function SizeGrid({ sizes, onChange }: SizeGridProps) {
  const [chartOpen, setChartOpen] = useState(false);
  const closeChart = () => setChartOpen(false);

  return (
    <div>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
        {SIZE_KEYS.map((key) => (
          <div key={key} className="rounded-xl border border-slate-200 bg-slate-50/80 p-3">
            <p className="text-center text-xs font-semibold uppercase tracking-wider text-slate-600">Size {key}</p>
            <div className="mt-2 flex items-center justify-between gap-1">
              <button
                type="button"
                aria-label={`Kurangi size ${key}`}
                onClick={() => onChange(key, Math.max(0, (sizes[key] || 0) - 1))}
                className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-lg bg-white text-slate-700 shadow-sm ring-1 ring-slate-200 transition hover:bg-slate-100 active:scale-95"
              >
                <Minus className="h-3.5 w-3.5" />
              </button>
              <input
                type="number"
                min={0}
                inputMode="numeric"
                aria-label={`Jumlah size ${key}`}
                value={sizes[key] || ''}
                placeholder="0"
                onChange={(e) => onChange(key, Math.max(0, Math.floor(Number(e.target.value) || 0)))}
                className={`${inputClass} w-full px-1 py-1.5 text-center font-semibold [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none`}
              />
              <button
                type="button"
                aria-label={`Tambah size ${key}`}
                onClick={() => onChange(key, (sizes[key] || 0) + 1)}
                className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-lg bg-white text-slate-700 shadow-sm ring-1 ring-slate-200 transition hover:bg-slate-100 active:scale-95"
              >
                <Plus className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <button
          type="button"
          onClick={() => setChartOpen(true)}
          className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-800 shadow-sm transition hover:border-amber-400 active:scale-95"
        >
          <Ruler className="h-4 w-4 text-amber-700" />
          Buka Panduan Size Chart (Lebar x Panjang cm)
        </button>
        <p className="text-sm font-semibold text-slate-900">
          Total Pcs: <span className="text-lg text-amber-700">{countPcs(sizes)}</span>
        </p>
      </div>

      <Modal open={chartOpen} title="Panduan Size Chart" onClose={closeChart}>
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-slate-200 text-slate-600">
              <th className="py-2 font-semibold">Size</th>
              <th className="py-2 font-semibold">Lebar (cm)</th>
              <th className="py-2 font-semibold">Panjang (cm)</th>
            </tr>
          </thead>
          <tbody>
            {SIZE_CHART.map((row) => (
              <tr key={row.size} className="border-b border-slate-100 text-slate-900">
                <td className="py-2.5 font-semibold">{row.size}</td>
                <td className="py-2.5">{row.width}</td>
                <td className="py-2.5">{row.length}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <p className="mt-4 text-xs text-slate-500">Ukuran dalam sentimeter, diukur dari ketiak ke ketiak dan dari bahu ke bawah.</p>
      </Modal>
    </div>
  );
}
