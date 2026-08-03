"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { postsAPI, categoriesAPI } from '../services/api';
import { 
  Clock, ArrowRight, Layers, Cpu, Layout, Brain, Shield, LineChart, 
  Activity, Trophy, Film, Compass, Globe, Book, Atom, MapPin, Utensils, Palette
} from 'lucide-react';
import SEOHead from '../components/SEOHead';
import { SkeletonCard, SkeletonLine } from '../components/Skeleton';
import { useAuth } from '../context/AuthContext';
import { motion } from 'framer-motion';
import BookmarkButton from '../components/BookmarkButton';
import NewsletterInline from '../components/NewsletterInline';

const getCategoryIcon = (slug: string) => {
  switch (slug) {
    case 'systems-engineering': return <Cpu className="w-3.5 h-3.5" />;
    case 'modern-design': return <Layout className="w-3.5 h-3.5" />;
    case 'artificial-intelligence': return <Brain className="w-3.5 h-3.5" />;
    case 'cyber-security-privacy': return <Shield className="w-3.5 h-3.5" />;
    case 'business-wealth': return <LineChart className="w-3.5 h-3.5" />;
    case 'health-neuroscience': return <Activity className="w-3.5 h-3.5" />;
    case 'sports-analytics': return <Trophy className="w-3.5 h-3.5" />;
    case 'entertainment-media': return <Film className="w-3.5 h-3.5" />;
    case 'social-lifestyle': return <Compass className="w-3.5 h-3.5" />;
    case 'news-geopolitics': return <Globe className="w-3.5 h-3.5" />;
    case 'literature-philosophy': return <Book className="w-3.5 h-3.5" />;
    case 'science-future-tech': return <Atom className="w-3.5 h-3.5" />;
    case 'travel-exploration': return <MapPin className="w-3.5 h-3.5" />;
    case 'food-gastronomy': return <Utensils className="w-3.5 h-3.5" />;
    case 'arts-culture': return <Palette className="w-3.5 h-3.5" />;
    default: return <Layers className="w-3.5 h-3.5" />;
  }
};

const DEFAULT_FEATURED_POST = {
  _id: 'default-lead-story',
  title: 'Architecting High-Throughput Distributed Systems with Zero Memory Allocations',
  slug: 'architecting-high-throughput-distributed-systems',
  summary: 'An architectural deep-dive into zero-copy networking, off-heap memory management, and deterministic latency bounds in modern distributed engines.',
  featuredImage: 'https://images.unsplash.com/photo-1513542789411-b6a5d4f31634?auto=format&fit=crop&w=800&q=80',
  category: { name: 'Systems Engineering', slug: 'systems-engineering' },
  author: { name: 'Dr. Elena Rostova' },
  readingTime: 8,
  publishedAt: new Date().toISOString()
};

const DEFAULT_TRENDING = [
  {
    _id: 't-1',
    title: 'Formal Verification of Concurrent Rust Kernel Primitives',
    slug: 'formal-verification-rust-kernel',
    category: { name: 'Systems Engineering' },
    author: { name: 'Marcus Vance' },
    readingTime: 6
  },
  {
    _id: 't-2',
    title: 'Quantizing 70B Parameter LLMs to 2-Bit Precision Without Loss',
    slug: 'quantizing-70b-parameter-llms',
    category: { name: 'Artificial Intelligence' },
    author: { name: 'Sofia Chen' },
    readingTime: 9
  },
  {
    _id: 't-3',
    title: 'Zero-Knowledge Proofs in Practice: Circuit Design Patterns',
    slug: 'zero-knowledge-proofs-circuit-design',
    category: { name: 'Cyber Security' },
    author: { name: 'Liam Thorne' },
    readingTime: 7
  },
  {
    _id: 't-4',
    title: 'The Design System Architecture Behind High-Density Interfaces',
    slug: 'design-system-architecture-interfaces',
    category: { name: 'Modern Design' },
    author: { name: 'Claire Dubois' },
    readingTime: 5
  }
];

export default function Home() {
  const { user } = useAuth();
  const [featuredPost, setFeaturedPost] = useState<any>(DEFAULT_FEATURED_POST);
  const [trendingPosts, setTrendingPosts] = useState<any[]>(DEFAULT_TRENDING);
  const [latestPosts, setLatestPosts] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeCategory, setActiveCategory] = useState('all');

  useEffect(() => {
    const fetchHomeContent = async () => {
      try {
        const [featuredRes, latestRes, catRes] = await Promise.all([
          postsAPI.getPosts({ featured: 'true', limit: 1 }),
          postsAPI.getPosts({ limit: 45 }),
          categoriesAPI.getCategories()
        ]);

        let allPosts: any[] = [];
        if (latestRes.data.success && Array.isArray(latestRes.data.posts) && latestRes.data.posts.length > 0) {
          allPosts = latestRes.data.posts;
          setLatestPosts(allPosts);
          setTrendingPosts(allPosts.slice(0, 4));
        }

        if (featuredRes.data.success && Array.isArray(featuredRes.data.posts) && featuredRes.data.posts.length > 0) {
          setFeaturedPost(featuredRes.data.posts[0]);
        } else if (allPosts.length > 0) {
          setFeaturedPost(allPosts[0]);
        }

        if (catRes.data.success && Array.isArray(catRes.data.categories) && catRes.data.categories.length > 0) {
          setCategories(catRes.data.categories);
        }
      } catch (err: any) {
        console.error('Home page loading error:', err.message);
      }
    };

    fetchHomeContent();
  }, []);

  const filteredPosts = activeCategory === 'all' 
    ? (latestPosts.length > 0 ? latestPosts : [DEFAULT_FEATURED_POST])
    : latestPosts.filter(p => p.category?.slug === activeCategory || p.category === activeCategory);

  return (
    <div className="space-y-12 pb-16">
      <SEOHead
        title="Bylines Journal — Technical & Editorial Publishing"
        description="Expert-driven engineering papers, technical journalism, and research reports covering systems architecture, AI models, cybersecurity, and design."
      />

      {/* ------------------------------------------------------------- */}
      {/* CLASSIC HUMAN MASTHEAD & HERO SECTION                         */}
      {/* ------------------------------------------------------------- */}
      <section className="pt-2 pb-8 border-b border-zinc-200 dark:border-zinc-800 space-y-6">
        
        {/* Editorial Date & Masthead Bar */}
        <div className="flex flex-wrap items-center justify-between text-[11px] font-mono tracking-tight text-neutral-500 dark:text-neutral-400 border-b border-zinc-150 dark:border-zinc-850 pb-3">
          <span>Vol. IV · No. 32</span>
          <span>Monday, August 3, 2026</span>
          <span className="hidden sm:inline">Independent Technical Publishing</span>
        </div>

        {/* Daily News Briefing Ticker Ribbon */}
        <div className="flex flex-wrap items-center justify-between gap-3 p-3 rounded-xl bg-neutral-900 dark:bg-zinc-950 text-white border border-neutral-800 shadow-sm text-xs font-sans">
          <div className="flex items-center gap-2.5">
            <span className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-editorial-accent/20 text-editorial-gold font-mono font-bold text-[9px] uppercase tracking-wider">
              <span className="w-1.5 h-1.5 rounded-full bg-editorial-gold animate-pulse" />
              Daily Wire
            </span>
            <span className="text-[11px] font-sans text-zinc-300 font-medium truncate max-w-lg">
              Open-Weights 14B Reasoning Models Achieve 94% MATH Benchmark · Linux 6.14 Merges Zero-Copy Sockets
            </span>
          </div>

          <Link 
            href="/daily-news" 
            className="flex items-center gap-1 text-[11px] font-mono font-semibold text-editorial-gold hover:underline"
          >
            <span>Read Today&apos;s Dispatch</span>
            <ArrowRight className="w-3 h-3" />
          </Link>
        </div>

        {/* Primary SEO H1 & Publication Headline */}
        <div className="space-y-3 max-w-4xl pt-2">
          <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-neutral-400 dark:text-neutral-500">
            Technical Essays & Inquiries
          </span>

          {/* Unique SEO H1 Headline */}
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-serif font-bold text-neutral-900 dark:text-neutral-50 tracking-tight leading-tight">
            Independent Technical Reporting, Systems Research & Essays
          </h1>

          <p className="text-base sm:text-lg font-serif italic text-neutral-600 dark:text-neutral-400 max-w-3xl leading-relaxed">
            Longform essays, machine learning teardowns, security research, and design principles—written by practicing engineers, researchers, and journalists.
          </p>
        </div>

        {/* Lead Story Bento Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 pt-4">
          
          {/* Main Lead Essay (8 Cols) */}
          <div className="lg:col-span-8">
            {featuredPost ? (
              <motion.article 
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className="group flex flex-col justify-between border border-zinc-200 dark:border-zinc-800 rounded-2xl bg-white dark:bg-zinc-950 p-6 shadow-sm hover:shadow-md transition-all duration-200"
              >
                {featuredPost.featuredImage && (
                  <div className="overflow-hidden rounded-xl aspect-[16/9] mb-5 bg-neutral-100 dark:bg-zinc-900">
                    <Link href={`/post/${featuredPost.slug}`}>
                      <img
                        src={featuredPost.featuredImage}
                        alt={featuredPost.title}
                        className="w-full h-full object-cover group-hover:scale-[1.01] transition-transform duration-500"
                        fetchPriority="high"
                      />
                    </Link>
                  </div>
                )}

                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono uppercase tracking-widest font-semibold text-editorial-accent dark:text-editorial-gold">
                      {featuredPost.category?.name || 'Featured Essay'}
                    </span>
                    <BookmarkButton
                      postId={featuredPost._id}
                      postTitle={featuredPost.title}
                      postSlug={featuredPost.slug}
                      size="sm"
                    />
                  </div>

                  <Link href={`/post/${featuredPost.slug}`} className="block">
                    <h2 className="text-xl sm:text-2xl font-serif font-bold text-neutral-900 dark:text-neutral-50 group-hover:text-editorial-accent dark:group-hover:text-editorial-gold transition-colors leading-snug">
                      {featuredPost.title}
                    </h2>
                  </Link>

                  <p className="text-xs sm:text-sm font-sans text-neutral-600 dark:text-neutral-400 line-clamp-3 leading-relaxed">
                    {featuredPost.summary}
                  </p>

                  <div className="flex items-center justify-between text-[11px] text-neutral-500 dark:text-neutral-400 pt-3 border-t border-zinc-100 dark:border-zinc-900 font-sans">
                    <span className="font-medium">By {featuredPost.author?.name || 'Byline Desk'}</span>
                    <span className="flex items-center gap-1 font-mono text-[10px]">
                      <Clock className="w-3 h-3 text-editorial-accent" />
                      {featuredPost.readingTime || 5} min read
                    </span>
                  </div>
                </div>
              </motion.article>
            ) : (
              <div className="h-[400px] rounded-2xl bg-neutral-100 dark:bg-zinc-900 animate-pulse flex items-center justify-center text-xs text-neutral-400 font-serif">
                Loading Lead Publication...
              </div>
            )}
          </div>

          {/* Selected Reading Stream (4 Cols) */}
          <div className="lg:col-span-4 space-y-5">
            <div className="border border-zinc-200 dark:border-zinc-800 rounded-2xl p-5 bg-white dark:bg-zinc-950 space-y-4 shadow-sm">
              <div className="border-b border-zinc-150 dark:border-zinc-850 pb-2.5">
                <h3 className="text-xs font-serif font-bold text-neutral-900 dark:text-neutral-100">
                  Selected Reading
                </h3>
              </div>

              <div className="space-y-4 divide-y divide-zinc-100 dark:divide-zinc-900">
                {trendingPosts.map((post, idx) => (
                  <div key={post._id || idx} className="pt-3.5 first:pt-0 space-y-1 group">
                    <span className="text-[10px] font-mono text-neutral-400 block">
                      {String(idx + 1).padStart(2, '0')} · {post.category?.name}
                    </span>
                    <Link href={`/post/${post.slug}`} className="block">
                      <h4 className="text-xs sm:text-sm font-serif font-bold text-neutral-900 dark:text-neutral-100 group-hover:text-editorial-accent dark:group-hover:text-editorial-gold transition-colors leading-snug line-clamp-2">
                        {post.title}
                      </h4>
                    </Link>
                    <span className="text-[10px] text-neutral-500 font-sans block pt-0.5">
                      By {post.author?.name || 'Byline Desk'}
                    </span>
                  </div>
                ))}
              </div>

              <Link 
                href="/posts" 
                className="inline-flex items-center justify-center w-full gap-2 text-xs py-2 px-3 rounded-lg bg-neutral-100 dark:bg-zinc-900 hover:bg-neutral-200 dark:hover:bg-zinc-800 font-semibold transition-colors text-neutral-800 dark:text-neutral-200 mt-2"
              >
                <span>View Archive</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ------------------------------------------------------------- */}
      {/* CATEGORY STREAM                                               */}
      {/* ------------------------------------------------------------- */}
      <section className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-200 dark:border-zinc-800 pb-3">
          <h2 className="text-lg font-serif font-bold text-neutral-900 dark:text-neutral-100">
            Recent Publications
          </h2>

          {/* Minimal Category Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 no-scrollbar">
            <button
              onClick={() => setActiveCategory('all')}
              className={`px-3 py-1 rounded-md text-xs font-sans transition-colors ${
                activeCategory === 'all'
                  ? 'bg-neutral-900 text-white dark:bg-white dark:text-black font-semibold'
                  : 'text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-zinc-900'
              }`}
            >
              All
            </button>
            {categories.slice(0, 6).map((cat) => (
              <button
                key={cat._id}
                onClick={() => setActiveCategory(cat.slug)}
                className={`px-3 py-1 rounded-md text-xs font-sans whitespace-nowrap transition-colors flex items-center gap-1.5 ${
                  activeCategory === cat.slug
                    ? 'bg-neutral-900 text-white dark:bg-white dark:text-black font-semibold'
                    : 'text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-zinc-900'
                }`}
              >
                {getCategoryIcon(cat.slug)}
                <span>{cat.name}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Clean Article Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
          </div>
        ) : filteredPosts.length === 0 ? (
          <div className="py-12 text-center text-xs text-neutral-500 font-serif italic border border-dashed border-zinc-200 dark:border-zinc-800 rounded-xl">
            No articles found in this category section yet.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredPosts.slice(0, 9).map((post) => (
              <article 
                key={post._id} 
                className="flex flex-col justify-between group border border-zinc-200/80 dark:border-zinc-850 p-4 rounded-xl bg-white dark:bg-zinc-950 hover:border-zinc-300 dark:hover:border-zinc-700 transition-all duration-200"
              >
                <div className="space-y-3">
                  {post.featuredImage && (
                    <div className="overflow-hidden rounded-lg aspect-[16/10] bg-neutral-100 dark:bg-zinc-900">
                      <Link href={`/post/${post.slug}`}>
                        <img
                          src={post.featuredImage}
                          alt={post.title}
                          className="w-full h-full object-cover group-hover:scale-[1.01] transition-transform duration-300"
                        />
                      </Link>
                    </div>
                  )}

                  <div className="space-y-1.5">
                    <span className="text-[10px] font-mono uppercase text-editorial-accent dark:text-editorial-gold font-semibold">
                      {post.category?.name || 'Essay'}
                    </span>

                    <Link href={`/post/${post.slug}`} className="block">
                      <h3 className="text-sm sm:text-base font-serif font-bold text-neutral-900 dark:text-neutral-100 group-hover:text-editorial-accent dark:group-hover:text-editorial-gold transition-colors leading-snug line-clamp-2">
                        {post.title}
                      </h3>
                    </Link>

                    <p className="text-xs text-neutral-600 dark:text-neutral-400 font-sans line-clamp-3 leading-relaxed">
                      {post.summary}
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-between text-[10px] text-neutral-500 dark:text-neutral-400 font-sans pt-3 mt-4 border-t border-zinc-100 dark:border-zinc-900">
                  <span>By {post.author?.name || 'Byline Desk'}</span>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-[9px]">{post.readingTime || 5}m</span>
                    <BookmarkButton
                      postId={post._id}
                      postTitle={post.title}
                      postSlug={post.slug}
                      size="sm"
                    />
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>

      {/* ------------------------------------------------------------- */}
      {/* NEWSLETTER SUBSCRIPTION SECTION                               */}
      {/* ------------------------------------------------------------- */}
      <NewsletterInline />
    </div>
  );
}
