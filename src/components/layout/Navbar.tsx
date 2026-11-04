import { useEffect, useState } from 'react';
import { ArrowRight, Factory } from 'lucide-react';
import { useDb } from '@/store/useDb';

const COMPACT_THRESHOLD = 120;

const NAV_LINKS = [
  { href: '#lacak', label: 'Lacak SPK' },
  { href: '#katalog', label: 'Katalog' },
  { href: '#portofolio', label: 'Portofolio' },
  { href: '#spk', label: 'Kalkulator' },
];

export default function Navbar() {
  const { db } = useDb();
  const [compact, setCompact] = useState(false);

  useEffect(() => {
    const handleScroll = () => setCompact(window.scrollY > COMPACT_THRESHOLD);
    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header className="pointer-events-none fixed inset-x-0 top-3 z-50 flex justify-center px-3 sm:top-4">
      <nav
        className={`pointer-events-auto flex w-full items-center justify-between gap-3 rounded-full border border-slate-200 bg-white/85 px-4 shadow-lg shadow-slate-900/5 backdrop-blur-xl transition-all duration-500 ease-out ${
          compact ? 'max-w-md py-2' : 'max-w-5xl py-3'
        }`}
      >
        <a href="#top" className="flex min-w-0 items-center gap-2.5">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-slate-900 text-amber-400">
            <Factory className="h-4 w-4" />
          </span>
          <span className="truncate text-sm font-extrabold tracking-tight text-slate-900 sm:text-base">
            {db.shopSettings.shopName}
          </span>
        </a>

        <div
          className={`hidden items-center gap-1 transition-all duration-500 md:flex ${
            compact ? 'pointer-events-none max-w-0 overflow-hidden opacity-0' : 'max-w-xl opacity-100'
          }`}
        >
          <span className="mr-2 flex items-center gap-2 whitespace-nowrap rounded-full bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-800">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-500 opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-600" />
            </span>
            Menerima Pesanan SPK
          </span>
          {NAV_LINKS.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="rounded-full px-3 py-1.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-100 hover:text-slate-900"
            >
              {link.label}
            </a>
          ))}
        </div>

        <a
          href="#spk"
          className="flex shrink-0 cursor-pointer items-center gap-1.5 rounded-full bg-amber-500 px-4 py-2 text-sm font-semibold text-slate-900 shadow-md shadow-amber-500/30 transition hover:bg-amber-400 active:scale-95"
        >
          Order Cepat
          <ArrowRight className="h-4 w-4" />
        </a>
      </nav>
    </header>
  );
}
