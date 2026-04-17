'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useLocale } from 'next-intl';
import { useMutation } from '@tanstack/react-query';
import { createTicket } from '../../../../lib/api';
import { useRequireAuth } from '../../../../hooks/useRequireAuth';

export default function NewTicketPage() {
  const locale = useLocale();
  const router = useRouter();
  const isAuth = useRequireAuth();

  const [subject, setSubject] = useState('');
  const [category, setCategory] = useState('PRODUCT_INQUIRY');
  const [priority, setPriority] = useState('MEDIUM');
  const [message, setMessage] = useState('');
  const [error, setError] = useState<string | null>(null);

  const createMut = useMutation({
    mutationFn: () => createTicket({ subject, category, priority, message }),
    onSuccess: (ticket: any) => router.push(`/${locale}/support/${ticket.id}`),
    onError: (e: any) => setError(e.response?.data?.message || 'Failed'),
  });

  if (!isAuth) return null;

  return (
    <div className="container mx-auto px-5 py-10 md:py-16 max-w-2xl">
      <Link href={`/${locale}/support`} className="text-xs stamp text-ink-ghost hover:text-ink mb-6 inline-block">
        ← {locale === 'ar' ? 'كل الطلبات' : 'All tickets'}
      </Link>

      <header className="mb-10 pb-5 border-b border-ink/10">
        <p className="eyebrow text-gold-deep mb-2">{locale === 'ar' ? 'طلب دعم جديد' : 'NEW TICKET'}</p>
        <h1 className="text-display text-4xl tracking-tightest">
          {locale === 'ar' ? 'كيف يمكننا المساعدة؟' : 'How can we help?'}
        </h1>
      </header>

      <form
        onSubmit={(e) => { e.preventDefault(); createMut.mutate(); }}
        className="space-y-7"
      >
        <div>
          <label htmlFor="ticket-subject" className="eyebrow block mb-2 text-ink-soft">{locale === 'ar' ? 'الموضوع' : 'Subject'}</label>
          <input id="ticket-subject" name="subject" required value={subject} onChange={(e) => setSubject(e.target.value)} className="input-atelier" />
        </div>

        <div className="grid grid-cols-2 gap-5">
          <div>
            <label htmlFor="ticket-category" className="eyebrow block mb-2 text-ink-soft">{locale === 'ar' ? 'الفئة' : 'Category'}</label>
            <select id="ticket-category" name="category" value={category} onChange={(e) => setCategory(e.target.value)} className="input-atelier">
              <option value="PRODUCT_INQUIRY">{locale === 'ar' ? 'استفسار عن منتج' : 'Product inquiry'}</option>
              <option value="ORDER_ISSUE">{locale === 'ar' ? 'مشكلة في الطلب' : 'Order issue'}</option>
              <option value="TECHNICAL_SUPPORT">{locale === 'ar' ? 'دعم فني' : 'Technical support'}</option>
              <option value="RETURNS_REFUNDS">{locale === 'ar' ? 'إرجاع/استرداد' : 'Returns/refunds'}</option>
            </select>
          </div>
          <div>
            <label htmlFor="ticket-priority" className="eyebrow block mb-2 text-ink-soft">{locale === 'ar' ? 'الأولوية' : 'Priority'}</label>
            <select id="ticket-priority" name="priority" value={priority} onChange={(e) => setPriority(e.target.value)} className="input-atelier">
              <option value="LOW">{locale === 'ar' ? 'منخفضة' : 'Low'}</option>
              <option value="MEDIUM">{locale === 'ar' ? 'متوسطة' : 'Medium'}</option>
              <option value="HIGH">{locale === 'ar' ? 'عالية' : 'High'}</option>
              <option value="URGENT">{locale === 'ar' ? 'عاجلة' : 'Urgent'}</option>
            </select>
          </div>
        </div>

        <div>
          <label htmlFor="ticket-message" className="eyebrow block mb-2 text-ink-soft">{locale === 'ar' ? 'الرسالة' : 'Message'}</label>
          <textarea
            id="ticket-message"
            name="message"
            required
            rows={6}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            className="w-full border border-ink/20 bg-paper-white p-4 text-sm focus:border-ink outline-none transition"
            placeholder={locale === 'ar' ? 'أخبرنا بالتفصيل...' : 'Tell us in detail…'}
          />
        </div>

        {error && (
          <div className="border border-seal/40 bg-seal/5 px-4 py-3 text-sm text-seal">{error}</div>
        )}

        <button type="submit" disabled={createMut.isPending} className="btn-ink">
          {createMut.isPending
            ? (locale === 'ar' ? 'جارٍ الإرسال...' : 'Submitting…')
            : (locale === 'ar' ? 'إرسال الطلب' : 'Submit ticket')}
          {!createMut.isPending && ' →'}
        </button>
      </form>
    </div>
  );
}
