import { useLocale } from 'next-intl';
import Link from 'next/link';

export function Footer() {
  const locale = useLocale();

  return (
    <footer className="mt-20 border-t border-ink/10 bg-paper">
      <div className="container mx-auto px-5 py-16">
        {/* Oversized wordmark watermark */}
        <div className="mb-12 text-center overflow-hidden">
          <h2 className="text-display leading-none tracking-tightest text-ink/[0.08] select-none text-[14vw] md:text-[9rem]">
            PrintbyFalcon
          </h2>
        </div>

        <div className="grid grid-cols-2 gap-10 md:grid-cols-4 pb-10 border-b border-ink/10">
          <div className="col-span-2">
            <p className="eyebrow mb-3">{locale === 'ar' ? 'أتيليه الطباعة' : 'Printing Atelier'}</p>
            <p className="text-sm leading-relaxed text-ink-soft max-w-sm">
              {locale === 'ar'
                ? 'مورّد متخصص في مستلزمات الطباعة الأصلية في مصر. نخدم المكاتب والمصممين والاستوديوهات منذ ٢٠٢٥.'
                : 'A specialist supplier of genuine printing consumables in Egypt. Serving offices, designers, and studios since 2025.'}
            </p>
          </div>

          <div>
            <p className="eyebrow mb-3">{locale === 'ar' ? 'الكتالوج' : 'Catalog'}</p>
            <ul className="space-y-2 text-sm">
              <li><Link href={`/${locale}/products`} className="hover:text-gold-deep">{locale === 'ar' ? 'المنتجات' : 'All Products'}</Link></li>
              <li><Link href={`/${locale}/products?category=ink-cartridges`} className="hover:text-gold-deep">{locale === 'ar' ? 'الأحبار' : 'Ink'}</Link></li>
              <li><Link href={`/${locale}/products?category=printers`} className="hover:text-gold-deep">{locale === 'ar' ? 'الطابعات' : 'Printers'}</Link></li>
              <li><Link href={`/${locale}/products?category=paper-media`} className="hover:text-gold-deep">{locale === 'ar' ? 'الورق' : 'Paper'}</Link></li>
            </ul>
          </div>

          <div>
            <p className="eyebrow mb-3">{locale === 'ar' ? 'الحساب' : 'Account'}</p>
            <ul className="space-y-2 text-sm">
              <li><Link href={`/${locale}/auth/login`} className="hover:text-gold-deep">{locale === 'ar' ? 'تسجيل الدخول' : 'Sign in'}</Link></li>
              <li><Link href={`/${locale}/account`} className="hover:text-gold-deep">{locale === 'ar' ? 'حسابي' : 'My account'}</Link></li>
              <li><Link href={`/${locale}/account/orders`} className="hover:text-gold-deep">{locale === 'ar' ? 'طلباتي' : 'Orders'}</Link></li>
              <li><Link href={`/${locale}/support`} className="hover:text-gold-deep">{locale === 'ar' ? 'الدعم' : 'Support'}</Link></li>
            </ul>
          </div>
        </div>

        <div className="mt-6 flex flex-col items-start justify-between gap-3 text-xs text-ink-soft md:flex-row md:items-center">
          <div className="stamp">© {new Date().getFullYear()} · PRINTBYFALCON · CAIRO, EGYPT</div>
          <div className="flex items-center gap-4 stamp">
            <span>EST. 2025</span>
            <span className="text-gold">✦</span>
            <span>info@printbyfalcon.com</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
