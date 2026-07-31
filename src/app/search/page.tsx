"use client";

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { postsAPI, categoriesAPI, tagsAPI } from '../../services/api';
import { Clock, Search, SlidersHorizontal, Eye } from 'lucide-react';
import SEOHead from '../../components/SEOHead';

function SearchContent() {
  const searchParams = useSearchParams();
  const query = searchParams.get('q') || '';
  
  const [posts, setPosts] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [tags, setTags] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters State
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedTag, setSelectedTag] = useState('');
  const [sortBy, setSortBy] = useState('latest');

  // Fetch filter metadata on mount
  useEffect(() => {
    const fetchFilterMetadata = async () => {
      try {
        const catRes = await categoriesAPI.getCategories();
        if (catRes.data.success) {
          setCategories(catRes.data.categories);
        }
        const tagRes = await tagsAPI.getTags();
        if (tagRes.data.success) {
          setTags(tagRes.data.tags);
        }
      } catch (err: any) {
        console.error('Failed to load filter metadata:', err.message);
      }
    };
    fetchFilterMetadata();
  }, []);

  // Fetch search results with filters
  useEffect(() => {
    const fetchSearchResults = async () => {
      if (!query.trim()) {
        setLoading(false);
        return;
      }

      setLoading(true);
      try {
        const params: any = { search: query, status: 'published', limit: 30 };
        if (selectedCategory) {
          params.category = selectedCategory;
        }
        if (selectedTag) {
          params.tag = selectedTag;
        }

        const response = await postsAPI.getPosts(params);
        if (response.data.success) {
          let results = response.data.posts;
          
          if (sortBy === 'liked') {
            results.sort((a: any, b: any) => (b.likesCount || 0) - (a.likesCount || 0));
          } else if (sortBy === 'views') {
            results.sort((a: any, b: any) => (b.viewsCount || 0) - (a.viewsCount || 0));
          }
          
          setPosts(results);
        }
      } catch (err: any) {
        console.error('Search results error:', err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchSearchResults();
  }, [query, selectedCategory, selectedTag, sortBy]);

  return (
    <div className="space-y-8">
      <SEOHead 
        title={query ? `Search: "${query}"` : 'Search Articles'} 
        description="Search articles and filter by category or tag."
      />

      {/* Header Toolbar */}
      <div className="border-b border-zinc-200/50 dark:border-zinc-900 pb-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-neutral-100 dark:bg-neutral-900 rounded-xl">
            <Search className="w-5 h-5 text-neutral-500" />
          </div>
          <div>
            <span className="text-[10px] uppercase font-bold text-neutral-450 tracking-widest">
              Search Results
            </span>
            <h1 className="text-xl font-bold font-serif leading-tight mt-0.5 text-neutral-900 dark:text-neutral-50">
              {query ? `Search: “${query}”` : 'Search Articles'}
            </h1>
          </div>
        </div>

        {query.trim() && (
          <div className="flex items-center space-x-2 text-xs">
            <span className="text-neutral-400 font-sans uppercase text-[9px] tracking-wider font-semibold">Sort by:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="text-xs bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-lg px-2 py-1.5 focus:outline-none dark:text-neutral-200"
            >
              <option value="latest">Latest</option>
              <option value="views">Most Viewed</option>
              <option value="liked">Most Liked</option>
            </select>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Sidebar Filters */}
        <div className="lg:col-span-3 space-y-6">
          <div className="flex items-center gap-1.5 border-b border-neutral-150 dark:border-neutral-900 pb-2">
            <SlidersHorizontal className="w-3.5 h-3.5 text-neutral-450" />
            <h3 className="text-xs uppercase tracking-wider font-bold text-neutral-850 dark:text-neutral-100">Filters</h3>
          </div>

          {/* Categories */}
          <div className="space-y-2 border-b border-neutral-100 dark:border-neutral-900 pb-5">
            <h4 className="text-[10px] uppercase tracking-widest font-extrabold text-neutral-400">Sections</h4>
            <div className="flex flex-wrap lg:flex-col gap-1 pt-1">
              <button
                onClick={() => setSelectedCategory('')}
                className={`text-left text-xs px-2.5 py-1.5 rounded-lg transition-colors ${!selectedCategory ? 'bg-neutral-900 text-white dark:bg-neutral-100 dark:text-black font-semibold' : 'hover:bg-neutral-50 dark:hover:bg-neutral-900/50 text-neutral-650 dark:text-neutral-400'}`}
              >
                All Categories
              </button>
              {categories.map((cat) => (
                <button
                  key={cat._id}
                  onClick={() => setSelectedCategory(cat.slug)}
                  className={`text-left text-xs px-2.5 py-1.5 rounded-lg transition-colors truncate ${selectedCategory === cat.slug ? 'bg-neutral-900 text-white dark:bg-neutral-100 dark:text-black font-semibold' : 'hover:bg-neutral-50 dark:hover:bg-neutral-900/50 text-neutral-650 dark:text-neutral-400'}`}
                >
                  {cat.name}
                </button>
              ))}
            </div>
          </div>

          {/* Tags */}
          <div className="space-y-2">
            <h4 className="text-[10px] uppercase tracking-widest font-extrabold text-neutral-400">Popular Tags</h4>
            <div className="flex flex-wrap gap-1.5 pt-1">
              <button
                onClick={() => setSelectedTag('')}
                className={`text-[9px] px-2.5 py-0.5 rounded-full border transition-colors ${!selectedTag ? 'bg-neutral-900 text-white border-neutral-900 dark:bg-neutral-100 dark:text-black dark:border-neutral-100 font-semibold' : 'border-neutral-200 dark:border-neutral-800 text-neutral-650 dark:text-neutral-400 hover:bg-neutral-50 dark:hover:bg-neutral-900'}`}
              >
                all tags
              </button>
              {tags.slice(0, 8).map((t) => (
                <button
                  key={t._id}
                  onClick={() => setSelectedTag(t.slug)}
                  className={`text-[9px] px-2.5 py-0.5 rounded-full border transition-colors ${selectedTag === t.slug ? 'bg-neutral-900 text-white border-neutral-900 dark:bg-neutral-100 dark:text-black dark:border-neutral-100 font-semibold' : 'border-neutral-200 dark:border-neutral-800 text-neutral-650 dark:text-neutral-400 hover:bg-neutral-50 dark:hover:bg-neutral-900'}`}
                >
                  #{t.name}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Results Feed */}
        <div className="lg:col-span-9 space-y-6">
          {loading ? (
            <div className="flex justify-center items-center py-24">
              <div className="animate-pulse font-serif text-xs tracking-widest text-neutral-400 uppercase">
                Searching archives...
              </div>
            </div>
          ) : !query.trim() ? (
            <div className="py-24 text-center text-xs text-neutral-500 italic">
              Enter a search term in the navigation bar to query articles.
            </div>
          ) : posts.length === 0 ? (
            <div className="py-24 text-center text-xs text-neutral-500 border border-dashed border-zinc-200 dark:border-zinc-800 rounded-3xl bg-neutral-50/20">
              No publications matched your current filter criteria. Try using broader keywords.
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center justify-between text-[9px] text-neutral-400 uppercase font-semibold pb-1.5 border-b border-neutral-100 dark:border-neutral-900">
                <span>Displaying {posts.length} matched article(s)</span>
                {(selectedCategory || selectedTag) && (
                  <button
                    onClick={() => {
                      setSelectedCategory('');
                      setSelectedTag('');
                    }}
                    className="text-editorial-accent dark:text-editorial-gold font-bold hover:underline"
                  >
                    Clear Filter Tags
                  </button>
                )}
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {posts.map((post) => (
                  <article key={post._id} className="flex flex-col group border border-zinc-200/40 dark:border-zinc-850 p-4 rounded-3xl bg-white dark:bg-zinc-950 transition-all hover:-translate-y-1 hover:shadow-xl">
                    {post.featuredImage && (
                      <div className="overflow-hidden rounded-2xl mb-4 aspect-[16/10] bg-neutral-100 dark:bg-neutral-900">
                        <Link href={`/post/${post.slug}`}>
                          <img
                            src={post.featuredImage}
                            alt=""
                            className="w-full h-full object-cover group-hover:scale-[1.02] transition-transform duration-500"
                          />
                        </Link>
                      </div>
                    )}
                    <div className="flex-grow space-y-1.5">
                      <div className="flex justify-between items-center text-[9px] uppercase tracking-wider text-editorial-accent font-bold">
                        <span>{post.category?.name}</span>
                        {post.isPremium && <span className="text-[8px] bg-amber-50 text-amber-650 dark:bg-amber-950/20 px-2 py-0.5 rounded-full font-bold">Premium</span>}
                      </div>
                      <Link href={`/post/${post.slug}`} className="block">
                        <h3 className="text-xs font-bold leading-snug group-hover:text-editorial-accent transition-colors font-serif text-neutral-850 dark:text-neutral-100 line-clamp-2">
                          {post.title}
                        </h3>
                      </Link>
                      <p className="text-[11px] text-neutral-500 dark:text-neutral-450 leading-relaxed font-sans line-clamp-3">
                        {post.summary}
                      </p>
                    </div>
                    <div className="flex items-center justify-between text-[9px] text-neutral-450 font-sans pt-3 mt-3 border-t border-neutral-100 dark:border-neutral-900">
                      <span>By {post.author?.name}</span>
                      <span className="flex items-center"><Clock className="w-3.5 h-3.5 mr-1" /> {post.readingTime} min</span>
                    </div>
                  </article>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function SearchResults() {
  return (
    <Suspense fallback={
      <div className="py-20 text-center text-xs text-neutral-405">
        Loading search portal...
      </div>
    }>
      <SearchContent />
    </Suspense>
  );
}
