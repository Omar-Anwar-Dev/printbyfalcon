'use client';

import { useQuery } from '@tanstack/react-query';
import { adminDailyRevenue, adminDashboard, adminTopProducts } from '../../../lib/api';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';

export default function AdminDashboard() {
  const { data: dash } = useQuery({ queryKey: ['admin-dashboard'], queryFn: adminDashboard });
  const { data: daily = [] } = useQuery({ queryKey: ['admin-daily-revenue'], queryFn: () => adminDailyRevenue() });
  const { data: topProducts = [] } = useQuery({ queryKey: ['admin-top-products'], queryFn: () => adminTopProducts(5) });

  const kpis = [
    { code: '01', label: 'Revenue · This month', value: dash ? `EGP ${Number(dash.revenue.thisMonth).toLocaleString()}` : '—', delta: dash ? `${dash.revenue.growth > 0 ? '+' : ''}${dash.revenue.growth}%` : '', tone: (dash?.revenue.growth ?? 0) >= 0 ? 'positive' : 'negative' },
    { code: '02', label: 'Pending orders', value: dash?.orders.pending ?? '—' },
    { code: '03', label: 'Open tickets', value: dash?.support.openTickets ?? '—' },
    { code: '04', label: 'Low stock', value: dash?.inventory.lowStock ?? '—', hint: 'items ≤ 10' },
  ];

  return (
    <div className="space-y-10">
      <header className="pb-5 border-b border-ink/10 flex items-end justify-between">
        <div>
          <p className="eyebrow text-gold-deep mb-2">№ 01 · OVERVIEW</p>
          <h1 className="text-display text-4xl md:text-5xl tracking-tightest">Atelier dashboard</h1>
        </div>
        <span className="stamp text-ink-ghost">{new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
      </header>

      {/* KPIs */}
      <section className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {kpis.map((k) => (
          <div key={k.code} className="border border-ink/10 bg-paper-white p-5 paper-texture">
            <div className="flex items-baseline justify-between mb-2">
              <span className="stamp text-ink-ghost">{k.code}</span>
              {k.delta && (
                <span className={`stamp ${k.tone === 'positive' ? 'text-gold-deep' : 'text-seal'}`}>
                  {k.delta}
                </span>
              )}
            </div>
            <p className="text-display text-3xl md:text-4xl text-ink break-all">{k.value}</p>
            <p className="text-xs text-ink-soft mt-2">{k.label}</p>
            {k.hint && <p className="stamp text-ink-ghost mt-1">{k.hint}</p>}
          </div>
        ))}
      </section>

      {/* Revenue chart */}
      <section className="border border-ink/10 bg-paper-white p-6 md:p-8">
        <div className="mb-6">
          <p className="eyebrow text-ink-ghost mb-2">№ 02</p>
          <h2 className="text-display text-2xl">Revenue · month-to-date</h2>
        </div>
        <div style={{ width: '100%', height: 320 }}>
          <ResponsiveContainer>
            <LineChart data={daily} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="2 4" stroke="rgba(18,23,43,0.1)" />
              <XAxis
                dataKey="date"
                stroke="#8b90a5"
                tick={{ fontSize: 11, fontFamily: 'var(--font-mono)' }}
                tickFormatter={(d) => new Date(d).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}
              />
              <YAxis
                stroke="#8b90a5"
                tick={{ fontSize: 11, fontFamily: 'var(--font-mono)' }}
                tickFormatter={(v) => `${v / 1000}k`}
              />
              <Tooltip
                contentStyle={{
                  background: '#fdfcf8',
                  border: '1px solid rgba(18,23,43,0.1)',
                  borderRadius: 0,
                  fontFamily: 'var(--font-mono)',
                  fontSize: 11,
                }}
                labelFormatter={(d) => new Date(d).toLocaleDateString()}
                formatter={(v: number) => [`EGP ${v.toLocaleString()}`, 'Revenue']}
              />
              <Line type="monotone" dataKey="revenue" stroke="#c9a063" strokeWidth={2} dot={{ r: 2.5, fill: '#c9a063' }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </section>

      {/* Top products */}
      <section>
        <div className="mb-5 flex items-end justify-between border-b border-ink/10 pb-3">
          <div>
            <p className="eyebrow text-ink-ghost mb-1">№ 03</p>
            <h2 className="text-display text-2xl">Top sellers</h2>
          </div>
        </div>
        <ul className="divide-y divide-ink/10">
          {topProducts.map((p: any, i: number) => (
            <li key={p.id} className="flex items-center gap-6 py-4">
              <span className="stamp text-ink-ghost w-8">{String(i + 1).padStart(2, '0')}</span>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-ink">{p.nameEn}</p>
                <p className="stamp text-ink-ghost">SKU · {p.sku}</p>
              </div>
              <div className="text-right">
                <p className="text-display text-lg">{p.soldCount}</p>
                <p className="stamp text-ink-ghost">sold</p>
              </div>
              <div className="text-right">
                <p className="text-display text-lg">EGP {Number(p.price).toLocaleString()}</p>
                <p className="stamp text-ink-ghost">price</p>
              </div>
            </li>
          ))}
          {topProducts.length === 0 && (
            <li className="py-8 text-center text-ink-ghost text-sm">No sales data yet.</li>
          )}
        </ul>
      </section>
    </div>
  );
}
