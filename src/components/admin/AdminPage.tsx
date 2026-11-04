import { AnimatePresence, motion } from 'framer-motion';
import { useState } from 'react';
import { ArrowLeft, Factory } from 'lucide-react';
import { useNavigate } from '@/hooks/useRoute';
import { useDb } from '@/store/useDb';
import SpringTabs from '@/components/ui/SpringTabs';
import AdminPinGate from '@/components/admin/AdminPinGate';
import SpkControlTab from '@/components/admin/SpkControlTab';
import CatalogTab from '@/components/admin/CatalogTab';
import BahanWarnaTab from '@/components/admin/BahanWarnaTab';
import PortfolioTab from '@/components/admin/PortfolioTab';
import ShopSettingsTab from '@/components/admin/ShopSettingsTab';
import SecurityBackupTab from '@/components/admin/SecurityBackupTab';

const TABS = [
  { id: 'spk', label: 'Kontrol SPK & Produksi' },
  { id: 'katalog', label: 'Katalog & Harga' },
  { id: 'bahan', label: 'Bahan & Warna' },
  { id: 'portofolio', label: 'Portofolio' },
  { id: 'pengaturan', label: 'Pengaturan Bengkel' },
  { id: 'keamanan', label: 'Keamanan & Backup' },
] as const;

type TabId = (typeof TABS)[number]['id'];

export default function AdminPage() {
  const [unlocked, setUnlocked] = useState(false);
  const navigate = useNavigate();

  if (!unlocked) {
    return <AdminPinGate onUnlock={() => setUnlocked(true)} onBack={() => navigate('/')} />;
  }

  return <AdminShell onBack={() => navigate('/')} />;
}

function AdminShell({ onBack }: { onBack: () => void }) {
  const { db, saveFailed } = useDb();
  const [tab, setTab] = useState<TabId>('spk');

  return (
    <div className="min-h-screen bg-slate-100">
      <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/90 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-5 py-4">
          <div className="flex min-w-0 items-center gap-3">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-900 text-amber-400">
              <Factory className="h-5 w-5" />
            </span>
            <div className="min-w-0">
              <p className="truncate text-base font-extrabold text-slate-900">{db.shopSettings.shopName}</p>
              <p className="text-xs font-semibold text-slate-600">Dashboard Admin</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onBack}
            className="inline-flex shrink-0 cursor-pointer items-center gap-2 rounded-xl border border-slate-300 bg-white px-3.5 py-2 text-sm font-semibold text-slate-800 shadow-sm transition hover:border-amber-400 active:scale-95"
          >
            <ArrowLeft className="h-4 w-4" />
            <span className="hidden sm:inline">Kembali ke Website</span>
          </button>
        </div>
        <div className="mx-auto max-w-7xl overflow-x-auto px-5 pb-3">
          <SpringTabs
            tabs={TABS.map((t) => ({ id: t.id, label: t.label }))}
            active={tab}
            onChange={(id) => setTab(id as TabId)}
            layoutId="adminTab"
            className="flex-nowrap"
          />
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-5 py-8">
        {saveFailed && (
          <p role="alert" className="mb-6 rounded-xl border border-red-300 bg-red-50 px-4 py-3 text-sm font-semibold text-red-800">
            Penyimpanan di perangkat ini penuh atau diblokir. Unduh backup data sekarang agar tidak ada yang hilang.
          </p>
        )}
        <AnimatePresence mode="wait">
          <motion.div
            key={tab}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}
          >
            {tab === 'spk' && <SpkControlTab />}
            {tab === 'katalog' && <CatalogTab />}
            {tab === 'bahan' && <BahanWarnaTab />}
            {tab === 'portofolio' && <PortfolioTab />}
            {tab === 'pengaturan' && <ShopSettingsTab />}
            {tab === 'keamanan' && <SecurityBackupTab />}
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  );
}
