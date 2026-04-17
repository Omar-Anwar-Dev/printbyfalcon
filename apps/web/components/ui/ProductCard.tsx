'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useLocale, useTranslations } from 'next-intl';
import { formatPrice, getProductName } from '../../lib/utils';
import { useCart } from '../../hooks/useCart';
import type { Product } from '../../lib/api';
import { ShoppingCartIcon } from '@heroicons/react/24/outline';

interface Props {
  product: Product;
}

export function ProductCard({ product }: Props) {
  const locale = useLocale();
  const t = useTranslations('products');
  const { addItem } = useCart();

  const name = getProductName(product, locale);
  const currentPrice = product.salePrice ?? product.price;
  const isOnSale = product.salePrice != null && Number(product.salePrice) < Number(product.price);
  const inStock = product.stock > 0;
  const discountPct = isOnSale
    ? Math.round(((Number(product.price) - Number(product.salePrice)) / Number(product.price)) * 100)
    : 0;

  return (
    <article className="group relative flex flex-col">
      {/* Image block — paper card with hairline border */}
      <Link
        href={`/${locale}/products/${product.slug}`}
        className="relative block aspect-[4/5] overflow-hidden border border-ink/10 bg-paper-white paper-texture"
      >
        {product.images?.[0] ? (
          <Image
            src={product.images[0].url}
            alt={name}
            fill
            className="object-cover transition-transform duration-700 group-hover:scale-[1.03]"
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-display text-7xl text-ink/10">✦</span>
          </div>
        )}

        {/* Stamp-style SALE mark */}
        {isOnSale && (
          <div className="absolute top-3 left-3 z-10 border border-seal/60 bg-paper/95 px-2 py-1 stamp text-seal rotate-[-3deg]">
            − {discountPct}%
          </div>
        )}

        {/* Out of stock overlay */}
        {!inStock && (
          <div className="absolute inset-0 flex items-center justify-center bg-paper/85">
            <span className="border border-ink px-3 py-1.5 stamp text-ink bg-paper">
              {t('outOfStock')}
            </span>
          </div>
        )}

        {/* Low stock ribbon */}
        {inStock && product.stock <= 5 && !isOnSale && (
          <div className="absolute bottom-3 left-3 z-10 bg-ink text-paper px-2 py-1 stamp">
            {locale === 'ar' ? `تبقى ${product.stock}` : `${product.stock} left`}
          </div>
        )}
      </Link>

      {/* Info */}
      <div className="pt-4 flex flex-1 flex-col">
        {/* Eyebrow: brand */}
        {product.brand && (
          <p className="eyebrow mb-1.5 text-gold-deep">
            {locale === 'ar' ? product.brand.nameAr : product.brand.nameEn}
          </p>
        )}

        <Link href={`/${locale}/products/${product.slug}`} className="mb-2">
          <h3 className="text-display text-base leading-snug tracking-tight text-ink line-clamp-2 group-hover:underline decoration-gold-deep underline-offset-4">
            {name}
          </h3>
        </Link>

        {/* Price row with optional strike-through */}
        <div className="mt-auto flex items-end justify-between pt-2">
          <div className="flex items-baseline gap-2">
            <span className="text-display text-xl text-ink">
              {formatPrice(Number(currentPrice), locale)}
            </span>
            {isOnSale && (
              <span className="text-xs text-ink-ghost line-through">
                {formatPrice(Number(product.price), locale)}
              </span>
            )}
          </div>

          <button
            onClick={() => inStock && addItem.mutate({ productId: product.id, quantity: 1 })}
            disabled={!inStock || addItem.isPending}
            className="border border-ink/20 p-2 hover:border-ink hover:bg-ink hover:text-paper transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
            aria-label={t('addToCart')}
          >
            <ShoppingCartIcon className="h-4 w-4" />
          </button>
        </div>
      </div>
    </article>
  );
}
