'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useLocale, useTranslations } from 'next-intl';
import { formatPrice, getProductName } from '../../lib/utils';
import { useCart } from '../../hooks/useCart';
import type { Product } from '../../lib/api';
import { ShoppingCartIcon, StarIcon } from '@heroicons/react/24/solid';

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

  return (
    <div className="group flex flex-col overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm transition-shadow hover:shadow-md">
      <Link href={`/${locale}/products/${product.slug}`} className="relative aspect-square overflow-hidden bg-gray-50">
        {product.images?.[0] ? (
          <Image
            src={product.images[0].url}
            alt={name}
            fill
            className="object-cover transition-transform group-hover:scale-105"
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-4xl text-gray-300">🖨️</div>
        )}
        {isOnSale && (
          <span className="absolute top-2 left-2 rounded-md bg-red-500 px-2 py-0.5 text-xs font-bold text-white">
            SALE
          </span>
        )}
        {!inStock && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/40">
            <span className="rounded-md bg-white px-3 py-1 text-xs font-bold text-gray-700">
              {t('outOfStock')}
            </span>
          </div>
        )}
      </Link>

      <div className="flex flex-1 flex-col p-3">
        <Link href={`/${locale}/products/${product.slug}`}>
          <h3 className="line-clamp-2 text-sm font-semibold text-gray-800 hover:text-[#1a1a2e] leading-snug">
            {name}
          </h3>
        </Link>

        {product.averageRating > 0 && (
          <div className="mt-1 flex items-center gap-1">
            <StarIcon className="h-3 w-3 text-[#e8b86d]" />
            <span className="text-xs text-gray-500">{product.averageRating.toFixed(1)}</span>
          </div>
        )}

        <div className="mt-auto pt-2">
          <div className="flex items-center gap-1.5">
            <span className="text-base font-bold text-[#1a1a2e]">
              {formatPrice(Number(currentPrice), locale)}
            </span>
            {isOnSale && (
              <span className="text-xs text-gray-400 line-through">
                {formatPrice(Number(product.price), locale)}
              </span>
            )}
          </div>

          <button
            onClick={() => inStock && addItem.mutate({ productId: product.id, quantity: 1 })}
            disabled={!inStock || addItem.isPending}
            className="mt-2 flex w-full items-center justify-center gap-1.5 rounded-lg bg-[#1a1a2e] py-2 text-xs font-semibold text-white transition-colors hover:bg-[#2a2a4e] disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ShoppingCartIcon className="h-3.5 w-3.5" />
            {t('addToCart')}
          </button>
        </div>
      </div>
    </div>
  );
}
