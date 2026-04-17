'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useLocale } from 'next-intl';
import { useAuthStore } from '../../../stores/auth.store';
import { useRequireAuth } from '../../../hooks/useRequireAuth';

const ADMIN_ROLES = ['SUPERADMIN', 'SALES_MANAGER', 'CUSTOMER_SERVICE'];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const locale = useLocale();
  const pathname = usePathname();
  const { user, clearAuth } = useAuthStore();
  const isAuth = useRequireAuth();

  if (!isAuth) return null;

  if (user && !ADMIN_ROLES.includes(user.role)) {
    return (
      <div className="container mx-auto px-5 py-20 text-center">
        <span className="text-seal text-5xl block mb-4">✦</span>
        <h1 className="text-display text-3xl mb-2">Access denied</h1>
        <p className="text-ink-soft">You don&rsquo;t have permission to view the admin panel.</p>
      </div>
    );
  }

  const nav = [
    { href: `/${locale}/admin`, label: 'Dashboard', code: '01' },
    { href: `/${locale}/admin/products`, label: 'Products', code: '02' },
    { href: `/${locale}/admin/orders`, label: 'Orders', code: '03' },
  ];

  const isActive = (href: string) =>
    href === `/${locale}/admin` ? pathname === href : pathname.startsWith(href);

  return (
    <div className="min-h-screen grid grid-cols-1 md:grid-cols-[240px_1fr]">
      {/* Sidebar */}
      <aside className="bg-ink text-paper paper-texture p-8 md:min-h-screen md:sticky md:top-0">
        <Link href={`/${locale}`} className="flex items-baseline gap-2.5 mb-12">
          <span className="text-gold text-lg">✦</span>
          <span className="text-display text-lg leading-none">
            Print<span className="italic-flourish text-gold">by</span>Falcon
          </span>
        </Link>

        <p className="eyebrow text-gold mb-4">ADMIN PANEL</p>

        <nav>
          <ul className="space-y-0">
            {nav.map((item) => {
              const active = isActive(item.href);
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className={`flex items-center justify-between border-t border-paper/10 py-4 text-sm transition-colors ${
                      active ? 'text-paper font-medium' : 'text-paper/60 hover:text-paper'
                    }`}
                  >
                    <span className="flex items-center gap-3">
                      <span className={`stamp ${active ? 'text-gold' : 'text-paper/30'}`}>{item.code}</span>
                      {item.label}
                    </span>
                    {active && <span className="text-gold">✦</span>}
                  </Link>
                </li>
              );
            })}
            <li className="border-t border-paper/10"></li>
          </ul>
        </nav>

        <div className="mt-12 pt-6 border-t border-paper/10">
          <p className="eyebrow text-paper/40 mb-2">SIGNED IN</p>
          <p className="text-sm text-paper">{user?.firstName} {user?.lastName}</p>
          <p className="stamp text-gold">{user?.role}</p>
          <button onClick={clearAuth} className="mt-4 stamp text-paper/50 hover:text-seal transition">
            ← Sign out
          </button>
        </div>
      </aside>

      {/* Main */}
      <main className="p-6 md:p-10 lg:p-14">{children}</main>
    </div>
  );
}
