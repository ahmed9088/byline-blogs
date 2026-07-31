import { MetadataRoute } from 'next';

export const dynamic = 'force-dynamic';

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || 
  (process.env.NEXT_PUBLIC_VERCEL_URL ? `https://${process.env.NEXT_PUBLIC_VERCEL_URL}` : 'https://bylines.dev');
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const routes: MetadataRoute.Sitemap = [
    {
      url: BASE_URL,
      lastModified: new Date(),
      changeFrequency: 'always',
      priority: 1.0,
    },
    {
      url: `${BASE_URL}/category`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: `${BASE_URL}/posts`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: `${BASE_URL}/about`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.5,
    },
    {
      url: `${BASE_URL}/contact`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.5,
    },
    {
      url: `${BASE_URL}/privacy-policy`,
      lastModified: new Date(),
      changeFrequency: 'yearly',
      priority: 0.3,
    },
    {
      url: `${BASE_URL}/terms-and-conditions`,
      lastModified: new Date(),
      changeFrequency: 'yearly',
      priority: 0.3,
    },
  ];

  try {
    const [postsRes, catRes] = await Promise.all([
      fetch(`${API_URL}/posts?status=published&limit=100`, { next: { revalidate: 60 } }),
      fetch(`${API_URL}/categories`, { next: { revalidate: 60 } })
    ]);

    const postsData = await postsRes.json();
    if (postsData.success && Array.isArray(postsData.posts)) {
      postsData.posts.forEach((post: any) => {
        routes.push({
          url: `${BASE_URL}/post/${post.slug}`,
          lastModified: post.updatedAt ? new Date(post.updatedAt) : new Date(post.publishedAt || Date.now()),
          changeFrequency: 'weekly',
          priority: post.isFeatured ? 0.9 : 0.8,
        });
      });
    }

    const catData = await catRes.json();
    if (catData.success && Array.isArray(catData.categories)) {
      catData.categories.forEach((cat: any) => {
        routes.push({
          url: `${BASE_URL}/category/${cat.slug}`,
          lastModified: new Date(),
          changeFrequency: 'daily',
          priority: 0.85,
        });
      });
    }
  } catch (err) {
    console.error('Error generating dynamic sitemap:', err);
  }

  return routes;
}
