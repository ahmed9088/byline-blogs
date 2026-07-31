"use client";

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { postsAPI, categoriesAPI } from '../services/api';
import { Clock, SlidersHorizontal, ChevronLeft, ChevronRight, Inbox } from 'lucide-react';
import SEOHead from './SEOHead';
import Breadcrumbs from './Breadcrumbs';
import { SkeletonCard } from './Skeleton';

export default function BlogListing() {
  const searchParams = useSearchParams();
  const [posts, setPosts] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalPages, setTotalPages] = useState(1);
  const [totalPosts, setTotalPosts] = useState(0);

  const page = parseInt(searchParams.get('page') || '1') || 1;
  const category = searchParams.get('category') || '';
  const search = searchParams.get('search') || '';

  useEffect(() => {
    const fetchListingData = async () => {
      setLoading(true);
      try {
        const params: any = {
          page,
          limit: 9,
          status: 'published'
        };
        if (category) params.category = category;
        if (search) params.search = search;

        const postsRes = await postsAPI.getPosts(params);
        if (postsRes.data.success) {
          setPosts(postsRes.data.posts);
          setTotalPages(postsRes.data.pages);
          setTotalPosts(postsRes.data.total);
        }

        const catRes = await categoriesAPI.getCategories();
        if (catRes.data.success) {
          setCategories(catRes.data.categories);
        }
      } catch (err: any) {
        console.error('Failed to load posts listing:', err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchListingData();
  }, [page, category, search]);

  const handleCategoryFilter = (catSlug: string) => {
    const params = new URLSearchParams(window.location.search);
    params.set('page', '1');
    if (catSlug) {
      params.set('category', catSlug);
    } else {
      params.delete('category');
    }
    window.history.pushState(null, '', `?${params.toString()}`);
    // Trigger popstate so state updates
    window.dispatchEvent(new Event('popstate'));
  };

  const handlePageChange = (newPage: number) => {
    if (newPage < 1 || newPage > totalPages) return;
    const params = new URLSearchParams(window.location.search);
    params.set('page', newPage.toString());
    window.history.pushState(null, '', `?${params.toString()}`);
    window.dispatchEvent(new Event('popstate'));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const activeCategoryName = categories.find(c => c.slug === category)?.name || '';

  return (
    <div className="space-y-8">
      <SEOHead 
        title={activeCategoryName ? `${activeCategoryName} Section` : 'Publications Archive'} 
        description={search ? `Search results for "${search}" in archives.` : 'Browse our collection of premium human-curated articles.'}
      />

      <div className="flex flex-col gap-1">
        <Breadcrumbs items={[{ label: 'Articles', href: '/posts' }]} />
        <div className="border-b border-neutral-200/60 dark:border-neutral-800/60 pb-5">
          <h1 className="text-3xl font-extrabold font-serif text-neutral-900 dark:text-neutral-50 tracking-tight">
            {search ? 'Search Findings' : activeCategoryName || 'Publications Archive'}
          </h1>
          <p className="text-xs text-neutral-500 dark:text-neutral-450 mt-1.5 max-w-2xl font-serif italic">
            {search 
              ? `Displaying archive entries matching keyword "${search}".` 
              : `Explore critical reviews, longform literature digests, and reports published in ${activeCategoryName || 'all sections'}.`
            }
          </p>
        </div>
      </div>

      {/* Category Filter Toolbar */}
      <div className="flex flex-wrap items-center gap-2 border-b border-neutral-200/40 dark:border-neutral-800/40 pb-4">
        <span className="text-[10px] uppercase font-bold text-neutral-400 dark:text-neutral-500 mr-2 flex items-center">
          <SlidersHorizontal className="w-3.5 h-3.5 mr-1" /> Filters:
        </span>
        <button
          onClick={() => handleCategoryFilter('')}
          className={`text-[11px] px-3.5 py-1 uppercase tracking-wider font-semibold border rounded-lg transition-all duration-200 ${
            !category 
              ? 'bg-neutral-900 text-white border-neutral-900 dark:bg-neutral-100 dark:text-black dark:border-neutral-100' 
              : 'bg-transparent text-neutral-605 dark:text-neutral-400 border-neutral-200 dark:border-neutral-800 hover:border-neutral-450'
          }`}
        >
          All
        </button>
        {categories.map((cat) => (
          <button
            key={cat._id}
            onClick={() => handleCategoryFilter(cat.slug)}
            className={`text-[11px] px-3.5 py-1 uppercase tracking-wider font-semibold border rounded-lg transition-all duration-200 flex items-center gap-1.5 ${
              category === cat.slug 
                ? 'bg-neutral-900 text-white border-neutral-900 dark:bg-neutral-100 dark:text-black dark:border-neutral-100' 
                : 'bg-transparent text-neutral-605 dark:text-neutral-400 border-neutral-200 dark:border-neutral-800 hover:border-neutral-450'
            }`}
          >
            <span>{cat.name}</span>
            <span className={`text-[9px] px-1.5 rounded-md ${category === cat.slug ? 'bg-neutral-750 text-white dark:bg-neutral-200' : 'bg-neutral-100 dark:bg-neutral-900 text-neutral-455'}`}>
              {cat.postCount || 0}
            </span>
          </button>
        ))}
      </div>

      {/* Grid of Articles */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <SkeletonCard />
          <SkeletonCard />
          <SkeletonCard />
          <SkeletonCard />
          <SkeletonCard />
          <SkeletonCard />
        </div>
      ) : posts.length === 0 ? (
        <div className="py-24 flex flex-col justify-center items-center text-center gap-3">
          <div className="w-12 h-12 bg-neutral-100 dark:bg-neutral-900/50 border border-zinc-200/50 dark:border-zinc-850 flex items-center justify-center rounded-full text-neutral-400">
            <Inbox className="w-6 h-6" />
          </div>
          <p className="font-serif text-sm text-neutral-500 italic">
            No articles found matching the selected criteria.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {posts.map((post) => (
            <article key={post._id} className="article-card flex flex-col group p-4 border border-zinc-100 dark:border-zinc-900 bg-white/50 dark:bg-zinc-950/20 rounded-2xl hover:border-zinc-200 dark:hover:border-zinc-800 transition-all duration-300">
              {post.featuredImage && (
                <div className="overflow-hidden rounded-xl mb-4 aspect-[16/10] bg-neutral-100 dark:bg-neutral-900">
                  <Link href={`/post/${post.slug}`}>
                    <img
                      src={post.featuredImage}
                      alt=""
                      className="w-full h-full object-cover group-hover:scale-[1.01] transition-transform duration-350"
                      loading="lazy"
                    />
                  </Link>
                </div>
              )}
              <div className="flex-grow space-y-2">
                <span className="text-[9px] uppercase tracking-wider text-editorial-accent dark:text-editorial-gold font-bold">
                  {post.category?.name}
                </span>
                <Link href={`/post/${post.slug}`} className="block">
                  <h3 className="text-base font-bold leading-snug group-hover:text-editorial-accent dark:group-hover:text-editorial-gold transition-colors font-serif text-neutral-850 dark:text-neutral-100 line-clamp-2">
                    {post.title}
                  </h3>
                </Link>
                <p className="text-xs text-neutral-550 dark:text-neutral-400 leading-relaxed font-sans line-clamp-3">
                  {post.summary}
                </p>
              </div>
              <div className="flex items-center space-x-3 text-[10px] text-neutral-450 dark:text-neutral-500 font-sans pt-4 mt-4 border-t border-neutral-100 dark:border-neutral-900">
                {post.author?.profileImage ? (
                  <img src={post.author.profileImage} alt="" className="w-4 h-4 rounded-full object-cover" />
                ) : (
                  <div className="w-4 h-4 rounded-full bg-neutral-200 dark:bg-neutral-800 flex items-center justify-center font-bold text-[7px] uppercase text-neutral-500">
                    {(post.author?.name || "?")[0]}
                  </div>
                )}
                <span className="font-bold text-neutral-650 dark:text-neutral-400">By {post.author?.name}</span>
                <span>•</span>
                <span className="flex items-center"><Clock className="w-3.5 h-3.5 mr-1 text-editorial-accent" /> {post.readingTime} min read</span>
              </div>
            </article>
          ))}
        </div>
      )}

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="flex justify-between items-center pt-8 border-t border-neutral-200/60 dark:border-neutral-800/60">
          <button
            onClick={() => handlePageChange(page - 1)}
            disabled={page === 1}
            className="flex items-center text-xs text-neutral-600 dark:text-neutral-400 hover:text-editorial-accent dark:hover:text-editorial-gold transition-colors disabled:opacity-30 font-semibold"
          >
            <ChevronLeft className="w-4 h-4 mr-1" /> Previous
          </button>
          <span className="text-xs text-neutral-400 font-medium">
            Page {page} of {totalPages}
          </span>
          <button
            onClick={() => handlePageChange(page + 1)}
            disabled={page === totalPages}
            className="flex items-center text-xs text-neutral-600 dark:text-neutral-400 hover:text-editorial-accent dark:hover:text-editorial-gold transition-colors disabled:opacity-30 font-semibold"
          >
            Next <ChevronRight className="w-4 h-4 ml-1" />
          </button>
        </div>
      )}
    </div>
  );
}
