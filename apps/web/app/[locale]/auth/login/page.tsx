'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useLocale } from 'next-intl';
import { authLogin } from '../../../../lib/api';
import { useAuthStore } from '../../../../stores/auth.store';

export default function LoginPage() {
  const locale = useLocale();
  const router = useRouter();
  const { setAuth } = useAuthStore();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await authLogin(email, password);
      setAuth(res.user, res.accessToken);
      router.push(`/${locale}/account`);
    } catch (err: any) {
      setError(err.response?.data?.message || (locale === 'ar' ? 'فشل تسجيل الدخول' : 'Login failed'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="opacity-0 animate-fade-up">
      <p className="eyebrow text-gold-deep mb-4">№ 01 · {locale === 'ar' ? 'العودة' : 'RETURNING'}</p>
      <h1 className="text-display text-4xl md:text-5xl tracking-tightest text-ink leading-none">
        {locale === 'ar' ? (
          <>مرحباً <span className="italic-flourish text-gold-deep">بعودتك</span></>
        ) : (
          <>Welcome <span className="italic-flourish text-gold-deep">back</span></>
        )}
      </h1>
      <p className="text-ink-soft mt-3 text-sm">
        {locale === 'ar' ? 'أدخل بياناتك للمتابعة إلى حسابك.' : 'Enter your details to continue to your account.'}
      </p>

      <form onSubmit={handleSubmit} className="mt-10 space-y-7">
        <div>
          <label htmlFor="login-email" className="eyebrow block mb-2 text-ink-soft">{locale === 'ar' ? 'البريد الإلكتروني' : 'Email'}</label>
          <input
            id="login-email"
            name="email"
            type="email"
            required
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="input-atelier"
            placeholder="name@studio.com"
          />
        </div>

        <div>
          <div className="flex items-center justify-between mb-2">
            <label htmlFor="login-password" className="eyebrow text-ink-soft">{locale === 'ar' ? 'كلمة المرور' : 'Password'}</label>
            <Link href={`/${locale}/auth/forgot-password`} className="text-xs text-gold-deep hover:underline">
              {locale === 'ar' ? 'نسيتها؟' : 'Forgot?'}
            </Link>
          </div>
          <input
            id="login-password"
            name="password"
            type="password"
            required
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="input-atelier"
            placeholder="••••••••"
          />
        </div>

        {error && (
          <div className="border border-seal/40 bg-seal/5 px-4 py-3 text-sm text-seal">
            {error}
          </div>
        )}

        <button type="submit" disabled={loading} className="btn-ink w-full">
          {loading
            ? (locale === 'ar' ? 'جارٍ الدخول...' : 'Signing in…')
            : (locale === 'ar' ? 'تسجيل الدخول' : 'Sign in')}
          {!loading && <span>→</span>}
        </button>

        <div className="divider-ornament"><span>{locale === 'ar' ? 'أو' : 'OR'}</span></div>

        <p className="text-center text-sm text-ink-soft">
          {locale === 'ar' ? 'لا تملك حساباً؟ ' : 'New here? '}
          <Link href={`/${locale}/auth/register`} className="font-medium text-ink underline decoration-gold decoration-2 underline-offset-4 hover:decoration-gold-deep">
            {locale === 'ar' ? 'إنشاء حساب' : 'Create an account'}
          </Link>
        </p>
      </form>
    </div>
  );
}
