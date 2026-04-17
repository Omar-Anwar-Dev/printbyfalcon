'use client';

import Link from 'next/link';
import { useTranslations, useLocale } from 'next-intl';
import { useCartStore } from '../../stores/cart.store';
import { useAuthStore } from '../../stores/auth.store';
import { ShoppingCartIcon, UserIcon, Bars3Icon } from '@heroicons/react/24/outline';
import { useState } from 'react';
import { SearchBar } from './SearchBar';

export function Navbar() {
  const t = useTranslations('nav');
  const locale = useLocale();
  const { itemCount, toggleDrawer } = useCartStore();
  const { isAuthenticated, user, clearAuth } = useAuthStore();
  const [mobileOpen, setMobileOpen] = useState(false);

  const otherLocale = locale === 'ar' ? 'en' : 'ar';

  return (
    <>
      {/* Thin marquee-like announcement bar */}
      <div className="bg-ink text-paper/80 text-center text-[11px] tracking-wideplus uppercase py-2" style={{ fontFamily: 'var(--font-mono), monospace' }}>
        <span className="mx-2">{locale === 'ar' ? '·' : '·'}</span>
        {locale === 'ar'
          ? 'شحن مجاني داخل القاهرة للطلبات أعلى من ١٥٠٠ ج.م'
          : 'Free shipping within Cairo for orders above EGP 1,500'}
        <span className="mx-2">·</span>
      </div>

      <header className="sticky top-0 z-40 border-b border-ink/10 bg-paper/90 backdrop-blur-sm">
        <div className="container mx-auto flex h-20 items-center justify-between gap-6 px-5">
          {/* Logo — editorial wordmark */}
          <Link href={`/${locale}`} className="flex items-baseline gap-2.5 group">
            <span className="text-gold text-xl leading-none transition-transform group-hover:rotate-6">✦</span>
            <div className="flex flex-col leading-none">
              <span className="text-display text-xl tracking-tightest text-ink">
                Print<span className="italic-flourish text-gold-deep">by</span>Falcon
              </span>
              <span className="stamp text-ink-ghost text-[8px] mt-0.5">{locale === 'ar' ? 'مطبعة اتيليه · القاهرة' : 'Atelier · Cairo est. 2025'}</span>
            </div>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden items-center gap-8 md:flex">
            <Link href={`/${locale}/products`} className="text-sm text-ink/80 hover:text-ink transition-colors">
              {t('products')}
            </Link>
            <Link href={`/${locale}/products?category=ink-cartridges`} className="text-sm text-ink/80 hover:text-ink transition-colors">
              {locale === 'ar' ? 'الأحبار' : 'Ink'}
            </Link>
            <Link href={`/${locale}/products?category=printers`} className="text-sm text-ink/80 hover:text-ink transition-colors">
              {locale === 'ar' ? 'الطابعات' : 'Printers'}
            </Link>
            <Link href={`/${locale}/products?category=paper-media`} className="text-sm text-ink/80 hover:text-ink transition-colors">
              {locale === 'ar' ? 'الورق' : 'Paper'}
            </Link>
          </nav>

          {/* Search bar */}
          <div className="hidden flex-1 md:block md:max-w-xs">
            <SearchBar />
          </div>

          {/* Actions */}
          <div className="flex items-center gap-4">
            <Link
              href={`/${otherLocale}`}
              className="hidden text-xs font-medium text-ink-soft hover:text-ink transition-colors tracking-wide md:block"
              style={{ fontFamily: 'var(--font-mono), monospace' }}
            >
              {otherLocale === 'ar' ? 'ع' : 'EN'}
            </Link>

            {isAuthenticated ? (
              <Link
                href={`/${locale}/account`}
                className="hidden items-center gap-1.5 text-xs text-ink-soft hover:text-ink md:flex"
              >
                <UserIcon className="h-4 w-4" />
                <span className="max-w-[90px] truncate">{user?.firstName}</span>
              </Link>
            ) : (
              <Link
                href={`/${locale}/auth/login`}
                className="hidden text-xs font-medium text-ink hover:underline md:block"
              >
                {t('login')}
              </Link>
            )}

            <button
              onClick={toggleDrawer}
              className="relative"
              aria-label={t('cart')}
            >
              <ShoppingCartIcon className="h-5 w-5 text-ink" />
              {itemCount > 0 && (
                <span className="absolute -top-2 -right-2 flex h-4 min-w-4 items-center justify-center bg-gold text-ink text-[10px] font-bold px-1" style={{ fontFamily: 'var(--font-mono), monospace' }}>
                  {itemCount > 9 ? '9+' : itemCount}
                </span>
              )}
            </button>

            <button className="md:hidden" onClick={() => setMobileOpen((v) => !v)}>
              <Bars3Icon className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {mobileOpen && (
          <div className="border-t border-ink/10 bg-paper px-5 pb-5 md:hidden">
            <div className="pt-4">
              <SearchBar />
            </div>
            <nav className="flex flex-col gap-3 pt-4 text-sm">
              <Link href={`/${locale}/products`} onClick={() => setMobileOpen(false)}>{t('products')}</Link>
              <Link href={`/${locale}/products?category=ink-cartridges`} onClick={() => setMobileOpen(false)}>
                {locale === 'ar' ? 'الأحبار' : 'Ink'}
              </Link>
              <Link href={`/${locale}/products?category=printers`} onClick={() => setMobileOpen(false)}>
                {locale === 'ar' ? 'الطابعات' : 'Printers'}
              </Link>
              <Link href={`/${otherLocale}`} className="text-ink-soft stamp">
                {otherLocale === 'ar' ? 'العربية' : 'English'}
              </Link>
              {!isAuthenticated ? (
                <Link href={`/${locale}/auth/login`} className="font-semibold text-gold-deep">{t('login')}</Link>
              ) : (
                <Link href={`/${locale}/account`}>{t('account')}</Link>
              )}
            </nav>
          </div>
        )}
      </header>
    </>
  );
}
