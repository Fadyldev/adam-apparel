import { useState, type FormEvent } from 'react';
import { createId, parseWholeNumber } from '@/lib/ids';
import { ICON_KEYS, type CatalogItem, type Fabric, type IconKey } from '@/lib/schema';
import Field, { inputClass } from '@/components/ui/Field';
import { adminPrimaryButton, adminSecondaryButton, AdminNotice } from '@/components/admin/adminUi';

const ICON_LABELS: Record<IconKey, string> = {
  shirt: 'Kaos',
  briefcase: 'Kemeja / Kantor',
  award: 'Polo',
  flame: 'Hoodie',
  trophy: 'Jersey / Sport',
  layers: 'Umum',
};

interface CatalogItemFormProps {
  initial: CatalogItem | null;
  fabricList: Fabric[];
  onSave: (item: CatalogItem) => void;
  onCancel: () => void;
}

export default function CatalogItemForm({ initial, fabricList, onSave, onCancel }: CatalogItemFormProps) {
  const [name, setName] = useState(initial?.name ?? '');
  const [iconKey, setIconKey] = useState<IconKey>(initial?.iconKey ?? 'shirt');
  const [basePrice, setBasePrice] = useState(String(initial?.basePrice ?? ''));
  const [minOrder, setMinOrder] = useState(String(initial?.minOrder ?? 12));
  const [description, setDescription] = useState(initial?.description ?? '');
  const [highlights, setHighlights] = useState((initial?.highlights ?? []).join('\n'));
  const [fabricIds, setFabricIds] = useState<string[]>(initial?.fabricIds ?? []);
  const [errors, setErrors] = useState<string[]>([]);

  const toggleFabric = (id: string) =>
    setFabricIds((current) => (current.includes(id) ? current.filter((f) => f !== id) : [...current, id]));

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const price = parseWholeNumber(basePrice);
    const min = parseWholeNumber(minOrder);
    const problems: string[] = [];
    if (!name.trim()) problems.push('Nama produk wajib diisi.');
    if (price === null) problems.push('Harga dasar harus berupa angka.');
    if (min === null || min < 1) problems.push('Minimal order harus minimal 1 pcs.');
    if (problems.length > 0) {
      setErrors(problems);
      return;
    }
    onSave({
      id: initial?.id ?? createId('cat'),
      name: name.trim(),
      iconKey,
      basePrice: price ?? 0,
      minOrder: min ?? 1,
      description: description.trim(),
      highlights: highlights.split('\n').map((line) => line.trim()).filter(Boolean),
      fabricIds,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="grid gap-5 sm:grid-cols-2">
      <Field label="Nama Produk">
        <input className={inputClass} value={name} onChange={(e) => setName(e.target.value)} placeholder="Contoh: Kaos Custom" />
      </Field>
      <Field label="Ikon Produk">
        <select className={inputClass} value={iconKey} onChange={(e) => setIconKey(e.target.value as IconKey)}>
          {ICON_KEYS.map((key) => (
            <option key={key} value={key}>
              {ICON_LABELS[key]}
            </option>
          ))}
        </select>
      </Field>
      <Field label="Harga Dasar per Pcs (Rp)" hint="Harga sebelum bahan tambahan dan diskon jumlah.">
        <input inputMode="numeric" className={inputClass} value={basePrice} onChange={(e) => setBasePrice(e.target.value)} placeholder="85000" />
      </Field>
      <Field label="Minimal Order (pcs)">
        <input inputMode="numeric" className={inputClass} value={minOrder} onChange={(e) => setMinOrder(e.target.value)} placeholder="12" />
      </Field>
      <Field label="Deskripsi Produk" className="sm:col-span-2">
        <textarea rows={2} className={inputClass} value={description} onChange={(e) => setDescription(e.target.value)} />
      </Field>
      <Field label="Keunggulan (satu baris per poin)" className="sm:col-span-2">
        <textarea rows={3} className={inputClass} value={highlights} onChange={(e) => setHighlights(e.target.value)} />
      </Field>

      <fieldset className="sm:col-span-2">
        <legend className="mb-2 text-sm font-semibold text-slate-800">Bahan yang Tersedia untuk Produk Ini</legend>
        {fabricList.length === 0 ? (
          <p className="text-sm text-slate-600">Belum ada bahan. Tambahkan bahan di tab Bahan &amp; Warna.</p>
        ) : (
          <div className="grid gap-2 sm:grid-cols-2">
            {fabricList.map((fabric) => (
              <label key={fabric.id} className="flex cursor-pointer items-center gap-3 rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-800 transition hover:border-amber-300">
                <input
                  type="checkbox"
                  className="h-4 w-4 accent-amber-500"
                  checked={fabricIds.includes(fabric.id)}
                  onChange={() => toggleFabric(fabric.id)}
                />
                {fabric.name} ({fabric.gsm} gsm)
              </label>
            ))}
          </div>
        )}
      </fieldset>

      {errors.length > 0 && (
        <div className="sm:col-span-2">
          <AdminNotice tone="error">{errors.join(' ')}</AdminNotice>
        </div>
      )}

      <div className="flex flex-col-reverse gap-3 sm:col-span-2 sm:flex-row sm:justify-end">
        <button type="button" onClick={onCancel} className={adminSecondaryButton}>
          Batal
        </button>
        <button type="submit" className={adminPrimaryButton}>
          Simpan Produk
        </button>
      </div>
    </form>
  );
}
