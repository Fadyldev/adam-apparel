import { useDb } from '@/store/useDb';
import CountUp from '@/components/ui/CountUp';
import SpotlightCard from '@/components/ui/SpotlightCard';

export default function StatsTicker() {
  const { stats } = useDb().db.shopSettings;
  return (
    <div className="mt-16 grid grid-cols-2 gap-4 lg:grid-cols-4">
      {stats.map((stat) => (
        <SpotlightCard key={stat.label} className="p-6">
          <p className="text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
            <CountUp value={stat.value} suffix={stat.suffix} />
          </p>
          <p className="mt-2 text-sm leading-snug text-slate-600">{stat.label}</p>
        </SpotlightCard>
      ))}
    </div>
  );
}
