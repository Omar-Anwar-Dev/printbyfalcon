'use client';

import { useTranslations, useLocale } from 'next-intl';
import { useCartStore } from '../../../stores/cart.store';
import { useCart } from '../../../hooks/useCart';
import { formatPrice, getProductName } from '../../../lib/utils';
import Image from 'next/image';
import Link from 'next/link';
import { TrashIcon, PlusIcon, MinusIcon } from '@heroicons/react/24/outline';

export default function CartPage() {
  const t = useTranslations('cart');
  const locale = useLocale();
  const { items, subtotal } = useCartStore();
  const { updateItem, removeItem } = useCart();

  if (items.length === 0) {
    return (
      <div className="container mx-auto flex flex-col items-center justify-center px-4 py-20 text-center">
        <span className="text-7xl">🛒</span>
        <h1 className="mt-4 text-2xl font-bold text-[#1a1a2e]">{t('empty')}</h1>
        <Link
          href={`/${locale}/products`}
          className="mt-6 rounded-xl bg-[#1a1a2e] px-8 py-3 font-semibold text-white hover:bg-[#2a2a4e] transition-colors"
        >
          {t('continueShopping')}
        </Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="mb-6 text-2xl font-bold text-[#1a1a2e]">{t('title')}</h1>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        {/* Items */}
        <div className="lg:col-span-2">
          <ul className="divide-y rounded-xl border bg-white shadow-sm">
            {items.map((item) => {
              const name = getProductName(item.product, locale);
              const price = Number(item.product.salePrice ?? item.product.price);
              return (
                <li key={item.id} className="flex gap-4 p-4">
                  <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-lg bg-gray-100">
                    {item.product.images?.[0] && (
                      <Image src={item.product.images[0].url} alt={name} fill className="object-cover" />
                    )}
                  </div>
                  <div className="flex flex-1 flex-col justify-between">
                    <div className="flex items-start justify-between">
                      <Link href={`/${locale}/products/${item.product.slug}`} className="font-medium text-gray-800 hover:text-[#1a1a2e]">
                        {name}
                      </Link>
                      <button onClick={() => removeItem.mutate(item.id)} className="text-red-400 hover:text-red-600 ms-2">
                        <TrashIcon className="h-4 w-4" />
                      </button>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1 rounded-lg border px-2 py-1">
                        <button onClick={() => item.quantity > 1 ? updateItem.mutate({ itemId: item.id, quantity: item.quantity - 1 }) : removeItem.mutate(item.id)} className="p-0.5">
                          <MinusIcon className="h-3.5 w-3.5" />
                        </button>
                        <span className="w-6 text-center text-sm font-medium">{item.quantity}</span>
                        <button onClick={() => updateItem.mutate({ itemId: item.id, quantity: item.quantity + 1 })} className="p-0.5">
                          <PlusIcon className="h-3.5 w-3.5" />
                        </button>
                      </div>
                      <span className="font-bold text-[#1a1a2e]">{formatPrice(price * item.quantity, locale)}</span>
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        </div>

        {/* Summary */}
        <div className="h-fit rounded-xl border bg-white p-5 shadow-sm">
          <h2 className="mb-4 font-bold text-[#1a1a2e]">{locale === 'ar' ? 'ملخص الطلب' : 'Order Summary'}</h2>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">{t('subtotal')}</span>
              <span className="font-medium">{formatPrice(subtotal, locale)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">{t('shipping')}</span>
              <span className="font-medium text-green-600">{locale === 'ar' ? 'مجاناً' : 'Free'}</span>
            </div>
            <div className="border-t pt-2 flex justify-between font-bold text-[#1a1a2e]">
              <span>{t('total')}</span>
              <span>{formatPrice(subtotal, locale)}</span>
            </div>
          </div>
          <Link
            href={`/${locale}/checkout`}
            className="mt-5 block w-full rounded-xl bg-[#e8b86d] py-3 text-center font-bold text-[#1a1a2e] hover:bg-[#d4a55e] transition-colors"
          >
            {t('checkout')}
          </Link>
        </div>
      </div>
    </div>
  );
}
