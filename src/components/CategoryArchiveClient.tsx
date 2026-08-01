"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { postsAPI, categoriesAPI } from '../services/api';
import { 
  Clock, ArrowLeft, Layers, Cpu, Layout, Brain, 
  Shield, LineChart, Activity, Trophy, Film, Compass, Globe, 
  Book, Atom, MapPin, Utensils, Palette 
} from 'lucide-react';
import SEOHead from './SEOHead';
import { CollectionPageJSONLD, BreadcrumbJSONLD } from './JSONLD';
import BookmarkButton from './BookmarkButton';
import { motion } from 'framer-motion';

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || 
  (process.env.NEXT_PUBLIC_VERCEL_URL ? `https://${process.env.NEXT_PUBLIC_VERCEL_URL}` : 'https://bylines.dev');

const getCategoryIcon = (slug: string) => {
  switch (slug) {
    case 'systems-engineering': return <Cpu className="w-6 h-6 text-blue-500" />;
    case 'modern-design': return <Layout className="w-6 h-6 text-purple-500" />;
    case 'artificial-intelligence': return <Brain className="w-6 h-6 text-emerald-500" />;
    case 'cyber-security-privacy': return <Shield className="w-6 h-6 text-red-500" />;
    case 'business-wealth': return <LineChart className="w-6 h-6 text-amber-500" />;
    case 'health-neuroscience': return <Activity className="w-6 h-6 text-teal-500" />;
    case 'sports-analytics': return <Trophy className="w-6 h-6 text-orange-500" />;
    case 'entertainment-media': return <Film className="w-6 h-6 text-pink-500" />;
    case 'social-lifestyle': return <Compass className="w-6 h-6 text-indigo-500" />;
    case 'news-geopolitics': return <Globe className="w-6 h-6 text-cyan-500" />;
    case 'literature-philosophy': return <Book className="w-6 h-6 text-yellow-500" />;
    case 'science-future-tech': return <Atom className="w-6 h-6 text-sky-500" />;
    case 'travel-exploration': return <MapPin className="w-6 h-6 text-emerald-600" />;
    case 'food-gastronomy': return <Utensils className="w-6 h-6 text-rose-500" />;
    case 'arts-culture': return <Palette className="w-6 h-6 text-fuchsia-500" />;
    default: return <Layers className="w-6 h-6 text-editorial-accent" />;
  }
};

export default function CategoryArchiveClient({ slug }: { slug: string }) {
  const [posts, setPosts] = useState<any[]>([]);
  const [currentCategory, setCurrentCategory] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCategoryPosts = async () => {
      if (!slug) return;
      setLoading(true);
      try {
        const catRes = await categoriesAPI.getCategories();
        if (catRes.data.success) {
          const matched = catRes.data.categories.find((c: any) => c.slug === slug);
          setCurrentCategory(matched || { name: slug.replace(/-/g, ' '), description: '' });
        }

        const postsRes = await postsAPI.getPosts({ category: slug, status: 'published', limit: 30 });
        if (postsRes.data.success) {
          setPosts(postsRes.data.posts);
        }
      } catch (err: any) {
        console.error('Category archive load error:', err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchCategoryPosts();
  }, [slug]);

  const catUrl = `${BASE_URL}/category/${slug}`;

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center space-y-4">
        <SEOHead title="Loading Section Archive" />
        <div className="animate-pulse font-serif text-sm tracking-widest text-neutral-400 uppercase">
          Loading section archive...
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      <SEOHead 
        title={currentCategory?.name ? `${currentCategory.name} Section Archive` : 'Category Stream'} 
        description={currentCategory?.description || `Explore published articles and research papers in ${currentCategory?.name || 'this category'}.`}
        url={catUrl}
        type="website"
      />
      <CollectionPageJSONLD
        name={currentCategory?.name || 'Publication Section'}
        description={currentCategory?.description || 'Browse curated articles and reports.'}
        url={catUrl}
      />
      <BreadcrumbJSONLD
        items={[
          { name: "Home", url: BASE_URL },
          { name: "Categories", url: `${BASE_URL}/category` },
          { name: currentCategory?.name || "Category", url: catUrl },
        ]}
      />

      {/* Back Navigation */}
      <div>
        <Link 
          href="/category" 
          className="inline-flex items-center gap-2 text-xs font-semibold text-neutral-500 hover:text-editorial-accent dark:hover:text-editorial-gold transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>All Editorial Sections</span>
        </Link>
      </div>

      {/* Category Hero Header */}
      {currentCategory && (
        <div className="p-8 sm:p-10 rounded-3xl bg-gradient-to-br from-white via-neutral-50 to-neutral-100 dark:from-zinc-900 dark:via-zinc-950 dark:to-zinc-900 border border-neutral-200/80 dark:border-zinc-800 shadow-lg space-y-4 relative overflow-hidden">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-3.5 rounded-2xl bg-neutral-100 dark:bg-zinc-800 shadow-inner">
                {getCategoryIcon(slug)}
              </div>
              <span className="text-xs uppercase font-extrabold text-editorial-accent dark:text-editorial-gold tracking-widest px-3 py-1 bg-editorial-accent/10 dark:bg-editorial-gold/10 rounded-full">
                Editorial Stream
              </span>
            </div>
            <span className="text-xs font-semibold text-neutral-500 dark:text-neutral-400 bg-white/80 dark:bg-zinc-800 px-3 py-1.5 rounded-full border border-neutral-200 dark:border-zinc-700">
              {posts.length} Published {posts.length === 1 ? 'Article' : 'Articles'}
            </span>
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold font-serif text-neutral-900 dark:text-neutral-50 tracking-tight">
            {currentCategory.name}
          </h1>

          {currentCategory.description && (
            <p className="text-sm sm:text-base text-neutral-600 dark:text-neutral-400 max-w-3xl font-serif italic leading-relaxed">
              {currentCategory.description}
            </p>
          )}
        </div>
      )}

      {/* Article Cards Grid */}
      {posts.length === 0 ? (
        <div className="py-20 text-center text-sm text-neutral-500 font-serif italic bg-white dark:bg-zinc-900/50 rounded-2xl border border-neutral-200 dark:border-zinc-800">
          No articles published in this category yet. Check back soon for fresh editorial reports!
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {posts.map((post) => (
            <motion.article 
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              key={post._id} 
              className="flex flex-col justify-between group border border-zinc-200/70 dark:border-zinc-850 p-5 rounded-3xl bg-white dark:bg-zinc-950/60 hover:border-editorial-accent/50 dark:hover:border-editorial-gold/50 shadow-sm hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
            >
              <div className="space-y-3">
                {post.featuredImage && (
                  <div className="overflow-hidden rounded-2xl aspect-[16/10] bg-neutral-100 dark:bg-neutral-900">
                    <Link href={`/post/${post.slug}`}>
                      <img
                        src={post.featuredImage}
                        alt={post.title || "Category article cover"}
                        className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-500"
                      />
                    </Link>
                  </div>
                )}

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[9px] uppercase tracking-widest font-extrabold text-editorial-accent dark:text-editorial-gold">
                      {post.category?.name || currentCategory?.name}
                    </span>
                    {post.isPremium && (
                      <span className="px-2 py-0.5 bg-amber-500 text-white text-[8px] font-bold rounded uppercase">
                        Premium
                      </span>
                    )}
                  </div>

                  <Link href={`/post/${post.slug}`} className="block">
                    <h3 className="text-base font-bold leading-snug group-hover:text-editorial-accent dark:group-hover:text-editorial-gold transition-colors font-serif text-neutral-900 dark:text-neutral-50 line-clamp-2">
                      {post.title}
                    </h3>
                  </Link>

                  <p className="text-xs text-neutral-600 dark:text-neutral-400 leading-relaxed font-sans line-clamp-3">
                    {post.summary}
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-between text-[10px] text-neutral-500 dark:text-neutral-400 font-sans pt-4 mt-4 border-t border-neutral-100 dark:border-neutral-900">
                <span className="font-medium">By {post.author?.name || 'Byline Desk'}</span>
                <div className="flex items-center gap-3">
                  <span className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-editorial-accent" />
                    {post.readingTime} min
                  </span>
                  <BookmarkButton
                    postId={post._id}
                    postTitle={post.title}
                    postSlug={post.slug}
                    size="sm"
                  />
                </div>
              </div>
            </motion.article>
          ))}
        </div>
      )}
    </div>
  );
}
