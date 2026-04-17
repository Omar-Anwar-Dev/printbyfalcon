'use client';

import { useTranslations, useLocale } from 'next-intl';
import { useCartStore } from '../../stores/cart.store';
import { useCart } from '../../hooks/useCart';
import { formatPrice, getProductName } from '../../lib/utils';
import Image from 'next/image';
import Link from 'next/link';
import { XMarkIcon, TrashIcon, PlusIcon, MinusIcon } from '@heroicons/react/24/outline';

export function CartDrawer() {
  const t = useTranslations('cart');
  const locale = useLocale();
  const { isOpen, closeDrawer, items, subtotal } = useCartStore();
  const { updateItem, removeItem } = useCart();

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 z-50 bg-black/50" onClick={closeDrawer} />

      {/* Drawer */}
      <div
        className={`fixed top-0 z-50 flex h-full w-full max-w-sm flex-col bg-white shadow-2xl transition-transform ${
          locale === 'ar' ? 'left-0' : 'right-0'
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b px-4 py-4">
          <h2 className="text-lg font-bold text-[#1a1a2e]">{t('title')}</h2>
          <button onClick={closeDrawer} className="rounded-full p-1 hover:bg-gray-100">
            <XMarkIcon className="h-5 w-5" />
          </button>
        </div>

        {/* Items */}
        <div className="flex-1 overflow-y-auto px-4 py-4">
          {items.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center gap-4 text-gray-400">
              <span className="text-5xl">🛒</span>
              <p>{t('empty')}</p>
              <Link
                href={`/${locale}/products`}
                onClick={closeDrawer}
                className="rounded-lg bg-[#1a1a2e] px-6 py-2 text-sm font-semibold text-white hover:bg-[#2a2a4e]"
              >
                {t('continueShopping')}
              </Link>
            </div>
          ) : (
            <ul className="space-y-4">
              {items.map((item) => (
                <li key={item.id} className="flex gap-3">
                  <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-lg bg-gray-100">
                    {item.product.images?.[0] && (
                      <Image
                        src={item.product.images[0].url}
                        alt={getProductName(item.product, locale)}
                        fill
                        className="object-cover"
                      />
                    )}
                  </div>
                  <div className="flex flex-1 flex-col justify-between">
                    <p className="line-clamp-2 text-sm font-medium text-gray-800">
                      {getProductName(item.product, locale)}
                    </p>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1 rounded-lg border px-2 py-0.5">
                        <button
                          onClick={() =>
                            item.quantity > 1
                              ? updateItem.mutate({ itemId: item.id, quantity: item.quantity - 1 })
                              : removeItem.mutate(item.id)
                          }
                          className="p-0.5 hover:text-[#1a1a2e]"
                        >
                          <MinusIcon className="h-3 w-3" />
                        </button>
                        <span className="w-6 text-center text-sm">{item.quantity}</span>
                        <button
                          onClick={() => updateItem.mutate({ itemId: item.id, quantity: item.quantity + 1 })}
                          className="p-0.5 hover:text-[#1a1a2e]"
                        >
                          <PlusIcon className="h-3 w-3" />
                        </button>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold text-[#1a1a2e]">
                          {formatPrice(Number(item.product.salePrice ?? item.product.price) * item.quantity, locale)}
                        </span>
                        <button
                          onClick={() => removeItem.mutate(item.id)}
                          className="text-red-400 hover:text-red-600"
                        >
                          <TrashIcon className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div className="border-t px-4 py-4">
            <div className="mb-3 flex items-center justify-between text-sm">
              <span className="text-gray-600">{t('subtotal')}</span>
              <span className="font-bold text-[#1a1a2e]">{formatPrice(subtotal, locale)}</span>
            </div>
            <Link
              href={`/${locale}/checkout`}
              onClick={closeDrawer}
              className="block w-full rounded-lg bg-[#e8b86d] py-3 text-center font-bold text-[#1a1a2e] hover:bg-[#d4a55e] transition-colors"
            >
              {t('checkout')}
            </Link>
          </div>
        )}
      </div>
    </>
  );
}
