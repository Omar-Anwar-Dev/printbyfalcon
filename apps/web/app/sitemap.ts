import type { MetadataRoute } from 'next';
import { fetchProducts, fetchCategories } from '../lib/api';

const BASE_URL = 'https://printbyfalcon.com';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticRoutes: MetadataRoute.Sitemap = [
    { url: `${BASE_URL}/ar`, lastModified: new Date(), changeFrequency: 'daily', priority: 1 },
    { url: `${BASE_URL}/en`, lastModified: new Date(), changeFrequency: 'daily', priority: 1 },
    { url: `${BASE_URL}/ar/products`, changeFrequency: 'daily', priority: 0.9 },
    { url: `${BASE_URL}/en/products`, changeFrequency: 'daily', priority: 0.9 },
  ];

  // Add product and category routes (best effort — fail silently if API is down)
  try {
    const [productsRes, categories] = await Promise.all([
      fetchProducts({ limit: 500 }),
      fetchCategories(),
    ]);

    const productRoutes: MetadataRoute.Sitemap = productsRes.data.flatMap((p) => [
      { url: `${BASE_URL}/ar/products/${p.slug}`, changeFrequency: 'weekly', priority: 0.7 },
      { url: `${BASE_URL}/en/products/${p.slug}`, changeFrequency: 'weekly', priority: 0.7 },
    ]);

    const categoryRoutes: MetadataRoute.Sitemap = categories.flatMap((c) => [
      { url: `${BASE_URL}/ar/products?category=${c.slug}`, changeFrequency: 'weekly', priority: 0.6 },
      { url: `${BASE_URL}/en/products?category=${c.slug}`, changeFrequency: 'weekly', priority: 0.6 },
    ]);

    return [...staticRoutes, ...productRoutes, ...categoryRoutes];
  } catch {
    return staticRoutes;
  }
}
