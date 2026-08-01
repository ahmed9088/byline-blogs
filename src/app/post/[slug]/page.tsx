import React from 'react';
import type { Metadata } from 'next';
import PostDetails from '../../../components/PostDetails';

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
    const res = await fetch(`${apiUrl}/posts/slug/${slug}`, { next: { revalidate: 60 } });
    if (res.ok) {
      const data = await res.json();
      if (data.success && data.post) {
        const post = data.post;
        const title = post.seo?.metaTitle || post.title;
        const description = post.seo?.metaDescription || post.summary || "Independent technical essay and research report on Bylines.dev.";
        const url = `${BASE_URL}/post/${slug}`;
        const image = post.featuredImage || "https://images.unsplash.com/photo-1513542789411-b6a5d4f31634?auto=format&fit=crop&w=1200&h=630&q=80";
        const tags = Array.isArray(post.tags)
          ? post.tags.map((t: any) => typeof t === 'object' ? t.name : t)
          : [];
        const authorName = post.author?.name || 'Bylines.dev Desk';

        return {
          title,
          description,
          keywords: tags.length > 0 ? tags : ['bylines dev', 'technical journalism', 'research'],
          authors: [{ name: authorName, url: `${BASE_URL}/author/${post.author?._id || ''}` }],
          publisher: 'Bylines.dev Journal',
          alternates: {
            canonical: url,
          },
          openGraph: {
            type: 'article',
            url,
            title,
            description,
            siteName: 'Bylines.dev Journal',
            publishedTime: post.publishedAt,
            modifiedTime: post.updatedAt || post.publishedAt,
            authors: [authorName],
            section: post.category?.name || 'Technical Journal',
            images: [
              {
                url: image,
                width: 1200,
                height: 630,
                alt: title,
              },
            ],
          },
          twitter: {
            card: 'summary_large_image',
            title,
            description,
            creator: '@bylines_dev',
            site: '@bylines_dev',
            images: [image],
          },
          robots: {
            index: true,
            follow: true,
            googleBot: {
              index: true,
              follow: true,
              'max-image-preview': 'large',
              'max-snippet': -1,
            },
          },
        };
      }
    }
  } catch (err) {
    console.error('Failed to generate post metadata server-side:', err);
  }

  return {
    title: 'Article | Bylines.dev',
    description: 'Independent engineering papers, technical journalism, and research reports.',
  };
}

export default async function PostPage({ params }: PageProps) {
  const resolvedParams = await params;
  return <PostDetails slug={resolvedParams.slug} />;
}
