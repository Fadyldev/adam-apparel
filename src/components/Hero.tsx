import { useDb } from '@/store/useDb';
import { buildWaLink } from '@/lib/spk';
import { ArrowRight, MessageCircle } from 'lucide-react';
import ColorMockup from '@/components/ColorMockup';
import StatsTicker from '@/components/StatsTicker';

export default function Hero() {
  const { db } = useDb();
  const { shopName, tagline, sinceYear, waNumber } = db.shopSettings;

  return (
    <section id="top" className="relative mx-auto max-w-6xl px-5 pb-16 pt-32 sm:pt-36">
      <div className="grid items-center gap-12 lg:grid-cols-2">
        <div>
          <span className="inline-flex items-center gap-2 rounded-full border border-amber-300 bg-amber-50 px-3.5 py-1.5 text-xs font-semibold uppercase tracking-wider text-amber-800">
            <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
            Sejak {sinceYear}
          </span>
          <h1 className="mt-6 text-4xl font-extrabold leading-[1.15] tracking-tight text-slate-900 sm:text-5xl lg:text-6xl">
            {shopName} <span className="text-amber-700">- {tagline}</span>
          </h1>
          <p className="mt-6 max-w-xl text-base leading-relaxed text-slate-600 sm:text-lg">
            {db.shopSettings.description}
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <a
              href="#spk"
              className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-full bg-slate-900 px-6 py-3.5 text-sm font-semibold text-white shadow-xl shadow-slate-900/20 transition hover:bg-slate-800 active:scale-95"
            >
              Buat SPK Sekarang (Hitung Harga)
              <ArrowRight className="h-4 w-4" />
            </a>
            <a
              href={buildWaLink(waNumber, `Halo Admin ${shopName}, saya ingin konsultasi desain.`)}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-full bg-emerald-700 px-6 py-3.5 text-sm font-semibold text-white shadow-xl shadow-emerald-700/25 transition hover:bg-emerald-600 active:scale-95"
            >
              <MessageCircle className="h-4 w-4" />
              Konsultasi Desain via WhatsApp
            </a>
          </div>
        </div>

        <ColorMockup />
      </div>
      <StatsTicker />
    </section>
  );
}
