import type { CSSProperties, PointerEvent, ReactNode } from 'react';

interface SpotlightCardProps {
  children: ReactNode;
  className?: string;
}

export default function SpotlightCard({ children, className = '' }: SpotlightCardProps) {
  const handlePointerMove = (event: PointerEvent<HTMLDivElement>) => {
    const rect = event.currentTarget.getBoundingClientRect();
    event.currentTarget.style.setProperty('--spot-x', `${event.clientX - rect.left}px`);
    event.currentTarget.style.setProperty('--spot-y', `${event.clientY - rect.top}px`);
  };

  return (
    <div
      onPointerMove={handlePointerMove}
      className={`group relative overflow-hidden rounded-2xl border border-slate-200 bg-white/90 shadow-sm backdrop-blur-xl transition duration-300 hover:-translate-y-0.5 hover:border-amber-300 hover:shadow-lg ${className}`}
      style={{ '--spot-x': '50%', '--spot-y': '50%' } as CSSProperties}
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-0 transition duration-500 group-hover:opacity-100"
        style={{
          background:
            'radial-gradient(320px circle at var(--spot-x) var(--spot-y), rgba(245,158,11,0.18), transparent 70%)',
        }}
      />
      <div className="relative">{children}</div>
    </div>
  );
}
