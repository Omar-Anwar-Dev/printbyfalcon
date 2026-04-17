'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useLocale } from 'next-intl';
import { useAuthStore } from '../stores/auth.store';

/**
 * Gate authenticated routes. Waits for Zustand to rehydrate from localStorage
 * before deciding, so refreshes don't bounce back to /login.
 */
export function useRequireAuth(redirectTo?: string) {
  const router = useRouter();
  const locale = useLocale();
  const { isAuthenticated } = useAuthStore();
  const [hasHydrated, setHasHydrated] = useState(false);

  useEffect(() => {
    // On mount, check if persist already hydrated (it may have done so
    // between SSR and the effect, in which case hasHydrated() returns true)
    const initial = useAuthStore.persist.hasHydrated();
    if (initial) {
      setHasHydrated(true);
      return;
    }
    // Otherwise subscribe for the hydration event
    const unsub = useAuthStore.persist.onFinishHydration(() => setHasHydrated(true));
    return () => unsub();
  }, []);

  useEffect(() => {
    if (!hasHydrated) return;            // wait for rehydrate before deciding
    if (!isAuthenticated) {
      router.replace(redirectTo ?? `/${locale}/auth/login`);
    }
  }, [hasHydrated, isAuthenticated, router, locale, redirectTo]);

  // Treat "still hydrating" as authenticated so children render optimistically
  // rather than flashing the redirecting spinner for 100ms.
  return !hasHydrated || isAuthenticated;
}
