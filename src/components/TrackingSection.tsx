import { motion } from 'framer-motion';
import { useState, type FormEvent } from 'react';
import { CheckCircle2, Search } from 'lucide-react';
import { STAGES } from '@/lib/schema';
import { formatDate } from '@/lib/format';
import { findSpkByQuery, stageIndex } from '@/lib/spk';
import { inputClass } from '@/components/ui/Field';
import SpotlightCard from '@/components/ui/SpotlightCard';
import { useDb } from '@/store/useDb';
import type { SpkRecord } from '@/lib/schema';

export default function TrackingSection() {
  const { db } = useDb();
  const [input, setInput] = useState('');
  const [submitted, setSubmitted] = useState('');
  const spk = findSpkByQuery(db.spkList, submitted);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitted(input.trim());
  };

  return (
    <section id="lacak" className="mx-auto max-w-6xl scroll-mt-28 px-5 py-20">
      <SpotlightCard className="p-6 sm:p-10">
        <div className="grid gap-8 lg:grid-cols-[1fr_1.4fr] lg:items-start">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wider text-amber-700">Tracking SPK</p>
            <h2 className="mt-3 text-2xl font-extrabold tracking-tight text-slate-900 sm:text-3xl">
              Lacak Progres Pesanan Anda
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-slate-600">
              Masukkan nomor SPK yang Anda terima, misalnya SPK-001, untuk melihat tahap produksi terbaru.
            </p>
            <form onSubmit={handleSubmit} role="search" className="mt-6 flex gap-2">
              <label className="sr-only" htmlFor="spk-query">
                Nomor SPK
              </label>
              <div className="relative flex-1">
                <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  id="spk-query"
                  value={input}
                  onChange={(event) => setInput(event.target.value)}
                  placeholder="Contoh: SPK-001"
                  className={`${inputClass} pl-10`}
                />
              </div>
              <button
                type="submit"
                className="cursor-pointer rounded-xl bg-slate-900 px-5 text-sm font-semibold text-white transition hover:bg-slate-800 active:scale-95"
              >
                Lacak
              </button>
            </form>
            {submitted && !spk && (
              <p role="alert" className="mt-4 rounded-xl border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-900">
                Nomor SPK &quot;{submitted}&quot; tidak ditemukan di perangkat ini. Periksa kembali nomor Anda.
              </p>
            )}
          </div>

          <div className="min-h-[18rem]">{spk ? <TrackingResult spk={spk} /> : <TrackingPlaceholder />}</div>
        </div>
      </SpotlightCard>
    </section>
  );
}

function TrackingPlaceholder() {
  return (
    <div className="flex h-full min-h-[18rem] flex-col items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-slate-50/80 p-8 text-center">
      <p className="text-base font-semibold text-slate-800">Belum ada pesanan yang dipilih</p>
      <p className="mt-2 text-sm text-slate-600">Timeline produksi akan muncul di sini setelah nomor SPK ditemukan.</p>
    </div>
  );
}

function TrackingResult({ spk }: { spk: SpkRecord }) {
  const current = stageIndex(spk.stage);
  const progress = ((current + 1) / STAGES.length) * 100;

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">No. SPK {spk.id}</p>
          <p className="mt-1 text-lg font-extrabold text-slate-900">{spk.customer.instansi || spk.customer.name}</p>
          <p className="text-sm text-slate-600">
            {spk.item.productName} - {spk.item.totalPcs} pcs
          </p>
        </div>
        <div className="text-right text-sm">
          <p className="text-slate-500">Target jadi</p>
          <p className="font-semibold text-slate-900">{formatDate(spk.customer.deadline)}</p>
        </div>
      </div>

      <div className="mt-6 h-2 w-full overflow-hidden rounded-full bg-slate-100">
        <motion.div
          className="h-full rounded-full bg-gradient-to-r from-amber-400 to-amber-600"
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
        />
      </div>

      <ol className="mt-6 space-y-4">
        {STAGES.map((stage, index) => {
          const done = index < current;
          const active = index === current;
          return (
            <li key={stage.id} className="flex items-center gap-4">
              <span
                className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-semibold ${
                  done
                    ? 'bg-emerald-700 text-white'
                    : active
                      ? 'bg-amber-500 text-slate-900 ring-4 ring-amber-500/25'
                      : 'bg-slate-100 text-slate-500'
                }`}
              >
                {done ? <CheckCircle2 className="h-4 w-4" /> : index + 1}
              </span>
              <span
                className={`text-sm ${active ? 'font-semibold text-slate-900' : done ? 'text-slate-700' : 'text-slate-500'}`}
              >
                {stage.label}
                {active && <span className="ml-2 text-xs font-semibold text-amber-700">(Tahap Saat Ini)</span>}
              </span>
            </li>
          );
        })}
      </ol>

      <div className="mt-6 grid grid-cols-2 gap-3 text-sm">
        <div className={`rounded-xl px-4 py-3 ${spk.dpPaid ? 'bg-emerald-50 text-emerald-900' : 'bg-slate-100 text-slate-700'}`}>
          <p className="text-xs font-semibold uppercase tracking-wider">DP 50%</p>
          <p className="mt-1 font-semibold">{spk.dpPaid ? 'Sudah Diterima' : 'Menunggu Pembayaran'}</p>
        </div>
        <div className={`rounded-xl px-4 py-3 ${spk.fullyPaid ? 'bg-emerald-50 text-emerald-900' : 'bg-slate-100 text-slate-700'}`}>
          <p className="text-xs font-semibold uppercase tracking-wider">Pelunasan</p>
          <p className="mt-1 font-semibold">{spk.fullyPaid ? 'Lunas' : 'Belum Lunas'}</p>
        </div>
      </div>
    </div>
  );
}
