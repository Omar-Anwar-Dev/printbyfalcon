import Link from 'next/link';
import { getLocale } from 'next-intl/server';

export default async function AuthLayout({ children }: { children: React.ReactNode }) {
  const locale = await getLocale();

  return (
    <div className="min-h-screen grid grid-cols-1 lg:grid-cols-[1fr_1.1fr]">
      {/* Left — narrative panel (dark ink) */}
      <aside className="relative hidden lg:flex flex-col justify-between bg-ink text-paper paper-texture p-12 xl:p-16 overflow-hidden">
        {/* Oversized backdrop letter */}
        <span
          aria-hidden
          className="absolute -top-20 -right-20 text-display text-[40rem] leading-none text-paper/[0.04] select-none pointer-events-none"
        >
          P
        </span>

        <div className="relative z-10">
          <Link href={`/${locale}`} className="flex items-baseline gap-2.5">
            <span className="text-gold text-xl">✦</span>
            <span className="text-display text-2xl tracking-tightest">
              Print<span className="italic-flourish text-gold">by</span>Falcon
            </span>
          </Link>
        </div>

        <div className="relative z-10 max-w-md">
          <p className="eyebrow text-gold mb-4">{locale === 'ar' ? 'من الاتيليه' : 'From the atelier'}</p>
          <blockquote className="text-display text-4xl xl:text-5xl leading-tight tracking-tightest">
            {locale === 'ar' ? (
              <>
                «الطباعة الجيدة <br/>
                <span className="italic-flourish text-gold">لا تُضَيِّع</span> <br/>
                الفكرة الأصلية.»
              </>
            ) : (
              <>
                &ldquo;Good printing <br/>
                <span className="italic-flourish text-gold">never loses</span> <br/>
                the original thought.&rdquo;
              </>
            )}
          </blockquote>
          <p className="mt-6 stamp text-paper/50">
            — {locale === 'ar' ? 'قول قديم للمطبعيين' : 'Old pressman&rsquo;s adage'}
          </p>
        </div>

        <div className="relative z-10 flex items-center justify-between text-xs text-paper/50">
          <span className="stamp">EST. CAIRO · MMXXV</span>
          <span className="text-gold">✦</span>
        </div>
      </aside>

      {/* Right — form panel */}
      <main className="flex flex-col bg-paper">
        <div className="flex justify-between items-center p-5 lg:hidden border-b border-ink/10">
          <Link href={`/${locale}`} className="flex items-baseline gap-2">
            <span className="text-gold">✦</span>
            <span className="text-display text-xl">PrintbyFalcon</span>
          </Link>
        </div>
        <div className="flex flex-1 items-center justify-center p-6 sm:p-10">
          <div className="w-full max-w-md">
            {children}
          </div>
        </div>
      </main>
    </div>
  );
}
