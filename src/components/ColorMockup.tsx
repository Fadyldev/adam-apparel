import { AnimatePresence, motion } from 'framer-motion';
import { useDb } from '@/store/useDb';
import TiltCard from '@/components/ui/TiltCard';
import { CUSTOM_OPTION } from '@/lib/spk';

const SHIRT_PATH =
  'M120 40 L60 70 L20 140 L60 160 L70 130 L70 300 Q70 320 90 320 L210 320 Q230 320 230 300 L230 130 L240 160 L280 140 L240 70 L180 40 Q150 62 120 40 Z';

export default function ColorMockup() {
  const { db, selection, setSelection } = useDb();
  const { colorList } = db;
  const isCustom = selection.colorId === CUSTOM_OPTION;
  const activeColor = colorList.find((c) => c.id === selection.colorId) ?? colorList[0];
  const fill = isCustom ? '#94a3b8' : (activeColor?.hex ?? '#e2e8f0');
  const label = isCustom ? 'Warna Khusus / Custom' : (activeColor?.name ?? 'Belum ada warna');
  const code = isCustom ? 'Custom' : (activeColor?.code ?? '-');

  return (
    <TiltCard>
      <div className="rounded-3xl border border-slate-200 bg-white/90 p-6 shadow-xl shadow-slate-900/5 backdrop-blur-xl">
        <div className="relative mx-auto flex aspect-[4/5] max-w-sm items-center justify-center rounded-2xl bg-gradient-to-b from-slate-50 to-slate-100">
          <AnimatePresence mode="wait">
            <motion.svg
              key={isCustom ? 'custom' : activeColor?.id ?? 'none'}
              viewBox="0 0 300 340"
              className="h-auto w-3/4 drop-shadow-xl"
              initial={{ opacity: 0, scale: 0.92 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.04 }}
              transition={{ duration: 0.45, ease: 'easeOut' }}
              role="img"
              aria-label={`Mockup baju warna ${label}`}
            >
              <path d={SHIRT_PATH} fill={fill} stroke="#cbd5e1" strokeWidth="1.5" />
              <path d="M120 40 Q150 62 180 40" fill="none" stroke="#94a3b8" strokeWidth="2" />
            </motion.svg>
          </AnimatePresence>
        </div>

        <div className="mt-5 flex items-center justify-between gap-3">
          <div className="min-w-0">
            <p className="text-xs font-semibold uppercase tracking-wider text-amber-700">Warna Kain Aktif</p>
            <p className="truncate text-lg font-extrabold text-slate-900">{label}</p>
            <p className="text-sm text-slate-600">Kode: {code}</p>
          </div>
        </div>

        {colorList.length > 0 && (
          <div role="radiogroup" aria-label="Pilih warna kain" className="mt-5 flex flex-wrap gap-3">
            {colorList.map((color) => {
              const checked = !isCustom && activeColor?.id === color.id;
              return (
                <button
                  key={color.id}
                  type="button"
                  role="radio"
                  aria-checked={checked}
                  aria-label={color.name}
                  title={`${color.name} (${color.code})`}
                  onClick={() => setSelection({ colorId: color.id })}
                  className={`h-9 w-9 cursor-pointer rounded-full border-2 shadow-sm transition active:scale-90 ${
                    checked ? 'scale-110 border-amber-500 ring-4 ring-amber-500/25' : 'border-white ring-1 ring-slate-300 hover:scale-110'
                  }`}
                  style={{ backgroundColor: color.hex }}
                />
              );
            })}
          </div>
        )}
      </div>
    </TiltCard>
  );
}
