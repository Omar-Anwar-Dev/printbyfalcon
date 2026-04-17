'use client';

import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useLocale } from 'next-intl';
import { useQuery } from '@tanstack/react-query';
import { fetchOrder } from '../../../../../lib/api';
import Image from 'next/image';

const statusTimeline = [
  'PENDING_PAYMENT',
  'PAYMENT_CONFIRMED',
  'PROCESSING',
  'SHIPPED',
  'OUT_FOR_DELIVERY',
  'DELIVERED',
];

export default function OrderDetailPage() {
  const params = useParams();
  const locale = useLocale();
  const id = params.id as string;

  const { data: order, isLoading } = useQuery({
    queryKey: ['order', id],
    queryFn: () => fetchOrder(id),
  });

  if (isLoading) return <div className="py-20 text-center text-ink-ghost">Loading…</div>;
  if (!order) return <div className="py-20 text-center text-ink-ghost">Order not found</div>;

  const currentStep = statusTimeline.indexOf(order.status);

  return (
    <div className="space-y-10">
      {/* Header */}
      <header>
        <Link href={`/${locale}/account/orders`} className="text-xs stamp text-ink-ghost hover:text-ink mb-4 inline-block">
          ← {locale === 'ar' ? 'كل الطلبات' : 'All orders'}
        </Link>

        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-3 border-b border-ink/10 pb-5">
          <div>
            <p className="eyebrow text-gold-deep mb-2">{order.invoiceNumber}</p>
            <h2 className="text-display text-3xl md:text-4xl tracking-tightest">
              {locale === 'ar' ? 'تفاصيل الطلب' : 'Order details'}
            </h2>
            <p className="text-sm text-ink-soft mt-2">
              {new Date(order.createdAt).toLocaleDateString(locale === 'ar' ? 'ar-EG' : 'en-GB', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
            </p>
          </div>
          <span className="stamp border border-ink/30 px-3 py-1 self-start">{order.status}</span>
        </div>
      </header>

      {/* Timeline */}
      {currentStep >= 0 && order.status !== 'CANCELLED' && order.status !== 'REFUNDED' && (
        <section>
          <p className="eyebrow mb-4 text-ink-ghost">{locale === 'ar' ? 'الحالة' : 'Tracking'}</p>
          <ol className="relative grid grid-cols-2 md:grid-cols-6 gap-2">
            {statusTimeline.map((status, i) => {
              const done = i <= currentStep;
              return (
                <li key={status} className="relative">
                  <div className={`h-1 w-full ${done ? 'bg-gold' : 'bg-ink/10'}`}></div>
                  <div className="pt-3">
                    <p className={`stamp ${done ? 'text-ink' : 'text-ink-ghost'}`}>0{i + 1}</p>
                    <p className={`text-xs mt-1 ${done ? 'text-ink' : 'text-ink-ghost'}`}>{status.replace('_', ' ')}</p>
                  </div>
                </li>
              );
            })}
          </ol>
        </section>
      )}

      {/* Items */}
      <section>
        <h3 className="eyebrow mb-4 text-ink-ghost">{locale === 'ar' ? 'المنتجات' : 'Items'}</h3>
        <ul className="divide-y divide-ink/10 border-t border-b border-ink/10">
          {order.items.map((item) => {
            const snap = item.productSnapshot ?? {};
            const name = locale === 'ar' ? snap.nameAr : snap.nameEn;
            return (
              <li key={item.id} className="flex items-center gap-5 py-4">
                <div className="relative h-16 w-16 shrink-0 overflow-hidden border border-ink/10 bg-paper-white">
                  {snap.imageUrl && <Image src={snap.imageUrl} alt={name || ''} fill className="object-cover" />}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-ink">{name}</p>
                  <p className="stamp text-ink-ghost mt-1">SKU · {snap.sku}</p>
                </div>
                <div className="text-right">
                  <p className="stamp text-ink-ghost mb-0.5">× {item.quantity}</p>
                  <p className="text-display text-lg">EGP {Number(item.totalPrice).toLocaleString()}</p>
                </div>
              </li>
            );
          })}
        </ul>
      </section>

      {/* Totals + shipping */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div>
          <h3 className="eyebrow mb-4 text-ink-ghost">{locale === 'ar' ? 'عنوان الشحن' : 'Shipping address'}</h3>
          {order.address ? (
            <address className="not-italic text-sm leading-relaxed">
              <p className="font-medium">{order.address.fullName}</p>
              <p className="text-ink-soft">{order.address.street}</p>
              <p className="text-ink-soft">{order.address.city}, {order.address.state}</p>
              <p className="text-ink-soft font-mono text-xs mt-2">{order.address.phone}</p>
            </address>
          ) : (
            <p className="text-sm text-ink-ghost">—</p>
          )}

          <div className="mt-6">
            <p className="eyebrow mb-2 text-ink-ghost">{locale === 'ar' ? 'طريقة الدفع' : 'Payment'}</p>
            <p className="text-sm">{order.paymentMethod}</p>
          </div>
        </div>

        <div className="border border-ink/10 bg-paper-white p-6">
          <dl className="space-y-2 text-sm">
            <div className="flex justify-between">
              <dt className="text-ink-soft">{locale === 'ar' ? 'المجموع' : 'Subtotal'}</dt>
              <dd className="font-mono">EGP {Number(order.subtotal).toLocaleString()}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-ink-soft">{locale === 'ar' ? 'الشحن' : 'Shipping'}</dt>
              <dd className="font-mono">EGP {Number(order.shippingAmount).toLocaleString()}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-ink-soft">{locale === 'ar' ? 'الضريبة' : 'VAT'}</dt>
              <dd className="font-mono">EGP {Number(order.vatAmount).toLocaleString()}</dd>
            </div>
            {Number(order.couponDiscount) > 0 && (
              <div className="flex justify-between text-seal">
                <dt>{locale === 'ar' ? 'خصم الكوبون' : 'Coupon'}</dt>
                <dd className="font-mono">− EGP {Number(order.couponDiscount).toLocaleString()}</dd>
              </div>
            )}
            <div className="flex justify-between pt-3 border-t border-ink/10 font-display text-lg">
              <dt>{locale === 'ar' ? 'الإجمالي' : 'Total'}</dt>
              <dd>EGP {Number(order.totalAmount).toLocaleString()}</dd>
            </div>
          </dl>
        </div>
      </section>
    </div>
  );
}
