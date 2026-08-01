import React, { Suspense } from 'react';
import type { Metadata } from 'next';
import BlogListing from '../../components/BlogListing';

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || 
  (process.env.NEXT_PUBLIC_VERCEL_URL ? `https://${process.env.NEXT_PUBLIC_VERCEL_URL}` : 'https://bylines.dev');

export const metadata: Metadata = {
  title: 'All Publications & Technical Essays',
  description: 'Explore the complete archive of technical essays, engineering papers, research reports, and editorial coverage on Bylines.dev.',
  alternates: {
    canonical: `${BASE_URL}/posts`,
  },
  openGraph: {
    title: 'All Publications & Technical Essays | Bylines.dev',
    description: 'Explore the complete archive of technical essays, engineering papers, research reports, and editorial coverage on Bylines.dev.',
    url: `${BASE_URL}/posts`,
    type: 'website',
  },
};

export default function PostsPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <Suspense fallback={<div className="text-center text-xs text-neutral-450 uppercase tracking-widest py-20 font-serif">Loading Publications...</div>}>
        <BlogListing />
      </Suspense>
    </div>
  );
}
