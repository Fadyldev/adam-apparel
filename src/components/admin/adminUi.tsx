import type { ReactNode } from 'react';

export const adminPrimaryButton =
  'inline-flex cursor-pointer items-center justify-center gap-2 rounded-xl bg-amber-500 px-4 py-2.5 text-sm font-semibold text-slate-900 shadow-md shadow-amber-500/25 transition hover:bg-amber-400 active:scale-95 disabled:cursor-not-allowed disabled:opacity-50';

export const adminSecondaryButton =
  'inline-flex cursor-pointer items-center justify-center gap-2 rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-800 shadow-sm transition hover:border-amber-400 hover:bg-amber-50 active:scale-95';

export const adminDangerButton =
  'inline-flex cursor-pointer items-center justify-center gap-2 rounded-xl border border-red-300 bg-white px-4 py-2.5 text-sm font-semibold text-red-700 shadow-sm transition hover:bg-red-50 active:scale-95';

interface AdminPanelProps {
  title: string;
  description?: string;
  action?: ReactNode;
  children: ReactNode;
}

export function AdminPanel({ title, description, action, children }: AdminPanelProps) {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7">
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h2 className="text-lg font-extrabold text-slate-900">{title}</h2>
          {description && <p className="mt-1 text-sm leading-relaxed text-slate-600">{description}</p>}
        </div>
        {action}
      </div>
      {children}
    </section>
  );
}

export function AdminNotice({ tone, children }: { tone: 'success' | 'error'; children: ReactNode }) {
  return (
    <p
      role="status"
      className={`rounded-xl border px-4 py-3 text-sm font-semibold ${
        tone === 'success' ? 'border-emerald-300 bg-emerald-50 text-emerald-900' : 'border-red-300 bg-red-50 text-red-800'
      }`}
    >
      {children}
    </p>
  );
}
