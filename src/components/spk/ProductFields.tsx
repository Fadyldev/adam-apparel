import { VARIATIONS } from '@/lib/constants';
import { formatRupiah } from '@/lib/format';
import { CUSTOM_OPTION, type SpkFormState } from '@/lib/spk';
import type { CatalogItem, ColorItem, Fabric } from '@/lib/schema';
import type { Selection } from '@/store/context';
import Field, { inputClass } from '@/components/ui/Field';

interface ProductFieldsProps {
  values: SpkFormState;
  catalogItems: CatalogItem[];
  productFabrics: Fabric[];
  colorList: ColorItem[];
  onSelection: (patch: Partial<Selection>) => void;
  onChange: (patch: Partial<SpkFormState>) => void;
}

export default function ProductFields({
  values,
  catalogItems,
  productFabrics,
  colorList,
  onSelection,
  onChange,
}: ProductFieldsProps) {
  const isCustomFabric = values.fabricId === CUSTOM_OPTION;
  const isCustomColor = values.colorId === CUSTOM_OPTION;

  return (
    <div className="grid gap-5 sm:grid-cols-2">
      <Field label="Jenis Pakaian">
        <select
          className={inputClass}
          value={values.catalogId}
          onChange={(e) => onSelection({ catalogId: e.target.value, fabricId: '' })}
        >
          {catalogItems.map((item) => (
            <option key={item.id} value={item.id}>
              {item.name}
            </option>
          ))}
        </select>
      </Field>

      <div className="flex flex-col gap-1.5">
        <span className="text-sm font-semibold text-slate-800">Pilihan Bahan Kain</span>
        <select
          className={inputClass}
          disabled={isCustomFabric}
          value={isCustomFabric ? '' : values.fabricId}
          onChange={(e) => onSelection({ fabricId: e.target.value })}
        >
          {productFabrics.map((fabric) => (
            <option key={fabric.id} value={fabric.id}>
              {fabric.name} ({fabric.gsm} gsm){fabric.addOnPerPcs > 0 ? ` +${formatRupiah(fabric.addOnPerPcs)}/pcs` : ''}
            </option>
          ))}
        </select>
        <label className="mt-1 flex cursor-pointer items-center gap-2 text-sm text-slate-700">
          <input
            type="checkbox"
            className="h-4 w-4 accent-amber-500"
            checked={isCustomFabric}
            onChange={(e) =>
              onSelection({ fabricId: e.target.checked ? CUSTOM_OPTION : (productFabrics[0]?.id ?? '') })
            }
          />
          Custom Bahan Sendiri
        </label>
        {isCustomFabric && (
          <input
            className={inputClass}
            value={values.customFabric}
            onChange={(e) => onChange({ customFabric: e.target.value })}
            placeholder="Tulis nama bahan, misal: Cotton Bamboo 40s"
          />
        )}
      </div>

      <div className="flex flex-col gap-1.5">
        <span className="text-sm font-semibold text-slate-800">Warna Kain</span>
        <select
          className={inputClass}
          value={values.colorId}
          onChange={(e) => onSelection({ colorId: e.target.value })}
        >
          {colorList.map((color) => (
            <option key={color.id} value={color.id}>
              {color.name} ({color.code})
            </option>
          ))}
          <option value={CUSTOM_OPTION}>Warna Khusus / Custom</option>
        </select>
        {isCustomColor && (
          <input
            className={inputClass}
            value={values.customColor}
            onChange={(e) => onChange({ customColor: e.target.value })}
            placeholder="Tulis nama atau kode warna yang diinginkan"
          />
        )}
      </div>

      <Field label="Jenis Variasi Sablon/Bordir">
        <select className={inputClass} value={values.variation} onChange={(e) => onChange({ variation: e.target.value })}>
          {VARIATIONS.map((variation) => (
            <option key={variation} value={variation}>
              {variation}
            </option>
          ))}
        </select>
      </Field>

      <Field label="Detail & Spesifikasi Sablon/Bordir" className="sm:col-span-2" hint="Tulis letak, ukuran, kantong, atau variasi jahitan yang diinginkan.">
        <textarea
          rows={3}
          className={inputClass}
          value={values.variationDetail}
          onChange={(e) => onChange({ variationDetail: e.target.value })}
          placeholder="Contoh: logo dada kiri 8x8 cm, nama punggung 25 cm, kantong dada kanan tanpa tutup"
        />
      </Field>

      <Field label="Link URL Desain / Catatan Desain" className="sm:col-span-2">
        <input
          className={inputClass}
          value={values.designLink}
          onChange={(e) => onChange({ designLink: e.target.value })}
          placeholder="https://drive.google.com/... atau catatan singkat"
        />
      </Field>
    </div>
  );
}
