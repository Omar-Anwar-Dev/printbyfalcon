'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useState } from 'react';
import { useParams } from 'next/navigation';
import { useLocale } from 'next-intl';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { adminUpdateOrderStatus, fetchOrder } from '../../../../../lib/api';

const STATUS_OPTIONS = ['PAYMENT_CONFIRMED', 'PROCESSING', 'SHIPPED', 'OUT_FOR_DELIVERY', 'DELIVERED', 'CANCELLED', 'REFUNDED'];

export default function AdminOrderDetail() {
  const params = useParams();
  const locale = useLocale();
  const id = params.id as string;
  const queryClient = useQueryClient();

  const { data: order } = useQuery({
    queryKey: ['admin-order', id],
    queryFn: () => fetchOrder(id),
  });

  const [newStatus, setNewStatus] = useState('');
  const [courierName, setCourierName] = useState('');
  const [trackingNumber, setTrackingNumber] = useState('');
  const [note, setNote] = useState('');

  const updateMut = useMutation({
    mutationFn: () => adminUpdateOrderStatus(id, newStatus, note || undefined, courierName || undefined, trackingNumber || undefined),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-order', id] });
      queryClient.invalidateQueries({ queryKey: ['admin-orders'] });
      setNewStatus(''); setNote(''); setCourierName(''); setTrackingNumber('');
    },
  });

  if (!order) return <div className="text-center py-20 text-ink-ghost">Loading…</div>;

  return (
    <div className="space-y-8">
      <div>
        <Link href={`/${locale}/admin/orders`} className="stamp text-ink-ghost hover:text-ink">
          ← All orders
        </Link>
      </div>

      <header className="border-b border-ink/10 pb-5 flex flex-col md:flex-row md:items-end md:justify-between gap-4">
        <div>
          <p className="eyebrow text-gold-deep mb-1">{order.invoiceNumber}</p>
          <h1 className="text-display text-3xl md:text-4xl tracking-tightest">Order detail</h1>
          <p className="stamp text-ink-soft mt-2">
            {new Date(order.createdAt).toLocaleString('en-GB', { dateStyle: 'medium', timeStyle: 'short' })}
          </p>
        </div>
        <span className="stamp border border-ink/30 px-3 py-1 self-start">{order.status}</span>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-10">
        <div className="space-y-8">
          {/* Items */}
          <section>
            <p className="eyebrow mb-3 text-ink-ghost">ITEMS</p>
            <ul className="divide-y divide-ink/10 border-t border-b border-ink/10">
              {order.items.map((item: any) => {
                const snap = item.productSnapshot ?? {};
                return (
                  <li key={item.id} className="flex items-center gap-4 py-3">
                    <div className="relative h-12 w-12 shrink-0 overflow-hidden border border-ink/10 bg-paper">
                      {snap.imageUrl && <Image src={snap.imageUrl} alt="" fill className="object-cover" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm">{snap.nameEn}</p>
                      <p className="stamp text-ink-ghost">SKU · {snap.sku} · × {item.quantity}</p>
                    </div>
                    <span className="font-mono text-sm">EGP {Number(item.totalPrice).toLocaleString()}</span>
                  </li>
                );
              })}
            </ul>
          </section>

          {/* Customer / address */}
          <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <p className="eyebrow mb-2 text-ink-ghost">CUSTOMER</p>
              <p className="text-sm">{(order as any).user?.firstName} {(order as any).user?.lastName}</p>
              <p className="text-xs text-ink-soft font-mono">{(order as any).user?.email}</p>
            </div>
            {order.address && (
              <div>
                <p className="eyebrow mb-2 text-ink-ghost">SHIPPING TO</p>
                <address className="not-italic text-sm leading-relaxed">
                  <p>{order.address.fullName}</p>
                  <p className="text-ink-soft">{order.address.street}</p>
                  <p className="text-ink-soft">{order.address.city}, {(order.address as any).state}</p>
                  <p className="font-mono text-xs mt-2">{order.address.phone}</p>
                </address>
              </div>
            )}
          </section>

          {/* Update status */}
          <section className="border border-ink/10 bg-paper-white p-6">
            <p className="eyebrow text-gold-deep mb-4">UPDATE STATUS</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="eyebrow block mb-1 text-ink-soft">New status</label>
                <select value={newStatus} onChange={(e) => setNewStatus(e.target.value)} className="input-atelier">
                  <option value="">Choose…</option>
                  {STATUS_OPTIONS.map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              <div>
                <label className="eyebrow block mb-1 text-ink-soft">Courier (optional)</label>
                <input value={courierName} onChange={(e) => setCourierName(e.target.value)} className="input-atelier" placeholder="Aramex / Bosta / DHL" />
              </div>
              <div>
                <label className="eyebrow block mb-1 text-ink-soft">Tracking # (optional)</label>
                <input value={trackingNumber} onChange={(e) => setTrackingNumber(e.target.value)} className="input-atelier" />
              </div>
              <div className="md:col-span-2">
                <label className="eyebrow block mb-1 text-ink-soft">Note (optional)</label>
                <input value={note} onChange={(e) => setNote(e.target.value)} className="input-atelier" />
              </div>
            </div>
            <button onClick={() => updateMut.mutate()} disabled={!newStatus || updateMut.isPending} className="btn-ink mt-5">
              {updateMut.isPending ? 'Updating…' : 'Update status →'}
            </button>
          </section>
        </div>

        {/* Totals */}
        <aside className="lg:sticky lg:top-8 lg:self-start">
          <div className="border border-ink/10 bg-paper-white p-6">
            <dl className="space-y-2 text-sm">
              <div className="flex justify-between"><dt className="text-ink-soft">Subtotal</dt><dd className="font-mono">EGP {Number(order.subtotal).toLocaleString()}</dd></div>
              <div className="flex justify-between"><dt className="text-ink-soft">Shipping</dt><dd className="font-mono">EGP {Number(order.shippingAmount).toLocaleString()}</dd></div>
              <div className="flex justify-between"><dt className="text-ink-soft">VAT</dt><dd className="font-mono">EGP {Number(order.vatAmount).toLocaleString()}</dd></div>
              {Number(order.couponDiscount) > 0 && (
                <div className="flex justify-between text-seal"><dt>Coupon</dt><dd className="font-mono">− EGP {Number(order.couponDiscount).toLocaleString()}</dd></div>
              )}
              <div className="flex justify-between pt-3 border-t border-ink/10 font-display text-xl">
                <dt>Total</dt><dd>EGP {Number(order.totalAmount).toLocaleString()}</dd>
              </div>
            </dl>
            <div className="mt-5 pt-4 border-t border-ink/10">
              <p className="eyebrow mb-2 text-ink-ghost">PAYMENT</p>
              <p className="text-sm">{order.paymentMethod}</p>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
