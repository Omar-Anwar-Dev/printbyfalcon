'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useLocale } from 'next-intl';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  Address, checkout, createAddress, fetchAddresses, validateCoupon,
} from '../../../lib/api';
import { useCartStore } from '../../../stores/cart.store';
import { useAuthStore } from '../../../stores/auth.store';
import { useRequireAuth } from '../../../hooks/useRequireAuth';
import { useCart } from '../../../hooks/useCart';
import { formatPrice, getProductName } from '../../../lib/utils';

type Step = 1 | 2 | 3 | 4;
type PaymentMethod = 'CARD' | 'FAWRY' | 'COD';

export default function CheckoutPage() {
  const locale = useLocale();
  const router = useRouter();
  const isAuth = useRequireAuth();
  const { items, subtotal, itemCount } = useCartStore();
  // Wire up cart sync so subtotal/items are populated from server
  useCart();
  const queryClient = useQueryClient();

  const [step, setStep] = useState<Step>(1);
  const [addressId, setAddressId] = useState<string | null>(null);
  const [newAddress, setNewAddress] = useState<null | {
    fullName: string; phone: string; street: string; city: string; state: string; postalCode?: string;
  }>(null);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('COD');
  const [couponCode, setCouponCode] = useState('');
  const [couponApplied, setCouponApplied] = useState<{ code: string; discount: number } | null>(null);
  const [couponError, setCouponError] = useState<string | null>(null);
  const [notes, setNotes] = useState('');
  const [placing, setPlacing] = useState(false);
  const [placeError, setPlaceError] = useState<string | null>(null);

  const { data: addresses = [] } = useQuery({
    queryKey: ['addresses'], queryFn: fetchAddresses, enabled: isAuth,
  });

  const createAddrMut = useMutation({
    mutationFn: (data: Omit<Address, 'id'>) => createAddress(data as any),
    onSuccess: (a) => {
      queryClient.invalidateQueries({ queryKey: ['addresses'] });
      setAddressId(a.id);
      setNewAddress(null);
      setStep(2);
    },
  });

  const shipping = subtotal >= 1500 ? 0 : 75;
  const vat = 0;
  const discount = couponApplied?.discount ?? 0;
  const total = Math.max(0, subtotal + shipping + vat - discount);

  const applyCoupon = async () => {
    setCouponError(null);
    try {
      const res: any = await validateCoupon(couponCode, subtotal);
      if (res.valid && res.discount >= 0) {
        setCouponApplied({ code: couponCode, discount: res.discount });
      } else {
        setCouponError(res.message || (locale === 'ar' ? 'كوبون غير صالح' : 'Invalid coupon'));
      }
    } catch (e: any) {
      setCouponError(e.response?.data?.message || (locale === 'ar' ? 'كوبون غير صالح' : 'Invalid coupon'));
    }
  };

  const placeOrder = async () => {
    if (!addressId) return;
    setPlaceError(null);
    setPlacing(true);
    try {
      const order: any = await checkout({
        addressId,
        paymentMethod,
        couponCode: couponApplied?.code,
        notes: notes || undefined,
      });
      queryClient.invalidateQueries({ queryKey: ['cart'] });
      // If Paymob iframe URL returned, redirect there
      if (order.iframeUrl) {
        window.location.href = order.iframeUrl;
        return;
      }
      if (order.fawryRefNumber) {
        router.push(`/${locale}/checkout/success?ref=${order.fawryRefNumber}&orderId=${order.id}`);
        return;
      }
      router.push(`/${locale}/checkout/success?orderId=${order.id}`);
    } catch (e: any) {
      setPlaceError(e.response?.data?.message || (locale === 'ar' ? 'فشل إنشاء الطلب' : 'Failed to place order'));
    } finally {
      setPlacing(false);
    }
  };

  if (!isAuth) return null;

  if (itemCount === 0) {
    return (
      <div className="container mx-auto px-5 py-20 text-center">
        <h1 className="text-display text-3xl mb-3">{locale === 'ar' ? 'السلة فارغة' : 'Your cart is empty'}</h1>
        <Link href={`/${locale}/products`} className="btn-ink mt-4">{locale === 'ar' ? 'تصفح المنتجات' : 'Browse products'}</Link>
      </div>
    );
  }

  const steps = [
    { n: 1, label: locale === 'ar' ? 'العنوان' : 'Address' },
    { n: 2, label: locale === 'ar' ? 'الشحن' : 'Shipping' },
    { n: 3, label: locale === 'ar' ? 'الدفع' : 'Payment' },
    { n: 4, label: locale === 'ar' ? 'المراجعة' : 'Review' },
  ];

  return (
    <div className="container mx-auto px-5 py-10 md:py-14">
      <header className="mb-10 pb-6 border-b border-ink/10">
        <p className="eyebrow text-gold-deep mb-2">{locale === 'ar' ? 'إتمام الطلب' : 'CHECKOUT'}</p>
        <h1 className="text-display text-4xl md:text-5xl tracking-tightest">
          {locale === 'ar' ? 'إتمام الشراء' : 'Complete your order'}
        </h1>
      </header>

      {/* Step indicator */}
      <div className="mb-10">
        <ol className="flex items-center gap-3 md:gap-4">
          {steps.map((s, i) => {
            const done = step > s.n;
            const active = step === s.n;
            return (
              <li key={s.n} className="flex-1">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => done && setStep(s.n as Step)}
                    disabled={!done}
                    className={`flex h-10 w-10 items-center justify-center border-2 stamp text-xs ${
                      active ? 'bg-ink text-paper border-ink' :
                      done ? 'border-gold bg-paper text-gold-deep' :
                      'border-ink/20 text-ink-ghost'
                    }`}
                  >
                    {done ? '✓' : String(s.n).padStart(2, '0')}
                  </button>
                  <span className={`hidden md:inline text-xs ${active ? 'text-ink font-medium' : 'text-ink-soft'}`}>
                    {s.label}
                  </span>
                </div>
                {i < steps.length - 1 && (
                  <div className={`mt-[-26px] ml-[52px] h-px ${done ? 'bg-gold' : 'bg-ink/10'}`}></div>
                )}
              </li>
            );
          })}
        </ol>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_400px] gap-10">
        {/* ── Main column ── */}
        <div>
          {/* STEP 1 — Address */}
          {step === 1 && (
            <section className="space-y-6">
              <h2 className="text-display text-2xl border-b border-ink/10 pb-3">
                {locale === 'ar' ? '١ · عنوان التسليم' : '1 · Delivery address'}
              </h2>

              {!newAddress && addresses.length > 0 && (
                <ul className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {addresses.map((a) => {
                    const selected = addressId === a.id;
                    return (
                      <li key={a.id}>
                        <button
                          onClick={() => setAddressId(a.id)}
                          className={`w-full text-left p-4 border transition-colors ${
                            selected ? 'border-ink bg-ink/5' : 'border-ink/10 bg-paper-white hover:border-ink/30'
                          }`}
                        >
                          <div className="flex items-center justify-between mb-2">
                            <span className="font-medium text-sm">{a.fullName}</span>
                            {selected && <span className="text-gold">✦</span>}
                          </div>
                          <p className="text-xs text-ink-soft leading-relaxed">
                            {a.street}<br />
                            {a.city}, {(a as any).state}
                          </p>
                          <p className="font-mono text-xs text-ink-ghost mt-2">{a.phone}</p>
                        </button>
                      </li>
                    );
                  })}
                </ul>
              )}

              {!newAddress && (
                <button
                  onClick={() => setNewAddress({ fullName: '', phone: '', street: '', city: '', state: '', postalCode: '' })}
                  className="btn-ghost"
                >
                  + {locale === 'ar' ? 'إضافة عنوان جديد' : 'Add a new address'}
                </button>
              )}

              {newAddress && (
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    createAddrMut.mutate(newAddress as any);
                  }}
                  className="border border-ink/10 bg-paper-white p-6 space-y-5"
                >
                  <p className="eyebrow text-gold-deep">{locale === 'ar' ? 'عنوان جديد' : 'NEW ADDRESS'}</p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div className="md:col-span-2">
                      <label className="eyebrow block mb-2 text-ink-soft">{locale === 'ar' ? 'الاسم الكامل' : 'Full name'}</label>
                      <input required value={newAddress.fullName} onChange={(e) => setNewAddress({ ...newAddress, fullName: e.target.value })} className="input-atelier" />
                    </div>
                    <div>
                      <label className="eyebrow block mb-2 text-ink-soft">{locale === 'ar' ? 'الهاتف' : 'Phone'}</label>
                      <input required value={newAddress.phone} onChange={(e) => setNewAddress({ ...newAddress, phone: e.target.value })} className="input-atelier" />
                    </div>
                    <div>
                      <label className="eyebrow block mb-2 text-ink-soft">{locale === 'ar' ? 'الرمز البريدي' : 'Postal code'}</label>
                      <input value={newAddress.postalCode} onChange={(e) => setNewAddress({ ...newAddress, postalCode: e.target.value })} className="input-atelier" />
                    </div>
                    <div className="md:col-span-2">
                      <label className="eyebrow block mb-2 text-ink-soft">{locale === 'ar' ? 'الشارع' : 'Street'}</label>
                      <input required value={newAddress.street} onChange={(e) => setNewAddress({ ...newAddress, street: e.target.value })} className="input-atelier" />
                    </div>
                    <div>
                      <label className="eyebrow block mb-2 text-ink-soft">{locale === 'ar' ? 'المدينة' : 'City'}</label>
                      <input required value={newAddress.city} onChange={(e) => setNewAddress({ ...newAddress, city: e.target.value })} className="input-atelier" />
                    </div>
                    <div>
                      <label className="eyebrow block mb-2 text-ink-soft">{locale === 'ar' ? 'المحافظة' : 'State'}</label>
                      <input required value={newAddress.state} onChange={(e) => setNewAddress({ ...newAddress, state: e.target.value })} className="input-atelier" />
                    </div>
                  </div>
                  <div className="flex gap-3 pt-3">
                    <button type="submit" className="btn-ink" disabled={createAddrMut.isPending}>
                      {locale === 'ar' ? 'حفظ والمتابعة' : 'Save & continue'}
                    </button>
                    <button type="button" onClick={() => setNewAddress(null)} className="btn-ghost">
                      {locale === 'ar' ? 'إلغاء' : 'Cancel'}
                    </button>
                  </div>
                </form>
              )}

              {addressId && !newAddress && (
                <div className="flex justify-end pt-4">
                  <button onClick={() => setStep(2)} className="btn-ink">
                    {locale === 'ar' ? 'التالي' : 'Continue'} →
                  </button>
                </div>
              )}
            </section>
          )}

          {/* STEP 2 — Shipping */}
          {step === 2 && (
            <section className="space-y-6">
              <h2 className="text-display text-2xl border-b border-ink/10 pb-3">
                {locale === 'ar' ? '٢ · طريقة الشحن' : '2 · Shipping method'}
              </h2>
              <div className="space-y-3">
                <label className="flex items-start gap-4 border border-ink bg-ink/5 p-5 cursor-pointer">
                  <input type="radio" checked readOnly className="accent-gold-deep mt-1" />
                  <div className="flex-1">
                    <div className="flex items-baseline justify-between">
                      <span className="font-medium text-sm">{locale === 'ar' ? 'التوصيل القياسي' : 'Standard delivery'}</span>
                      <span className="text-display text-lg">{shipping === 0 ? (locale === 'ar' ? 'مجاناً' : 'Free') : `EGP ${shipping}`}</span>
                    </div>
                    <p className="text-xs text-ink-soft mt-1">
                      {locale === 'ar'
                        ? 'القاهرة: اليوم التالي · المحافظات: ٢–٣ أيام'
                        : 'Cairo: next-day · Governorates: 2–3 days'}
                    </p>
                    {shipping === 0 && (
                      <p className="stamp text-gold-deep mt-2">✦ {locale === 'ar' ? 'شحن مجاني على طلبك' : 'Free on your order'}</p>
                    )}
                  </div>
                </label>
              </div>

              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder={locale === 'ar' ? 'ملاحظات للتوصيل (اختياري)' : 'Delivery notes (optional)'}
                className="w-full border border-ink/20 bg-paper-white p-4 text-sm focus:border-ink outline-none transition"
                rows={3}
              />

              <div className="flex justify-between pt-4">
                <button onClick={() => setStep(1)} className="btn-ghost">← {locale === 'ar' ? 'رجوع' : 'Back'}</button>
                <button onClick={() => setStep(3)} className="btn-ink">{locale === 'ar' ? 'التالي' : 'Continue'} →</button>
              </div>
            </section>
          )}

          {/* STEP 3 — Payment */}
          {step === 3 && (
            <section className="space-y-6">
              <h2 className="text-display text-2xl border-b border-ink/10 pb-3">
                {locale === 'ar' ? '٣ · الدفع' : '3 · Payment'}
              </h2>
              <div className="space-y-3">
                {([
                  { id: 'COD', label: locale === 'ar' ? 'الدفع عند الاستلام' : 'Cash on delivery', desc: locale === 'ar' ? 'ادفع نقداً عند استلام طلبك' : 'Pay in cash upon delivery' },
                  { id: 'CARD', label: locale === 'ar' ? 'بطاقة ائتمان (Paymob)' : 'Credit card (Paymob)', desc: locale === 'ar' ? 'Visa, Mastercard, Meeza' : 'Visa, Mastercard, Meeza' },
                  { id: 'FAWRY', label: locale === 'ar' ? 'فوري' : 'Fawry', desc: locale === 'ar' ? 'ادفع في أي محل فوري' : 'Pay at any Fawry outlet' },
                ] as { id: PaymentMethod; label: string; desc: string }[]).map((opt) => {
                  const selected = paymentMethod === opt.id;
                  return (
                    <label
                      key={opt.id}
                      className={`flex items-start gap-4 border p-5 cursor-pointer transition-colors ${
                        selected ? 'border-ink bg-ink/5' : 'border-ink/10 bg-paper-white hover:border-ink/30'
                      }`}
                    >
                      <input
                        type="radio"
                        checked={selected}
                        onChange={() => setPaymentMethod(opt.id)}
                        className="accent-gold-deep mt-1"
                      />
                      <div className="flex-1">
                        <span className="font-medium text-sm">{opt.label}</span>
                        <p className="text-xs text-ink-soft mt-1">{opt.desc}</p>
                      </div>
                    </label>
                  );
                })}
              </div>

              <div className="flex justify-between pt-4">
                <button onClick={() => setStep(2)} className="btn-ghost">← {locale === 'ar' ? 'رجوع' : 'Back'}</button>
                <button onClick={() => setStep(4)} className="btn-ink">{locale === 'ar' ? 'مراجعة الطلب' : 'Review order'} →</button>
              </div>
            </section>
          )}

          {/* STEP 4 — Review */}
          {step === 4 && (
            <section className="space-y-6">
              <h2 className="text-display text-2xl border-b border-ink/10 pb-3">
                {locale === 'ar' ? '٤ · مراجعة الطلب' : '4 · Review your order'}
              </h2>

              {/* Items */}
              <div>
                <p className="eyebrow mb-3 text-ink-ghost">{locale === 'ar' ? 'المنتجات' : 'Items'}</p>
                <ul className="divide-y divide-ink/10 border-t border-b border-ink/10">
                  {items.map((item) => {
                    const name = getProductName(item.product, locale);
                    const price = Number(item.product.salePrice ?? item.product.price);
                    return (
                      <li key={item.id} className="flex items-center gap-4 py-3">
                        <div className="relative h-12 w-12 shrink-0 overflow-hidden border border-ink/10 bg-paper">
                          {item.product.images?.[0] && <Image src={item.product.images[0].url} alt={name} fill className="object-cover" />}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm line-clamp-1">{name}</p>
                          <p className="stamp text-ink-ghost">× {item.quantity}</p>
                        </div>
                        <span className="text-display text-sm">{formatPrice(price * item.quantity, locale)}</span>
                      </li>
                    );
                  })}
                </ul>
              </div>

              {/* Coupon */}
              <div>
                <p className="eyebrow mb-2 text-ink-ghost">{locale === 'ar' ? 'كوبون' : 'Coupon'}</p>
                {!couponApplied ? (
                  <div className="flex items-end gap-2">
                    <input
                      value={couponCode}
                      onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                      placeholder="SAVE10"
                      className="input-atelier flex-1"
                    />
                    <button onClick={applyCoupon} type="button" className="btn-ghost">
                      {locale === 'ar' ? 'تطبيق' : 'Apply'}
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center justify-between border border-gold/40 bg-gold/10 px-4 py-2 text-sm">
                    <span className="font-mono text-gold-deep">{couponApplied.code} · −{formatPrice(couponApplied.discount, locale)}</span>
                    <button onClick={() => { setCouponApplied(null); setCouponCode(''); }} className="text-xs stamp text-ink-soft hover:text-seal">
                      {locale === 'ar' ? 'إزالة' : 'Remove'}
                    </button>
                  </div>
                )}
                {couponError && <p className="text-xs text-seal mt-2">{couponError}</p>}
              </div>

              {placeError && (
                <div className="border border-seal/40 bg-seal/5 px-4 py-3 text-sm text-seal">{placeError}</div>
              )}

              <div className="flex justify-between pt-4">
                <button onClick={() => setStep(3)} className="btn-ghost">← {locale === 'ar' ? 'رجوع' : 'Back'}</button>
                <button onClick={placeOrder} disabled={placing} className="btn-gold">
                  {placing
                    ? (locale === 'ar' ? 'جارٍ...' : 'Placing…')
                    : (locale === 'ar' ? 'تأكيد الطلب' : 'Place order')} →
                </button>
              </div>
            </section>
          )}
        </div>

        {/* ── Order summary (sticky on desktop) ── */}
        <aside className="lg:sticky lg:top-28 lg:self-start">
          <div className="border border-ink/10 bg-paper-white p-6 paper-texture">
            <p className="eyebrow text-ink-ghost mb-4">
              {locale === 'ar' ? `${itemCount} منتج` : `№ · ${itemCount} items`}
            </p>

            <dl className="space-y-2 text-sm">
              <div className="flex justify-between">
                <dt className="text-ink-soft">{locale === 'ar' ? 'المجموع' : 'Subtotal'}</dt>
                <dd className="font-mono">{formatPrice(subtotal, locale)}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-ink-soft">{locale === 'ar' ? 'الشحن' : 'Shipping'}</dt>
                <dd className="font-mono">{shipping === 0 ? (locale === 'ar' ? 'مجاناً' : 'Free') : formatPrice(shipping, locale)}</dd>
              </div>
              {discount > 0 && (
                <div className="flex justify-between text-seal">
                  <dt>{locale === 'ar' ? 'خصم' : 'Coupon'}</dt>
                  <dd className="font-mono">− {formatPrice(discount, locale)}</dd>
                </div>
              )}
              <div className="flex justify-between pt-3 border-t border-ink/10 font-display text-xl">
                <dt>{locale === 'ar' ? 'الإجمالي' : 'Total'}</dt>
                <dd>{formatPrice(total, locale)}</dd>
              </div>
            </dl>

            <div className="mt-6 pt-4 border-t border-ink/10 stamp text-ink-ghost text-center">
              ✦ {locale === 'ar' ? 'دفع آمن · شحن مضمون' : 'Secure payment · Guaranteed delivery'}
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
