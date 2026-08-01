import { MetadataRoute } from 'next';

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://bylines.dev';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/admin',
          '/admin/*',
          '/api/*',
          '/profile',
          '/bookmarks',
          '/login',
          '/register',
          '/unsubscribe',
        ],
      },
      {
        userAgent: 'Googlebot',
        allow: '/',
        disallow: [
          '/admin/*',
          '/api/*',
          '/profile',
          '/bookmarks',
        ],
      },
      {
        userAgent: 'Bingbot',
        allow: '/',
        disallow: [
          '/admin/*',
          '/api/*',
          '/profile',
        ],
      },
    ],
    sitemap: `${BASE_URL}/sitemap.xml`,
    host: BASE_URL,
  };
}
