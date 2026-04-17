import { getTranslations } from 'next-intl/server';
import { ProductCard } from '../../../components/ui/ProductCard';
import { fetchCategories, fetchProducts } from '../../../lib/api';
import Link from 'next/link';

// Force dynamic rendering — filters change per request, inventory changes often
export const dynamic = 'force-dynamic';

interface Props {
  params: { locale: string };
  searchParams: {
    category?: string;
    brand?: string;
    minPrice?: string;
    maxPrice?: string;
    page?: string;
    sort?: string;
    search?: string;
  };
}

export default async function ProductsPage({ params: { locale }, searchParams }: Props) {
  const t = await getTranslations('products');
  const page = searchParams.page ? parseInt(searchParams.page) : 1;

  const [productsResult, categoriesResult] = await Promise.allSettled([
    fetchProducts({
      page,
      limit: 20,
      categorySlug: searchParams.category,
      minPrice: searchParams.minPrice,
      maxPrice: searchParams.maxPrice,
      search: searchParams.search,
    }),
    fetchCategories(),
  ]);

  const productsData = productsResult.status === 'fulfilled'
    ? productsResult.value
    : { data: [], total: 0, page: 1, totalPages: 1 };
  const categories = categoriesResult.status === 'fulfilled' ? categoriesResult.value : [];

  return (
    <div className="container mx-auto px-4 py-6">
      <h1 className="mb-6 text-2xl font-bold text-[#1a1a2e]">{t('title')}</h1>

      <div className="flex gap-6">
        {/* Sidebar filters */}
        <aside className="hidden w-56 shrink-0 lg:block">
          <div className="rounded-xl border bg-white p-4 shadow-sm">
            <h3 className="mb-3 font-semibold text-[#1a1a2e]">{t('category')}</h3>
            <ul className="space-y-1">
              <li>
                <Link
                  href={`/${locale}/products`}
                  className={`block rounded-lg px-3 py-1.5 text-sm transition-colors hover:bg-gray-50 ${!searchParams.category ? 'font-semibold text-[#1a1a2e]' : 'text-gray-600'}`}
                >
                  {locale === 'ar' ? 'الكل' : 'All'}
                </Link>
              </li>
              {categories.map((cat) => (
                <li key={cat.id}>
                  <Link
                    href={`/${locale}/products?category=${cat.slug}`}
                    className={`block rounded-lg px-3 py-1.5 text-sm transition-colors hover:bg-gray-50 ${searchParams.category === cat.slug ? 'font-semibold text-[#1a1a2e]' : 'text-gray-600'}`}
                  >
                    {locale === 'ar' ? cat.nameAr : cat.nameEn}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </aside>

        {/* Product grid */}
        <div className="flex-1">
          {productsData.data.length === 0 ? (
            <div className="flex h-64 items-center justify-center text-gray-400">
              <p>{t('noResults')}</p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4">
                {productsData.data.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>

              {/* Pagination */}
              {productsData.totalPages > 1 && (
                <div className="mt-8 flex justify-center gap-2">
                  {Array.from({ length: productsData.totalPages }, (_, i) => i + 1).map((p) => (
                    <Link
                      key={p}
                      href={`/${locale}/products?page=${p}${searchParams.category ? `&category=${searchParams.category}` : ''}`}
                      className={`flex h-9 w-9 items-center justify-center rounded-lg text-sm font-medium transition-colors ${
                        p === page
                          ? 'bg-[#1a1a2e] text-white'
                          : 'border bg-white text-gray-600 hover:bg-gray-50'
                      }`}
                    >
                      {p}
                    </Link>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
