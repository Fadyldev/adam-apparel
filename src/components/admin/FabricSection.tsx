import { useState, type FormEvent } from 'react';
import { Pencil, Plus, Trash2 } from 'lucide-react';
import { createId, parseWholeNumber } from '@/lib/ids';
import { formatRupiah } from '@/lib/format';
import { useDb } from '@/store/useDb';
import type { Fabric } from '@/lib/schema';
import Field, { inputClass } from '@/components/ui/Field';
import { AdminNotice, AdminPanel, adminDangerButton, adminPrimaryButton, adminSecondaryButton } from '@/components/admin/adminUi';

type Editing = { mode: 'new' } | { mode: 'edit'; fabric: Fabric } | null;

export default function FabricSection() {
  const { db, update } = useDb();
  const [editing, setEditing] = useState<Editing>(null);

  const saveFabric = (fabric: Fabric) => {
    update((current) => {
      const exists = current.fabricList.some((f) => f.id === fabric.id);
      return {
        ...current,
        fabricList: exists
          ? current.fabricList.map((f) => (f.id === fabric.id ? fabric : f))
          : [...current.fabricList, fabric],
      };
    });
    setEditing(null);
  };

  const deleteFabric = (fabric: Fabric) => {
    if (!window.confirm(`Hapus bahan "${fabric.name}"? Bahan ini juga dilepas dari semua produk.`)) return;
    update((current) => ({
      ...current,
      fabricList: current.fabricList.filter((f) => f.id !== fabric.id),
      catalogItems: current.catalogItems.map((item) => ({
        ...item,
        fabricIds: item.fabricIds.filter((id) => id !== fabric.id),
      })),
    }));
  };

  return (
    <AdminPanel
      title="Daftar Bahan Kain"
      description="Harga tambahan per pcs ditambahkan ke harga dasar produk. Isi 0 jika bahan termasuk harga dasar."
      action={
        editing === null ? (
          <button type="button" onClick={() => setEditing({ mode: 'new' })} className={adminPrimaryButton}>
            <Plus className="h-4 w-4" />
            Tambah Bahan
          </button>
        ) : null
      }
    >
      {editing && (
        <div className="mb-6 rounded-2xl border border-amber-300 bg-amber-50/40 p-5">
          <FabricForm
            key={editing.mode === 'new' ? 'new' : editing.fabric.id}
            initial={editing.mode === 'edit' ? editing.fabric : null}
            onSave={saveFabric}
            onCancel={() => setEditing(null)}
          />
        </div>
      )}

      {db.fabricList.length === 0 ? (
        <p className="rounded-xl bg-slate-50 p-6 text-center text-sm text-slate-600">Belum ada bahan kain.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[560px] text-left text-sm">
            <thead>
              <tr className="border-b border-slate-200 text-xs uppercase tracking-wider text-slate-600">
                <th className="py-3 pr-3 font-semibold">Nama Bahan</th>
                <th className="py-3 pr-3 font-semibold">Gramasi</th>
                <th className="py-3 pr-3 font-semibold">Tambahan / Pcs</th>
                <th className="py-3 pr-3 font-semibold">Keterangan</th>
                <th className="py-3 text-right font-semibold">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {db.fabricList.map((fabric) => (
                <tr key={fabric.id} className="border-b border-slate-100 text-slate-800">
                  <td className="py-3 pr-3 font-semibold text-slate-900">{fabric.name}</td>
                  <td className="py-3 pr-3">{fabric.gsm} gsm</td>
                  <td className="py-3 pr-3">{fabric.addOnPerPcs > 0 ? formatRupiah(fabric.addOnPerPcs) : 'Termasuk'}</td>
                  <td className="py-3 pr-3 text-slate-600">{fabric.note}</td>
                  <td className="py-3">
                    <div className="flex justify-end gap-2">
                      <button type="button" aria-label={`Edit ${fabric.name}`} onClick={() => setEditing({ mode: 'edit', fabric })} className={`${adminSecondaryButton} px-3`}>
                        <Pencil className="h-4 w-4" />
                      </button>
                      <button type="button" aria-label={`Hapus ${fabric.name}`} onClick={() => deleteFabric(fabric)} className={`${adminDangerButton} px-3`}>
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </AdminPanel>
  );
}

function FabricForm({ initial, onSave, onCancel }: { initial: Fabric | null; onSave: (f: Fabric) => void; onCancel: () => void }) {
  const [name, setName] = useState(initial?.name ?? '');
  const [gsm, setGsm] = useState(String(initial?.gsm ?? ''));
  const [addOn, setAddOn] = useState(String(initial?.addOnPerPcs ?? 0));
  const [note, setNote] = useState(initial?.note ?? '');
  const [error, setError] = useState('');

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const weight = parseWholeNumber(gsm);
    const extra = parseWholeNumber(addOn);
    if (!name.trim()) return setError('Nama bahan wajib diisi.');
    if (weight === null || weight < 1) return setError('Gramasi harus berupa angka lebih dari 0.');
    if (extra === null) return setError('Tambahan harga harus berupa angka.');
    onSave({ id: initial?.id ?? createId('fab'), name: name.trim(), gsm: weight, addOnPerPcs: extra, note: note.trim() });
  };

  return (
    <form onSubmit={handleSubmit} className="grid gap-5 sm:grid-cols-2">
      <Field label="Nama Bahan">
        <input className={inputClass} value={name} onChange={(e) => setName(e.target.value)} placeholder="Contoh: Cotton Combed 30s" />
      </Field>
      <Field label="Gramasi (gsm)">
        <input inputMode="numeric" className={inputClass} value={gsm} onChange={(e) => setGsm(e.target.value)} placeholder="160" />
      </Field>
      <Field label="Tambahan Harga per Pcs (Rp)">
        <input inputMode="numeric" className={inputClass} value={addOn} onChange={(e) => setAddOn(e.target.value)} />
      </Field>
      <Field label="Keterangan">
        <input className={inputClass} value={note} onChange={(e) => setNote(e.target.value)} placeholder="Keunggulan singkat bahan" />
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
          Simpan Bahan
        </button>
      </div>
    </form>
  );
}
