import { useState } from 'react';
import { Pencil, Plus, Trash2 } from 'lucide-react';
import { CATALOG_ICONS } from '@/lib/icons';
import { formatRupiah } from '@/lib/format';
import { useDb } from '@/store/useDb';
import type { CatalogItem } from '@/lib/schema';
import CatalogItemForm from '@/components/admin/CatalogItemForm';
import { AdminPanel, adminDangerButton, adminPrimaryButton, adminSecondaryButton } from '@/components/admin/adminUi';

type Editing = { mode: 'new' } | { mode: 'edit'; item: CatalogItem } | null;

export default function CatalogTab() {
  const { db, update } = useDb();
  const [editing, setEditing] = useState<Editing>(null);

  const saveItem = (item: CatalogItem) => {
    update((current) => {
      const exists = current.catalogItems.some((existing) => existing.id === item.id);
      return {
        ...current,
        catalogItems: exists
          ? current.catalogItems.map((existing) => (existing.id === item.id ? item : existing))
          : [...current.catalogItems, item],
      };
    });
    setEditing(null);
  };

  const deleteItem = (item: CatalogItem) => {
    if (!window.confirm(`Hapus produk "${item.name}" dari katalog? Riwayat SPK lama tetap tersimpan.`)) return;
    update((current) => ({ ...current, catalogItems: current.catalogItems.filter((c) => c.id !== item.id) }));
  };

  return (
    <div className="space-y-6">
      <AdminPanel
        title="Katalog Produk & Harga"
        description="Atur jenis pakaian yang tampil di website beserta harga dasar, minimal order, dan keunggulannya."
        action={
          editing === null ? (
            <button type="button" onClick={() => setEditing({ mode: 'new' })} className={adminPrimaryButton}>
              <Plus className="h-4 w-4" />
              Tambah Produk
            </button>
          ) : null
        }
      >
        {editing && (
          <div className="mb-8 rounded-2xl border border-amber-300 bg-amber-50/40 p-5 sm:p-6">
            <h3 className="mb-5 text-base font-extrabold text-slate-900">
              {editing.mode === 'new' ? 'Produk Baru' : `Edit ${editing.item.name}`}
            </h3>
            <CatalogItemForm
              key={editing.mode === 'new' ? 'new' : editing.item.id}
              initial={editing.mode === 'edit' ? editing.item : null}
              fabricList={db.fabricList}
              onSave={saveItem}
              onCancel={() => setEditing(null)}
            />
          </div>
        )}

        {db.catalogItems.length === 0 ? (
          <p className="rounded-xl bg-slate-50 p-6 text-center text-sm text-slate-600">Belum ada produk. Tambahkan produk pertama Anda.</p>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {db.catalogItems.map((item) => {
              const Icon = CATALOG_ICONS[item.iconKey];
              return (
                <article key={item.id} className="flex flex-col rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-slate-900 text-amber-400">
                        <Icon className="h-5 w-5" />
                      </span>
                      <div>
                        <h3 className="text-base font-extrabold text-slate-900">{item.name}</h3>
                        <p className="text-xs text-slate-600">{item.fabricIds.length} bahan tersedia</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-base font-extrabold text-slate-900">{formatRupiah(item.basePrice)}</p>
                      <p className="text-xs text-slate-600">Min. {item.minOrder} pcs</p>
                    </div>
                  </div>
                  <p className="mt-4 line-clamp-2 text-sm leading-relaxed text-slate-600">{item.description}</p>
                  <div className="mt-5 flex gap-2">
                    <button type="button" onClick={() => setEditing({ mode: 'edit', item })} className={`${adminSecondaryButton} flex-1`}>
                      <Pencil className="h-4 w-4" />
                      Edit
                    </button>
                    <button type="button" onClick={() => deleteItem(item)} className={adminDangerButton}>
                      <Trash2 className="h-4 w-4" />
                      Hapus
                    </button>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </AdminPanel>
    </div>
  );
}
