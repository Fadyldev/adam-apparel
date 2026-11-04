import { useState, type FormEvent } from 'react';
import { Pencil, Plus, Trash2 } from 'lucide-react';
import { createId } from '@/lib/ids';
import { useDb } from '@/store/useDb';
import type { ColorItem } from '@/lib/schema';
import Field, { inputClass } from '@/components/ui/Field';
import { AdminNotice, AdminPanel, adminDangerButton, adminPrimaryButton, adminSecondaryButton } from '@/components/admin/adminUi';

type Editing = { mode: 'new' } | { mode: 'edit'; color: ColorItem } | null;

const HEX_PATTERN = /^#[0-9a-fA-F]{6}$/;

export default function ColorSection() {
  const { db, update } = useDb();
  const [editing, setEditing] = useState<Editing>(null);

  const saveColor = (color: ColorItem) => {
    update((current) => {
      const exists = current.colorList.some((c) => c.id === color.id);
      return {
        ...current,
        colorList: exists ? current.colorList.map((c) => (c.id === color.id ? color : c)) : [...current.colorList, color],
      };
    });
    setEditing(null);
  };

  const deleteColor = (color: ColorItem) => {
    if (!window.confirm(`Hapus warna "${color.name}" dari palet?`)) return;
    update((current) => ({ ...current, colorList: current.colorList.filter((c) => c.id !== color.id) }));
  };

  return (
    <AdminPanel
      title="Palet Warna Kain"
      description="Warna di sini tampil pada Live Color Switcher di website dan bisa dipilih di kalkulator SPK."
      action={
        editing === null ? (
          <button type="button" onClick={() => setEditing({ mode: 'new' })} className={adminPrimaryButton}>
            <Plus className="h-4 w-4" />
            Tambah Warna
          </button>
        ) : null
      }
    >
      {editing && (
        <div className="mb-6 rounded-2xl border border-amber-300 bg-amber-50/40 p-5">
          <ColorForm
            key={editing.mode === 'new' ? 'new' : editing.color.id}
            initial={editing.mode === 'edit' ? editing.color : null}
            onSave={saveColor}
            onCancel={() => setEditing(null)}
          />
        </div>
      )}

      {db.colorList.length === 0 ? (
        <p className="rounded-xl bg-slate-50 p-6 text-center text-sm text-slate-600">Belum ada warna. Tambahkan warna pertama.</p>
      ) : (
        <ul className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {db.colorList.map((color) => (
            <li key={color.id} className="flex items-center gap-4 rounded-xl border border-slate-200 bg-white p-3.5 shadow-sm">
              <span className="h-12 w-12 shrink-0 rounded-full ring-2 ring-white shadow-md ring-offset-2 ring-offset-slate-200" style={{ backgroundColor: color.hex }} />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-extrabold text-slate-900">{color.name}</p>
                <p className="text-xs font-semibold text-slate-600">
                  {color.code} - <span className="font-mono">{color.hex.toUpperCase()}</span>
                </p>
              </div>
              <button type="button" aria-label={`Edit ${color.name}`} onClick={() => setEditing({ mode: 'edit', color })} className={`${adminSecondaryButton} px-3`}>
                <Pencil className="h-4 w-4" />
              </button>
              <button type="button" aria-label={`Hapus ${color.name}`} onClick={() => deleteColor(color)} className={`${adminDangerButton} px-3`}>
                <Trash2 className="h-4 w-4" />
              </button>
            </li>
          ))}
        </ul>
      )}
    </AdminPanel>
  );
}

function ColorForm({ initial, onSave, onCancel }: { initial: ColorItem | null; onSave: (c: ColorItem) => void; onCancel: () => void }) {
  const [name, setName] = useState(initial?.name ?? '');
  const [code, setCode] = useState(initial?.code ?? '');
  const [hex, setHex] = useState(initial?.hex ?? '#111827');
  const [error, setError] = useState('');

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!name.trim()) return setError('Nama warna wajib diisi.');
    if (!code.trim()) return setError('Kode warna wajib diisi.');
    if (!HEX_PATTERN.test(hex)) return setError('Kode HEX harus berbentuk #RRGGBB, misal #064E3B.');
    onSave({ id: initial?.id ?? createId('col'), name: name.trim(), code: code.trim(), hex: hex.toLowerCase() });
  };

  return (
    <form onSubmit={handleSubmit} className="grid gap-5 sm:grid-cols-2">
      <Field label="Nama Warna">
        <input className={inputClass} value={name} onChange={(e) => setName(e.target.value)} placeholder="Contoh: Emerald Bottle Green" />
      </Field>
      <Field label="Kode Warna Internal">
        <input className={inputClass} value={code} onChange={(e) => setCode(e.target.value)} placeholder="EB-03" />
      </Field>
      <Field label="Kode HEX">
        <div className="flex items-center gap-3">
          <input
            type="color"
            aria-label="Pilih warna"
            value={HEX_PATTERN.test(hex) ? hex : '#111827'}
            onChange={(e) => setHex(e.target.value)}
            className="h-11 w-14 shrink-0 cursor-pointer rounded-lg border border-slate-300 bg-white p-1"
          />
          <input className={`${inputClass} font-mono uppercase`} value={hex} onChange={(e) => setHex(e.target.value)} placeholder="#064E3B" maxLength={7} />
        </div>
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
          Simpan Warna
        </button>
      </div>
    </form>
  );
}
