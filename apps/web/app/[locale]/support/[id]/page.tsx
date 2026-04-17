'use client';

import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useState } from 'react';
import { useLocale } from 'next-intl';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { fetchTicket, replyTicket } from '../../../../lib/api';
import { useAuthStore } from '../../../../stores/auth.store';

export default function TicketDetailPage() {
  const params = useParams();
  const locale = useLocale();
  const id = params.id as string;
  const queryClient = useQueryClient();
  const { user } = useAuthStore();

  const [reply, setReply] = useState('');

  const { data: ticket } = useQuery({
    queryKey: ['ticket', id],
    queryFn: () => fetchTicket(id),
  });

  const replyMut = useMutation({
    mutationFn: () => replyTicket(id, reply),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ticket', id] });
      setReply('');
    },
  });

  if (!ticket) return <div className="container mx-auto px-5 py-20 text-center text-ink-ghost">Loading…</div>;

  return (
    <div className="container mx-auto px-5 py-10 md:py-16 max-w-3xl">
      <Link href={`/${locale}/support`} className="text-xs stamp text-ink-ghost hover:text-ink mb-4 inline-block">
        ← {locale === 'ar' ? 'كل الطلبات' : 'All tickets'}
      </Link>

      <header className="mb-10 pb-5 border-b border-ink/10">
        <div className="flex items-center gap-2 mb-3">
          <span className="stamp border border-ink/20 px-2 py-0.5">{ticket.status}</span>
          <span className="stamp border border-gold/40 text-gold-deep px-2 py-0.5">{ticket.priority}</span>
          <span className="stamp text-ink-ghost">{ticket.category.replace('_', ' ')}</span>
        </div>
        <h1 className="text-display text-3xl md:text-4xl tracking-tightest">{ticket.subject}</h1>
        <p className="text-sm text-ink-soft mt-2">
          {locale === 'ar' ? 'فُتح في' : 'Opened on'}{' '}
          {new Date(ticket.createdAt).toLocaleDateString(locale === 'ar' ? 'ar-EG' : 'en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}
        </p>
      </header>

      {/* Reply thread */}
      <section className="space-y-5 mb-10">
        {ticket.replies.map((r) => {
          const isMine = r.user.id === user?.id;
          const isStaff = r.user.role !== 'CUSTOMER';
          return (
            <article
              key={r.id}
              className={`border p-5 ${
                isStaff ? 'border-gold/40 bg-gold/5' : isMine ? 'border-ink/20 bg-paper-white' : 'border-ink/10 bg-paper-white'
              }`}
            >
              <div className="flex items-center justify-between mb-3 text-xs">
                <div className="flex items-center gap-2">
                  <span className="font-medium text-ink">
                    {r.user.firstName} {r.user.lastName}
                  </span>
                  {isStaff && (
                    <span className="stamp text-gold-deep border border-gold/60 px-1.5 py-0.5">
                      {locale === 'ar' ? 'فريق الدعم' : 'Team'}
                    </span>
                  )}
                </div>
                <time className="stamp text-ink-ghost">
                  {new Date(r.createdAt).toLocaleString(locale === 'ar' ? 'ar-EG' : 'en-GB', { dateStyle: 'medium', timeStyle: 'short' })}
                </time>
              </div>
              <p className="text-sm text-ink whitespace-pre-wrap leading-relaxed">{r.message}</p>
            </article>
          );
        })}
      </section>

      {/* Reply composer */}
      {ticket.status !== 'CLOSED' && (
        <form onSubmit={(e) => { e.preventDefault(); if (reply.trim()) replyMut.mutate(); }} className="border-t border-ink/10 pt-6">
          <label className="eyebrow block mb-2 text-ink-soft">{locale === 'ar' ? 'أضف ردّاً' : 'Add a reply'}</label>
          <textarea
            required
            rows={4}
            value={reply}
            onChange={(e) => setReply(e.target.value)}
            className="w-full border border-ink/20 bg-paper-white p-4 text-sm focus:border-ink outline-none transition mb-3"
          />
          <button type="submit" disabled={replyMut.isPending || !reply.trim()} className="btn-ink">
            {replyMut.isPending
              ? (locale === 'ar' ? 'جارٍ...' : 'Sending…')
              : (locale === 'ar' ? 'إرسال الرد' : 'Send reply')} →
          </button>
        </form>
      )}
    </div>
  );
}
