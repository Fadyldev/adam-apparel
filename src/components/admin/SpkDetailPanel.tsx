import { useState } from 'react';
import { CheckCircle2, MessageCircle, Printer, X } from 'lucide-react';
import { STAGES, type StageId } from '@/lib/schema';
import { formatDate, formatRupiah, normalizeWa } from '@/lib/format';
import { buildStatusMessage, buildWaLink, openSpkPrint, stageIndex } from '@/lib/spk';
import { useDb } from '@/store/useDb';
import { AdminNotice, AdminPanel, adminSecondaryButton } from '@/components/admin/adminUi';
import type { SpkRecord } from '@/lib/schema';

interface SpkDetailPanelProps {
  spk: SpkRecord;
  onPatch: (patch: Partial<SpkRecord>) => void;
  onClose: () => void;
}

export default function SpkDetailPanel({ spk, onPatch, onClose }: SpkDetailPanelProps) {
  const { db } = useDb();
  const settings = db.shopSettings;
  const [printError, setPrintError] = useState(false);
  const current = stageIndex(spk.stage);
  const customerWa = normalizeWa(spk.customer.wa);
  const { customer: c, item: i } = spk;

  const handlePrint = (variant: 'thermal' | 'a4') => {
    setPrintError(!openSpkPrint(spk, settings, variant));
  };

  const sendStatusUpdate = () => {
    if (!customerWa) return;
    window.open(buildWaLink(customerWa, buildStatusMessage(spk, settings)), '_blank', 'noopener,noreferrer');
  };

  return (
    <AdminPanel
      title={`Kontrol ${spk.id}`}
      description={`${c.name}${c.instansi ? ` - ${c.instansi}` : ''}`}
      action={
        <button
          type="button"
          onClick={onClose}
          aria-label="Tutup panel"
          className="cursor-pointer rounded-full p-2 text-slate-600 transition hover:bg-slate-100 active:scale-95"
        >
          <X className="h-5 w-5" />
        </button>
      }
    >
      <div className="grid gap-8 xl:grid-cols-[1.2fr_1fr]">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-600">Tahap Produksi</p>
          <ol className="mt-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {STAGES.map((stage, index) => {
              const active = stage.id === spk.stage;
              const done = index < current;
              return (
                <li key={stage.id}>
                  <button
                    type="button"
                    aria-pressed={active}
                    onClick={() => onPatch({ stage: stage.id as StageId })}
                    className={`flex w-full cursor-pointer items-center gap-3 rounded-xl border px-3.5 py-3 text-left text-sm font-semibold transition active:scale-95 ${
                      active
                        ? 'border-amber-500 bg-amber-400 text-slate-900 shadow-md shadow-amber-500/25'
                        : done
                          ? 'border-emerald-300 bg-emerald-50 text-emerald-900 hover:bg-emerald-100'
                          : 'border-slate-200 bg-white text-slate-700 hover:border-amber-300 hover:bg-amber-50'
                    }`}
                  >
                    <span
                      className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs ${
                        active ? 'bg-slate-900 text-amber-400' : done ? 'bg-emerald-700 text-white' : 'bg-slate-100 text-slate-600'
                      }`}
                    >
                      {done ? <CheckCircle2 className="h-3.5 w-3.5" /> : index + 1}
                    </span>
                    {stage.label}
                  </button>
                </li>
              );
            })}
          </ol>

          <p className="mt-8 text-xs font-semibold uppercase tracking-wider text-slate-600">Status Pembayaran</p>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <PaymentToggle label="DP 50%" amount={formatRupiah(i.dp)} paid={spk.dpPaid} onToggle={() => onPatch({ dpPaid: !spk.dpPaid })} />
            <PaymentToggle
              label="Sisa Pelunasan"
              amount={formatRupiah(i.remaining)}
              paid={spk.fullyPaid}
              onToggle={() => onPatch({ fullyPaid: !spk.fullyPaid })}
            />
          </div>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <button type="button" onClick={() => handlePrint('thermal')} className={`${adminSecondaryButton} flex-1`}>
              <Printer className="h-4 w-4" />
              Cetak Thermal 80mm
            </button>
            <button type="button" onClick={() => handlePrint('a4')} className={`${adminSecondaryButton} flex-1`}>
              <Printer className="h-4 w-4" />
              Preview PDF
            </button>
          </div>
          <button
            type="button"
            onClick={sendStatusUpdate}
            disabled={!customerWa}
            className="mt-3 inline-flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl bg-emerald-700 px-4 py-3 text-sm font-semibold text-white shadow-md shadow-emerald-700/25 transition hover:bg-emerald-600 active:scale-95 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <MessageCircle className="h-4 w-4" />
            Kirim Update Status ke WA Pembeli
          </button>
          {!customerWa && (
            <p className="mt-2 text-xs text-slate-600">Nomor WhatsApp pemesan tidak valid, sehingga update belum bisa dikirim.</p>
          )}
          {printError && (
            <div className="mt-4">
              <AdminNotice tone="error">Jendela cetak diblokir browser. Izinkan pop-up untuk situs ini lalu coba lagi.</AdminNotice>
            </div>
          )}
        </div>

        <dl className="grid grid-cols-2 gap-x-6 gap-y-4 self-start rounded-2xl bg-slate-50 p-5 text-sm">
          <Detail label="Tanggal Masuk" value={formatDate(spk.createdAt.slice(0, 10))} />
          <Detail label="Target Jadi" value={formatDate(c.deadline)} />
          <Detail label="No. WhatsApp" value={c.wa} />
          <Detail label="Ekspedisi" value={c.courier} />
          <Detail label="Produk" value={i.productName} />
          <Detail label="Bahan" value={i.fabricName} />
          <Detail label="Warna" value={`${i.colorName} (${i.colorCode})`} />
          <Detail label="Sablon/Bordir" value={i.variation} />
          <Detail label="Total Pcs" value={`${i.totalPcs} pcs`} />
          <Detail label="Total Biaya" value={formatRupiah(i.total)} />
          <div className="col-span-2">
            <Detail label="Alamat Kirim" value={c.alamat} />
          </div>
          {i.variationDetail && (
            <div className="col-span-2">
              <Detail label="Detail Sablon/Bordir" value={i.variationDetail} />
            </div>
          )}
          {c.notes && (
            <div className="col-span-2">
              <Detail label="Catatan" value={c.notes} />
            </div>
          )}
          <div className="col-span-2">
            <Detail label="Rincian Size" value={sizeSummary(spk)} />
          </div>
        </dl>
      </div>
    </AdminPanel>
  );
}

function sizeSummary(spk: SpkRecord): string {
  const parts = Object.entries(spk.item.sizes)
    .filter(([, qty]) => (qty || 0) > 0)
    .map(([size, qty]) => `${size}: ${qty}`);
  return parts.length > 0 ? parts.join(', ') : '-';
}

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-xs font-semibold uppercase tracking-wider text-slate-500">{label}</dt>
      <dd className="mt-1 break-words font-semibold text-slate-900">{value}</dd>
    </div>
  );
}

function PaymentToggle({ label, amount, paid, onToggle }: { label: string; amount: string; paid: boolean; onToggle: () => void }) {
  return (
    <button
      type="button"
      onClick={onToggle}
      aria-pressed={paid}
      className={`flex cursor-pointer items-center justify-between gap-3 rounded-xl border-2 px-4 py-3.5 text-left transition active:scale-95 ${
        paid ? 'border-emerald-600 bg-emerald-50 text-emerald-900' : 'border-slate-200 bg-white text-slate-800 hover:border-amber-300'
      }`}
    >
      <span>
        <span className="block text-sm font-semibold">{label}</span>
        <span className="block text-xs text-slate-600">{amount}</span>
      </span>
      <span className={`rounded-full px-3 py-1 text-xs font-semibold ${paid ? 'bg-emerald-700 text-white' : 'bg-slate-100 text-slate-700'}`}>
        {paid ? 'Sudah' : 'Belum'}
      </span>
    </button>
  );
}
