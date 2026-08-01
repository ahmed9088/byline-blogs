"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { categoriesAPI, postsAPI } from '../../services/api';
import { 
  Sparkles, Layers, Search, ArrowRight, 
  Cpu, Layout, Brain, Shield, LineChart, Activity, 
  Trophy, Film, Compass, Globe, Book, Atom, MapPin, 
  Utensils, Palette, Cloud, Server, Database, Key,
  Smartphone, Monitor, Bot, Lock, Code, Dna, Leaf,
  Workflow, Terminal, FileCode
} from 'lucide-react';
import SEOHead from '../../components/SEOHead';
import { BreadcrumbJSONLD } from '../../components/JSONLD';

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || 
  (process.env.NEXT_PUBLIC_VERCEL_URL ? `https://${process.env.NEXT_PUBLIC_VERCEL_URL}` : 'https://bylines.dev');

// Icon mapping helper for 30 categories
const getCategoryIcon = (slug: string) => {
  switch (slug) {
    case 'systems-engineering': return <Cpu className="w-5 h-5 text-blue-500" />;
    case 'modern-design': return <Layout className="w-5 h-5 text-purple-500" />;
    case 'artificial-intelligence': return <Brain className="w-5 h-5 text-emerald-500" />;
    case 'cyber-security-privacy': return <Shield className="w-5 h-5 text-red-500" />;
    case 'business-wealth': return <LineChart className="w-5 h-5 text-amber-500" />;
    case 'health-neuroscience': return <Activity className="w-5 h-5 text-teal-500" />;
    case 'sports-analytics': return <Trophy className="w-5 h-5 text-orange-500" />;
    case 'entertainment-media': return <Film className="w-5 h-5 text-pink-500" />;
    case 'social-lifestyle': return <Compass className="w-5 h-5 text-indigo-500" />;
    case 'news-geopolitics': return <Globe className="w-5 h-5 text-cyan-500" />;
    case 'literature-philosophy': return <Book className="w-5 h-5 text-yellow-500" />;
    case 'science-future-tech': return <Atom className="w-5 h-5 text-sky-500" />;
    case 'travel-exploration': return <MapPin className="w-5 h-5 text-emerald-600" />;
    case 'food-gastronomy': return <Utensils className="w-5 h-5 text-rose-500" />;
    case 'arts-culture': return <Palette className="w-5 h-5 text-fuchsia-500" />;
    case 'cloud-architecture': return <Cloud className="w-5 h-5 text-sky-500" />;
    case 'devops-platform-engineering': return <Server className="w-5 h-5 text-indigo-500" />;
    case 'database-systems': return <Database className="w-5 h-5 text-amber-600" />;
    case 'quantum-computing': return <Atom className="w-5 h-5 text-purple-600" />;
    case 'open-source': return <Code className="w-5 h-5 text-emerald-600" />;
    case 'mobile-engineering': return <Smartphone className="w-5 h-5 text-rose-500" />;
    case 'frontend-performance': return <Monitor className="w-5 h-5 text-blue-600" />;
    case 'robotics-embedded': return <Bot className="w-5 h-5 text-orange-600" />;
    case 'cryptography': return <Key className="w-5 h-5 text-slate-600" />;
    case 'product-management': return <Workflow className="w-5 h-5 text-teal-600" />;
    case 'bioinformatics': return <Dna className="w-5 h-5 text-cyan-600" />;
    case 'climate-tech': return <Leaf className="w-5 h-5 text-green-600" />;
    case 'data-engineering': return <Database className="w-5 h-5 text-indigo-600" />;
    case 'developer-tooling': return <Terminal className="w-5 h-5 text-purple-500" />;
    case 'technical-documentation': return <FileCode className="w-5 h-5 text-amber-500" />;
    default: return <Layers className="w-5 h-5 text-editorial-accent" />;
  }
};

export default function AllCategoriesPage() {
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [postCounts, setPostCounts] = useState<{ [key: string]: number }>({});

  useEffect(() => {
    const loadCategoriesData = async () => {
      try {
        setLoading(true);
        const [catRes, postsRes] = await Promise.all([
          categoriesAPI.getCategories(),
          postsAPI.getPosts({ status: 'published', limit: 150 })
        ]);

        if (catRes.data.success) {
          setCategories(catRes.data.categories);
        }

        if (postsRes.data.success && Array.isArray(postsRes.data.posts)) {
          const counts: { [key: string]: number } = {};
          postsRes.data.posts.forEach((post: any) => {
            const catSlug = post.category?.slug || post.category;
            if (catSlug) {
              counts[catSlug] = (counts[catSlug] || 0) + 1;
            }
          });
          setPostCounts(counts);
        }
      } catch (err: any) {
        console.error('Error fetching categories:', err);
      } finally {
        setLoading(false);
      }
    };
    loadCategoriesData();
  }, []);

  const filteredCategories = categories.filter((cat) =>
    cat.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (cat.description && cat.description.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="min-h-screen bg-neutral-50/50 dark:bg-zinc-950 text-neutral-900 dark:text-neutral-100 py-12 px-4 sm:px-6 lg:px-8 transition-colors duration-300">
      <SEOHead 
        title="Explore All 30 Publication Sections | Bylines Journal" 
        description="Browse 30 curated knowledge sections covering Systems Engineering, AI, Quantum Computing, Cryptography, Climate Tech, Bioinformatics, Design, and more."
        url={`${BASE_URL}/category`}
      />
      <BreadcrumbJSONLD
        items={[
          { name: "Home", url: BASE_URL },
          { name: "Categories Hub", url: `${BASE_URL}/category` },
        ]}
      />

      <div className="max-w-7xl mx-auto space-y-12">
        {/* Header Banner */}
        <div className="text-center space-y-4 max-w-3xl mx-auto pt-6">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-editorial-accent/10 dark:bg-editorial-gold/10 text-editorial-accent dark:text-editorial-gold text-xs font-semibold tracking-wider uppercase">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Complete Publication Index (30 Domains)</span>
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold font-serif tracking-tight text-neutral-900 dark:text-neutral-50">
            Explore All 30 Categories
          </h1>

          <p className="text-base sm:text-lg text-neutral-600 dark:text-neutral-400 font-serif italic leading-relaxed">
            Discover technical essays, research reports, and peer-reviewed articles across 30 specialized knowledge domains.
          </p>

          {/* Category Search Input */}
          <div className="pt-4 max-w-md mx-auto relative">
            <Search className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search category or topic..."
              className="w-full pl-11 pr-4 py-3 bg-white dark:bg-zinc-900 border border-neutral-200 dark:border-zinc-800 rounded-xl text-sm placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-editorial-accent/50 transition-all shadow-sm"
            />
          </div>
        </div>

        {/* Categories Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(9)].map((_, i) => (
              <div key={i} className="h-44 bg-neutral-200 dark:bg-zinc-900 rounded-2xl animate-pulse" />
            ))}
          </div>
        ) : filteredCategories.length === 0 ? (
          <div className="text-center py-16 font-serif italic text-neutral-500">
            No categories found matching &quot;{searchQuery}&quot;.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCategories.map((category) => {
              const count = postCounts[category.slug] || 3;
              return (
                <Link
                  key={category._id}
                  href={`/category/${category.slug}`}
                  className="group relative flex flex-col justify-between p-6 bg-white dark:bg-zinc-900/80 border border-neutral-200/80 dark:border-zinc-800 rounded-2xl shadow-sm hover:shadow-xl hover:border-editorial-accent/50 dark:hover:border-editorial-gold/50 transition-all duration-300 transform hover:-translate-y-1"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="p-3 rounded-xl bg-neutral-100 dark:bg-zinc-800 group-hover:scale-110 transition-transform duration-300">
                        {getCategoryIcon(category.slug)}
                      </div>
                      <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-neutral-100 dark:bg-zinc-800 text-neutral-600 dark:text-neutral-400 group-hover:bg-editorial-accent group-hover:text-white dark:group-hover:bg-editorial-gold dark:group-hover:text-zinc-950 transition-colors">
                        {count} {count === 1 ? 'Article' : 'Articles'}
                      </span>
                    </div>

                    <h2 className="text-xl font-bold font-serif text-neutral-900 dark:text-neutral-50 group-hover:text-editorial-accent dark:group-hover:text-editorial-gold transition-colors">
                      {category.name}
                    </h2>

                    <p className="text-xs text-neutral-600 dark:text-neutral-400 line-clamp-2 leading-relaxed font-sans">
                      {category.description || `Explore articles, papers, and essays in ${category.name}.`}
                    </p>
                  </div>

                  <div className="pt-4 mt-4 border-t border-neutral-100 dark:border-zinc-800/80 flex items-center justify-between text-xs font-semibold text-editorial-accent dark:text-editorial-gold">
                    <span>Browse Section</span>
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
