import { motion, useAnimationControls } from 'framer-motion';
import { useState, type FormEvent } from 'react';
import { Lock } from 'lucide-react';
import { useDb } from '@/store/useDb';
import { inputClass } from '@/components/ui/Field';
import { adminPrimaryButton } from '@/components/admin/adminUi';

interface AdminPinGateProps {
  onUnlock: () => void;
  onBack: () => void;
}

export default function AdminPinGate({ onUnlock, onBack }: AdminPinGateProps) {
  const { db } = useDb();
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');
  const controls = useAnimationControls();

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (pin === db.shopSettings.adminPin) {
      onUnlock();
      return;
    }
    setError('PIN salah. Silakan coba lagi.');
    setPin('');
    void controls.start({ x: [0, -10, 10, -6, 6, 0], transition: { duration: 0.4 } });
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-100 px-5 py-12">
      <motion.form
        animate={controls}
        onSubmit={handleSubmit}
        className="w-full max-w-sm rounded-3xl border border-slate-200 bg-white p-8 shadow-xl"
      >
        <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-900 text-amber-400">
          <Lock className="h-6 w-6" />
        </span>
        <h1 className="mt-6 text-2xl font-extrabold tracking-tight text-slate-900">Dashboard Admin</h1>
        <p className="mt-2 text-sm leading-relaxed text-slate-600">Masukkan PIN admin untuk mengelola SPK, katalog, dan pengaturan bengkel.</p>

        <label className="mt-6 flex flex-col gap-1.5">
          <span className="text-sm font-semibold text-slate-800">PIN Admin</span>
          <input
            type="password"
            inputMode="numeric"
            autoComplete="off"
            maxLength={8}
            autoFocus
            value={pin}
            onChange={(e) => {
              setPin(e.target.value.replace(/\D/g, ''));
              setError('');
            }}
            className={`${inputClass} text-center text-xl tracking-[0.5em]`}
            placeholder="----"
          />
        </label>
        {error && (
          <p role="alert" className="mt-3 text-sm font-semibold text-red-700">
            {error}
          </p>
        )}

        <button type="submit" className={`${adminPrimaryButton} mt-6 w-full`} disabled={pin.length < 4}>
          Buka Dashboard
        </button>
        <button
          type="button"
          onClick={onBack}
          className="mt-3 w-full cursor-pointer rounded-xl px-4 py-2.5 text-sm font-semibold text-slate-600 transition hover:bg-slate-100 hover:text-slate-900 active:scale-95"
        >
          Kembali ke Website
        </button>
      </motion.form>
    </main>
  );
}
