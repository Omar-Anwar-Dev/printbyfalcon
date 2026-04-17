'use client';

import Link from 'next/link';
import { useState } from 'react';
import { useLocale } from 'next-intl';
import { useQuery } from '@tanstack/react-query';
import { adminOrders } from '../../../../lib/api';

const STATUSES = ['', 'PENDING_PAYMENT', 'PAYMENT_CONFIRMED', 'PROCESSING', 'SHIPPED', 'OUT_FOR_DELIVERY', 'DELIVERED', 'CANCELLED', 'REFUNDED'];
const METHODS = ['', 'CARD', 'FAWRY', 'COD'];

export default function AdminOrdersPage() {
  const locale = useLocale();
  const [status, setStatus] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('');
  const [search, setSearch] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [page, setPage] = useState(1);

  const { data, isLoading } = useQuery({
    queryKey: ['admin-orders', status, paymentMethod, search, dateFrom, dateTo, page],
    queryFn: () => adminOrders({
      status: status || undefined,
      paymentMethod: paymentMethod || undefined,
      search: search || undefined,
      dateFrom: dateFrom || undefined,
      dateTo: dateTo || undefined,
      page,
    }),
  });

  return (
    <div className="space-y-8">
      <header className="flex items-end justify-between border-b border-ink/10 pb-5">
        <div>
          <p className="eyebrow text-gold-deep mb-2">№ 03 · ORDERS</p>
          <h1 className="text-display text-4xl md:text-5xl tracking-tightest">Orders</h1>
        </div>
        <span className="stamp text-ink-ghost">{data?.total ?? 0} total</span>
      </header>

      {/* Filters */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3 border border-ink/10 bg-paper-white p-4">
        <div>
          <label className="eyebrow block mb-1 text-ink-soft">Status</label>
          <select value={status} onChange={(e) => { setStatus(e.target.value); setPage(1); }} className="input-atelier text-xs">
            {STATUSES.map((s) => <option key={s} value={s}>{s || 'All'}</option>)}
          </select>
        </div>
        <div>
          <label className="eyebrow block mb-1 text-ink-soft">Method</label>
          <select value={paymentMethod} onChange={(e) => { setPaymentMethod(e.target.value); setPage(1); }} className="input-atelier text-xs">
            {METHODS.map((m) => <option key={m} value={m}>{m || 'All'}</option>)}
          </select>
        </div>
        <div>
          <label className="eyebrow block mb-1 text-ink-soft">From</label>
          <input type="date" value={dateFrom} onChange={(e) => { setDateFrom(e.target.value); setPage(1); }} className="input-atelier text-xs" />
        </div>
        <div>
          <label className="eyebrow block mb-1 text-ink-soft">To</label>
          <input type="date" value={dateTo} onChange={(e) => { setDateTo(e.target.value); setPage(1); }} className="input-atelier text-xs" />
        </div>
        <div>
          <label className="eyebrow block mb-1 text-ink-soft">Search</label>
          <input
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            placeholder="Invoice / email / name"
            className="input-atelier text-xs"
          />
        </div>
      </div>

      {/* Table */}
      <div className="border border-ink/10 bg-paper-white overflow-x-auto">
        <table className="w-full text-sm min-w-[800px]">
          <thead>
            <tr className="bg-ink text-paper">
              <th className="text-left p-3 stamp font-normal">Invoice</th>
              <th className="text-left p-3 stamp font-normal">Customer</th>
              <th className="text-left p-3 stamp font-normal">Method</th>
              <th className="text-right p-3 stamp font-normal">Total</th>
              <th className="text-left p-3 stamp font-normal">Status</th>
              <th className="text-left p-3 stamp font-normal">Date</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr><td colSpan={7} className="py-10 text-center text-ink-ghost">Loading…</td></tr>
            ) : !data || data.data.length === 0 ? (
              <tr><td colSpan={7} className="py-10 text-center text-ink-ghost">No orders match these filters</td></tr>
            ) : data.data.map((o: any) => (
              <tr key={o.id} className="border-t border-ink/10 hover:bg-paper/50">
                <td className="p-3 font-mono text-xs">{o.invoiceNumber}</td>
                <td className="p-3">
                  <p className="text-sm">{o.user?.firstName} {o.user?.lastName}</p>
                  <p className="stamp text-ink-ghost">{o.user?.email}</p>
                </td>
                <td className="p-3 text-xs">{o.paymentMethod}</td>
                <td className="p-3 text-right font-mono">EGP {Number(o.totalAmount).toLocaleString()}</td>
                <td className="p-3">
                  <span className="stamp border border-ink/20 px-2 py-0.5">{o.status}</span>
                </td>
                <td className="p-3 stamp text-ink-soft">
                  {new Date(o.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: '2-digit' })}
                </td>
                <td className="p-3">
                  <Link href={`/${locale}/admin/orders/${o.id}`} className="stamp text-gold-deep hover:text-ink">
                    View →
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {data && data.totalPages > 1 && (
        <div className="flex justify-center gap-2">
          {Array.from({ length: Math.min(data.totalPages, 10) }, (_, i) => i + 1).map((p) => (
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
