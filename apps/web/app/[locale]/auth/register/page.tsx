'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useLocale } from 'next-intl';
import { authRegister } from '../../../../lib/api';
import { useAuthStore } from '../../../../stores/auth.store';

export default function RegisterPage() {
  const locale = useLocale();
  const router = useRouter();
  const { setAuth } = useAuthStore();

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await authRegister({ firstName, lastName, email, password, phone: phone || undefined });
      setAuth(res.user, res.accessToken);
      router.push(`/${locale}/account`);
    } catch (err: any) {
      setError(err.response?.data?.message || (locale === 'ar' ? 'فشل إنشاء الحساب' : 'Registration failed'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="opacity-0 animate-fade-up">
      <p className="eyebrow text-gold-deep mb-4">№ 02 · {locale === 'ar' ? 'حساب جديد' : 'NEW MEMBER'}</p>
      <h1 className="text-display text-4xl md:text-5xl tracking-tightest text-ink leading-none">
        {locale === 'ar' ? (
          <>انضمّ إلى <span className="italic-flourish text-gold-deep">الاتيليه</span></>
        ) : (
          <>Join the <span className="italic-flourish text-gold-deep">atelier</span></>
        )}
      </h1>
      <p className="text-ink-soft mt-3 text-sm">
        {locale === 'ar' ? 'دقيقة واحدة لإنشاء الحساب.' : 'A single minute to create your account.'}
      </p>

      <form onSubmit={handleSubmit} className="mt-8 space-y-6">
        <div className="grid grid-cols-2 gap-5">
          <div>
            <label htmlFor="reg-first" className="eyebrow block mb-2 text-ink-soft">{locale === 'ar' ? 'الاسم الأول' : 'First name'}</label>
            <input id="reg-first" name="firstName" required autoComplete="given-name" value={firstName} onChange={(e) => setFirstName(e.target.value)} className="input-atelier" />
          </div>
          <div>
            <label htmlFor="reg-last" className="eyebrow block mb-2 text-ink-soft">{locale === 'ar' ? 'الاسم الأخير' : 'Last name'}</label>
            <input id="reg-last" name="lastName" required autoComplete="family-name" value={lastName} onChange={(e) => setLastName(e.target.value)} className="input-atelier" />
          </div>
        </div>

        <div>
          <label htmlFor="reg-email" className="eyebrow block mb-2 text-ink-soft">{locale === 'ar' ? 'البريد الإلكتروني' : 'Email'}</label>
          <input id="reg-email" name="email" type="email" required autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} className="input-atelier" />
        </div>

        <div>
          <label htmlFor="reg-phone" className="eyebrow block mb-2 text-ink-soft">
            {locale === 'ar' ? 'رقم الهاتف (اختياري)' : 'Phone (optional)'}
          </label>
          <input id="reg-phone" name="phone" type="tel" autoComplete="tel" value={phone} onChange={(e) => setPhone(e.target.value)} className="input-atelier" placeholder="+20 10 1234 5678" />
        </div>

        <div>
          <label htmlFor="reg-password" className="eyebrow block mb-2 text-ink-soft">{locale === 'ar' ? 'كلمة المرور' : 'Password'}</label>
          <input
            id="reg-password"
            name="password"
            type="password"
            required
            minLength={8}
            autoComplete="new-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="input-atelier"
            placeholder={locale === 'ar' ? '٨ أحرف على الأقل' : 'Min. 8 characters'}
          />
        </div>

        {error && (
          <div className="border border-seal/40 bg-seal/5 px-4 py-3 text-sm text-seal">{error}</div>
        )}

        <button type="submit" disabled={loading} className="btn-ink w-full">
          {loading
            ? (locale === 'ar' ? 'جارٍ الإنشاء...' : 'Creating…')
            : (locale === 'ar' ? 'إنشاء الحساب' : 'Create account')}
          {!loading && <span>→</span>}
        </button>

        <p className="text-center text-sm text-ink-soft pt-2">
          {locale === 'ar' ? 'لديك حساب؟ ' : 'Already have one? '}
          <Link href={`/${locale}/auth/login`} className="font-medium text-ink underline decoration-gold decoration-2 underline-offset-4">
            {locale === 'ar' ? 'تسجيل الدخول' : 'Sign in'}
          </Link>
        </p>
      </form>
    </div>
  );
}
