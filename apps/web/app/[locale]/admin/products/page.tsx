'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import Image from 'next/image';
import { adminProducts } from '../../../../lib/api';

export default function AdminProductsPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');

  const { data, isLoading } = useQuery({
    queryKey: ['admin-products', page, search],
    queryFn: () => adminProducts({ page, search }),
  });

  return (
    <div className="space-y-8">
      <header className="flex items-end justify-between border-b border-ink/10 pb-5">
        <div>
          <p className="eyebrow text-gold-deep mb-2">№ 02 · INVENTORY</p>
          <h1 className="text-display text-4xl md:text-5xl tracking-tightest">Products</h1>
        </div>
        <div className="flex items-center gap-2">
          <span className="stamp text-ink-ghost">{data?.total ?? 0} total</span>
        </div>
      </header>

      {/* Search + actions */}
      <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center">
        <input
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          placeholder="Search by name or SKU…"
          className="input-atelier md:max-w-md"
        />
      </div>

      {/* Table */}
      <div className="border border-ink/10 bg-paper-white overflow-x-auto">
        <table className="w-full text-sm min-w-[700px]">
          <thead>
            <tr className="bg-ink text-paper">
              <th className="text-left p-3 stamp font-normal">Product</th>
              <th className="text-left p-3 stamp font-normal">SKU</th>
              <th className="text-right p-3 stamp font-normal">Price</th>
              <th className="text-right p-3 stamp font-normal">Stock</th>
              <th className="text-left p-3 stamp font-normal">Status</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr><td colSpan={5} className="py-10 text-center text-ink-ghost">Loading…</td></tr>
            ) : !data || data.data.length === 0 ? (
              <tr><td colSpan={5} className="py-10 text-center text-ink-ghost">No products found</td></tr>
            ) : data.data.map((p: any) => (
              <tr key={p.id} className="border-t border-ink/10 hover:bg-paper/50">
                <td className="p-3">
                  <div className="flex items-center gap-3">
                    <div className="relative h-10 w-10 shrink-0 overflow-hidden border border-ink/10 bg-paper">
                      {p.images?.[0] && <Image src={p.images[0].url} alt="" fill className="object-cover" />}
                    </div>
                    <div className="min-w-0">
                      <p className="text-ink text-sm line-clamp-1">{p.nameEn}</p>
                      <p className="stamp text-ink-ghost">{p.brand?.nameEn}</p>
                    </div>
                  </div>
                </td>
                <td className="p-3 font-mono text-xs text-ink-soft">{p.sku}</td>
                <td className="p-3 text-right font-mono">EGP {Number(p.price).toLocaleString()}</td>
                <td className="p-3 text-right">
                  <span className={`font-mono ${p.stock <= 5 ? 'text-seal' : p.stock <= 10 ? 'text-gold-deep' : 'text-ink'}`}>
                    {p.stock}
                  </span>
                </td>
                <td className="p-3">
                  <span className="stamp border border-ink/20 px-2 py-0.5">{p.status}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {data && data.totalPages > 1 && (
        <div className="flex justify-center gap-2">
          {Array.from({ length: data.totalPages }, (_, i) => i + 1).map((p) => (
            <button
              key={p}
              onClick={() => setPage(p)}
              className={`h-9 w-9 stamp border ${
                p === page ? 'bg-ink text-paper border-ink' : 'border-ink/20 hover:border-ink'
              }`}
            >
              {p}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
