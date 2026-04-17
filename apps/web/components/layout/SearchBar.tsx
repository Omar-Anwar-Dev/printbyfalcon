'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useLocale, useTranslations } from 'next-intl';
import { MagnifyingGlassIcon } from '@heroicons/react/24/outline';
import Image from 'next/image';
import { api } from '../../lib/api';

interface Suggestion {
  nameEn: string;
  nameAr: string;
  slug: string;
  imageUrl?: string | null;
  price: number;
}

export function SearchBar() {
  const t = useTranslations('nav');
  const locale = useLocale();
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const q = query.trim();
    if (q.length < 2) { setSuggestions([]); return; }
    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await api.get<{ suggestions: Suggestion[] }>('/products/autocomplete', { params: { q } });
        setSuggestions(res.data.suggestions ?? []);
      } catch {
        setSuggestions([]);
      } finally {
        setLoading(false);
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [query]);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      router.push(`/${locale}/products?search=${encodeURIComponent(query.trim())}`);
      setOpen(false);
    }
  };

  const showDropdown = open && query.trim().length >= 2;

  return (
    <div ref={containerRef} className="relative w-full">
      <form onSubmit={handleSubmit}>
        <div className="relative border-b border-ink/20 focus-within:border-ink transition-colors">
          <MagnifyingGlassIcon className="absolute top-1/2 left-0 h-4 w-4 -translate-y-1/2 text-ink-ghost" />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={() => setOpen(true)}
            placeholder={t('search')}
            className="w-full bg-transparent pl-6 pr-2 py-2.5 text-sm text-ink placeholder:text-ink-ghost outline-none"
          />
        </div>
      </form>

      {showDropdown && (
        <div className="absolute top-full z-50 mt-2 w-full bg-paper-white shadow-card border border-ink/10 max-h-96 overflow-auto">
          {loading ? (
            <div className="px-4 py-3 text-sm text-ink-ghost stamp">{locale === 'ar' ? 'جارٍ البحث...' : 'SEARCHING...'}</div>
          ) : suggestions.length === 0 ? (
            <div className="px-4 py-3 text-sm text-ink-ghost stamp">{locale === 'ar' ? 'لا توجد نتائج' : 'NO RESULTS'}</div>
          ) : (
            <ul className="divide-y divide-ink/5">
              {suggestions.map((s) => (
                <li key={s.slug}>
                  <button
                    onClick={() => {
                      router.push(`/${locale}/products/${s.slug}`);
                      setOpen(false);
                      setQuery('');
                    }}
                    className="flex w-full items-center gap-3 px-3 py-3 text-start hover:bg-paper/50"
                  >
                    <div className="relative h-12 w-12 shrink-0 overflow-hidden bg-paper border border-ink/10">
                      {s.imageUrl && <Image src={s.imageUrl} alt="" fill className="object-cover" />}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm text-ink">{locale === 'ar' ? s.nameAr : s.nameEn}</p>
                      <p className="text-xs text-gold-deep mt-0.5 font-mono">
                        {new Intl.NumberFormat(locale === 'ar' ? 'ar-EG' : 'en-EG', { style: 'currency', currency: 'EGP', minimumFractionDigits: 0 }).format(Number(s.price))}
                      </p>
                    </div>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
