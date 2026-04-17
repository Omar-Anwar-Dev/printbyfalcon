'use client';

import { useEffect } from 'react';
import { useLocale } from 'next-intl';
import Link from 'next/link';

export default function ErrorPage({ error, reset }: { error: Error; reset: () => void }) {
  const locale = useLocale();

  useEffect(() => {
    console.error('App error:', error);
  }, [error]);

  return (
    <div className="container mx-auto flex min-h-[60vh] flex-col items-center justify-center px-4 text-center">
      <span className="text-6xl">⚠️</span>
      <h1 className="mt-4 text-2xl font-bold text-[#1a1a2e]">
        {locale === 'ar' ? 'حدث خطأ ما' : 'Something went wrong'}
      </h1>
      <p className="mt-2 text-gray-500">
        {locale === 'ar'
          ? 'نعتذر، حدث خطأ غير متوقع. حاول مرة أخرى.'
          : 'Sorry, an unexpected error occurred. Please try again.'}
      </p>
      <div className="mt-6 flex gap-3">
        <button
          onClick={reset}
          className="rounded-lg bg-[#1a1a2e] px-6 py-2 text-sm font-semibold text-white hover:bg-[#2a2a4e]"
        >
          {locale === 'ar' ? 'إعادة المحاولة' : 'Try again'}
        </button>
        <Link
          href={`/${locale}`}
          className="rounded-lg border border-gray-300 px-6 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50"
        >
          {locale === 'ar' ? 'العودة للرئيسية' : 'Go home'}
        </Link>
      </div>
    </div>
  );
}
