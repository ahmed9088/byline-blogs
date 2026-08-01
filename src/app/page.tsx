"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { postsAPI, categoriesAPI } from '../services/api';
import { 
  Clock, ChevronRight, ArrowUpRight, Sparkles, TrendingUp, Eye, Award, User, 
  Layers, ArrowRight, Cpu, Layout, Brain, Shield, LineChart, Activity, 
  Trophy, Film, Compass, Globe, Book, Atom, MapPin, Utensils, Palette
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

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-12">
        <SEOHead 
          title="Bylines Journal — Technical Publishing" 
          description="Expert-driven engineering papers, technical journalism, and research reports covering systems architecture, AI models, cybersecurity, and design."
        />
        <h1 className="sr-only">Bylines Journal — Independent Technical & Editorial Publishing</h1>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-4">
            <div className="animate-pulse bg-neutral-200 dark:bg-neutral-800 aspect-video w-full rounded-3xl" />
            <SkeletonLine className="h-6 w-3/4" />
            <SkeletonLine className="h-4 w-5/6" />
          </div>
          <div className="space-y-6">
            <SkeletonLine className="h-4 w-1/3" />
            <div className="space-y-4">
              <SkeletonLine className="h-12 w-full" />
              <SkeletonLine className="h-12 w-full" />
              <SkeletonLine className="h-12 w-full" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-14 relative pb-10">
      <SEOHead
        title="Bylines Journal — Technical & Editorial Publishing"
        description="Expert-driven engineering papers, technical journalism, and research reports covering systems architecture, AI models, cybersecurity, and design."
      />

      {/* Primary Accessible H1 for Search Engine Crawlers & Readers */}
      <h1 className="sr-only">Bylines Journal — Independent Technical & Editorial Publishing</h1>

      {/* Hero Header */}
      <div className="border-b border-zinc-200/60 dark:border-zinc-850 pb-6 pt-2">
        <span className="text-[10px] font-extrabold uppercase text-editorial-accent dark:text-editorial-gold tracking-widest block mb-1">
          Independent Technical Publishing
        </span>
        <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold font-serif text-neutral-900 dark:text-neutral-50 tracking-tight">
          Bylines Journal
        </h2>
        <p className="text-xs sm:text-sm text-neutral-600 dark:text-neutral-400 font-serif italic mt-2 max-w-3xl leading-relaxed">
          Expert-driven engineering papers, technical journalism, and research reports covering systems architecture, AI models, neuroscience, cybersecurity, and modern design.
        </p>
      </div>

      {/* Floating Background Glows */}
      <div className="absolute top-[-10%] left-[-15%] w-[500px] h-[500px] rounded-full bg-editorial-accent/5 dark:bg-editorial-accent/2 blur-[120px] pointer-events-none animate-blob" />
      <div className="absolute top-[30%] right-[-10%] w-[400px] h-[400px] rounded-full bg-amber-550/5 dark:bg-amber-500/1 blur-[100px] pointer-events-none animate-blob animation-delay-2000" />

      {/* 1. Breaking News Banner */}
      <div className="relative overflow-hidden rounded-2xl border border-zinc-200/50 dark:border-zinc-850 bg-amber-50/40 dark:bg-amber-950/10 p-3 flex items-center gap-3">
        <span className="flex-shrink-0 text-[9px] font-extrabold uppercase bg-amber-500 text-white px-2 py-0.5 rounded-sm tracking-widest animate-pulse">
          Alert
        </span>
        <div className="w-full overflow-hidden text-[11px] text-amber-800 dark:text-amber-400 font-sans tracking-wide">
          <div className="animate-marquee whitespace-nowrap">
            EXPLORE OUR 15 NEW PUBLICATION SECTIONS: Systems Engineering, AI, Neuroscience, Cyber Security, Geopolitics, and Design.
          </div>
        </div>
      </div>

      {/* Greetings bar & Live Pulse Panel */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        {!geo.loading && (
          <div className="inline-flex items-center gap-2 bg-white/60 dark:bg-zinc-900/60 backdrop-blur-xs px-3.5 py-1.5 rounded-full border border-zinc-200/40 dark:border-zinc-800/40 text-[10px] text-zinc-600 dark:text-zinc-400 font-sans tracking-wide">
            <span className="w-1.5 h-1.5 rounded-full bg-editorial-accent animate-pulse" />
            <span>Unlocked latest reports for readers in {geo.country || 'local region'}.</span>
          </div>
        )}

        {/* Live Active Readers Indicator */}
        <div className="flex items-center gap-3 bg-white/40 dark:bg-zinc-950/20 backdrop-blur-md px-4 py-2 border border-zinc-200/50 dark:border-zinc-850 rounded-full text-[10px] font-sans text-neutral-600 dark:text-neutral-400">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
          </span>
          <span className="font-bold font-serif text-neutral-805 dark:text-neutral-200">
            342 readers active across {categories.length} sections
          </span>
          <span className="text-zinc-300 dark:text-zinc-700">|</span>
          <span className="uppercase tracking-wider font-extrabold text-editorial-accent dark:text-editorial-gold">
            Live Updates
          </span>
        </div>
      </div>

      {/* Hero Bento Grid */}
      <div className="space-y-4">
        <div className="flex items-center justify-between border-b border-zinc-150 dark:border-zinc-850 pb-2">
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-editorial-accent dark:bg-editorial-gold" />
            <h2 className="text-sm font-extrabold uppercase tracking-widest text-neutral-850 dark:text-white">
              Best of the week
            </h2>
          </div>
          <Link href="/posts" className="text-xs text-editorial-accent dark:text-editorial-gold hover:underline font-semibold flex items-center gap-1">
            <span>View All ({latestPosts.length})</span>
            <ArrowRight className="w-3 h-3" />
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Main Featured Card */}
          {featuredPost && (
            <motion.div 
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              className="lg:col-span-2 group relative overflow-hidden rounded-3xl border border-zinc-200/50 dark:border-zinc-850 bg-neutral-900 h-[480px] flex flex-col justify-between p-6 shadow-xl hover:shadow-[0_20px_50px_rgba(99,102,241,0.04)] hover:-translate-y-1 transition-all duration-500 z-10"
            >
              {featuredPost.featuredImage ? (
                <img
                  src={featuredPost.featuredImage}
                  alt={featuredPost.title}
                  className="absolute inset-0 w-full h-full object-cover group-hover:scale-[1.02] transition-transform duration-750 pointer-events-none"
                />
              ) : (
                <div className="absolute inset-0 bg-neutral-950" />
              )}
              
              <div className="absolute inset-0 bg-gradient-to-t from-zinc-950/70 to-transparent z-0" />

              <div className="z-10 flex justify-between items-center w-full">
                <span className="text-[9px] uppercase tracking-widest font-extrabold px-3 py-1 bg-white/90 dark:bg-black/90 text-neutral-900 dark:text-white rounded-full shadow-sm border border-neutral-200/20">
                  {featuredPost.category?.name}
                </span>
                {featuredPost.isPremium && (
                  <span className="px-3 py-1 bg-amber-500 text-white rounded-full text-[9px] font-bold uppercase tracking-wider shadow-sm">
                    Premium
                  </span>
                )}
              </div>

              <div className="z-10 bg-white/90 dark:bg-zinc-900/90 backdrop-blur-md p-6 rounded-2xl border border-neutral-200/30 dark:border-zinc-800/50 shadow-lg max-w-md self-end transition-all duration-300 group-hover:shadow-xl">
                <span className="text-[8px] uppercase tracking-widest font-extrabold text-neutral-450 dark:text-neutral-500 block mb-1">
                  Cover Article
                </span>
                <Link href={`/post/${featuredPost.slug}`} className="block mb-2">
                  <h3 className="text-base md:text-lg font-bold leading-snug font-serif text-neutral-850 dark:text-white hover:text-editorial-accent dark:hover:text-editorial-gold transition-colors">
                    {featuredPost.title}
                  </h3>
                </Link>
                <p className="text-[10px] text-neutral-500 dark:text-neutral-440 leading-relaxed font-sans line-clamp-2 mb-3">
                  {featuredPost.summary}
                </p>
                <div className="flex items-center justify-between text-[9px] text-neutral-400 dark:text-neutral-500 pt-2 border-t border-neutral-100 dark:border-neutral-800">
                  <span>By {featuredPost.author?.name}</span>
                  <span>{featuredPost.readingTime} min read</span>
                </div>
              </div>
            </motion.div>
          )}

          {/* Right Column Stacked Bento Cards */}
          <div className="flex flex-col gap-6 h-[480px]">
            {latestPosts[1] && (
              <motion.div 
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.1 }}
                className="flex-1 rounded-3xl p-6 bg-gradient-to-br from-editorial-accent/5 to-editorial-accent/15 dark:from-editorial-gold/5 dark:to-editorial-gold/15 border border-zinc-200/40 dark:border-zinc-850 flex flex-col justify-between group hover:-translate-y-1 hover:shadow-lg transition-all duration-300"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-[8px] uppercase tracking-widest font-extrabold px-2 py-0.5 bg-neutral-900/10 dark:bg-white/10 text-neutral-850 dark:text-neutral-200 rounded-full font-bold">
                      {latestPosts[1].category?.name}
                    </span>
                    <span className="text-[8px] uppercase tracking-widest font-bold text-neutral-400 dark:text-neutral-500">
                      Trending
                    </span>
                  </div>
                  <Link href={`/post/${latestPosts[1].slug}`}>
                    <h3 className="text-sm font-bold leading-snug font-serif text-neutral-850 dark:text-white group-hover:text-editorial-accent dark:group-hover:text-editorial-gold transition-colors line-clamp-3">
                      {latestPosts[1].title}
                    </h3>
                  </Link>
                </div>
                <div className="flex items-center justify-between pt-4 border-t border-neutral-200/30 dark:border-neutral-800/30">
                  <span className="text-[9px] text-neutral-500 dark:text-neutral-400 font-sans">
                    By {latestPosts[1].author?.name}
                  </span>
                  <Link 
                    href={`/post/${latestPosts[1].slug}`}
                    className="w-7 h-7 rounded-full bg-white dark:bg-zinc-900 text-neutral-850 dark:text-white flex items-center justify-center border border-neutral-200/40 hover:bg-neutral-900 hover:text-white dark:hover:bg-white dark:hover:text-black transition-all"
                  >
                    <ArrowUpRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </motion.div>
            )}

            {latestPosts[2] && (
              <motion.div 
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.2 }}
                className="flex-1 group relative overflow-hidden rounded-3xl border border-zinc-200/40 dark:border-zinc-850 bg-neutral-900 flex flex-col justify-end p-5 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-300"
              >
                {latestPosts[2].featuredImage ? (
                  <img
                    src={latestPosts[2].featuredImage}
                    alt={latestPosts[2].title}
                    className="absolute inset-0 w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-500 pointer-events-none"
                  />
                ) : (
                  <div className="absolute inset-0 bg-neutral-950" />
                )}
                
                <div className="absolute inset-0 bg-gradient-to-t from-zinc-950/80 via-zinc-950/20 to-transparent z-0" />

                <div className="z-10 space-y-1.5 text-white">
                  <span className="text-[8px] uppercase tracking-wider text-editorial-gold font-bold">
                    {latestPosts[2].category?.name}
                  </span>
                  <Link href={`/post/${latestPosts[2].slug}`} className="block">
                    <h3 className="text-xs font-bold leading-tight font-serif text-white hover:text-editorial-gold transition-colors line-clamp-2">
                      {latestPosts[2].title}
                    </h3>
                  </Link>
                  <div className="flex items-center justify-between text-[8px] text-zinc-400 pt-2 mt-2 border-t border-white/10">
                    <span>{latestPosts[2].readingTime}m read</span>
                    <span className="opacity-0 group-hover:opacity-100 transition-opacity uppercase tracking-widest font-extrabold text-editorial-gold text-[7px]">
                      Read Article →
                    </span>
                  </div>
                </div>
              </motion.div>
            )}
          </div>
        </div>
      </div>

      {/* NEW FEATURE: Dedicated "Browse All 15 Categories" Hub Banner */}
      <section className="p-8 rounded-3xl bg-gradient-to-r from-zinc-900 via-zinc-950 to-neutral-900 text-white border border-zinc-800 shadow-xl flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="space-y-2 text-center md:text-left max-w-xl">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-editorial-accent/20 text-editorial-gold text-xs font-bold uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Complete Category Hub</span>
          </div>
          <h3 className="text-2xl font-serif font-bold">Explore 15 Distinct Publication Domains</h3>
          <p className="text-xs text-neutral-400 leading-relaxed font-sans">
            From Systems Engineering and AI Models to Geopolitics, Fine Art, and Neuroscience—dive into expert-curated editorial streams.
          </p>
        </div>
        <Link 
          href="/category"
          className="px-6 py-3 bg-editorial-accent hover:bg-editorial-accent/90 text-white text-xs font-bold uppercase tracking-widest rounded-xl transition-all shadow-lg hover:scale-105 flex items-center gap-2 flex-shrink-0"
        >
          <span>View All 15 Categories</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </section>

      {/* Trending Articles Horizontal Scroll */}
      <section className="space-y-6">
        <div className="flex items-center justify-between border-b border-neutral-150 dark:border-neutral-900 pb-3">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-editorial-accent" />
            <h3 className="text-xs uppercase tracking-widest font-extrabold text-neutral-850 dark:text-neutral-50">Trending Articles</h3>
          </div>
        </div>

        <div className="flex overflow-x-auto gap-6 pb-4 scrollbar-thin scroll-smooth snap-x">
          {trendingPosts.map((post) => (
            <div
              key={post._id}
              className="flex-shrink-0 w-[290px] snap-start border border-zinc-200/50 dark:border-zinc-850 p-4 bg-white/70 dark:bg-zinc-950/70 backdrop-blur-md rounded-2xl space-y-3 shadow-xs hover:-translate-y-1 hover:shadow-md transition-all duration-300"
            >
              <div className="flex justify-between items-center text-[8px] uppercase tracking-wider text-neutral-400">
                <span className="font-bold text-editorial-accent dark:text-editorial-gold">{post.category?.name}</span>
                <span className="flex items-center gap-1"><Eye className="w-3 h-3" /> {post.viewsCount || 120} views</span>
              </div>
              <Link href={`/post/${post.slug}`}>
                <h4 className="font-serif text-xs font-bold leading-snug text-neutral-850 dark:text-neutral-100 hover:text-editorial-accent transition-colors line-clamp-2 min-h-[36px]">
                  {post.title}
                </h4>
              </Link>
              <div className="flex items-center justify-between text-[9px] text-neutral-400 border-t border-neutral-100 dark:border-neutral-900 pt-2">
                <span>By {post.author?.name}</span>
                <span>{post.readingTime} min read</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Latest Articles Section with Filter Bar */}
      <section className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        <div className="lg:col-span-3 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-neutral-150 dark:border-neutral-900 pb-3">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 bg-editorial-accent dark:bg-editorial-gold rounded-full" />
              <h3 className="text-xs uppercase tracking-widest font-extrabold text-neutral-850 dark:text-neutral-50">
                Latest Publications
              </h3>
            </div>

            {/* Scrollable Category Filter Pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 max-w-full text-[9px] font-extrabold uppercase tracking-wider scrollbar-none">
              <button
                onClick={() => setActiveCategory('all')}
                className={`px-3 py-1 rounded-full border transition-all duration-200 flex-shrink-0 ${activeCategory === 'all' ? 'bg-neutral-900 border-neutral-900 text-white dark:bg-white dark:border-white dark:text-black shadow-sm' : 'border-zinc-200/50 dark:border-zinc-800 text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-200 bg-white/40 dark:bg-zinc-950/20'}`}
              >
                All ({categories.length})
              </button>
              {categories.map(cat => (
                <button
                  key={cat._id}
                  onClick={() => setActiveCategory(cat.slug)}
                  className={`px-3 py-1 rounded-full border transition-all duration-200 flex-shrink-0 ${activeCategory === cat.slug ? 'bg-neutral-900 border-neutral-900 text-white dark:bg-white dark:border-white dark:text-black shadow-sm' : 'border-zinc-200/50 dark:border-zinc-800 text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-200 bg-white/40 dark:bg-zinc-950/20'}`}
                >
                  {cat.name}
                </button>
              ))}
            </div>
          </div>

          <motion.div layout className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <AnimatePresence mode="popLayout">
              {latestPosts
                .filter(p => activeCategory === 'all' || p.category?.slug === activeCategory || p.category?._id === activeCategory)
                .slice(0, 8)
                .map((post) => (
                  <motion.article
                    layout
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.25 }}
                    key={post._id}
                    className="p-5 border border-zinc-200/40 dark:border-zinc-900 rounded-3xl bg-white/70 dark:bg-zinc-950/40 backdrop-blur-md flex flex-col justify-between group hover:-translate-y-1 hover:shadow-lg transition-all duration-350"
                  >
                    <div className="space-y-3">
                      {post.featuredImage && (
                        <div className="overflow-hidden rounded-2xl bg-neutral-100 dark:bg-neutral-900 aspect-video">
                          <Link href={`/post/${post.slug}`}>
                            <img
                              src={post.featuredImage}
                              alt=""
                              className="w-full h-full object-cover group-hover:scale-[1.02] transition-transform duration-500"
                            />
                          </Link>
                        </div>
                      )}

                      <div className="space-y-1.5">
                        <span className="text-[9px] uppercase tracking-wider text-editorial-accent font-bold">
                          {post.category?.name}
                        </span>
                        <Link href={`/post/${post.slug}`}>
                          <h4 className="text-sm font-bold leading-snug font-serif text-neutral-850 dark:text-neutral-100 group-hover:text-editorial-accent transition-colors line-clamp-2">
                            {post.title}
                          </h4>
                        </Link>
                        <p className="text-[11px] text-neutral-500 dark:text-neutral-440 leading-relaxed font-sans line-clamp-2">
                          {post.summary}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-[9px] text-neutral-400 dark:text-neutral-500 font-sans border-t border-neutral-100 dark:border-neutral-900 pt-3 mt-4">
                      <span>By {post.author?.name}</span>
                      <div className="flex items-center gap-3">
                        <span>{post.readingTime} min read</span>
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
            </AnimatePresence>
          </motion.div>
        </div>

        {/* Sidebar */}
        <div className="space-y-8">
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-neutral-100 dark:border-neutral-900 pb-2">
              <h3 className="text-xs uppercase tracking-widest font-semibold text-neutral-400 dark:text-neutral-550">
                All 15 Categories
              </h3>
              <Link href="/category" className="text-[10px] text-editorial-accent font-bold">View Hub</Link>
            </div>
            <div className="flex flex-col space-y-2">
              {categories.map((cat) => (
                <Link
                  key={cat._id}
                  href={`/category/${cat.slug}`}
                  className="flex justify-between items-center p-3 rounded-2xl border border-zinc-200/40 dark:border-zinc-850/50 bg-white/50 dark:bg-zinc-950/50 text-xs text-neutral-700 dark:text-neutral-400 hover:border-editorial-accent dark:hover:border-editorial-gold transition-colors font-bold group"
                >
                  <div className="flex items-center gap-2">
                    {getCategoryIcon(cat.slug)}
                    <span className="group-hover:text-editorial-accent transition-colors">{cat.name}</span>
                  </div>
                  <span className="text-[9px] px-2 py-0.5 bg-neutral-100 dark:bg-neutral-900 text-neutral-450 rounded-full font-bold">
                    3 posts
                  </span>
                </Link>
              ))}
            </div>
          </div>

          {/* Featured Authors Showcase */}
          {authors.length > 0 && (
            <div className="space-y-4">
              <h3 className="text-xs uppercase tracking-widest font-semibold text-neutral-400 dark:text-neutral-550 border-b border-neutral-100 dark:border-neutral-900 pb-2">
                Editorial Authors
              </h3>
              <div className="space-y-3">
                {authors.map((author) => (
                  <div key={author._id} className="flex items-center gap-3 p-2 bg-white/30 dark:bg-zinc-950/30 rounded-xl">
                    {author.profileImage ? (
                      <img
                        src={author.profileImage}
                        alt={author.name}
                        className="w-8 h-8 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-8 h-8 rounded-full bg-neutral-200 dark:bg-neutral-800 flex items-center justify-center">
                        <User className="w-4 h-4 text-neutral-500" />
                      </div>
                    )}
                    <div>
                      <div className="text-xs font-bold text-neutral-850 dark:text-neutral-200 flex items-center gap-1">
                        {author.name}
                        <Award className="w-3 h-3 text-editorial-accent" />
                      </div>
                      <span className="text-[9px] text-neutral-400 uppercase tracking-wider">{author.role}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Write on Byline Promo Card */}
          <div className="p-5 border border-zinc-200/50 dark:border-zinc-850/50 bg-gradient-to-br from-editorial-accent/[0.03] to-editorial-accent/[0.08] dark:from-editorial-gold/[0.01] dark:to-editorial-gold/[0.05] rounded-3xl space-y-4">
            <div className="space-y-1">
              <span className="text-[9px] uppercase tracking-widest font-extrabold text-editorial-accent dark:text-editorial-gold block">
                Publishing Program
              </span>
              <h4 className="font-serif text-sm font-bold text-neutral-850 dark:text-neutral-100 leading-snug">
                Write on Byline
              </h4>
              <p className="text-[10px] text-neutral-500 dark:text-neutral-400 leading-relaxed font-sans pt-1">
                Share your ideas, research, and technical insights with a global audience of software developers, product designers, and technology leaders.
              </p>
            </div>
            <Link
              href={user ? "/admin/posts/new" : "/login?redirect=/admin/posts/new"}
              className="w-full text-center block text-[9px] uppercase font-bold tracking-widest py-2.5 bg-neutral-900 hover:bg-editorial-accent dark:bg-neutral-100 dark:text-black dark:hover:bg-editorial-gold text-white rounded-xl transition-all"
            >
              Start Drafting
            </Link>
          </div>

        </div>
      </section>

      {/* Newsletter Digest */}
      <section className="relative overflow-hidden rounded-3xl border border-zinc-200/50 dark:border-zinc-850 p-8 md:p-12 bg-neutral-950 text-white flex flex-col md:flex-row items-center justify-between gap-6 shadow-2xl">
        <div className="absolute top-0 right-0 w-[350px] h-[350px] bg-editorial-accent/20 rounded-full blur-[90px] pointer-events-none" />

        <div className="space-y-2 text-center md:text-left max-w-xl z-10">
          <span className="text-[9px] tracking-widest uppercase text-editorial-gold font-extrabold block">
            WEEKLY DIGEST
          </span>
          <h3 className="font-serif text-2xl font-bold leading-tight tracking-tight">
            Original investigations and editorial reviews across all 15 categories.
          </h3>
          <p className="text-[10px] text-neutral-400 font-sans">Zero spam. Interactive options. Cancel subscription anytime.</p>
        </div>

        <div className="w-full md:w-auto z-10 md:min-w-[320px]">
          <NewsletterInline />
        </div>
      </section>

    </div>
  );
}
