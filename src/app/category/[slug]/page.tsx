import React from 'react';
import type { Metadata } from 'next';
import CategoryArchiveClient from '../../../components/CategoryArchiveClient';

interface PageProps {
  params: Promise<{ slug: string }>;
}

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || 
  (process.env.NEXT_PUBLIC_VERCEL_URL ? `https://${process.env.NEXT_PUBLIC_VERCEL_URL}` : 'https://bylines.dev');

const getApiUrl = () => {
  const envApi = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
  if (envApi.startsWith('http://') || envApi.startsWith('https://')) {
    return envApi;
  }
  return `${BASE_URL}${envApi.startsWith('/') ? '' : '/'}${envApi}`;
};

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;

  try {
    const apiUrl = getApiUrl();
    const res = await fetch(`${apiUrl}/categories`, { next: { revalidate: 3600 } });
    if (res.ok) {
      const data = await res.json();
      if (data.success && Array.isArray(data.categories)) {
        const category = data.categories.find((c: any) => c.slug === slug);
        if (category) {
          const title = `${category.name} Section Archive | Bylines.dev`;
          const description = category.description || `Browse curated technical essays, research reports, and analysis in ${category.name}.`;
          const url = `${BASE_URL}/category/${slug}`;

          return {
            title,
            description,
            alternates: {
              canonical: url,
            },
            openGraph: {
              type: 'website',
              url,
              title,
              description,
              siteName: 'Bylines.dev Journal',
            },
            twitter: {
              card: 'summary_large_image',
              title,
              description,
            },
          };
        }
      }
    }
  } catch (err) {
    console.error('Category metadata error:', err);
  }

  const fallbackName = slug.replace(/-/g, ' ');
  return {
    title: `${fallbackName} | Bylines.dev`,
    description: `Explore published articles and research papers in ${fallbackName}.`,
    alternates: {
      canonical: `${BASE_URL}/category/${slug}`,
    },
  };
}

export default async function CategoryPage({ params }: PageProps) {
  const resolvedParams = await params;
  return <CategoryArchiveClient slug={resolvedParams.slug} />;
}
