'use client';

import Link from 'next/link';
import { useTranslations, useLocale } from 'next-intl';
import { useCartStore } from '../../stores/cart.store';
import { useAuthStore } from '../../stores/auth.store';
import { ShoppingCartIcon, UserIcon, Bars3Icon } from '@heroicons/react/24/outline';
import { useState } from 'react';

export function Navbar() {
  const t = useTranslations('nav');
  const locale = useLocale();
  const { itemCount, toggleDrawer } = useCartStore();
  const { isAuthenticated, clearAuth } = useAuthStore();
  const [mobileOpen, setMobileOpen] = useState(false);

  const otherLocale = locale === 'ar' ? 'en' : 'ar';

  return (
    <header className="sticky top-0 z-40 bg-[#1a1a2e] text-white shadow-md">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        {/* Logo */}
        <Link href={`/${locale}`} className="flex items-center gap-2 text-xl font-bold">
          <span className="text-[#e8b86d]">🦅</span>
          <span>PrintByFalcon</span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden items-center gap-6 md:flex">
          <Link href={`/${locale}`} className="hover:text-[#e8b86d] transition-colors text-sm">
            {t('home')}
          </Link>
          <Link href={`/${locale}/products`} className="hover:text-[#e8b86d] transition-colors text-sm">
            {t('products')}
          </Link>
        </nav>

        {/* Actions */}
        <div className="flex items-center gap-3">
          {/* Language switcher */}
          <Link
            href={`/${otherLocale}`}
            className="hidden text-xs font-medium text-gray-300 hover:text-[#e8b86d] transition-colors md:block"
          >
            {otherLocale === 'ar' ? 'العربية' : 'EN'}
          </Link>

          {/* Cart */}
          <button
            onClick={toggleDrawer}
            className="relative rounded-full p-2 hover:bg-white/10 transition-colors"
            aria-label={t('cart')}
          >
            <ShoppingCartIcon className="h-5 w-5" />
            {itemCount > 0 && (
              <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-[#e8b86d] text-[10px] font-bold text-[#1a1a2e]">
                {itemCount > 9 ? '9+' : itemCount}
              </span>
            )}
          </button>

          {/* User */}
          {isAuthenticated ? (
            <button
              onClick={clearAuth}
              className="hidden rounded-full p-2 hover:bg-white/10 transition-colors md:block"
              title={t('logout')}
            >
              <UserIcon className="h-5 w-5" />
            </button>
          ) : (
            <Link
              href={`/${locale}/login`}
              className="hidden rounded-lg bg-[#e8b86d] px-4 py-1.5 text-sm font-semibold text-[#1a1a2e] hover:bg-[#d4a55e] transition-colors md:block"
            >
              {t('login')}
            </Link>
          )}

          {/* Mobile hamburger */}
          <button
            className="rounded-full p-2 hover:bg-white/10 md:hidden"
            onClick={() => setMobileOpen((v) => !v)}
          >
            <Bars3Icon className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="border-t border-white/10 bg-[#1a1a2e] px-4 pb-4 md:hidden">
          <nav className="flex flex-col gap-3 pt-3">
            <Link href={`/${locale}`} className="text-sm hover:text-[#e8b86d]" onClick={() => setMobileOpen(false)}>
              {t('home')}
            </Link>
            <Link href={`/${locale}/products`} className="text-sm hover:text-[#e8b86d]" onClick={() => setMobileOpen(false)}>
              {t('products')}
            </Link>
            <Link href={`/${otherLocale}`} className="text-sm text-gray-300 hover:text-[#e8b86d]">
              {otherLocale === 'ar' ? 'العربية' : 'English'}
            </Link>
            {!isAuthenticated && (
              <Link href={`/${locale}/login`} className="text-sm font-semibold text-[#e8b86d]">
                {t('login')}
              </Link>
            )}
          </nav>
        </div>
      )}
    </header>
  );
}
