import { getTranslations } from 'next-intl/server';
import Link from 'next/link';
import { ProductCard } from '../../components/ui/ProductCard';
import { fetchBanners, fetchFeaturedProducts, fetchCategories } from '../../lib/api';

interface Props {
  params: { locale: string };
}

// Re-render at most every 60 seconds — picks up new products/banners quickly
export const revalidate = 60;

export default async function HomePage({ params: { locale } }: Props) {
  const t = await getTranslations('home');

  const [featuredProducts, categories, banners] = await Promise.all([
    fetchFeaturedProducts().catch(() => [] as any[]),
    fetchCategories().catch(() => [] as any[]),
    fetchBanners().catch(() => [] as any[]),
  ]);

  const isRtl = locale === 'ar';

  return (
    <div className="container mx-auto px-5">
      {/* ─── HERO — Editorial split layout ─── */}
      <section className="grid grid-cols-12 gap-6 py-14 md:py-20 lg:py-28">
        <div className="col-span-12 md:col-span-7 relative opacity-0 animate-fade-up">
          <p className="eyebrow mb-6 text-gold-deep">
            <span className="text-gold">✦</span>{'  '}{locale === 'ar' ? 'مطبعة اتيليه · القاهرة' : 'Atelier · Est. Cairo 2025'}
          </p>
          <h1 className="text-display text-[clamp(2.75rem,8vw,6.5rem)] leading-[0.95] tracking-tightest text-ink">
            {locale === 'ar' ? (
              <>
                حبر أصيل، <br />
                <span className="italic-flourish text-gold-deep">و</span>طباعة بلا هوادة
              </>
            ) : (
              <>
                Archival inks, <br />
                <span className="italic-flourish text-gold-deep">un</span>compromising print
              </>
            )}
          </h1>
          <p className="mt-6 max-w-lg text-base leading-relaxed text-ink-soft">
            {locale === 'ar'
              ? 'مستلزمات أصلية من HP, Canon, Epson, Brother — مختارة بعناية ومضمونة الجودة. شحن سريع داخل مصر.'
              : 'Genuine consumables from HP, Canon, Epson, Brother — hand-curated for studios, offices, and print enthusiasts across Egypt.'}
          </p>

          <div className="mt-10 flex flex-wrap items-center gap-3 opacity-0 animate-fade-up-1">
            <Link href={`/${locale}/products`} className="btn-ink">
              {t('shopNow')}
              <span>→</span>
            </Link>
            <Link href={`/${locale}/products?category=ink-cartridges`} className="btn-ghost">
              {locale === 'ar' ? 'تسوق الأحبار' : 'Shop ink'}
            </Link>
          </div>

          <div className="mt-12 flex items-center gap-5 stamp text-ink-soft opacity-0 animate-fade-up-2">
            <span>{locale === 'ar' ? 'أصلي' : 'Original'}</span>
            <span className="text-gold">·</span>
            <span>{locale === 'ar' ? 'مضمون' : 'Warranty-backed'}</span>
            <span className="text-gold">·</span>
            <span>{locale === 'ar' ? 'شحن سريع' : 'Fast dispatch'}</span>
          </div>
        </div>

        {/* Hero visual — stacked paper sheets */}
        <div className="col-span-12 md:col-span-5 relative min-h-[400px] md:min-h-[520px] opacity-0 animate-fade-up-1">
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="absolute right-6 top-8 h-[85%] w-[75%] bg-paper-shadow/60 border border-ink/5 paper-texture transform rotate-[4deg]"></div>
            <div className="absolute right-10 top-4 h-[90%] w-[80%] bg-paper-white border border-ink/10 paper-texture transform rotate-[-2deg] shadow-card"></div>
            <div className="absolute inset-x-6 top-0 h-[95%] bg-paper-white border border-ink/10 paper-texture shadow-card flex flex-col p-8">
              <div className="stamp text-ink-soft mb-2">№ 01 — {locale === 'ar' ? 'كتالوج' : 'CATALOG'}</div>
              <div className="my-auto">
                <p className="text-display text-2xl leading-tight text-ink">
                  {locale === 'ar'
                    ? 'خرطوشة HP ٦٨٠ — ١,٢٠٠ صفحة'
                    : 'HP 680 Cartridge — 1,200 pages'}
                </p>
              </div>
              <div className="mt-auto flex items-end justify-between border-t border-ink/10 pt-4">
                <div>
                  <p className="stamp text-ink-soft mb-1">{locale === 'ar' ? 'من' : 'From'}</p>
                  <p className="text-display text-3xl text-ink">EGP 299</p>
                </div>
                <span className="text-gold text-3xl">✦</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="divider-ornament">
        <span>{locale === 'ar' ? 'ما المعروض اليوم' : 'Selected for you'}</span>
      </div>

      {/* ─── CATEGORIES ─── */}
      {categories.length > 0 && (
        <section className="py-8">
          <div className="grid grid-cols-2 gap-3 md:grid-cols-5">
            {categories.slice(0, 5).map((cat, i) => (
              <Link
                key={cat.id}
                href={`/${locale}/products?category=${cat.slug}`}
                className="group relative flex items-center justify-between border border-ink/10 bg-paper-white px-4 py-5 hover:bg-ink hover:text-paper transition-colors"
              >
                <div>
                  <span className="stamp text-ink-ghost group-hover:text-paper/60 block mb-0.5">0{i + 1}</span>
                  <span className="text-display text-lg tracking-tight">{locale === 'ar' ? cat.nameAr : cat.nameEn}</span>
                </div>
                <span className="text-lg opacity-30 group-hover:opacity-100 transition-opacity">→</span>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* ─── FEATURED PRODUCTS ─── */}
      {featuredProducts.length > 0 && (
        <section className="py-14">
          <div className="mb-10 flex items-end justify-between border-b border-ink/10 pb-4">
            <div>
              <p className="eyebrow mb-2">{locale === 'ar' ? 'الفصل ١' : 'Chapter I'}</p>
              <h2 className="text-display text-3xl md:text-5xl tracking-tightest text-ink">
                {locale === 'ar' ? (
                  <>المنتجات <span className="italic-flourish text-gold-deep">المميزة</span></>
                ) : (
                  <><span className="italic-flourish text-gold-deep">Featured</span> products</>
                )}
              </h2>
            </div>
            <Link href={`/${locale}/products`} className="hidden text-sm text-ink-soft hover:text-ink md:inline-block">
              {t('viewAll')} →
            </Link>
          </div>

          <div className="grid grid-cols-2 gap-x-6 gap-y-10 md:grid-cols-3 lg:grid-cols-4">
            {featuredProducts.slice(0, 8).map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </section>
      )}

      {/* ─── Banner ─── */}
      {banners.length > 0 && (
        <section className="relative my-14 border border-ink/10 bg-ink text-paper paper-texture">
          <div className="grid grid-cols-12 items-center">
            <div className="col-span-12 p-10 md:col-span-7 md:p-14">
              <p className="eyebrow mb-4 text-gold">{locale === 'ar' ? 'عرض الأسبوع' : 'Of The Week'}</p>
              <h3 className="text-display text-3xl md:text-5xl tracking-tight mb-4">
                {locale === 'ar' ? banners[0].titleAr : banners[0].titleEn}
              </h3>
              {(locale === 'ar' ? banners[0].subtitleAr : banners[0].subtitleEn) && (
                <p className="text-paper/70 max-w-md mb-6">
                  {locale === 'ar' ? banners[0].subtitleAr : banners[0].subtitleEn}
                </p>
              )}
              {banners[0].link && (
                <Link href={banners[0].link} className="btn-gold">
                  {locale === 'ar' ? 'اكتشف' : 'Discover'} →
                </Link>
              )}
            </div>
            <div className="col-span-12 md:col-span-5 h-64 md:h-96 relative overflow-hidden border-l border-paper/10">
              {banners[0].imageUrl && (
                /* eslint-disable-next-line @next/next/no-img-element */
                <img src={banners[0].imageUrl} alt="" className="absolute inset-0 h-full w-full object-cover opacity-80" />
              )}
            </div>
          </div>
        </section>
      )}

      {/* ─── Manifesto ─── */}
      <section className="py-20">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
          {[
            {
              num: '01',
              title: locale === 'ar' ? 'أصلي، بلا استثناء' : 'Genuine. Always.',
              body: locale === 'ar'
                ? 'نستورد مباشرةً من الموزعين المعتمدين. كل منتج مضمون.'
                : 'We source directly from authorized distributors. Every product is guaranteed.',
            },
            {
              num: '02',
              title: locale === 'ar' ? 'شحن سريع' : 'Swift dispatch',
              body: locale === 'ar'
                ? 'طلبك يغادر المستودع خلال ٢٤ ساعة. القاهرة غداً، باقي المحافظات في يومين.'
                : 'Orders leave our warehouse within 24h. Cairo next-day, governorates within 2 days.',
            },
            {
              num: '03',
              title: locale === 'ar' ? 'خدمة من إنسان' : 'Human service',
              body: locale === 'ar'
                ? 'فريق دعم مختص يرد عليك بالعربية أو الإنجليزية، من السبت إلى الخميس.'
                : 'A specialist support team replies in Arabic or English, Saturday through Thursday.',
            },
          ].map((item) => (
            <div key={item.num} className="border-t border-ink pt-5">
              <span className="stamp text-gold-deep">{item.num}</span>
              <h4 className="text-display text-xl mt-2 mb-2 text-ink">{item.title}</h4>
              <p className="text-sm text-ink-soft leading-relaxed">{item.body}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
