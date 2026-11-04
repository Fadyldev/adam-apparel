import { COURIERS } from '@/lib/constants';
import { todayIso } from '@/lib/format';
import type { SpkCustomer } from '@/lib/schema';
import Field, { inputClass } from '@/components/ui/Field';

interface CustomerFieldsProps {
  customer: SpkCustomer;
  onChange: (patch: Partial<SpkCustomer>) => void;
}

export default function CustomerFields({ customer, onChange }: CustomerFieldsProps) {
  return (
    <div className="grid gap-5 sm:grid-cols-2">
      <Field label="Nama Pemesan / PIC">
        <input className={inputClass} value={customer.name} onChange={(e) => onChange({ name: e.target.value })} placeholder="Nama lengkap" autoComplete="name" />
      </Field>
      <Field label="Nama Instansi / Komunitas / Brand">
        <input className={inputClass} value={customer.instansi} onChange={(e) => onChange({ instansi: e.target.value })} placeholder="Opsional" />
      </Field>
      <Field label="Nomor WhatsApp Aktif" hint="Format 08xx atau 628xx">
        <input
          type="tel"
          inputMode="tel"
          className={inputClass}
          value={customer.wa}
          onChange={(e) => onChange({ wa: e.target.value })}
          placeholder="08123456789"
          autoComplete="tel"
        />
      </Field>
      <Field label="Ekspedisi Pilihan">
        <select className={inputClass} value={customer.courier} onChange={(e) => onChange({ courier: e.target.value })}>
          {COURIERS.map((courier) => (
            <option key={courier} value={courier}>
              {courier}
            </option>
          ))}
        </select>
      </Field>
      <Field label="Alamat Lengkap Pengiriman (Kota/Kabupaten)" className="sm:col-span-2">
        <textarea rows={2} className={inputClass} value={customer.alamat} onChange={(e) => onChange({ alamat: e.target.value })} placeholder="Jalan, kelurahan, kecamatan, kota/kabupaten" />
      </Field>
      <Field label="Target Tanggal Jadi (Deadline Acara)">
        <input type="date" min={todayIso()} className={inputClass} value={customer.deadline} onChange={(e) => onChange({ deadline: e.target.value })} />
      </Field>
      <Field label="Catatan Khusus Pengerjaan">
        <input className={inputClass} value={customer.notes} onChange={(e) => onChange({ notes: e.target.value })} placeholder="Opsional" />
      </Field>
    </div>
  );
}
