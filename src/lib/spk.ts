import { STAGES, SIZE_KEYS, type SizeKey } from '@/lib/schema';
import { formatRupiah, escapeHtml, formatDate, normalizeWa } from '@/lib/format';
import { calculatePricing, countPcs } from '@/lib/pricing';
import type {
  CatalogItem,
  ColorItem,
  Fabric,
  ShopSettings,
  SpkCustomer,
  SpkRecord,
  Sizes,
  StageId,
} from '@/lib/schema';

export const CUSTOM_OPTION = 'custom';
const SPK_PREFIX = 'SPK-';

export interface SpkFormState {
  customer: SpkCustomer;
  catalogId: string;
  fabricId: string;
  customFabric: string;
  colorId: string;
  customColor: string;
  variation: string;
  variationDetail: string;
  designLink: string;
  sizes: Sizes;
}

export function formatSpkId(number: number): string {
  return `${SPK_PREFIX}${String(number).padStart(3, '0')}`;
}

export function spkNumber(id: string): number {
  return Number(id.slice(SPK_PREFIX.length));
}

export function nextSpkId(settings: ShopSettings, spkList: SpkRecord[]): string {
  const highest = spkList.reduce((max, spk) => Math.max(max, spkNumber(spk.id)), 0);
  return formatSpkId(Math.max(settings.spkCounter, highest) + 1);
}

export function findSpkByQuery(spkList: SpkRecord[], query: string): SpkRecord | undefined {
  const cleaned = query.trim().toUpperCase();
  if (!cleaned) return undefined;
  const normalized = /^\d+$/.test(cleaned) ? formatSpkId(Number(cleaned)) : cleaned;
  return spkList.find((spk) => spk.id.toUpperCase() === normalized);
}

export function stageIndex(stage: StageId): number {
  return STAGES.findIndex((s) => s.id === stage);
}

export function stageLabel(stage: StageId): string {
  return STAGES[stageIndex(stage)]?.label ?? stage;
}

export function validateSpkForm(form: SpkFormState, minOrder: number, hasCatalog: boolean): string[] {
  const errors: string[] = [];
  const { customer } = form;
  if (!hasCatalog) errors.push('Produk belum tersedia. Hubungi admin bengkel.');
  if (!customer.name.trim()) errors.push('Nama pemesan wajib diisi.');
  if (!normalizeWa(customer.wa)) errors.push('Nomor WhatsApp harus diawali 08 atau 628 dan valid.');
  if (!customer.alamat.trim()) errors.push('Alamat pengiriman wajib diisi.');
  if (!customer.deadline) errors.push('Target tanggal jadi wajib diisi.');
  if (form.fabricId === CUSTOM_OPTION && !form.customFabric.trim()) errors.push('Nama bahan custom wajib diisi.');
  if (form.colorId === CUSTOM_OPTION && !form.customColor.trim()) errors.push('Nama warna custom wajib diisi.');
  const totalPcs = countPcs(form.sizes);
  if (totalPcs < minOrder) errors.push(`Minimal order ${minOrder} pcs (saat ini ${totalPcs} pcs).`);
  return errors;
}

export function buildSpkRecord(
  form: SpkFormState,
  input: { id: string; createdAt: string; catalog: CatalogItem; fabric?: Fabric; color?: ColorItem },
): SpkRecord {
  const isCustomFabric = form.fabricId === CUSTOM_OPTION;
  const isCustomColor = form.colorId === CUSTOM_OPTION;
  const pricing = calculatePricing(input.catalog.basePrice, isCustomFabric ? 0 : (input.fabric?.addOnPerPcs ?? 0), form.sizes);
  return {
    id: input.id,
    createdAt: input.createdAt,
    stage: 'antrean',
    dpPaid: false,
    fullyPaid: false,
    customer: { ...form.customer, name: form.customer.name.trim(), wa: form.customer.wa.trim() },
    item: {
      catalogId: input.catalog.id,
      productName: input.catalog.name,
      fabricName: isCustomFabric ? form.customFabric.trim() : (input.fabric?.name ?? ''),
      isCustomFabric,
      colorName: isCustomColor ? form.customColor.trim() : (input.color?.name ?? ''),
      colorCode: isCustomColor ? 'Custom' : (input.color?.code ?? ''),
      variation: form.variation,
      variationDetail: form.variationDetail.trim(),
      designLink: form.designLink.trim(),
      sizes: form.sizes,
      totalPcs: pricing.totalPcs,
      unitPrice: pricing.unitPrice,
      bigSizeFee: pricing.bigSizeFee,
      total: pricing.total,
      dp: pricing.dp,
      remaining: pricing.remaining,
      tierLabel: pricing.tier.label,
    },
  };
}

function sizeLines(sizes: Sizes): string {
  return SIZE_KEYS.map((key: SizeKey) => `• Size ${key}: ${sizes[key] || 0} pcs`).join('\n');
}

export function buildSpkMessage(spk: SpkRecord, settings: ShopSettings): string {
  const { customer: c, item: i } = spk;
  const bigSize = i.bigSizeFee > 0 ? `\n• Biaya Big Size: ${formatRupiah(i.bigSizeFee)}` : '';
  return [
    `*SURAT PERINTAH KERJA (SPK) - ${settings.shopName.toUpperCase()}*`,
    `No. Dokumen: #${spk.id}`,
    `Tanggal: ${formatDate(spk.createdAt.slice(0, 10))}`,
    '----------------------------------------------',
    '*DATA PEMESAN:*',
    `• Nama: ${c.name}`,
    `• Instansi: ${c.instansi || '-'}`,
    `• WA: ${c.wa}`,
    `• Alamat: ${c.alamat}`,
    `• Ekspedisi: ${c.courier}`,
    `• Deadline: ${formatDate(c.deadline)}`,
    '',
    '*DETAIL PESANAN:*',
    `• Produk: ${i.productName} - ${i.fabricName}`,
    `• Warna Kain: ${i.colorName} (${i.colorCode})`,
    `• Sablon/Bordir: ${i.variation}${i.variationDetail ? ` - ${i.variationDetail}` : ''}`,
    i.designLink ? `• Link Desain: ${i.designLink}` : '',
    '',
    '*RINCIAN UKURAN:*',
    sizeLines(i.sizes),
    `*TOTAL JUMLAH: ${i.totalPcs} Pcs*`,
    '----------------------------------------------',
    '*RINCIAN BIAYA:*',
    `• Harga Satuan: ${formatRupiah(i.unitPrice)}${bigSize}`,
    `• Total Biaya: ${formatRupiah(i.total)}`,
    `• *WAJIB DP 50%: ${formatRupiah(i.dp)}*`,
    `• Sisa Pelunasan: ${formatRupiah(i.remaining)}`,
    '----------------------------------------------',
    `Halo Admin ${settings.shopName}, saya ingin konfirmasi pesanan SPK ini dan minta nomor rekening untuk pembayaran DP 50%. Terima kasih!`,
  ]
    .filter((line) => line !== '')
    .join('\n');
}

export function buildStatusMessage(spk: SpkRecord, settings: ShopSettings): string {
  return [
    `Halo ${spk.customer.name}, update pesanan Anda di ${settings.shopName}:`,
    `No. SPK: #${spk.id}`,
    `Status produksi: *${stageLabel(spk.stage)}*`,
    `DP 50%: ${spk.dpPaid ? 'Sudah diterima' : 'Belum diterima'}`,
    `Sisa pelunasan: ${spk.fullyPaid ? 'Lunas' : formatRupiah(spk.item.remaining)}`,
    'Terima kasih sudah memesan di bengkel kami.',
  ].join('\n');
}

export function buildWaLink(waNumber: string, text: string): string {
  return `https://wa.me/${waNumber}?text=${encodeURIComponent(text)}`;
}

function buildPrintHtml(spk: SpkRecord, settings: ShopSettings, variant: 'thermal' | 'a4'): string {
  const { customer: c, item: i } = spk;
  const esc = escapeHtml;
  const sizeRows = SIZE_KEYS.filter((key) => (i.sizes[key] || 0) > 0)
    .map((key) => `<tr><td>Size ${key}</td><td class="r">${i.sizes[key]} pcs</td></tr>`)
    .join('');
  const pageSize = variant === 'thermal' ? '80mm auto' : 'A4';
  const bodyWidth = variant === 'thermal' ? '72mm' : '180mm';
  const baseFont = variant === 'thermal' ? '11px' : '13px';
  return `<!doctype html><html lang="id"><head><meta charset="utf-8"><title>SPK ${esc(spk.id)}</title>
<style>
@page { size: ${pageSize}; margin: ${variant === 'thermal' ? '3mm' : '12mm'}; }
body { font-family: Arial, Helvetica, sans-serif; color: #0f172a; width: ${bodyWidth}; margin: 0 auto; font-size: ${baseFont}; line-height: 1.45; }
h1 { font-size: ${variant === 'thermal' ? '14px' : '20px'}; text-align: center; margin: 0; }
.muted { text-align: center; color: #475569; margin: 2px 0 8px; }
hr { border: 0; border-top: 1px dashed #94a3b8; margin: 8px 0; }
table { width: 100%; border-collapse: collapse; }
td { padding: 2px 0; vertical-align: top; }
td.r { text-align: right; }
.total { font-weight: 800; }
.dp { font-weight: 800; border: 1px solid #047857; color: #047857; padding: 4px; text-align: center; margin-top: 6px; }
.toolbar { position: fixed; top: 8px; right: 8px; }
.toolbar button { padding: 6px 12px; background: #f59e0b; border: 0; font-weight: 600; cursor: pointer; }
@media print { .toolbar { display: none; } }
</style></head><body>
<div class="toolbar"><button onclick="window.print()">Cetak / Simpan PDF</button></div>
<h1>${esc(settings.shopName)}</h1>
<div class="muted">${esc(settings.address)}</div>
<hr>
<table>
<tr><td>No. SPK</td><td class="r"><b>${esc(spk.id)}</b></td></tr>
<tr><td>Tanggal</td><td class="r">${esc(formatDate(spk.createdAt.slice(0, 10)))}</td></tr>
<tr><td>Deadline</td><td class="r">${esc(formatDate(c.deadline))}</td></tr>
</table>
<hr>
<table>
<tr><td>Nama</td><td class="r">${esc(c.name)}</td></tr>
<tr><td>Instansi</td><td class="r">${esc(c.instansi || '-')}</td></tr>
<tr><td>WA</td><td class="r">${esc(c.wa)}</td></tr>
<tr><td>Ekspedisi</td><td class="r">${esc(c.courier)}</td></tr>
</table>
<hr>
<table>
<tr><td>Produk</td><td class="r">${esc(i.productName)}</td></tr>
<tr><td>Bahan</td><td class="r">${esc(i.fabricName)}</td></tr>
<tr><td>Warna</td><td class="r">${esc(i.colorName)} ${esc(i.colorCode)}</td></tr>
<tr><td>Sablon/Bordir</td><td class="r">${esc(i.variation)}</td></tr>
${i.variationDetail ? `<tr><td colspan="2">Detail: ${esc(i.variationDetail)}</td></tr>` : ''}
</table>
<hr>
<table>${sizeRows}<tr class="total"><td>Total Pcs</td><td class="r">${i.totalPcs} pcs</td></tr></table>
<hr>
<table>
<tr><td>Harga Satuan</td><td class="r">${esc(formatRupiah(i.unitPrice))}</td></tr>
<tr><td>Big Size</td><td class="r">${esc(formatRupiah(i.bigSizeFee))}</td></tr>
<tr class="total"><td>Total Biaya</td><td class="r">${esc(formatRupiah(i.total))}</td></tr>
</table>
<div class="dp">DP 50%: ${esc(formatRupiah(i.dp))}</div>
<table style="margin-top:6px"><tr><td>Sisa Pelunasan</td><td class="r">${esc(formatRupiah(i.remaining))}</td></tr></table>
<hr>
<div class="muted">Status: ${esc(stageLabel(spk.stage))}</div>
</body></html>`;
}

export function openSpkPrint(spk: SpkRecord, settings: ShopSettings, variant: 'thermal' | 'a4'): boolean {
  const win = window.open('', '_blank', 'width=460,height=760');
  if (!win) return false;
  win.document.open();
  win.document.write(buildPrintHtml(spk, settings, variant));
  win.document.close();
  return true;
}
