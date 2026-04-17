'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useLocale } from 'next-intl';
import { useAuthStore } from '../stores/auth.store';

export function useRequireAuth(redirectTo?: string) {
  const router = useRouter();
  const locale = useLocale();
  const { isAuthenticated } = useAuthStore();

  useEffect(() => {
    if (!isAuthenticated) {
      const target = redirectTo ?? `/${locale}/auth/login`;
      router.replace(target);
    }
  }, [isAuthenticated, router, locale, redirectTo]);

  return isAuthenticated;
}
