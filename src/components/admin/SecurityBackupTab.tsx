import { useRef, useState, type FormEvent } from 'react';
import { Download, FileSpreadsheet, RotateCcw, Upload } from 'lucide-react';
import { MIN_PIN_LENGTH } from '@/lib/constants';
import { buildBackup, buildSpkCsv, downloadFile, parseBackup } from '@/lib/backup';
import { createSeedDb } from '@/lib/seed';
import { todayIso } from '@/lib/format';
import { useDb } from '@/store/useDb';
import Field, { inputClass } from '@/components/ui/Field';
import { AdminNotice, AdminPanel, adminDangerButton, adminPrimaryButton, adminSecondaryButton } from '@/components/admin/adminUi';

const PIN_PATTERN = /^\d{4,8}$/;

type Feedback = { tone: 'success' | 'error'; text: string } | null;

export default function SecurityBackupTab() {
  return (
    <div className="space-y-6">
      <ChangePinPanel />
      <BackupPanel />
      <ResetPanel />
    </div>
  );
}

function ChangePinPanel() {
  const { db, update } = useDb();
  const [oldPin, setOldPin] = useState('');
  const [newPin, setNewPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [feedback, setFeedback] = useState<Feedback>(null);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (oldPin !== db.shopSettings.adminPin) return setFeedback({ tone: 'error', text: 'PIN lama tidak sesuai.' });
    if (!PIN_PATTERN.test(newPin) || newPin.length < MIN_PIN_LENGTH) {
      return setFeedback({ tone: 'error', text: `PIN baru harus ${MIN_PIN_LENGTH} sampai 8 digit angka.` });
    }
    if (newPin === oldPin) return setFeedback({ tone: 'error', text: 'PIN baru harus berbeda dari PIN lama.' });
    if (newPin !== confirmPin) return setFeedback({ tone: 'error', text: 'Konfirmasi PIN baru tidak sama.' });

    update((current) => ({ ...current, shopSettings: { ...current.shopSettings, adminPin: newPin } }));
    setOldPin('');
    setNewPin('');
    setConfirmPin('');
    setFeedback({ tone: 'success', text: 'PIN admin berhasil diganti.' });
  };

  return (
    <AdminPanel title="Ganti PIN Admin" description="Gunakan PIN 4 sampai 8 digit angka. Simpan PIN baru di tempat yang aman.">
      <form onSubmit={handleSubmit} className="grid max-w-2xl gap-5 sm:grid-cols-3">
        <Field label="PIN Lama">
          <input type="password" inputMode="numeric" autoComplete="off" className={inputClass} value={oldPin} onChange={(e) => setOldPin(e.target.value)} />
        </Field>
        <Field label="PIN Baru">
          <input type="password" inputMode="numeric" autoComplete="off" className={inputClass} value={newPin} onChange={(e) => setNewPin(e.target.value)} />
        </Field>
        <Field label="Ulangi PIN Baru">
          <input type="password" inputMode="numeric" autoComplete="off" className={inputClass} value={confirmPin} onChange={(e) => setConfirmPin(e.target.value)} />
        </Field>
        {feedback && (
          <div className="sm:col-span-3">
            <AdminNotice tone={feedback.tone}>{feedback.text}</AdminNotice>
          </div>
        )}
        <div className="sm:col-span-3">
          <button type="submit" className={adminPrimaryButton}>
            Simpan PIN Baru
          </button>
        </div>
      </form>
    </AdminPanel>
  );
}

function BackupPanel() {
  const { db, update } = useDb();
  const fileInput = useRef<HTMLInputElement>(null);
  const [feedback, setFeedback] = useState<Feedback>(null);

  const exportJson = () => {
    downloadFile(`adam-apparel-backup-${todayIso()}.json`, JSON.stringify(buildBackup(db), null, 2), 'application/json');
  };

  const exportCsv = () => {
    downloadFile(`adam-apparel-spk-${todayIso()}.csv`, buildSpkCsv(db.spkList), 'text/csv;charset=utf-8');
  };

  const importJson = async (file: File) => {
    let restored = null;
    try {
      restored = parseBackup(await file.text());
    } catch {
      restored = null;
    }
    if (!restored) return setFeedback({ tone: 'error', text: 'File backup tidak valid atau bukan milik aplikasi ini.' });
    if (!window.confirm(`Ganti seluruh data di perangkat ini dengan isi file backup (${restored.spkList.length} SPK)?`)) return;
    update(() => restored);
    setFeedback({ tone: 'success', text: `Data berhasil dipulihkan (${restored.spkList.length} SPK, ${restored.catalogItems.length} produk).` });
  };

  return (
    <AdminPanel title="Backup & Restore Data" description="Simpan salinan data sebelum ganti perangkat atau sebelum melakukan perubahan besar.">
      <div className="grid gap-4 md:grid-cols-3">
        <div className="flex flex-col rounded-2xl border border-slate-200 bg-slate-50/60 p-5">
          <p className="text-sm font-extrabold text-slate-900">Export Backup (JSON)</p>
          <p className="mt-1 flex-1 text-xs leading-relaxed text-slate-600">Seluruh SPK, katalog, bahan, warna, portofolio, dan pengaturan.</p>
          <button type="button" onClick={exportJson} className={`${adminSecondaryButton} mt-4`}>
            <Download className="h-4 w-4" />
            Download JSON
          </button>
        </div>
        <div className="flex flex-col rounded-2xl border border-slate-200 bg-slate-50/60 p-5">
          <p className="text-sm font-extrabold text-slate-900">Export Daftar SPK (CSV)</p>
          <p className="mt-1 flex-1 text-xs leading-relaxed text-slate-600">Tabel SPK untuk dibuka di Excel atau Google Sheets.</p>
          <button type="button" onClick={exportCsv} className={`${adminSecondaryButton} mt-4`}>
            <FileSpreadsheet className="h-4 w-4" />
            Download CSV
          </button>
        </div>
        <div className="flex flex-col rounded-2xl border border-slate-200 bg-slate-50/60 p-5">
          <p className="text-sm font-extrabold text-slate-900">Import Restore (JSON)</p>
          <p className="mt-1 flex-1 text-xs leading-relaxed text-slate-600">Menggantikan seluruh data di perangkat ini dengan isi file backup.</p>
          <button type="button" onClick={() => fileInput.current?.click()} className={`${adminSecondaryButton} mt-4`}>
            <Upload className="h-4 w-4" />
            Pilih File Backup
          </button>
          <input
            ref={fileInput}
            type="file"
            accept="application/json,.json"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              e.target.value = '';
              if (file) void importJson(file);
            }}
          />
        </div>
      </div>
      {feedback && (
        <div className="mt-6">
          <AdminNotice tone={feedback.tone}>{feedback.text}</AdminNotice>
        </div>
      )}
    </AdminPanel>
  );
}

function ResetPanel() {
  const { update } = useDb();

  const resetToDefault = () => {
    if (!window.confirm('Reset semua data ke pengaturan pabrik? Seluruh SPK dan perubahan katalog akan hilang. Unduh backup terlebih dahulu jika masih diperlukan.')) return;
    update(() => createSeedDb());
  };

  return (
    <AdminPanel title="Reset ke Pengaturan Pabrik" description="Mengembalikan seluruh data ke contoh awal aplikasi. Tindakan ini tidak dapat dibatalkan dari dalam aplikasi.">
      <button type="button" onClick={resetToDefault} className={adminDangerButton}>
        <RotateCcw className="h-4 w-4" />
        Reset ke Pengaturan Pabrik
      </button>
    </AdminPanel>
  );
}
