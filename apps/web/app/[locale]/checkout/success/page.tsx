'use client';

import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useLocale } from 'next-intl';

export default function CheckoutSuccessPage() {
  const locale = useLocale();
  const params = useSearchParams();
  const orderId = params.get('orderId');
  const ref = params.get('ref');

  return (
    <div className="container mx-auto px-5 py-20 max-w-xl text-center">
      <div className="relative inline-block mb-8">
        <span className="absolute -top-2 -right-2 stamp bg-gold text-ink px-3 py-1 rotate-6">
          PAID
        </span>
        <span className="text-gold text-7xl">✦</span>
      </div>
      <p className="eyebrow text-gold-deep mb-3">{locale === 'ar' ? 'تم استلام طلبك' : 'Order received'}</p>
      <h1 className="text-display text-4xl md:text-5xl tracking-tightest text-ink leading-tight">
        {locale === 'ar' ? (
          <>شكراً <span className="italic-flourish text-gold-deep">لك</span></>
        ) : (
          <>Thank <span className="italic-flourish text-gold-deep">you</span></>
        )}
      </h1>
      <p className="text-ink-soft mt-4 leading-relaxed max-w-md mx-auto">
        {locale === 'ar'
          ? 'تم إرسال تأكيد عبر البريد الإلكتروني. فريقنا يعد طلبك الآن.'
          : 'A confirmation has been sent to your email. Our team is preparing your order now.'}
      </p>

      {ref && (
        <div className="mt-8 border border-ink/20 bg-paper-white p-5 inline-block">
          <p className="stamp text-ink-ghost mb-1">{locale === 'ar' ? 'رقم فوري للدفع' : 'Fawry reference'}</p>
          <p className="text-display text-2xl font-mono tracking-wider">{ref}</p>
        </div>
      )}

      <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-3">
        {orderId && (
          <Link href={`/${locale}/account/orders/${orderId}`} className="btn-ink">
            {locale === 'ar' ? 'متابعة الطلب' : 'Track order'} →
          </Link>
        )}
        <Link href={`/${locale}/products`} className="btn-ghost">
          {locale === 'ar' ? 'مواصلة التسوق' : 'Continue shopping'}
        </Link>
      </div>
    </div>
  );
}
