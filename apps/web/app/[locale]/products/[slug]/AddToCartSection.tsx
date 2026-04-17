'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { useCart } from '../../../../hooks/useCart';
import type { Product } from '../../../../lib/api';
import { ShoppingCartIcon, PlusIcon, MinusIcon } from '@heroicons/react/24/outline';

interface Props {
  product: Product;
  locale: string;
}

export function AddToCartSection({ product, locale }: Props) {
  const t = useTranslations('product');
  const [qty, setQty] = useState(1);
  const { addItem } = useCart();

  const inStock = product.stock > 0;

  const handleAdd = () => {
    if (inStock) {
      addItem.mutate({ productId: product.id, quantity: qty });
    }
  };

  return (
    <div className="flex items-center gap-3">
      {/* Quantity selector */}
      <div className="flex items-center gap-1 rounded-xl border px-3 py-2">
        <button
          onClick={() => setQty((q) => Math.max(1, q - 1))}
          className="rounded p-1 hover:bg-gray-100 disabled:opacity-40"
          disabled={qty <= 1}
        >
          <MinusIcon className="h-4 w-4" />
        </button>
        <span className="w-8 text-center font-medium">{qty}</span>
        <button
          onClick={() => setQty((q) => Math.min(product.stock, q + 1))}
          className="rounded p-1 hover:bg-gray-100 disabled:opacity-40"
          disabled={qty >= product.stock}
        >
          <PlusIcon className="h-4 w-4" />
        </button>
      </div>

      {/* Add to cart */}
      <button
        onClick={handleAdd}
        disabled={!inStock || addItem.isPending}
        className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-[#1a1a2e] py-3 font-semibold text-white transition-colors hover:bg-[#2a2a4e] disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <ShoppingCartIcon className="h-5 w-5" />
        {inStock ? t('addToCart') : (locale === 'ar' ? 'غير متوفر' : 'Out of Stock')}
      </button>
    </div>
  );
}
