import { motion } from 'framer-motion';
import { ClipboardList, Factory, PackageCheck, Ruler, Truck } from 'lucide-react';
import SpotlightCard from '@/components/ui/SpotlightCard';

const STEPS = [
  {
    icon: ClipboardList,
    title: 'Isi Form SPK Online',
    text: 'Isi data pemesan dan rincian ukuran S sampai 3XL di kalkulator.',
  },
  {
    icon: Ruler,
    title: 'Konfirmasi DP 50%',
    text: 'Bayar DP 50% dan setujui mockup desain sebelum produksi dimulai.',
  },
  {
    icon: Factory,
    title: 'Produksi Workshop',
    text: 'Potong pola, sablon atau bordir, jahit rantai, lalu finishing.',
  },
  {
    icon: PackageCheck,
    title: 'Quality Control',
    text: 'Pemeriksaan ketat tiap pcs, lalu pelunasan sisa 50%.',
  },
  {
    icon: Truck,
    title: 'Pengiriman Aman',
    text: 'Dikirim ke seluruh Indonesia dengan garansi retur 7 hari.',
  },
];

export default function WorkflowSteps() {
  return (
    <section className="mx-auto max-w-6xl px-5 py-20">
      <div className="max-w-2xl">
        <p className="text-sm font-semibold uppercase tracking-wider text-amber-700">Alur Pemesanan</p>
        <h2 className="mt-3 text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
          Lima langkah dari SPK sampai barang di tangan Anda
        </h2>
      </div>

      <ol className="relative mt-12 grid gap-5 md:grid-cols-5">
        {STEPS.map((step, index) => {
          const Icon = step.icon;
          return (
            <motion.li
              key={step.title}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-60px' }}
              transition={{ delay: index * 0.08, duration: 0.5, ease: 'easeOut' }}
            >
              <SpotlightCard className="h-full p-6">
                <div className="flex items-center justify-between">
                  <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-slate-900 text-amber-400">
                    <Icon className="h-5 w-5" />
                  </span>
                  <span className="text-xs font-semibold text-slate-500">Langkah {index + 1}</span>
                </div>
                <h3 className="mt-5 text-base font-extrabold text-slate-900">{step.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-600">{step.text}</p>
              </SpotlightCard>
            </motion.li>
          );
        })}
      </ol>
    </section>
  );
}
