import { motion } from 'framer-motion';
import { useMemo, useState } from 'react';
import { ArrowRight, CheckCircle2 } from 'lucide-react';
import { CATALOG_ICONS } from '@/lib/icons';
import { formatRupiah } from '@/lib/format';
import { useDb } from '@/store/useDb';
import SpringTabs from '@/components/ui/SpringTabs';
import TiltCard from '@/components/ui/TiltCard';

const ALL_TAB = 'all';

export default function ProductCatalog() {
  const { db, setSelection } = useDb();
  const [active, setActive] = useState(ALL_TAB);

  const tabs = useMemo(
    () => [{ id: ALL_TAB, label: 'Semua' }, ...db.catalogItems.map((item) => ({ id: item.id, label: item.name }))],
    [db.catalogItems],
  );
  const visible = active === ALL_TAB ? db.catalogItems : db.catalogItems.filter((item) => item.id === active);

  const pickForOrder = (catalogId: string, fabricIds: string[]) => {
    setSelection({ catalogId, fabricId: fabricIds[0] ?? '' });
    document.getElementById('spk')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <section id="katalog" className="mx-auto max-w-6xl scroll-mt-28 px-5 py-20">
      <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
        <div className="max-w-2xl">
          <p className="text-sm font-semibold uppercase tracking-wider text-amber-700">Katalog Produk</p>
          <h2 className="mt-3 text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
            Pilih produk, lalu tentukan bahan kainnya
          </h2>
        </div>
        <SpringTabs tabs={tabs} active={active} onChange={setActive} layoutId="activeTab" className="flex-wrap" />
      </div>

      <div className="mt-10 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
        {visible.map((item) => {
          const Icon = CATALOG_ICONS[item.iconKey];
          const fabrics = db.fabricList.filter((fabric) => item.fabricIds.includes(fabric.id));
          return (
            <motion.div
              key={item.id}
              layout
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35 }}
            >
              <TiltCard>
                <article className="flex h-full flex-col rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:border-amber-300 hover:shadow-xl">
                  <div className="flex items-start justify-between gap-4">
                    <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-slate-900 text-amber-400">
                      <Icon className="h-6 w-6" />
                    </span>
                    <div className="text-right">
                      <p className="text-xs font-semibold text-slate-500">Mulai dari</p>
                      <p className="text-lg font-extrabold text-slate-900">{formatRupiah(item.basePrice)}</p>
                      <p className="text-xs text-slate-500">Min. {item.minOrder} pcs</p>
                    </div>
                  </div>
                  <h3 className="mt-5 text-xl font-extrabold text-slate-900">{item.name}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-slate-600">{item.description}</p>

                  <ul className="mt-4 space-y-2">
                    {item.highlights.map((highlight) => (
                      <li key={highlight} className="flex items-start gap-2 text-sm text-slate-700">
                        <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-700" />
                        {highlight}
                      </li>
                    ))}
                  </ul>

                  {fabrics.length > 0 && (
                    <div className="mt-5 flex flex-wrap gap-2">
                      {fabrics.map((fabric) => (
                        <span key={fabric.id} className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">
                          {fabric.name} - {fabric.gsm} gsm
                        </span>
                      ))}
                    </div>
                  )}

                  <button
                    type="button"
                    onClick={() => pickForOrder(item.id, item.fabricIds)}
                    className="mt-6 flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl bg-amber-500 px-4 py-3 text-sm font-semibold text-slate-900 shadow-md shadow-amber-500/25 transition hover:bg-amber-400 active:scale-95"
                  >
                    Pilih Bahan Ini di Form SPK
                    <ArrowRight className="h-4 w-4" />
                  </button>
                </article>
              </TiltCard>
            </motion.div>
          );
        })}
      </div>
    </section>
  );
}
