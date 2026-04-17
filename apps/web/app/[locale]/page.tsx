import { useTranslations } from 'next-intl';
import { getTranslations } from 'next-intl/server';
import { BannerCarousel } from '../../components/ui/BannerCarousel';
import { ProductCard } from '../../components/ui/ProductCard';
import { fetchBanners, fetchFeaturedProducts } from '../../lib/api';
import Link from 'next/link';

interface Props {
  params: { locale: string };
}

export default async function HomePage({ params: { locale } }: Props) {
  const t = await getTranslations('home');

  const [banners, featuredProducts] = await Promise.allSettled([
    fetchBanners(),
    fetchFeaturedProducts(),
  ]);

  const bannerData = banners.status === 'fulfilled' ? banners.value : [];
  const products = featuredProducts.status === 'fulfilled' ? featuredProducts.value : [];

  return (
    <div className="container mx-auto px-4 py-6 space-y-10">
      {/* Banner carousel */}
      {bannerData.length > 0 && <BannerCarousel banners={bannerData} />}

      {/* Hero (fallback when no banners) */}
      {bannerData.length === 0 && (
        <section className="rounded-2xl bg-gradient-to-r from-[#1a1a2e] to-[#2a2a5e] px-8 py-16 text-center text-white">
          <h1 className="text-3xl font-bold md:text-5xl">{t('heroTitle')}</h1>
          <p className="mt-3 text-gray-300">{t('heroSubtitle')}</p>
          <Link
            href={`/${locale}/products`}
            className="mt-6 inline-block rounded-lg bg-[#e8b86d] px-8 py-3 font-bold text-[#1a1a2e] hover:bg-[#d4a55e] transition-colors"
          >
            {t('shopNow')}
          </Link>
        </section>
      )}

      {/* Featured products */}
      {products.length > 0 && (
        <section>
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-xl font-bold text-[#1a1a2e] md:text-2xl">{t('featuredProducts')}</h2>
            <Link
              href={`/${locale}/products`}
              className="text-sm font-semibold text-[#e8b86d] hover:underline"
            >
              {t('viewAll')} →
            </Link>
          </div>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
            {products.slice(0, 10).map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
