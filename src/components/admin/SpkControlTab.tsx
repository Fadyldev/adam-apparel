import { useMemo, useState } from 'react';
import { Search } from 'lucide-react';
import { formatDate, formatRupiah } from '@/lib/format';
import { stageLabel } from '@/lib/spk';
import { useDb } from '@/store/useDb';
import { inputClass } from '@/components/ui/Field';
import { AdminPanel } from '@/components/admin/adminUi';
import SpkDetailPanel from '@/components/admin/SpkDetailPanel';
import type { SpkRecord } from '@/lib/schema';

export default function SpkControlTab() {
  const { db, update } = useDb();
  const [query, setQuery] = useState('');
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const rows = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return [...db.spkList]
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
      .filter((spk) =>
        !needle ||
        spk.id.toLowerCase().includes(needle) ||
        spk.customer.name.toLowerCase().includes(needle) ||
        spk.customer.instansi.toLowerCase().includes(needle),
      );
  }, [db.spkList, query]);

  const selected = db.spkList.find((spk) => spk.id === selectedId) ?? null;
  const inProduction = db.spkList.filter((spk) => spk.stage !== 'siap').length;
  const awaitingDp = db.spkList.filter((spk) => !spk.dpPaid).length;

  const patchSpk = (id: string, patch: Partial<SpkRecord>) =>
    update((current) => ({
      ...current,
      spkList: current.spkList.map((spk) => (spk.id === id ? { ...spk, ...patch } : spk)),
    }));

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard label="Total SPK Masuk" value={db.spkList.length} />
        <StatCard label="Sedang Produksi" value={inProduction} />
        <StatCard label="Menunggu DP 50%" value={awaitingDp} />
      </div>

      <AdminPanel
        title="Daftar SPK Masuk"
        description="Klik baris untuk membuka kontrol produksi, pembayaran, dan cetak SPK."
        action={
          <div className="relative w-full sm:w-72">
            <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Cari no. SPK, nama, instansi"
              aria-label="Cari SPK"
              className={`${inputClass} pl-10`}
            />
          </div>
        }
      >
        {rows.length === 0 ? (
          <p className="rounded-xl bg-slate-50 p-6 text-center text-sm text-slate-600">
            {db.spkList.length === 0 ? 'Belum ada SPK masuk.' : 'Tidak ada SPK yang cocok dengan pencarian.'}
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[760px] text-left text-sm">
              <thead>
                <tr className="border-b border-slate-200 text-xs uppercase tracking-wider text-slate-600">
                  <th className="py-3 pr-3 font-semibold">No SPK</th>
                  <th className="py-3 pr-3 font-semibold">Pemesan</th>
                  <th className="py-3 pr-3 font-semibold">Deadline</th>
                  <th className="py-3 pr-3 text-right font-semibold">Pcs</th>
                  <th className="py-3 pr-3 text-right font-semibold">Total</th>
                  <th className="py-3 pr-3 font-semibold">DP &amp; Pelunasan</th>
                  <th className="py-3 font-semibold">Tahap Produksi</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((spk) => {
                  const isSelected = spk.id === selectedId;
                  return (
                    <tr
                      key={spk.id}
                      onClick={() => setSelectedId(spk.id)}
                      className={`cursor-pointer border-b border-slate-100 text-slate-800 transition hover:bg-amber-50 ${
                        isSelected ? 'bg-amber-50' : ''
                      }`}
                    >
                      <td className="py-3.5 pr-3 font-extrabold text-slate-900">{spk.id}</td>
                      <td className="py-3.5 pr-3">
                        <p className="font-semibold text-slate-900">{spk.customer.name}</p>
                        <p className="text-xs text-slate-500">{spk.customer.instansi || spk.item.productName}</p>
                      </td>
                      <td className="py-3.5 pr-3 whitespace-nowrap">{formatDate(spk.customer.deadline)}</td>
                      <td className="py-3.5 pr-3 text-right font-semibold">{spk.item.totalPcs}</td>
                      <td className="py-3.5 pr-3 text-right font-semibold whitespace-nowrap">{formatRupiah(spk.item.total)}</td>
                      <td className="py-3.5 pr-3">
                        <div className="flex flex-wrap gap-1.5">
                          <Chip ok={spk.dpPaid} okLabel="DP Lunas" pendingLabel="DP Belum" />
                          <Chip ok={spk.fullyPaid} okLabel="Pelunasan Lunas" pendingLabel="Pelunasan Belum" />
                        </div>
                      </td>
                      <td className="py-3.5 font-semibold text-slate-800">{stageLabel(spk.stage)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </AdminPanel>

      {selected && (
        <SpkDetailPanel key={selected.id} spk={selected} onPatch={(patch) => patchSpk(selected.id, patch)} onClose={() => setSelectedId(null)} />
      )}
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <p className="text-sm font-semibold text-slate-600">{label}</p>
      <p className="mt-2 text-3xl font-extrabold tracking-tight text-slate-900">{value}</p>
    </div>
  );
}

function Chip({ ok, okLabel, pendingLabel }: { ok: boolean; okLabel: string; pendingLabel: string }) {
  return (
    <span
      className={`whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-semibold ${
        ok ? 'bg-emerald-50 text-emerald-800 ring-1 ring-emerald-200' : 'bg-slate-100 text-slate-700 ring-1 ring-slate-200'
      }`}
    >
      {ok ? okLabel : pendingLabel}
    </span>
  );
}
