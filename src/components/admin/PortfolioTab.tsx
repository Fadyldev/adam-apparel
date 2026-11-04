import { useState, type FormEvent } from 'react';
import { ImageOff, Pencil, Plus, Trash2 } from 'lucide-react';
import { createId, parseWholeNumber } from '@/lib/ids';
import { useDb } from '@/store/useDb';
import type { PortfolioItem } from '@/lib/schema';
import Field, { inputClass } from '@/components/ui/Field';
import { AdminNotice, AdminPanel, adminDangerButton, adminPrimaryButton, adminSecondaryButton } from '@/components/admin/adminUi';

type Editing = { mode: 'new' } | { mode: 'edit'; item: PortfolioItem } | null;

export default function PortfolioTab() {
  const { db, update } = useDb();
  const [editing, setEditing] = useState<Editing>(null);

  const savePortfolio = (item: PortfolioItem) => {
    update((current) => {
      const exists = current.portfolioList.some((p) => p.id === item.id);
      return {
        ...current,
        portfolioList: exists
          ? current.portfolioList.map((p) => (p.id === item.id ? item : p))
          : [...current.portfolioList, item],
      };
    });
    setEditing(null);
  };

  const deletePortfolio = (item: PortfolioItem) => {
    if (!window.confirm(`Hapus proyek "${item.client}" dari portofolio?`)) return;
    update((current) => ({ ...current, portfolioList: current.portfolioList.filter((p) => p.id !== item.id) }));
  };

  return (
    <AdminPanel
      title="Portofolio Proyek"
      description="Dokumentasi proyek yang pernah dikerjakan. Tampil di bagian Portofolio pada website."
      action={
        editing === null ? (
          <button type="button" onClick={() => setEditing({ mode: 'new' })} className={adminPrimaryButton}>
            <Plus className="h-4 w-4" />
            Tambah Proyek
          </button>
        ) : null
      }
    >
      {editing && (
        <div className="mb-8 rounded-2xl border border-amber-300 bg-amber-50/40 p-5 sm:p-6">
          <PortfolioForm
            key={editing.mode === 'new' ? 'new' : editing.item.id}
            initial={editing.mode === 'edit' ? editing.item : null}
            onSave={savePortfolio}
            onCancel={() => setEditing(null)}
          />
        </div>
      )}

      {db.portfolioList.length === 0 ? (
        <p className="rounded-xl bg-slate-50 p-6 text-center text-sm text-slate-600">Belum ada proyek di portofolio.</p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {db.portfolioList.map((item) => (
            <article key={item.id} className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
              <div className="flex aspect-[4/3] items-center justify-center bg-slate-100">
                {item.photoUrl ? (
                  <img src={item.photoUrl} alt={item.client} loading="lazy" className="h-full w-full object-cover" />
                ) : (
                  <ImageOff className="h-8 w-8 text-slate-400" />
                )}
              </div>
              <div className="p-4">
                <h3 className="text-sm font-extrabold text-slate-900">{item.client}</h3>
                <p className="mt-1 text-xs font-semibold text-slate-600">
                  {item.garment} - {item.quantity} pcs - {item.year}
                </p>
                {item.note && <p className="mt-2 line-clamp-2 text-xs leading-relaxed text-slate-600">{item.note}</p>}
                <div className="mt-4 flex gap-2">
                  <button type="button" onClick={() => setEditing({ mode: 'edit', item })} className={`${adminSecondaryButton} flex-1`}>
                    <Pencil className="h-4 w-4" />
                    Edit
                  </button>
                  <button type="button" onClick={() => deletePortfolio(item)} className={adminDangerButton}>
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
    </AdminPanel>
  );
}

function PortfolioForm({ initial, onSave, onCancel }: { initial: PortfolioItem | null; onSave: (p: PortfolioItem) => void; onCancel: () => void }) {
  const [client, setClient] = useState(initial?.client ?? '');
  const [garment, setGarment] = useState(initial?.garment ?? '');
  const [quantity, setQuantity] = useState(String(initial?.quantity ?? ''));
  const [year, setYear] = useState(String(initial?.year ?? new Date().getFullYear()));
  const [photoUrl, setPhotoUrl] = useState(initial?.photoUrl ?? '');
  const [note, setNote] = useState(initial?.note ?? '');
  const [error, setError] = useState('');

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const qty = parseWholeNumber(quantity);
    const yr = parseWholeNumber(year);
    if (!client.trim()) return setError('Nama instansi atau komunitas wajib diisi.');
    if (!garment.trim()) return setError('Jenis baju wajib diisi.');
    if (qty === null || qty < 1) return setError('Jumlah produksi harus berupa angka lebih dari 0.');
    if (yr === null || yr < 2000) return setError('Tahun proyek tidak valid.');
    const url = photoUrl.trim();
    if (url && !/^https?:\/\//.test(url)) return setError('Alamat foto harus diawali http:// atau https://.');
    onSave({
      id: initial?.id ?? createId('pf'),
      client: client.trim(),
      garment: garment.trim(),
      quantity: qty,
      year: yr,
      photoUrl: url,
      note: note.trim(),
    });
  };

  return (
    <form onSubmit={handleSubmit} className="grid gap-5 sm:grid-cols-2">
      <Field label="Nama Instansi / Komunitas">
        <input className={inputClass} value={client} onChange={(e) => setClient(e.target.value)} placeholder="Contoh: Komunitas Lari Bandung" />
      </Field>
      <Field label="Jenis Baju">
        <input className={inputClass} value={garment} onChange={(e) => setGarment(e.target.value)} placeholder="Kaos Sablon, Kemeja PDH" />
      </Field>
      <Field label="Jumlah Produksi (pcs)">
        <input inputMode="numeric" className={inputClass} value={quantity} onChange={(e) => setQuantity(e.target.value)} />
      </Field>
      <Field label="Tahun">
        <input inputMode="numeric" className={inputClass} value={year} onChange={(e) => setYear(e.target.value)} />
      </Field>
      <Field label="Tautan Foto Hasil Jadi" hint="Boleh dikosongkan." className="sm:col-span-2">
        <input className={inputClass} value={photoUrl} onChange={(e) => setPhotoUrl(e.target.value)} placeholder="https://..." />
      </Field>
      <Field label="Catatan" className="sm:col-span-2">
        <textarea rows={2} className={inputClass} value={note} onChange={(e) => setNote(e.target.value)} />
      </Field>
      {error && (
        <div className="sm:col-span-2">
          <AdminNotice tone="error">{error}</AdminNotice>
        </div>
      )}
      <div className="flex flex-col-reverse gap-3 sm:col-span-2 sm:flex-row sm:justify-end">
        <button type="button" onClick={onCancel} className={adminSecondaryButton}>
          Batal
        </button>
        <button type="submit" className={adminPrimaryButton}>
          Simpan Proyek
        </button>
      </div>
    </form>
  );
}
