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
  const { isOpen, closeDrawer, items, subtotal, itemCount } = useCartStore();
  const { updateItem, removeItem } = useCart();

  if (!isOpen) return null;
  const isRtl = locale === 'ar';

  return (
    <>
      <div className="fixed inset-0 z-50 bg-ink/40 backdrop-blur-sm" onClick={closeDrawer} />

      <div
        className={`fixed top-0 z-50 flex h-full w-full max-w-md flex-col bg-paper shadow-2xl ${
          isRtl ? 'left-0' : 'right-0'
        }`}
      >
        {/* Header — letterpress receipt style */}
        <div className="border-b border-ink/10 px-6 py-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="eyebrow text-ink-ghost">№ {String(itemCount).padStart(3, '0')} — {locale === 'ar' ? 'إيصال' : 'RECEIPT'}</p>
              <h2 className="text-display text-2xl tracking-tight mt-0.5">{t('title')}</h2>
            </div>
            <button onClick={closeDrawer} className="p-1 hover:bg-ink/5" aria-label="Close">
              <XMarkIcon className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Items */}
        <div className="flex-1 overflow-y-auto px-6 py-6">
          {items.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center gap-6 text-center">
              <span className="text-gold text-6xl">✦</span>
              <div>
                <p className="text-display text-xl text-ink mb-1">{t('empty')}</p>
                <p className="text-sm text-ink-soft">
                  {locale === 'ar' ? 'تصفح الكتالوج وابدأ مجموعتك' : 'Browse the catalog and begin your collection'}
                </p>
              </div>
              <Link href={`/${locale}/products`} onClick={closeDrawer} className="btn-ink">
                {t('continueShopping')}
              </Link>
            </div>
          ) : (
            <ul className="space-y-5">
              {items.map((item) => {
                const name = getProductName(item.product, locale);
                const price = Number(item.product.salePrice ?? item.product.price);
                return (
                  <li key={item.id} className="grid grid-cols-[64px_1fr_auto] gap-4 pb-5 border-b border-ink/5 last:border-b-0">
                    <div className="relative h-16 w-16 overflow-hidden border border-ink/10 bg-paper-white">
                      {item.product.images?.[0] && (
                        <Image src={item.product.images[0].url} alt={name} fill className="object-cover" />
                      )}
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm text-ink line-clamp-2 mb-1.5 leading-snug">{name}</p>
                      <p className="text-[11px] text-ink-ghost stamp mb-2">SKU · {item.product.sku}</p>

                      <div className="inline-flex items-center border border-ink/15 text-xs">
                        <button
                          onClick={() =>
                            item.quantity > 1
                              ? updateItem.mutate({ itemId: item.id, quantity: item.quantity - 1 })
                              : removeItem.mutate(item.id)
                          }
                          className="px-2 py-1 hover:bg-ink hover:text-paper transition"
                        >
                          <MinusIcon className="h-3 w-3" />
                        </button>
                        <span className="px-3 font-mono text-[11px]">{item.quantity}</span>
                        <button
                          onClick={() => updateItem.mutate({ itemId: item.id, quantity: item.quantity + 1 })}
                          className="px-2 py-1 hover:bg-ink hover:text-paper transition"
                        >
                          <PlusIcon className="h-3 w-3" />
                        </button>
                      </div>
                    </div>
                    <div className="flex flex-col items-end justify-between">
                      <button
                        onClick={() => removeItem.mutate(item.id)}
                        className="text-ink-ghost hover:text-seal transition"
                      >
                        <TrashIcon className="h-3.5 w-3.5" />
                      </button>
                      <span className="text-display text-sm text-ink">
                        {formatPrice(price * item.quantity, locale)}
                      </span>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        {/* Footer — subtotal + checkout */}
        {items.length > 0 && (
          <div className="border-t border-ink/10 px-6 py-5 bg-paper-white">
            <div className="flex items-baseline justify-between mb-4">
              <span className="eyebrow text-ink-ghost">{t('subtotal')}</span>
              <span className="text-display text-2xl text-ink">{formatPrice(subtotal, locale)}</span>
            </div>
            <p className="stamp text-ink-ghost mb-4">
              {locale === 'ar' ? 'الشحن محسوب عند الدفع' : 'Shipping calculated at checkout'}
            </p>
            <Link href={`/${locale}/checkout`} onClick={closeDrawer} className="btn-gold w-full">
              {t('checkout')} →
            </Link>
          </div>
        )}
      </div>
    </>
  );
}
