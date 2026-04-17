import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { fetchProduct, fetchRelatedProducts } from '../../../../lib/api';
import { notFound } from 'next/navigation';
import Image from 'next/image';
import { AddToCartSection } from './AddToCartSection';
import { Breadcrumbs } from '../../../../components/ui/Breadcrumbs';
import { ProductCard } from '../../../../components/ui/ProductCard';

interface Props {
  params: { locale: string; slug: string };
}

// Was `revalidate = 3600` but that caches transient 404s (when API is slow
// during container boot) for a full hour. Dynamic rendering keeps content
// fresh and avoids cache-poisoning scenarios.
export const dynamic = 'force-dynamic';

export async function generateMetadata({ params: { locale, slug } }: Props): Promise<Metadata> {
  try {
    const product = await fetchProduct(slug);
    const name = locale === 'ar' ? product.nameAr : product.nameEn;
    const description = (locale === 'ar' ? product.descriptionAr : product.descriptionEn) ?? name;
    return {
      title: `${name} — PrintByFalcon`,
      description,
      openGraph: {
        title: name,
        description,
        images: product.images?.[0]?.url ? [product.images[0].url] : [],
      },
    };
  } catch {
    return { title: 'PrintByFalcon' };
  }
}

export default async function ProductDetailPage({ params: { locale, slug } }: Props) {
  const t = await getTranslations('product');

  let product;
  try {
    product = await fetchProduct(slug);
  } catch {
    notFound();
  }

  // Fetch related (best-effort — don't block page)
  const related = await fetchRelatedProducts(slug, 8).catch(() => [] as typeof product extends any ? any[] : any[]);

  const name = locale === 'ar' ? product.nameAr : product.nameEn;
  const description = locale === 'ar' ? product.descriptionAr : product.descriptionEn;
  const currentPrice = product.salePrice ?? product.price;
  const isOnSale = product.salePrice != null && Number(product.salePrice) < Number(product.price);

  // JSON-LD structured data for SEO
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name,
    description: description ?? name,
    sku: product.sku,
    image: product.images?.map((i) => i.url) ?? [],
    brand: product.brand ? {
      '@type': 'Brand',
      name: locale === 'ar' ? product.brand.nameAr : product.brand.nameEn,
    } : undefined,
    offers: {
      '@type': 'Offer',
      priceCurrency: 'EGP',
      price: Number(currentPrice),
      availability: product.stock > 0
        ? 'https://schema.org/InStock'
        : 'https://schema.org/OutOfStock',
      url: `https://printbyfalcon.com/${locale}/products/${slug}`,
    },
    aggregateRating: product.averageRating > 0 ? {
      '@type': 'AggregateRating',
      ratingValue: product.averageRating,
      ratingCount: 1,
    } : undefined,
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <Breadcrumbs
        items={[
          { label: locale === 'ar' ? 'الرئيسية' : 'Home', href: `/${locale}` },
          { label: locale === 'ar' ? 'المنتجات' : 'Products', href: `/${locale}/products` },
          ...(product.category
            ? [{
                label: locale === 'ar' ? product.category.nameAr : product.category.nameEn,
                href: `/${locale}/products?category=${product.category.slug}`,
              }]
            : []),
          { label: name },
        ]}
      />

      <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
        {/* Images */}
        <div className="space-y-3">
          <div className="relative aspect-square w-full overflow-hidden rounded-2xl bg-gray-100">
            {product.images?.[0] ? (
              <Image
                src={product.images[0].url}
                alt={name}
                fill
                className="object-cover"
                priority
              />
            ) : (
              <div className="flex h-full items-center justify-center text-6xl text-gray-300">🖨️</div>
            )}
          </div>
          {product.images && product.images.length > 1 && (
            <div className="flex gap-2 overflow-x-auto">
              {product.images.map((img, i) => (
                <div key={i} className="relative h-16 w-16 shrink-0 overflow-hidden rounded-lg border bg-gray-50">
                  <Image src={img.url} alt={`${name} ${i + 1}`} fill className="object-cover" />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Info */}
        <div className="flex flex-col gap-5">
          <div>
            {product.category && (
              <span className="text-xs font-medium text-[#e8b86d] uppercase tracking-wider">
                {locale === 'ar' ? product.category.nameAr : product.category.nameEn}
              </span>
            )}
            <h1 className="mt-1 text-2xl font-bold text-[#1a1a2e] md:text-3xl">{name}</h1>
            {product.brand && (
              <p className="mt-1 text-sm text-gray-500">
                {locale === 'ar' ? product.brand.nameAr : product.brand.nameEn}
              </p>
            )}
          </div>

          {/* Price */}
          <div className="flex items-baseline gap-3">
            <span className="text-3xl font-bold text-[#1a1a2e]">
              {new Intl.NumberFormat(locale === 'ar' ? 'ar-EG' : 'en-EG', { style: 'currency', currency: 'EGP', minimumFractionDigits: 0 }).format(Number(currentPrice))}
            </span>
            {isOnSale && (
              <span className="text-lg text-gray-400 line-through">
                {new Intl.NumberFormat(locale === 'ar' ? 'ar-EG' : 'en-EG', { style: 'currency', currency: 'EGP', minimumFractionDigits: 0 }).format(Number(product.price))}
              </span>
            )}
          </div>

          {/* SKU + stock */}
          <div className="flex flex-wrap gap-4 text-sm text-gray-600">
            <span>
              <span className="font-medium">{t('sku')}:</span> {product.sku}
            </span>
            <span>
              <span className="font-medium">{t('stock')}:</span>{' '}
              <span className={product.stock > 0 ? 'text-green-600' : 'text-red-500'}>
                {product.stock > 0 ? `${product.stock} ${locale === 'ar' ? 'قطعة' : 'units'}` : (locale === 'ar' ? 'غير متوفر' : 'Out of Stock')}
              </span>
            </span>
          </div>

          {product.stock > 0 && product.stock <= 5 && (
            <div className="rounded-lg bg-amber-50 border border-amber-200 px-3 py-2 text-sm text-amber-800">
              ⚡ {locale === 'ar'
                ? `مخزون محدود! تبقى ${product.stock} قطع فقط`
                : `Limited stock! Only ${product.stock} left`}
            </div>
          )}

          {/* Add to cart (client component) */}
          <AddToCartSection product={product} locale={locale} />

          {/* Description */}
          {description && (
            <div className="border-t pt-5">
              <h3 className="mb-2 font-semibold text-[#1a1a2e]">{t('description')}</h3>
              <p className="whitespace-pre-wrap text-sm leading-relaxed text-gray-600">{description}</p>
            </div>
          )}
        </div>
      </div>

      {/* Related products */}
      {related.length > 0 && (
        <section className="mt-14 border-t pt-10">
          <h2 className="mb-5 text-xl font-bold text-[#1a1a2e]">
            {locale === 'ar' ? 'منتجات متوافقة' : 'Compatible Products'}
          </h2>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {related.slice(0, 8).map((p: any) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
