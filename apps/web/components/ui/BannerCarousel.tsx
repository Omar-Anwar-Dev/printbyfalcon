'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useLocale } from 'next-intl';
import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline';
import type { Banner } from '../../lib/api';

interface Props {
  banners: Banner[];
}

export function BannerCarousel({ banners }: Props) {
  const locale = useLocale();
  const [current, setCurrent] = useState(0);
  const isRtl = locale === 'ar';

  useEffect(() => {
    if (banners.length <= 1) return;
    const timer = setInterval(() => {
      setCurrent((c) => (c + 1) % banners.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [banners.length]);

  if (banners.length === 0) return null;

  const prev = () => setCurrent((c) => (c - 1 + banners.length) % banners.length);
  const next = () => setCurrent((c) => (c + 1) % banners.length);
  const banner = banners[current];

  return (
    <div className="relative overflow-hidden rounded-2xl bg-[#1a1a2e] shadow-lg">
      <div className="relative aspect-[16/5] w-full">
        <Image
          src={banner.imageUrl}
          alt={locale === 'ar' ? (banner.titleAr ?? '') : (banner.titleEn ?? '')}
          fill
          className="object-cover opacity-60"
          priority
        />
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center text-white px-6">
          {(isRtl ? banner.titleAr : banner.titleEn) && (
            <h2 className="text-2xl font-bold md:text-4xl">
              {isRtl ? banner.titleAr : banner.titleEn}
            </h2>
          )}
          {(isRtl ? banner.subtitleAr : banner.subtitleEn) && (
            <p className="mt-2 text-sm text-gray-200 md:text-base">
              {isRtl ? banner.subtitleAr : banner.subtitleEn}
            </p>
          )}
          {banner.link && (
            <Link
              href={banner.link}
              className="mt-4 rounded-lg bg-[#e8b86d] px-6 py-2 text-sm font-bold text-[#1a1a2e] hover:bg-[#d4a55e] transition-colors"
            >
              {locale === 'ar' ? 'تسوق الآن' : 'Shop Now'}
            </Link>
          )}
        </div>
      </div>

      {banners.length > 1 && (
        <>
          <button
            onClick={isRtl ? next : prev}
            className="absolute left-3 top-1/2 -translate-y-1/2 rounded-full bg-black/40 p-2 text-white hover:bg-black/60"
          >
            <ChevronLeftIcon className="h-4 w-4" />
          </button>
          <button
            onClick={isRtl ? prev : next}
            className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full bg-black/40 p-2 text-white hover:bg-black/60"
          >
            <ChevronRightIcon className="h-4 w-4" />
          </button>
          <div className="absolute bottom-3 left-1/2 flex -translate-x-1/2 gap-1.5">
            {banners.map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrent(i)}
                className={`h-1.5 rounded-full transition-all ${i === current ? 'w-6 bg-[#e8b86d]' : 'w-1.5 bg-white/50'}`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
