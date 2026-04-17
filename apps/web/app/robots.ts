import type { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: ['/', '/ar', '/en', '/ar/products', '/en/products'],
        disallow: ['/admin', '/api', '/checkout', '/cart'],
      },
    ],
    sitemap: 'https://printbyfalcon.com/sitemap.xml',
  };
}
