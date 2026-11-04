import { CloudOff, Wifi } from 'lucide-react';
import { useOnlineStatus } from '@/hooks/useOnlineStatus';

export default function NetworkBadge() {
  const online = useOnlineStatus();
  return (
    <div
      role="status"
      className={`fixed bottom-4 left-4 z-40 flex max-w-[calc(100%-9rem)] items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-semibold shadow-md backdrop-blur-xl sm:bottom-6 sm:left-6 ${
        online
          ? 'border-emerald-200 bg-white/90 text-emerald-800'
          : 'border-amber-300 bg-amber-50/95 text-amber-800'
      }`}
    >
      {online ? <Wifi className="h-3.5 w-3.5 shrink-0" /> : <CloudOff className="h-3.5 w-3.5 shrink-0" />}
      <span className="truncate">{online ? 'Online' : 'Mode Offline (Data Tersimpan Aman di Perangkat)'}</span>
    </div>
  );
}
