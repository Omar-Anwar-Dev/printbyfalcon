import { useTranslations, useLocale } from 'next-intl';
import Link from 'next/link';

export function Footer() {
  const locale = useLocale();

  return (
    <footer className="bg-[#1a1a2e] text-gray-300">
      <div className="container mx-auto px-4 py-10">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
          <div>
            <h3 className="mb-3 text-lg font-bold text-white">
              <span className="text-[#e8b86d]">🦅</span> PrintByFalcon
            </h3>
            <p className="text-sm leading-relaxed">
              {locale === 'ar'
                ? 'مستلزمات الطباعة الاحترافية بأفضل الأسعار في مصر'
                : 'Professional printing supplies at the best prices in Egypt'}
            </p>
          </div>

          <div>
            <h4 className="mb-3 font-semibold text-white">
              {locale === 'ar' ? 'روابط سريعة' : 'Quick Links'}
            </h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href={`/${locale}/products`} className="hover:text-[#e8b86d] transition-colors">
                  {locale === 'ar' ? 'المنتجات' : 'Products'}
                </Link>
              </li>
              <li>
                <Link href={`/${locale}/cart`} className="hover:text-[#e8b86d] transition-colors">
                  {locale === 'ar' ? 'السلة' : 'Cart'}
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="mb-3 font-semibold text-white">
              {locale === 'ar' ? 'تواصل معنا' : 'Contact'}
            </h4>
            <ul className="space-y-2 text-sm">
              <li>📧 info@printbyfalcon.com</li>
              <li>📍 {locale === 'ar' ? 'القاهرة، مصر' : 'Cairo, Egypt'}</li>
            </ul>
          </div>
        </div>

        <div className="mt-8 border-t border-white/10 pt-6 text-center text-xs text-gray-500">
          © {new Date().getFullYear()} PrintByFalcon.{' '}
          {locale === 'ar' ? 'جميع الحقوق محفوظة' : 'All rights reserved.'}
        </div>
      </div>
    </footer>
  );
}
