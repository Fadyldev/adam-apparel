import { BACKUP_APP_ID, BACKUP_VERSION } from '@/lib/constants';
import { sanitizeDb } from '@/lib/validate';
import { SIZE_KEYS, type AppDb, type SpkRecord } from '@/lib/schema';

export function buildBackup(db: AppDb) {
  return { app: BACKUP_APP_ID, version: BACKUP_VERSION, exportedAt: new Date().toISOString(), ...db };
}

export function parseBackup(text: string): AppDb | null {
  try {
    return sanitizeDb(JSON.parse(text));
  } catch {
    return null;
  }
}

const csvCell = (value: string | number) => {
  let text = String(value);
  if (/^[=+\-@\t\r]/.test(text)) text = `'${text}`;
  return `"${text.replace(/"/g, '""')}"`;
};

export function buildSpkCsv(spkList: SpkRecord[]): string {
  const header = [
    'No SPK', 'Tanggal', 'Nama', 'Instansi', 'WA', 'Alamat', 'Ekspedisi', 'Deadline', 'Produk', 'Bahan',
    'Warna', 'Variasi', ...SIZE_KEYS, 'Total Pcs', 'Harga Satuan', 'Biaya Big Size', 'Total Biaya',
    'DP 50%', 'Sisa Pelunasan', 'DP Lunas', 'Pelunasan', 'Tahap Produksi',
  ];
  const rows = spkList.map((spk) => {
    const { customer: c, item: i } = spk;
    return [
      spk.id, spk.createdAt, c.name, c.instansi, c.wa, c.alamat, c.courier, c.deadline, i.productName,
      i.fabricName, `${i.colorName} (${i.colorCode})`, i.variation, ...SIZE_KEYS.map((key) => i.sizes[key] || 0),
      i.totalPcs, i.unitPrice, i.bigSizeFee, i.total, i.dp, i.remaining, spk.dpPaid ? 'Ya' : 'Belum',
      spk.fullyPaid ? 'Lunas' : 'Belum', spk.stage,
    ]
      .map(csvCell)
      .join(',');
  });
  return [header.map(csvCell).join(','), ...rows].join('\r\n');
}

export function downloadFile(filename: string, content: string, mime: string) {
  const url = URL.createObjectURL(new Blob([content], { type: mime }));
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}
