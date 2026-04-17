import Link from 'next/link';
import { getLocale } from 'next-intl/server';

export default async function NotFound() {
  const locale = await getLocale();
  return (
    <div className="container mx-auto flex min-h-[60vh] flex-col items-center justify-center px-4 text-center">
      <span className="text-7xl">🔍</span>
      <h1 className="mt-4 text-4xl font-bold text-[#1a1a2e]">404</h1>
      <p className="mt-2 text-lg font-semibold text-gray-700">
        {locale === 'ar' ? 'الصفحة غير موجودة' : 'Page not found'}
      </p>
      <p className="mt-1 text-sm text-gray-500">
        {locale === 'ar'
          ? 'الصفحة التي تبحث عنها غير موجودة أو تم نقلها.'
          : "The page you're looking for doesn't exist or has been moved."}
      </p>
      <Link
        href={`/${locale}`}
        className="mt-6 rounded-lg bg-[#e8b86d] px-6 py-3 font-bold text-[#1a1a2e] hover:bg-[#d4a55e]"
      >
        {locale === 'ar' ? 'العودة للرئيسية' : 'Back to home'}
      </Link>
    </div>
  );
}
