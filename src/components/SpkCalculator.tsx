import { useState, type ReactNode } from 'react';
import { COURIERS, VARIATIONS } from '@/lib/constants';
import type { SizeKey, Sizes } from '@/lib/schema';
import { calculatePricing } from '@/lib/pricing';
import {
  buildSpkMessage,
  buildSpkRecord,
  buildWaLink,
  CUSTOM_OPTION,
  nextSpkId,
  openSpkPrint,
  spkNumber,
  validateSpkForm,
  type SpkFormState,
} from '@/lib/spk';
import { useDb } from '@/store/useDb';
import type { SpkCustomer } from '@/lib/schema';
import CustomerFields from '@/components/spk/CustomerFields';
import ProductFields from '@/components/spk/ProductFields';
import SizeGrid from '@/components/spk/SizeGrid';
import PriceSummary from '@/components/spk/PriceSummary';
import SpkActions, { type PrintVariant, type SpkNotice } from '@/components/spk/SpkActions';

const EMPTY_SIZES: Sizes = { S: 0, M: 0, L: 0, XL: 0, XXL: 0, '3XL': 0 };

const EMPTY_CUSTOMER: SpkCustomer = {
  name: '',
  instansi: '',
  wa: '',
  alamat: '',
  courier: COURIERS[0],
  deadline: '',
  notes: '',
};

const EMPTY_FORM: SpkFormState = {
  customer: EMPTY_CUSTOMER,
  catalogId: '',
  fabricId: '',
  customFabric: '',
  colorId: '',
  customColor: '',
  variation: VARIATIONS[0],
  variationDetail: '',
  designLink: '',
  sizes: EMPTY_SIZES,
};

export default function SpkCalculator() {
  const { db, update, selection, setSelection } = useDb();
  const { shopSettings: settings, catalogItems, fabricList, colorList, spkList } = db;
  const [form, setForm] = useState<SpkFormState>(EMPTY_FORM);
  const [attempted, setAttempted] = useState(false);
  const [notice, setNotice] = useState<SpkNotice | null>(null);

  const catalog = catalogItems.find((item) => item.id === selection.catalogId) ?? catalogItems[0];
  const productFabrics = catalog ? fabricList.filter((fabric) => catalog.fabricIds.includes(fabric.id)) : [];
  const fabricId =
    selection.fabricId === CUSTOM_OPTION || productFabrics.some((f) => f.id === selection.fabricId)
      ? selection.fabricId
      : (productFabrics[0]?.id ?? CUSTOM_OPTION);
  const colorId =
    selection.colorId === CUSTOM_OPTION || colorList.some((c) => c.id === selection.colorId)
      ? selection.colorId
      : (colorList[0]?.id ?? CUSTOM_OPTION);
  const fabric = productFabrics.find((f) => f.id === fabricId);
  const color = colorList.find((c) => c.id === colorId);

  const values: SpkFormState = { ...form, catalogId: catalog?.id ?? '', fabricId, colorId };
  const pricing = catalog
    ? calculatePricing(catalog.basePrice, fabricId === CUSTOM_OPTION ? 0 : (fabric?.addOnPerPcs ?? 0), form.sizes)
    : null;
  const errors = attempted ? validateSpkForm(values, catalog?.minOrder ?? 0, Boolean(catalog)) : [];

  const updateCustomer = (patch: Partial<SpkCustomer>) =>
    setForm((prev) => ({ ...prev, customer: { ...prev.customer, ...patch } }));
  const updateSize = (key: SizeKey, value: number) =>
    setForm((prev) => ({ ...prev, sizes: { ...prev.sizes, [key]: value } }));
  const updateFields = (patch: Partial<SpkFormState>) => setForm((prev) => ({ ...prev, ...patch }));

  const readyToSubmit = () => {
    setAttempted(true);
    return validateSpkForm(values, catalog?.minOrder ?? 0, Boolean(catalog)).length === 0;
  };

  const handleSend = () => {
    if (!catalog || !readyToSubmit()) {
      setNotice({ tone: 'error', text: 'Lengkapi data SPK yang masih kosong atau belum sesuai.' });
      return;
    }
    const id = nextSpkId(settings, spkList);
    const record = buildSpkRecord(values, {
      id,
      createdAt: new Date().toISOString(),
      catalog,
      fabric,
      color,
    });
    update((current) => ({
      ...current,
      shopSettings: { ...current.shopSettings, spkCounter: spkNumber(id) },
      spkList: [...current.spkList, record],
    }));
    window.open(buildWaLink(settings.waNumber, buildSpkMessage(record, settings)), '_blank', 'noopener,noreferrer');
    setForm(EMPTY_FORM);
    setAttempted(false);
    setNotice({
      tone: 'success',
      text: `SPK ${id} tersimpan di perangkat ini dan WhatsApp admin dibuka. Lanjutkan dengan mengirim pesan di WhatsApp.`,
    });
  };

  const handlePrint = (variant: PrintVariant) => {
    if (!catalog || !readyToSubmit()) {
      setNotice({ tone: 'error', text: 'Lengkapi data SPK sebelum mencetak ringkasan.' });
      return;
    }
    const record = buildSpkRecord(values, {
      id: nextSpkId(settings, spkList),
      createdAt: new Date().toISOString(),
      catalog,
      fabric,
      color,
    });
    const opened = openSpkPrint(record, settings, variant);
    setNotice(
      opened
        ? null
        : { tone: 'error', text: 'Jendela cetak diblokir browser. Izinkan pop-up untuk situs ini lalu coba lagi.' },
    );
  };

  return (
    <section id="spk" className="mx-auto max-w-6xl scroll-mt-28 px-5 py-20">
      <div className="max-w-2xl">
        <p className="text-sm font-semibold uppercase tracking-wider text-amber-700">Kalkulator SPK</p>
        <h2 className="mt-3 text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
          Hitung estimasi dan kirim SPK dalam satu klik
        </h2>
        <p className="mt-3 text-sm leading-relaxed text-slate-600">
          Harga dihitung otomatis sesuai jumlah pcs dan ukuran. Anda cukup mengirim formulir ke admin untuk mendapatkan nomor rekening DP.
        </p>
      </div>

      {!catalog ? (
        <div className="mt-10 rounded-2xl border border-dashed border-slate-300 bg-white/80 p-8 text-center text-sm text-slate-600">
          Produk belum tersedia. Silakan hubungi admin bengkel.
        </div>
      ) : (
        <div className="mt-10 grid items-start gap-8 lg:grid-cols-[1.6fr_1fr]">
          <div className="space-y-6">
            <FormCard title="Data Pemesan">
              <CustomerFields customer={form.customer} onChange={updateCustomer} />
            </FormCard>
            <FormCard title="Detail Produk & Bahan">
              <ProductFields
                values={values}
                catalogItems={catalogItems}
                productFabrics={productFabrics}
                colorList={colorList}
                onSelection={setSelection}
                onChange={updateFields}
              />
            </FormCard>
            <FormCard title="Rincian Ukuran (S - 3XL)">
              <SizeGrid sizes={form.sizes} onChange={updateSize} />
            </FormCard>
          </div>

          <div className="space-y-6 lg:sticky lg:top-28">
            <PriceSummary pricing={pricing} productName={catalog.name} minOrder={catalog.minOrder} />
            <SpkActions
              shopName={settings.shopName}
              errors={errors}
              notice={notice}
              onSend={handleSend}
              onPrint={handlePrint}
            />
          </div>
        </div>
      )}
    </section>
  );
}

function FormCard({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white/90 p-6 shadow-sm backdrop-blur-xl sm:p-8">
      <h3 className="mb-6 text-base font-extrabold text-slate-900">{title}</h3>
      {children}
    </div>
  );
}
