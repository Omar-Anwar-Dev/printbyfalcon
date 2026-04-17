import Link from 'next/link';
import { useLocale } from 'next-intl';
import { ChevronRightIcon, ChevronLeftIcon } from '@heroicons/react/24/outline';

interface Crumb {
  label: string;
  href?: string;
}

export function Breadcrumbs({ items }: { items: Crumb[] }) {
  const locale = useLocale();
  const Chevron = locale === 'ar' ? ChevronLeftIcon : ChevronRightIcon;

  return (
    <nav aria-label="Breadcrumb" className="mb-4 flex items-center gap-1.5 text-xs text-gray-500">
      {items.map((item, i) => {
        const last = i === items.length - 1;
        return (
          <span key={i} className="flex items-center gap-1.5">
            {i > 0 && <Chevron className="h-3 w-3 text-gray-300" />}
            {item.href && !last ? (
              <Link href={item.href} className="hover:text-[#1a1a2e] transition-colors">
                {item.label}
              </Link>
            ) : (
              <span className={last ? 'font-medium text-gray-700' : ''}>{item.label}</span>
            )}
          </span>
        );
      })}
    </nav>
  );
}
