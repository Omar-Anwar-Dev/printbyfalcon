'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useLocale } from 'next-intl';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { fetchWishlist, moveWishlistToCart, removeFromWishlist } from '../../../../lib/api';
import { useCartStore } from '../../../../stores/cart.store';
import { TrashIcon, ShoppingCartIcon } from '@heroicons/react/24/outline';

export default function WishlistPage() {
  const locale = useLocale();
  const queryClient = useQueryClient();
  const { openDrawer } = useCartStore();

  const { data = [] } = useQuery({
    queryKey: ['wishlist'],
    queryFn: fetchWishlist,
  });

  const removeMut = useMutation({
    mutationFn: (productId: string) => removeFromWishlist(productId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['wishlist'] }),
  });

  const moveMut = useMutation({
    mutationFn: (productId: string) => moveWishlistToCart(productId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['wishlist'] });
      queryClient.invalidateQueries({ queryKey: ['cart'] });
      openDrawer();
    },
  });

  return (
    <div>
      <header className="mb-8 flex items-end justify-between border-b border-ink/10 pb-4">
        <div>
          <p className="eyebrow text-gold-deep mb-2">№ 04</p>
          <h2 className="text-display text-3xl md:text-4xl tracking-tightest">
            {locale === 'ar' ? 'المفضلة' : 'Wishlist'}
          </h2>
        </div>
        <span className="stamp text-ink-ghost">
          {data.length} {locale === 'ar' ? 'منتج' : 'items'}
        </span>
      </header>

      {data.length === 0 ? (
        <div className="border border-dashed border-ink/20 py-20 text-center">
          <span className="text-gold text-5xl block mb-4">✦</span>
          <p className="text-display text-xl text-ink mb-2">
            {locale === 'ar' ? 'لم تحفظ منتجات بعد' : 'Nothing saved yet'}
          </p>
          <p className="text-sm text-ink-soft mb-6">
            {locale === 'ar' ? 'احفظ المنتجات للعودة إليها لاحقاً' : 'Save products to return to later'}
          </p>
          <Link href={`/${locale}/products`} className="btn-ink">
            {locale === 'ar' ? 'تصفح المنتجات' : 'Browse products'} →
          </Link>
        </div>
      ) : (
        <ul className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {data.map((item) => {
            const p = item.product;
            const name = locale === 'ar' ? p.nameAr : p.nameEn;
            const price = p.salePrice ?? p.price;
            return (
              <li key={item.id} className="border border-ink/10 bg-paper-white p-4 flex gap-4">
                <Link href={`/${locale}/products/${p.slug}`} className="relative h-24 w-24 shrink-0 overflow-hidden border border-ink/10 bg-paper">
                  {p.images?.[0] && <Image src={p.images[0].url} alt={name} fill className="object-cover" />}
                </Link>
                <div className="flex-1 min-w-0 flex flex-col">
                  <Link href={`/${locale}/products/${p.slug}`}>
                    <h3 className="text-sm text-ink line-clamp-2 hover:underline">{name}</h3>
                  </Link>
                  <p className="stamp text-ink-ghost mt-1">SKU · {p.sku}</p>
                  <p className="text-display text-lg mt-auto">EGP {Number(price).toLocaleString()}</p>
                </div>
                <div className="flex flex-col gap-2 justify-between">
                  <button onClick={() => removeMut.mutate(p.id)} className="text-ink-ghost hover:text-seal">
                    <TrashIcon className="h-4 w-4" />
                  </button>
                  <button onClick={() => moveMut.mutate(p.id)} className="p-2 border border-ink/20 hover:bg-ink hover:text-paper hover:border-ink transition" title={locale === 'ar' ? 'نقل إلى السلة' : 'Move to cart'}>
                    <ShoppingCartIcon className="h-4 w-4" />
                  </button>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
