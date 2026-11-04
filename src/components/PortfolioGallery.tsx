import { useDb } from '@/store/useDb';
import SpotlightCard from '@/components/ui/SpotlightCard';

export default function PortfolioGallery() {
  const { portfolioList } = useDb().db;
  if (portfolioList.length === 0) return null;

  return (
    <section id="portofolio" className="mx-auto max-w-6xl scroll-mt-28 px-5 py-20">
      <p className="text-sm font-semibold uppercase tracking-wider text-amber-700">Portofolio</p>
      <h2 className="mt-3 text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
        Proyek yang sudah kami kerjakan
      </h2>

      <div className="mt-10 grid gap-6 md:grid-cols-3">
        {portfolioList.map((item) => (
          <SpotlightCard key={item.id}>
            <div className="aspect-[4/3] overflow-hidden bg-slate-100">
              <img
                src={item.photoUrl}
                alt={`${item.garment} untuk ${item.client}`}
                loading="lazy"
                className="h-full w-full object-cover transition duration-700 hover:scale-105"
              />
            </div>
            <div className="p-5">
              <div className="flex items-center justify-between gap-3">
                <span className="rounded-full bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-800">{item.garment}</span>
                <span className="text-xs font-semibold text-slate-500">{item.year}</span>
              </div>
              <h3 className="mt-3 text-base font-extrabold text-slate-900">{item.client}</h3>
              <p className="mt-1 text-sm text-slate-600">{item.quantity.toLocaleString('id-ID')} pcs diproduksi</p>
              {item.note && <p className="mt-2 text-sm leading-relaxed text-slate-600">{item.note}</p>}
            </div>
          </SpotlightCard>
        ))}
      </div>
    </section>
  );
}
