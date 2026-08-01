"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { postsAPI, categoriesAPI } from '../services/api';
import { 
  Clock, ChevronRight, ArrowUpRight, Sparkles, TrendingUp, Eye, Award, User, 
  Layers, ArrowRight, Cpu, Layout, Brain, Shield, LineChart, Activity, 
  Trophy, Film, Compass, Globe, Book, Atom, MapPin, Utensils, Palette,
  Zap, Compass as CompassIcon, ShieldCheck, Flame, BookOpen
} from 'lucide-react';
import SEOHead from '../components/SEOHead';
import { SkeletonCard, SkeletonLine } from '../components/Skeleton';
import { useToast } from '../context/ToastContext';
import { useAuth } from '../context/AuthContext';
import { useGeolocation } from '../hooks/useGeolocation';
import { motion, AnimatePresence } from 'framer-motion';
import BookmarkButton from '../components/BookmarkButton';
import NewsletterInline from '../components/NewsletterInline';

const getCategoryIcon = (slug: string) => {
  switch (slug) {
    case 'systems-engineering': return <Cpu className="w-4 h-4 text-blue-500" />;
    case 'modern-design': return <Layout className="w-4 h-4 text-purple-500" />;
    case 'artificial-intelligence': return <Brain className="w-4 h-4 text-emerald-500" />;
    case 'cyber-security-privacy': return <Shield className="w-4 h-4 text-red-500" />;
    case 'business-wealth': return <LineChart className="w-4 h-4 text-amber-500" />;
    case 'health-neuroscience': return <Activity className="w-4 h-4 text-teal-500" />;
    case 'sports-analytics': return <Trophy className="w-4 h-4 text-orange-500" />;
    case 'entertainment-media': return <Film className="w-4 h-4 text-pink-500" />;
    case 'social-lifestyle': return <Compass className="w-4 h-4 text-indigo-500" />;
    case 'news-geopolitics': return <Globe className="w-4 h-4 text-cyan-500" />;
    case 'literature-philosophy': return <Book className="w-4 h-4 text-yellow-500" />;
    case 'science-future-tech': return <Atom className="w-4 h-4 text-sky-500" />;
    case 'travel-exploration': return <MapPin className="w-4 h-4 text-emerald-600" />;
    case 'food-gastronomy': return <Utensils className="w-4 h-4 text-rose-500" />;
    case 'arts-culture': return <Palette className="w-4 h-4 text-fuchsia-500" />;
    default: return <Layers className="w-4 h-4 text-editorial-accent" />;
  }
};

export default function Home() {
  const { user } = useAuth();
  const [featuredPost, setFeaturedPost] = useState<any>(null);
  const [trendingPosts, setTrendingPosts] = useState<any[]>([]);
  const [latestPosts, setLatestPosts] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [editorsPicks, setEditorsPicks] = useState<any[]>([]);
  const [authors, setAuthors] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState('all');
  const geo = useGeolocation();

  useEffect(() => {
    const fetchHomeContent = async () => {
      try {
        const [featuredRes, latestRes, catRes] = await Promise.all([
          postsAPI.getPosts({ featured: 'true', limit: 1 }),
          postsAPI.getPosts({ limit: 45 }),
          categoriesAPI.getCategories()
        ]);

        let allPosts: any[] = [];
        if (latestRes.data.success) {
          allPosts = latestRes.data.posts;
          setLatestPosts(allPosts);
          setEditorsPicks(allPosts.slice(2, 5));
          setTrendingPosts(allPosts.slice(0, 8));
        }

        if (featuredRes.data.success && featuredRes.data.posts.length > 0) {
          setFeaturedPost(featuredRes.data.posts[0]);
        } else if (allPosts.length > 0) {
          setFeaturedPost(allPosts[0]);
        }

        if (catRes.data.success) {
          setCategories(catRes.data.categories);
        }

        const writers: any[] = [];
        const writerIds = new Set();
        allPosts.forEach((p: any) => {
          if (p.author && !writerIds.has(p.author._id)) {
            writerIds.add(p.author._id);
            writers.push(p.author);
          }
        });
        setAuthors(writers.slice(0, 5));
      } catch (err: any) {
        console.error('Home page loading error:', err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchHomeContent();
  }, []);

  const filteredPosts = activeCategory === 'all' 
    ? latestPosts 
    : latestPosts.filter(p => p.category?.slug === activeCategory || p.category === activeCategory);

  return (
    <div className="space-y-16 relative pb-12">
      <SEOHead
        title="Bylines Journal — Technical & Editorial Publishing"
        description="Expert-driven engineering papers, technical journalism, and research reports covering systems architecture, AI models, cybersecurity, and design."
      />

      {/* ------------------------------------------------------------- */}
      {/* WORLD-CLASS REDESIGNED HERO SECTION (High-Impact & 100% SEO)   */}
      {/* ------------------------------------------------------------- */}
      <section className="relative overflow-hidden pt-2 pb-6 space-y-8 border-b border-zinc-200/80 dark:border-zinc-850">
        {/* Ambient Glow Orbs for Modern Aesthetics */}
        <div className="absolute top-[-10%] left-[-15%] w-[600px] h-[600px] rounded-full bg-gradient-to-tr from-indigo-500/10 via-editorial-accent/10 to-transparent blur-[140px] pointer-events-none" />
        <div className="absolute top-[20%] right-[-10%] w-[500px] h-[500px] rounded-full bg-gradient-to-bl from-amber-500/10 via-rose-500/5 to-transparent blur-[120px] pointer-events-none" />

        {/* Live Newsroom Top Status Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 p-3.5 rounded-2xl bg-white/70 dark:bg-zinc-950/70 backdrop-blur-md border border-zinc-200/70 dark:border-zinc-850 shadow-xs">
          <div className="flex items-center gap-3">
            <span className="inline-flex items-center gap-1.5 text-[9px] font-extrabold uppercase bg-editorial-accent/10 dark:bg-editorial-gold/10 text-editorial-accent dark:text-editorial-gold px-3 py-1 rounded-full border border-editorial-accent/20">
              <span className="w-1.5 h-1.5 rounded-full bg-editorial-accent dark:bg-editorial-gold animate-pulse" />
              Live Newsroom
            </span>
            <span className="text-[11px] font-serif italic text-neutral-600 dark:text-neutral-350 hidden sm:inline">
              Daily Edition — Independent Peer-Reviewed Journalism
            </span>
          </div>

          <div className="flex items-center gap-4 text-[10px] font-sans text-neutral-500 dark:text-neutral-400">
            <span className="flex items-center gap-1.5 font-medium">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
              <strong className="text-neutral-800 dark:text-neutral-200 font-bold">342 active readers</strong>
            </span>
            <span className="text-zinc-300 dark:text-zinc-800">|</span>
            <span className="hidden md:inline text-neutral-400">15 Editorial Streams</span>
          </div>
        </div>

        {/* Hero Title & Primary SEO Headline (Unique H1) */}
        <div className="space-y-4 max-w-4xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-neutral-100 dark:bg-zinc-900 text-[10px] font-bold uppercase tracking-widest text-neutral-600 dark:text-neutral-400">
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            <span>Systems Architecture, AI & Engineering Papers</span>
          </div>

          {/* CRITICAL SEO H1 (Unique from Title tag) */}
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold font-serif text-neutral-950 dark:text-neutral-50 tracking-tight leading-[1.12]">
            Independent Research, Systems Architecture & Developer Journalism
          </h1>

          <p className="text-base sm:text-lg text-neutral-650 dark:text-neutral-350 font-serif italic leading-relaxed max-w-3xl">
            Bylines publishes rigorous, peer-reviewed engineering essays, machine learning benchmarks, cybersecurity investigations, and contemporary design philosophy. Written by builders and senior researchers.
          </p>
        </div>

        {/* Featured Hero Bento Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 pt-4">
          
          {/* Main Lead Featured Story (8 Cols) */}
          <div className="lg:col-span-8">
            {featuredPost ? (
              <motion.article 
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                className="group relative overflow-hidden rounded-3xl border border-zinc-200/80 dark:border-zinc-850 bg-neutral-950 min-h-[460px] flex flex-col justify-between p-6 sm:p-8 shadow-2xl transition-all duration-500 hover:shadow-indigo-500/5 hover:-translate-y-0.5"
              >
                {featuredPost.featuredImage ? (
                  <img
                    src={featuredPost.featuredImage}
                    alt={featuredPost.title}
                    className="absolute inset-0 w-full h-full object-cover opacity-80 group-hover:scale-[1.02] transition-transform duration-700 pointer-events-none"
                    fetchPriority="high"
                  />
                ) : (
                  <div className="absolute inset-0 bg-neutral-950" />
                )}
                
                <div className="absolute inset-0 bg-gradient-to-t from-neutral-950 via-neutral-950/60 to-transparent z-0" />

                <div className="z-10 flex items-center justify-between w-full">
                  <span className="text-[10px] uppercase tracking-widest font-extrabold px-3 py-1.5 bg-white/90 dark:bg-black/90 text-neutral-900 dark:text-white rounded-full shadow-md backdrop-blur-xs border border-white/20">
                    {featuredPost.category?.name || 'Featured Report'}
                  </span>
                  <div className="flex items-center gap-2">
                    {featuredPost.isPremium && (
                      <span className="px-3 py-1 bg-amber-500 text-white rounded-full text-[9px] font-bold uppercase tracking-wider shadow-sm">
                        Premium
                      </span>
                    )}
                    <BookmarkButton
                      postId={featuredPost._id}
                      postTitle={featuredPost.title}
                      postSlug={featuredPost.slug}
                    />
                  </div>
                </div>

                <div className="z-10 mt-auto pt-16 space-y-3">
                  <div className="flex items-center gap-2 text-[10px] text-amber-400 font-bold uppercase tracking-widest">
                    <Flame className="w-3.5 h-3.5 fill-current" />
                    <span>Lead Story of the Week</span>
                  </div>

                  <Link href={`/post/${featuredPost.slug}`} className="block group">
                    <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold font-serif text-white group-hover:text-editorial-gold transition-colors leading-tight drop-shadow-sm">
                      {featuredPost.title}
                    </h2>
                  </Link>

                  <p className="text-xs sm:text-sm text-neutral-300 font-serif italic line-clamp-2 max-w-2xl leading-relaxed">
                    {featuredPost.summary}
                  </p>

                  <div className="flex items-center gap-4 text-[10px] text-neutral-400 font-sans pt-2 border-t border-white/10">
                    <span className="font-bold text-neutral-200">By {featuredPost.author?.name || 'Byline Desk'}</span>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-editorial-gold" />
                      {featuredPost.readingTime || 6} min read
                    </span>
                  </div>
                </div>
              </motion.article>
            ) : (
              <div className="h-[460px] rounded-3xl bg-neutral-100 dark:bg-zinc-900 animate-pulse flex items-center justify-center text-xs text-neutral-400 font-serif">
                Loading Featured Publication...
              </div>
            )}
          </div>

          {/* Right Sidebar: Editors Picks & Trending Top 3 (4 Cols) */}
          <div className="lg:col-span-4 flex flex-col justify-between space-y-6">
            <div className="p-6 rounded-3xl bg-white dark:bg-zinc-950 border border-zinc-200/80 dark:border-zinc-850 shadow-md space-y-4">
              <div className="flex items-center justify-between border-b border-zinc-150 dark:border-zinc-850 pb-3">
                <h3 className="text-xs uppercase font-extrabold tracking-widest text-neutral-900 dark:text-neutral-100 flex items-center gap-2">
                  <Award className="w-4 h-4 text-editorial-accent" />
                  <span>Must-Read Papers</span>
                </h3>
                <span className="text-[10px] font-bold text-neutral-400">Curated</span>
              </div>

              <div className="space-y-4 divide-y divide-zinc-100 dark:divide-zinc-900">
                {trendingPosts.slice(0, 3).map((post, idx) => (
                  <div key={post._id || idx} className="pt-3 first:pt-0 space-y-1.5 group">
                    <div className="flex items-center justify-between text-[9px] font-bold uppercase tracking-wider text-editorial-accent dark:text-editorial-gold">
                      <span>#{String(idx + 1).padStart(2, '0')} • {post.category?.name}</span>
                      <span>{post.readingTime}m</span>
                    </div>
                    <Link href={`/post/${post.slug}`} className="block">
                      <h4 className="text-xs sm:text-sm font-serif font-bold text-neutral-900 dark:text-neutral-100 group-hover:text-editorial-accent transition-colors line-clamp-2 leading-snug">
                        {post.title}
                      </h4>
                    </Link>
                    <p className="text-[10px] text-neutral-500 dark:text-neutral-400 font-sans line-clamp-1">
                      By {post.author?.name || 'Byline Desk'}
                    </p>
                  </div>
                ))}
              </div>

              <Link 
                href="/posts" 
                className="inline-flex items-center justify-center w-full gap-2 text-xs py-2.5 px-4 rounded-xl bg-neutral-100 dark:bg-zinc-900 hover:bg-editorial-accent hover:text-white font-semibold transition-colors text-neutral-800 dark:text-neutral-200"
              >
                <span>Browse All Publications</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ------------------------------------------------------------- */}
      {/* EDITORIAL CATEGORIES RIBBON FILTER                           */}
      {/* ------------------------------------------------------------- */}
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-200/70 dark:border-zinc-850 pb-4">
          <div>
            <span className="text-[10px] uppercase tracking-widest font-extrabold text-editorial-accent dark:text-editorial-gold block mb-0.5">
              Knowledge Domains
            </span>
            <h2 className="text-xl sm:text-2xl font-bold font-serif text-neutral-900 dark:text-neutral-50 tracking-tight">
              Explore 15 Specialized Sections
            </h2>
          </div>

          {/* Category Tabs */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2 sm:pb-0 no-scrollbar">
            <button
              onClick={() => setActiveCategory('all')}
              className={`px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${
                activeCategory === 'all'
                  ? 'bg-neutral-900 text-white dark:bg-white dark:text-black shadow-sm'
                  : 'bg-neutral-100 dark:bg-zinc-900 text-neutral-600 dark:text-neutral-400 hover:bg-neutral-200'
              }`}
            >
              All Stream
            </button>
            {categories.slice(0, 6).map((cat) => (
              <button
                key={cat._id}
                onClick={() => setActiveCategory(cat.slug)}
                className={`px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-1.5 ${
                  activeCategory === cat.slug
                    ? 'bg-neutral-900 text-white dark:bg-white dark:text-black shadow-sm'
                    : 'bg-neutral-100 dark:bg-zinc-900 text-neutral-600 dark:text-neutral-400 hover:bg-neutral-200'
                }`}
              >
                {getCategoryIcon(cat.slug)}
                <span>{cat.name}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Filtered Articles Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
          </div>
        ) : filteredPosts.length === 0 ? (
          <div className="py-16 text-center text-xs text-neutral-500 font-serif italic bg-white dark:bg-zinc-950 rounded-2xl border border-zinc-200/60 dark:border-zinc-850">
            No published articles found in this category section yet.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredPosts.slice(0, 9).map((post) => (
              <motion.article 
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                key={post._id} 
                className="flex flex-col justify-between group border border-zinc-200/70 dark:border-zinc-850 p-5 rounded-3xl bg-white dark:bg-zinc-950 hover:border-editorial-accent/50 dark:hover:border-editorial-gold/50 shadow-xs hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
              >
                <div className="space-y-3">
                  {post.featuredImage && (
                    <div className="overflow-hidden rounded-2xl aspect-[16/10] bg-neutral-100 dark:bg-neutral-900">
                      <Link href={`/post/${post.slug}`}>
                        <img
                          src={post.featuredImage}
                          alt={post.title}
                          className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-500"
                        />
                      </Link>
                    </div>
                  )}

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[9px] uppercase tracking-widest font-extrabold text-editorial-accent dark:text-editorial-gold">
                        {post.category?.name || 'Journal'}
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
                      {post.readingTime || 5} min
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

      {/* ------------------------------------------------------------- */}
      {/* INLINE NEWSLETTER SUBSCRIPTION SECTION                        */}
      {/* ------------------------------------------------------------- */}
      <NewsletterInline />
    </div>
  );
}
