import React, { Suspense } from 'react';
import BlogListing from '../../components/BlogListing';

export default function PostsPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <Suspense fallback={<div className="text-center text-xs text-neutral-450 uppercase tracking-widest py-20 font-serif">Loading Publications...</div>}>
        <BlogListing />
      </Suspense>
    </div>
  );
}
