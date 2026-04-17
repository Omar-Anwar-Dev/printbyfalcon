'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useLocale } from 'next-intl';
import { authForgotPassword } from '../../../../lib/api';

export default function ForgotPasswordPage() {
  const locale = useLocale();
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await authForgotPassword(email);
      setSent(true);
    } catch (err: any) {
      setError(err.response?.data?.message || (locale === 'ar' ? 'حدث خطأ' : 'Something went wrong'));
    } finally {
      setLoading(false);
    }
  };

  if (sent) {
    return (
      <div className="opacity-0 animate-fade-up text-center">
        <span className="inline-block text-gold text-5xl mb-6">✦</span>
        <h1 className="text-display text-3xl md:text-4xl tracking-tightest text-ink mb-3">
          {locale === 'ar' ? 'تحقق من بريدك' : 'Check your mail'}
        </h1>
        <p className="text-ink-soft leading-relaxed max-w-sm mx-auto">
          {locale === 'ar'
            ? `إذا كان الحساب موجوداً، فقد أرسلنا رابط إعادة التعيين إلى ${email}`
            : `If an account exists, we've sent a reset link to ${email}.`}
        </p>
        <Link href={`/${locale}/auth/login`} className="btn-ghost mt-8">
          ← {locale === 'ar' ? 'العودة لتسجيل الدخول' : 'Back to sign in'}
        </Link>
      </div>
    );
  }

  return (
    <div className="opacity-0 animate-fade-up">
      <p className="eyebrow text-gold-deep mb-4">№ 03 · {locale === 'ar' ? 'استعادة' : 'RECOVER'}</p>
      <h1 className="text-display text-4xl md:text-5xl tracking-tightest text-ink leading-none">
        {locale === 'ar' ? (
          <>إعادة تعيين <span className="italic-flourish text-gold-deep">كلمة المرور</span></>
        ) : (
          <>Reset your <span className="italic-flourish text-gold-deep">password</span></>
        )}
      </h1>
      <p className="text-ink-soft mt-3 text-sm max-w-sm">
        {locale === 'ar'
          ? 'أدخل بريدك الإلكتروني وسنرسل لك رابطاً لإعادة تعيين كلمة المرور.'
          : 'Enter your email and we&rsquo;ll send you a secure link to reset.'}
      </p>

      <form onSubmit={handleSubmit} className="mt-10 space-y-7">
        <div>
          <label htmlFor="fp-email" className="eyebrow block mb-2 text-ink-soft">{locale === 'ar' ? 'البريد الإلكتروني' : 'Email'}</label>
          <input id="fp-email" name="email" type="email" required autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} className="input-atelier" />
        </div>

        {error && (
          <div className="border border-seal/40 bg-seal/5 px-4 py-3 text-sm text-seal">{error}</div>
        )}

        <button type="submit" disabled={loading} className="btn-ink w-full">
          {loading
            ? (locale === 'ar' ? 'جارٍ الإرسال...' : 'Sending…')
            : (locale === 'ar' ? 'إرسال الرابط' : 'Send reset link')}
          {!loading && <span>→</span>}
        </button>

        <p className="text-center text-sm text-ink-soft">
          <Link href={`/${locale}/auth/login`} className="hover:underline">
            ← {locale === 'ar' ? 'العودة لتسجيل الدخول' : 'Back to sign in'}
          </Link>
        </p>
      </form>
    </div>
  );
}
