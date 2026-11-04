import { MessageCircle } from 'lucide-react';
import { buildWaLink } from '@/lib/spk';
import { useDb } from '@/store/useDb';

export default function Footer() {
  const { db } = useDb();
  const { shopName, address, waNumber, description } = db.shopSettings;
  return (
    <footer className="border-t border-slate-200 bg-white/80 backdrop-blur-xl">
      <div className="mx-auto grid max-w-6xl gap-8 px-5 py-12 md:grid-cols-3">
        <div>
          <p className="text-lg font-extrabold text-slate-900">{shopName}</p>
          <p className="mt-2 text-sm leading-relaxed text-slate-600">{description}</p>
        </div>
        <div>
          <p className="text-sm font-semibold text-slate-900">Alamat Workshop</p>
          <p className="mt-2 text-sm leading-relaxed text-slate-600">{address}</p>
        </div>
        <div className="flex flex-col items-start gap-3">
          <p className="text-sm font-semibold text-slate-900">Hubungi Admin</p>
          <a
            href={buildWaLink(waNumber, `Halo Admin ${shopName}, saya ingin konsultasi desain.`)}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex cursor-pointer items-center gap-2 rounded-full bg-emerald-700 px-5 py-2.5 text-sm font-semibold text-white shadow-md shadow-emerald-700/25 transition hover:bg-emerald-600 active:scale-95"
          >
            <MessageCircle className="h-4 w-4" />
            Chat WhatsApp Admin
          </a>
        </div>
      </div>
      <div className="border-t border-slate-200 px-5 py-4 text-center text-xs text-slate-500">
        &copy; {new Date().getFullYear()} {shopName}. Seluruh data pesanan tersimpan di perangkat ini.
      </div>
    </footer>
  );
}
