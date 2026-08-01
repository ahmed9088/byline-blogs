import React from 'react';
import type { Metadata } from 'next';
import TagArchiveClient from '../../../components/TagArchiveClient';

interface PageProps {
  params: Promise<{ slug: string }>;
}

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || 
  (process.env.NEXT_PUBLIC_VERCEL_URL ? `https://${process.env.NEXT_PUBLIC_VERCEL_URL}` : 'https://bylines.dev');

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const tagName = slug.replace(/-/g, ' ');
  const title = `#${tagName} Articles | Bylines.dev`;
  const description = `Browse all technical papers, research reports, and editorial publications tagged with #${tagName} on Bylines.dev.`;
  const url = `${BASE_URL}/tag/${slug}`;

  return {
    title,
    description,
    alternates: {
      canonical: url,
    },
    openGraph: {
      title,
      description,
      url,
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
    },
  };
}

export default async function TagPage({ params }: PageProps) {
  const resolvedParams = await params;
  return <TagArchiveClient slug={resolvedParams.slug} />;
}
