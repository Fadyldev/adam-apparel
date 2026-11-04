import { Lock } from 'lucide-react';
import { useNavigate } from '@/hooks/useRoute';

export default function FloatingAdminButton() {
  const navigate = useNavigate();
  return (
    <button
      type="button"
      onClick={() => navigate('/admin')}
      className="fixed bottom-4 right-4 z-40 flex cursor-pointer items-center gap-2 rounded-full bg-slate-900 px-4 py-3 text-sm font-semibold text-white shadow-xl shadow-slate-900/25 transition hover:bg-slate-800 active:scale-95 sm:bottom-6 sm:right-6"
    >
      <Lock className="h-4 w-4 text-amber-400" />
      Masuk Dashboard Admin
    </button>
  );
}
