import { MetadataRoute } from 'next';

export const dynamic = 'force-dynamic';

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || 
  (process.env.NEXT_PUBLIC_VERCEL_URL ? `https://${process.env.NEXT_PUBLIC_VERCEL_URL}` : 'https://bylines.dev');

const getApiUrl = () => {
  const envApi = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
  if (envApi.startsWith('http://') || envApi.startsWith('https://')) {
    return envApi;
  }
  return `${BASE_URL}${envApi.startsWith('/') ? '' : '/'}${envApi}`;
};

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const routes: MetadataRoute.Sitemap = [
    {
      url: BASE_URL,
      lastModified: new Date(),
      changeFrequency: 'always',
      priority: 1.0,
    },
    {
      url: `${BASE_URL}/posts`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.95,
    },
    {
      url: `${BASE_URL}/category`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: `${BASE_URL}/about`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.6,
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
    const apiUrl = getApiUrl();
    const [postsRes, catRes, tagsRes] = await Promise.all([
      fetch(`${apiUrl}/posts?status=published&limit=200`, { next: { revalidate: 60 } }).catch(() => null),
      fetch(`${apiUrl}/categories`, { next: { revalidate: 3600 } }).catch(() => null),
      fetch(`${apiUrl}/tags`, { next: { revalidate: 3600 } }).catch(() => null)
    ]);

    if (postsRes && postsRes.ok) {
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
    }

    if (catRes && catRes.ok) {
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
    }

    if (tagsRes && tagsRes.ok) {
      const tagsData = await tagsRes.json();
      if (tagsData.success && Array.isArray(tagsData.tags)) {
        tagsData.tags.forEach((tag: any) => {
          routes.push({
            url: `${BASE_URL}/tag/${tag.slug}`,
            lastModified: new Date(),
            changeFrequency: 'weekly',
            priority: 0.7,
          });
        });
      }
    }
  } catch (err) {
    console.error('Error generating dynamic sitemap:', err);
  }

  return routes;
}
