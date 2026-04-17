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
    if (q.length < 2) {
      setSuggestions([]);
      return;
    }
    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await api.get<{ suggestions: Suggestion[] }>('/products/autocomplete', {
          params: { q },
        });
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
    <div ref={containerRef} className="relative w-full max-w-xs">
      <form onSubmit={handleSubmit}>
        <div className="relative">
          <MagnifyingGlassIcon className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={() => setOpen(true)}
            placeholder={t('search')}
            className="w-full rounded-lg bg-white/10 py-2 ps-9 pe-3 text-sm text-white placeholder:text-gray-400 outline-none ring-1 ring-white/20 focus:ring-[#e8b86d]"
          />
        </div>
      </form>

      {showDropdown && (
        <div className="absolute top-full z-50 mt-1 w-full rounded-lg bg-white shadow-xl ring-1 ring-black/10 overflow-hidden">
          {loading ? (
            <div className="px-4 py-3 text-sm text-gray-400">{locale === 'ar' ? 'جارٍ البحث...' : 'Searching...'}</div>
          ) : suggestions.length === 0 ? (
            <div className="px-4 py-3 text-sm text-gray-400">
              {locale === 'ar' ? 'لا توجد نتائج' : 'No results'}
            </div>
          ) : (
            <ul>
              {suggestions.map((s) => (
                <li key={s.slug}>
                  <button
                    onClick={() => {
                      router.push(`/${locale}/products/${s.slug}`);
                      setOpen(false);
                      setQuery('');
                    }}
                    className="flex w-full items-center gap-3 px-3 py-2 text-start hover:bg-gray-50"
                  >
                    <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded bg-gray-100">
                      {s.imageUrl && (
                        <Image src={s.imageUrl} alt="" fill className="object-cover" />
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-gray-800">
                        {locale === 'ar' ? s.nameAr : s.nameEn}
                      </p>
                      <p className="text-xs text-[#1a1a2e] font-semibold">
                        {new Intl.NumberFormat(locale === 'ar' ? 'ar-EG' : 'en-EG', {
                          style: 'currency',
                          currency: 'EGP',
                          minimumFractionDigits: 0,
                        }).format(Number(s.price))}
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
