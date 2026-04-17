'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useLocale } from 'next-intl';
import { useAuthStore } from '../../../stores/auth.store';
import { useRequireAuth } from '../../../hooks/useRequireAuth';

export default function AccountLayout({ children }: { children: React.ReactNode }) {
  const locale = useLocale();
  const pathname = usePathname();
  const { user, clearAuth } = useAuthStore();
  const isAuth = useRequireAuth();

  if (!isAuth) {
    return (
      <div className="container mx-auto px-5 py-20 text-center">
        <p className="text-ink-soft">{locale === 'ar' ? 'جارٍ إعادة التوجيه...' : 'Redirecting…'}</p>
      </div>
    );
  }

  const nav = [
    { href: `/${locale}/account`, label: locale === 'ar' ? 'نظرة عامة' : 'Overview', code: '01' },
    { href: `/${locale}/account/orders`, label: locale === 'ar' ? 'الطلبات' : 'Orders', code: '02' },
    { href: `/${locale}/account/addresses`, label: locale === 'ar' ? 'العناوين' : 'Addresses', code: '03' },
    { href: `/${locale}/account/wishlist`, label: locale === 'ar' ? 'المفضلة' : 'Wishlist', code: '04' },
    { href: `/${locale}/support`, label: locale === 'ar' ? 'الدعم' : 'Support', code: '05' },
  ];

  const isActive = (href: string) =>
    href === `/${locale}/account` ? pathname === href : pathname.startsWith(href);

  return (
    <div className="container mx-auto px-5 py-10 md:py-16">
      <header className="mb-10 pb-8 border-b border-ink/10 flex flex-col md:flex-row md:items-end md:justify-between gap-4">
        <div>
          <p className="eyebrow mb-3 text-gold-deep">№ {String(user?.id || '').slice(0, 8).toUpperCase()}</p>
          <h1 className="text-display text-4xl md:text-5xl tracking-tightest leading-none">
            {locale === 'ar' ? (
              <>أهلاً، <span className="italic-flourish text-gold-deep">{user?.firstName}</span></>
            ) : (
              <>Hello, <span className="italic-flourish text-gold-deep">{user?.firstName}</span></>
            )}
          </h1>
        </div>
        <button onClick={clearAuth} className="text-xs stamp text-ink-soft hover:text-seal transition">
          {locale === 'ar' ? '← تسجيل الخروج' : '← Sign out'}
        </button>
      </header>

      <div className="grid grid-cols-1 gap-10 lg:grid-cols-[220px_1fr]">
        {/* Sidebar */}
        <aside>
          <nav className="sticky top-28">
            <ul className="space-y-0">
              {nav.map((item) => {
                const active = isActive(item.href);
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      className={`flex items-center justify-between border-t border-ink/10 py-4 text-sm transition-colors ${
                        active ? 'text-ink font-semibold' : 'text-ink-soft hover:text-ink'
                      }`}
                    >
                      <span className="flex items-center gap-3">
                        <span className={`stamp ${active ? 'text-gold-deep' : 'text-ink-ghost'}`}>{item.code}</span>
                        {item.label}
                      </span>
                      {active && <span className="text-gold">✦</span>}
                    </Link>
                  </li>
                );
              })}
              <li className="border-t border-ink/10"></li>
            </ul>
          </nav>
        </aside>

        <div>{children}</div>
      </div>
    </div>
  );
}
