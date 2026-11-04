import { motion } from 'framer-motion';

export interface SpringTab {
  id: string;
  label: string;
}

interface SpringTabsProps {
  tabs: SpringTab[];
  active: string;
  onChange: (id: string) => void;
  layoutId: string;
  className?: string;
}

export default function SpringTabs({ tabs, active, onChange, layoutId, className = '' }: SpringTabsProps) {
  return (
    <div role="tablist" className={`flex gap-2 ${className}`}>
      {tabs.map((tab) => {
        const isActive = tab.id === active;
        return (
          <button
            key={tab.id}
            type="button"
            role="tab"
            aria-selected={isActive}
            onClick={() => onChange(tab.id)}
            className={`relative cursor-pointer rounded-full px-4 py-2 text-sm font-semibold transition-colors active:scale-95 ${
              isActive ? 'text-slate-900' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            {isActive && (
              <motion.span
                layoutId={layoutId}
                transition={{ type: 'spring', stiffness: 350, damping: 30 }}
                className="absolute inset-0 rounded-full bg-amber-400 shadow-md shadow-amber-500/30"
              />
            )}
            <span className="relative">{tab.label}</span>
          </button>
        );
      })}
    </div>
  );
}
