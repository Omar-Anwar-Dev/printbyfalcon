'use client';

import Link from 'next/link';
import { useLocale } from 'next-intl';
import { useQuery } from '@tanstack/react-query';
import { useAuthStore } from '../../../stores/auth.store';
import { fetchMyOrders, fetchAddresses, fetchWishlist } from '../../../lib/api';

export default function AccountOverviewPage() {
  const locale = useLocale();
  const { user, isAuthenticated } = useAuthStore();

  const orders = useQuery({
    queryKey: ['orders', 1, 3],
    queryFn: () => fetchMyOrders(1, 3),
    enabled: isAuthenticated,
  });

  const addresses = useQuery({
    queryKey: ['addresses'],
    queryFn: fetchAddresses,
    enabled: isAuthenticated,
  });

  const wishlist = useQuery({
    queryKey: ['wishlist'],
    queryFn: fetchWishlist,
    enabled: isAuthenticated,
  });

  const stats = [
    {
      code: '02',
      label: locale === 'ar' ? 'الطلبات' : 'Orders',
      value: orders.data?.total ?? 0,
      href: `/${locale}/account/orders`,
    },
    {
      code: '03',
      label: locale === 'ar' ? 'العناوين' : 'Addresses',
      value: addresses.data?.length ?? 0,
      href: `/${locale}/account/addresses`,
    },
    {
      code: '04',
      label: locale === 'ar' ? 'المفضلة' : 'Wishlist',
      value: wishlist.data?.length ?? 0,
      href: `/${locale}/account/wishlist`,
    },
  ];

  return (
    <div className="space-y-10">
      {/* Stat cards */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {stats.map((s) => (
          <Link key={s.code} href={s.href} className="block border border-ink/10 bg-paper-white p-6 paper-texture hover:border-ink transition-colors group">
            <div className="flex items-baseline justify-between mb-3">
              <span className="stamp text-ink-ghost">{s.code}</span>
              <span className="text-display text-4xl text-ink">{s.value}</span>
            </div>
            <p className="text-sm text-ink-soft group-hover:text-ink transition">{s.label}</p>
          </Link>
        ))}
      </section>

      {/* Account details */}
      <section>
        <h2 className="text-display text-2xl mb-5 border-b border-ink/10 pb-3">
          {locale === 'ar' ? 'تفاصيل الحساب' : 'Account details'}
        </h2>
        <dl className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-5 text-sm">
          <div>
            <dt className="eyebrow mb-1 text-ink-ghost">{locale === 'ar' ? 'الاسم' : 'Name'}</dt>
            <dd>{user?.firstName} {user?.lastName}</dd>
          </div>
          <div>
            <dt className="eyebrow mb-1 text-ink-ghost">{locale === 'ar' ? 'البريد' : 'Email'}</dt>
            <dd className="font-mono text-xs">{user?.email}</dd>
          </div>
          <div>
            <dt className="eyebrow mb-1 text-ink-ghost">{locale === 'ar' ? 'الدور' : 'Role'}</dt>
            <dd>
              <span className="stamp border border-ink/20 px-2 py-0.5">{user?.role}</span>
            </dd>
          </div>
        </dl>
      </section>

      {/* Recent orders */}
      {orders.data && orders.data.data.length > 0 && (
        <section>
          <div className="mb-5 flex items-end justify-between border-b border-ink/10 pb-3">
            <h2 className="text-display text-2xl">{locale === 'ar' ? 'آخر الطلبات' : 'Recent orders'}</h2>
            <Link href={`/${locale}/account/orders`} className="text-xs text-ink-soft hover:text-ink">
              {locale === 'ar' ? 'الكل →' : 'View all →'}
            </Link>
          </div>
          <ul className="divide-y divide-ink/10">
            {orders.data.data.map((o) => (
              <li key={o.id}>
                <Link href={`/${locale}/account/orders/${o.id}`} className="flex items-center justify-between py-4 group">
                  <div>
                    <p className="font-mono text-xs text-ink-ghost mb-1">{o.invoiceNumber}</p>
                    <p className="text-sm text-ink group-hover:underline">{new Date(o.createdAt).toLocaleDateString()}</p>
                  </div>
                  <div className="text-right">
                    <span className="stamp border border-ink/20 px-2 py-0.5 mb-1 inline-block">{o.status}</span>
                    <p className="text-display text-lg text-ink mt-1">EGP {Number(o.totalAmount).toLocaleString()}</p>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
