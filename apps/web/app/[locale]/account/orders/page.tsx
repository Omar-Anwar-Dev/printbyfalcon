'use client';

import Link from 'next/link';
import { useState } from 'react';
import { useLocale } from 'next-intl';
import { useQuery } from '@tanstack/react-query';
import { fetchMyOrders } from '../../../../lib/api';
import { useAuthStore } from '../../../../stores/auth.store';

const statusColors: Record<string, string> = {
  PENDING_PAYMENT: 'border-ink-ghost/40 text-ink-ghost',
  PAYMENT_CONFIRMED: 'border-accent/40 text-accent',
  PROCESSING: 'border-gold/60 text-gold-deep',
  SHIPPED: 'border-accent/40 text-accent',
  OUT_FOR_DELIVERY: 'border-accent/60 text-accent',
  DELIVERED: 'border-ink text-ink',
  CANCELLED: 'border-seal/40 text-seal',
  REFUNDED: 'border-seal/40 text-seal',
};

export default function OrdersPage() {
  const locale = useLocale();
  const { isAuthenticated } = useAuthStore();
  const [page, setPage] = useState(1);

  const { data, isLoading } = useQuery({
    queryKey: ['orders', page, 10],
    queryFn: () => fetchMyOrders(page, 10),
    enabled: isAuthenticated,
  });

  return (
    <div>
      <header className="mb-8 flex items-end justify-between border-b border-ink/10 pb-4">
        <div>
          <p className="eyebrow text-gold-deep mb-2">№ 02</p>
          <h2 className="text-display text-3xl md:text-4xl tracking-tightest">
            {locale === 'ar' ? 'طلباتي' : 'My Orders'}
          </h2>
        </div>
        <span className="stamp text-ink-ghost">{data?.total ?? 0} {locale === 'ar' ? 'طلب' : 'total'}</span>
      </header>

      {isLoading ? (
        <div className="text-center py-20 text-ink-ghost">{locale === 'ar' ? 'جارٍ التحميل...' : 'Loading…'}</div>
      ) : !data || data.data.length === 0 ? (
        <div className="border border-dashed border-ink/20 py-20 text-center">
          <span className="text-gold text-5xl block mb-4">✦</span>
          <p className="text-display text-xl text-ink mb-2">
            {locale === 'ar' ? 'لا توجد طلبات حتى الآن' : 'No orders yet'}
          </p>
          <p className="text-sm text-ink-soft mb-6">
            {locale === 'ar' ? 'ابدأ التسوق واجعل أول طلب لك' : 'Start shopping to place your first order'}
          </p>
          <Link href={`/${locale}/products`} className="btn-ink">
            {locale === 'ar' ? 'تصفح المنتجات' : 'Browse products'} →
          </Link>
        </div>
      ) : (
        <>
          <ul className="divide-y divide-ink/10">
            {data.data.map((order) => {
              const statusClass = statusColors[order.status] ?? 'border-ink/20 text-ink';
              return (
                <li key={order.id}>
                  <Link
                    href={`/${locale}/account/orders/${order.id}`}
                    className="block py-5 group hover:bg-paper-white/50 -mx-4 px-4 transition-colors"
                  >
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-3 mb-1">
                          <span className="font-mono text-xs text-ink-ghost">{order.invoiceNumber}</span>
                          <span className={`stamp border px-2 py-0.5 ${statusClass}`}>{order.status}</span>
                        </div>
                        <p className="text-sm text-ink">
                          {new Date(order.createdAt).toLocaleDateString(locale === 'ar' ? 'ar-EG' : 'en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}
                          <span className="mx-2 text-ink-ghost">·</span>
                          <span className="text-ink-soft">{order.items?.length ?? 0} {locale === 'ar' ? 'منتج' : 'items'}</span>
                        </p>
                      </div>
                      <div className="flex items-center gap-6">
                        <div className="text-right">
                          <p className="stamp text-ink-ghost mb-0.5">{locale === 'ar' ? 'الإجمالي' : 'Total'}</p>
                          <p className="text-display text-xl text-ink">EGP {Number(order.totalAmount).toLocaleString()}</p>
                        </div>
                        <span className="text-ink-ghost group-hover:text-ink transition">→</span>
                      </div>
                    </div>
                  </Link>
                </li>
              );
            })}
          </ul>

          {data.totalPages > 1 && (
            <div className="mt-8 flex justify-center gap-2">
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
        </>
      )}
    </div>
  );
}
