'use client';

import Link from 'next/link';
import { useLocale } from 'next-intl';
import { useQuery } from '@tanstack/react-query';
import { fetchMyTickets } from '../../../lib/api';
import { useRequireAuth } from '../../../hooks/useRequireAuth';
import { PlusIcon } from '@heroicons/react/24/outline';

const priorityColor: Record<string, string> = {
  LOW: 'border-ink/20 text-ink-soft',
  MEDIUM: 'border-accent/40 text-accent',
  HIGH: 'border-gold/60 text-gold-deep',
  URGENT: 'border-seal/60 text-seal',
};

export default function SupportPage() {
  const locale = useLocale();
  const isAuth = useRequireAuth();
  const { data } = useQuery({
    queryKey: ['tickets'],
    queryFn: () => fetchMyTickets(1, 20),
    enabled: isAuth,
  });

  if (!isAuth) return null;

  return (
    <div className="container mx-auto px-5 py-10 md:py-16 max-w-4xl">
      <header className="mb-10 flex items-end justify-between border-b border-ink/10 pb-5">
        <div>
          <p className="eyebrow text-gold-deep mb-2">{locale === 'ar' ? 'الدعم' : 'ATELIER SUPPORT'}</p>
          <h1 className="text-display text-4xl md:text-5xl tracking-tightest">
            {locale === 'ar' ? 'طلبات المساعدة' : 'Tickets'}
          </h1>
        </div>
        <Link href={`/${locale}/support/new`} className="btn-ink">
          <PlusIcon className="h-4 w-4" />
          {locale === 'ar' ? 'طلب جديد' : 'New ticket'}
        </Link>
      </header>

      {!data || data.data.length === 0 ? (
        <div className="border border-dashed border-ink/20 py-20 text-center">
          <span className="text-gold text-5xl block mb-4">✉</span>
          <p className="text-display text-xl mb-2">{locale === 'ar' ? 'لا توجد طلبات مساعدة' : 'No tickets yet'}</p>
          <p className="text-sm text-ink-soft mb-6">
            {locale === 'ar'
              ? 'افتح طلباً لأي استفسار أو مشكلة'
              : 'Open a ticket for any question or issue.'}
          </p>
          <Link href={`/${locale}/support/new`} className="btn-ink">
            {locale === 'ar' ? 'فتح طلب' : 'Open a ticket'}
          </Link>
        </div>
      ) : (
        <ul className="divide-y divide-ink/10">
          {data.data.map((t) => (
            <li key={t.id}>
              <Link href={`/${locale}/support/${t.id}`} className="group flex items-center justify-between py-5 hover:bg-paper-white/50 -mx-4 px-4 transition-colors">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <span className={`stamp border px-2 py-0.5 ${priorityColor[t.priority] ?? ''}`}>{t.priority}</span>
                    <span className="stamp text-ink-ghost">{t.category.replace('_', ' ')}</span>
                    <span className="stamp border border-ink/20 px-2 py-0.5">{t.status}</span>
                  </div>
                  <p className="text-base text-ink line-clamp-1 group-hover:underline">{t.subject}</p>
                  <p className="text-xs text-ink-ghost mt-1">
                    {new Date(t.updatedAt).toLocaleDateString(locale === 'ar' ? 'ar-EG' : 'en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </p>
                </div>
                <span className="text-ink-ghost group-hover:text-ink">→</span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
