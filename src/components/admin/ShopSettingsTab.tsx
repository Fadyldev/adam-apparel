import { useState, type FormEvent } from 'react';
import { normalizeWa } from '@/lib/format';
import { parseWholeNumber } from '@/lib/ids';
import { useDb } from '@/store/useDb';
import type { BankAccount, ShopSettings, ShopStat } from '@/lib/schema';
import Field, { inputClass } from '@/components/ui/Field';
import { AdminNotice, AdminPanel, adminPrimaryButton } from '@/components/admin/adminUi';

type Draft = Pick<ShopSettings, 'shopName' | 'tagline' | 'sinceYear' | 'description' | 'address' | 'waNumber' | 'accounts' | 'stats'>;

export default function ShopSettingsTab() {
  const { db, update } = useDb();
  const { shopSettings } = db;
  const [draft, setDraft] = useState<Draft>({
    shopName: shopSettings.shopName,
    tagline: shopSettings.tagline,
    sinceYear: shopSettings.sinceYear,
    description: shopSettings.description,
    address: shopSettings.address,
    waNumber: shopSettings.waNumber,
    accounts: shopSettings.accounts,
    stats: shopSettings.stats,
  });
  const [sinceInput, setSinceInput] = useState(String(shopSettings.sinceYear));
  const [error, setError] = useState('');
  const [saved, setSaved] = useState(false);

  const setField = <K extends keyof Draft>(key: K, value: Draft[K]) => {
    setSaved(false);
    setDraft((current) => ({ ...current, [key]: value }));
  };

  const setAccount = (index: number, patch: Partial<BankAccount>) =>
    setField('accounts', draft.accounts.map((account, i) => (i === index ? { ...account, ...patch } : account)));

  const setStat = (index: number, patch: Partial<ShopStat>) =>
    setField('stats', draft.stats.map((stat, i) => (i === index ? { ...stat, ...patch } : stat)));

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const since = parseWholeNumber(sinceInput);
    const wa = normalizeWa(draft.waNumber);
    if (!draft.shopName.trim()) return setError('Nama usaha wajib diisi.');
    if (since === null || since < 1900 || since > new Date().getFullYear()) return setError('Tahun berdiri tidak valid.');
    if (!wa) return setError('Nomor WhatsApp tidak valid. Gunakan format 62 diikuti 8 sampai 13 digit, misal 6281234567890.');
    if (draft.accounts.some((a) => !a.number.trim() || !a.owner.trim())) return setError('Nomor rekening dan nama pemilik rekening wajib diisi.');
    if (draft.stats.some((s) => s.value < 0 || !Number.isFinite(s.value))) return setError('Nilai statistik harus berupa angka.');

    setError('');
    update((current) => ({
      ...current,
      shopSettings: {
        ...current.shopSettings,
        shopName: draft.shopName.trim(),
        tagline: draft.tagline.trim(),
        sinceYear: since,
        description: draft.description.trim(),
        address: draft.address.trim(),
        waNumber: wa,
        accounts: draft.accounts.map((a) => ({ bank: a.bank, number: a.number.trim(), owner: a.owner.trim() })),
        stats: draft.stats.map((s) => ({ ...s, label: s.label.trim(), suffix: s.suffix.trim() })),
      },
    }));
    setDraft((current) => ({ ...current, waNumber: wa }));
    setSaved(true);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <AdminPanel
        title="Identitas Bengkel"
        description="Nama, deskripsi, dan alamat ini tampil di hero, footer, dan dokumen SPK. Tombol WhatsApp di website mengikuti nama dan nomor di sini."
      >
        <div className="grid gap-5 sm:grid-cols-2">
          <Field label="Nama Usaha">
            <input className={inputClass} value={draft.shopName} onChange={(e) => setField('shopName', e.target.value)} />
          </Field>
          <Field label="Tagline">
            <input className={inputClass} value={draft.tagline} onChange={(e) => setField('tagline', e.target.value)} />
          </Field>
          <Field label="Tahun Berdiri" hint="Ditampilkan sebagai badge Sejak tahun ini.">
            <input inputMode="numeric" className={inputClass} value={sinceInput} onChange={(e) => setSinceInput(e.target.value)} />
          </Field>
          <Field label="Nomor WhatsApp Resmi SPK" hint="Format 62 diikuti nomor, misal 6281234567890.">
            <input inputMode="tel" className={inputClass} value={draft.waNumber} onChange={(e) => setField('waNumber', e.target.value)} />
          </Field>
          <Field label="Deskripsi Usaha" className="sm:col-span-2">
            <textarea rows={3} className={inputClass} value={draft.description} onChange={(e) => setField('description', e.target.value)} />
          </Field>
          <Field label="Alamat Bengkel" className="sm:col-span-2">
            <textarea rows={2} className={inputClass} value={draft.address} onChange={(e) => setField('address', e.target.value)} />
          </Field>
        </div>
      </AdminPanel>

      <AdminPanel title="Rekening Pembayaran DP" description="Rekening ini ditampilkan kepada pelanggan saat pembayaran DP 50%.">
        <div className="grid gap-4 md:grid-cols-2">
          {draft.accounts.map((account, index) => (
            <div key={account.bank} className="rounded-2xl border border-slate-200 bg-slate-50/60 p-5">
              <p className="mb-4 text-sm font-extrabold tracking-wide text-slate-900">{account.bank}</p>
              <div className="grid gap-4">
                <Field label="Nomor Rekening">
                  <input inputMode="numeric" className={inputClass} value={account.number} onChange={(e) => setAccount(index, { number: e.target.value })} />
                </Field>
                <Field label="Atas Nama">
                  <input className={inputClass} value={account.owner} onChange={(e) => setAccount(index, { owner: e.target.value })} />
                </Field>
              </div>
            </div>
          ))}
        </div>
      </AdminPanel>

      <AdminPanel title="Statistik Beranda" description="Angka yang tampil pada counter di bawah hero.">
        <div className="grid gap-4 md:grid-cols-2">
          {draft.stats.map((stat, index) => (
            <div key={index} className="grid gap-4 rounded-2xl border border-slate-200 bg-slate-50/60 p-5 sm:grid-cols-3">
              <Field label="Label" className="sm:col-span-3">
                <input className={inputClass} value={stat.label} onChange={(e) => setStat(index, { label: e.target.value })} />
              </Field>
              <Field label="Angka">
                <input
                  inputMode="numeric"
                  className={inputClass}
                  value={String(stat.value)}
                  onChange={(e) => setStat(index, { value: parseWholeNumber(e.target.value) ?? 0 })}
                />
              </Field>
              <Field label="Akhiran">
                <input className={inputClass} value={stat.suffix} onChange={(e) => setStat(index, { suffix: e.target.value })} placeholder="+" />
              </Field>
            </div>
          ))}
        </div>
      </AdminPanel>

      {error && <AdminNotice tone="error">{error}</AdminNotice>}
      {saved && !error && <AdminNotice tone="success">Pengaturan bengkel berhasil disimpan.</AdminNotice>}

      <div className="flex justify-end">
        <button type="submit" className={adminPrimaryButton}>
          Simpan Pengaturan Bengkel
        </button>
      </div>
    </form>
  );
}
