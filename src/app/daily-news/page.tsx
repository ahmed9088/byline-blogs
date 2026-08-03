"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { 
  Globe, Clock, ArrowRight, Radio, Sparkles, Shield, Cpu, 
  Brain, Zap, Share2, Bookmark, CheckCircle2, ChevronRight,
  TrendingUp, Layers, Newspaper
} from 'lucide-react';
import SEOHead from '../../components/SEOHead';
import NewsletterInline from '../../components/NewsletterInline';

const DAILY_HEADLINES = [
  {
    id: "news-1",
    category: "AI & Models",
    title: "Open-Weights Reasoning Models Achieve 94% on MATH Benchmark at 1/10th Latency",
    time: "22m ago",
    readTime: "3 min read",
    summary: "Researchers release a 14B parameter reasoning architecture leveraging sparse chain-of-thought distillation, rivaling proprietary 70B models while running locally on consumer hardware.",
    source: "Bylines Tech Desk",
    keyPoints: [
      "14B parameter model runs at 85 tokens/sec on RTX 4090",
      "Implements dynamic depth token pruning during reasoning loops",
      "Weights and training datasets published under Apache 2.0 license"
    ],
    image: "https://images.unsplash.com/photo-1677442136019-21780efad99a?auto=format&fit=crop&w=800&q=80"
  },
  {
    id: "news-2",
    category: "Systems & Cloud",
    title: "Linux Kernel 6.14 Formally Merges Native Zero-Copy Network Socket Abstraction",
    time: "1h ago",
    readTime: "4 min read",
    summary: "The Linux kernel maintainers have merged the io_uring zero-copy buffer ring patchset, eliminating kernel-to-user memory transfers for 100GbE network interfaces.",
    source: "Systems Infrastructure Wire",
    keyPoints: [
      "Eliminates 35% of CPU cache invalidation overhead under high packet loads",
      "Tested across 10 million concurrent socket benchmarks at major cloud providers",
      "Backward compatible with existing io_uring ring buffer APIs"
    ],
    image: "https://images.unsplash.com/photo-1544197150-b99a580bb7a8?auto=format&fit=crop&w=800&q=80"
  },
  {
    id: "news-3",
    category: "Cybersecurity",
    title: "NIST Formally Finalizes Post-Quantum Encryption Migration Timelines for Cloud Providers",
    time: "2h ago",
    readTime: "3 min read",
    summary: "The National Institute of Standards and Technology releases compulsory guidance mandating lattice-based ML-KEM algorithms for all TLS 1.3 handshakes by Q3 2027.",
    source: "Cryptographic Security Desk",
    keyPoints: [
      "ML-KEM-768 and ML-DSA-65 become primary standards",
      "Hybrid classical-quantum certificate handshakes recommended during transition",
      "Major browser vendors announce default enablement in autumn builds"
    ],
    image: "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=800&q=80"
  },
  {
    id: "news-4",
    category: "Hardware & Fabs",
    title: "2nm Gate-All-Around Transistor Yields Reach Commercial Mass-Production Thresholds",
    time: "4h ago",
    readTime: "5 min read",
    summary: "Semiconductor foundries confirm 2-nanometer GAAFET process node yields have passed 78%, paving the way for next-generation mobile and datacenter silicon in 2027.",
    source: "Silicon & Hardware Report",
    keyPoints: [
      "15% clock speed boost at equivalent power envelope",
      "Nanosheet architecture reduces parasitic leakage currents by 25%",
      "EUV high-NA lithography tools operational across main fabrication lines"
    ],
    image: "https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=800&q=80"
  },
  {
    id: "news-5",
    category: "Databases",
    title: "Distributed LSM-Tree Compactors Implement Autonomous ML Compression Profiling",
    time: "5h ago",
    readTime: "4 min read",
    summary: "New open-source database engine extensions use lightweight neural heuristics to predict SSTable access frequency and dynamically adjust compaction levels.",
    source: "Database Engineering Wire",
    keyPoints: [
      "Reduces write amplification by 42% on mixed OLTP workloads",
      "Eliminates manual RocksDB tuning flags in production clusters",
      "Zero runtime performance penalty during peak write spikes"
    ],
    image: "https://images.unsplash.com/photo-1544383835-bda2bc66a55d?auto=format&fit=crop&w=800&q=80"
  },
  {
    id: "news-6",
    category: "Quantum Science",
    title: "Cryogenic CMOS Controller Operates 1,000 Transmon Qubits at 15 Millikelvin",
    time: "7h ago",
    readTime: "4 min read",
    summary: "Quantum physicists demonstrate a low-power CMOS control chip mounted inside the dilution refrigerator, eliminating thousand-cable wiring bottlenecks.",
    source: "Quantum Physics Quarterly",
    keyPoints: [
      "Power dissipation under 1.2 milliwatts per control channel",
      "Achieves 99.9% single-qubit gate fidelity at cryogenic temperatures",
      "Scalable path toward million-qubit quantum supercomputers"
    ],
    image: "https://images.unsplash.com/photo-1635070041078-e363dbe005cb?auto=format&fit=crop&w=800&q=80"
  }
];

export default function DailyNewsPage() {
  const [activeCategory, setActiveCategory] = useState("All");
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const categories = ["All", "AI & Models", "Systems & Cloud", "Cybersecurity", "Hardware & Fabs", "Databases", "Quantum Science"];

  const filteredNews = activeCategory === "All" 
    ? DAILY_HEADLINES 
    : DAILY_HEADLINES.filter(n => n.category === activeCategory);

  const handleShare = (id: string, title: string) => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(`${window.location.origin}/daily-news#${id}`);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    }
  };

  return (
    <div className="min-h-screen pb-16 space-y-12">
      <SEOHead 
        title="Daily Tech News & Briefing Wire — Bylines Journal"
        description="Real-time daily technical briefings, systems engineering news, AI research updates, and cybersecurity reports."
      />

      {/* ------------------------------------------------------------- */}
      {/* DAILY BRIEFING HEADER                                         */}
      {/* ------------------------------------------------------------- */}
      <section className="pt-4 pb-8 border-b border-zinc-200 dark:border-zinc-800 space-y-6">
        <div className="flex flex-wrap items-center justify-between text-[11px] font-mono tracking-tight text-neutral-500 dark:text-neutral-400 border-b border-zinc-150 dark:border-zinc-850 pb-3">
          <div className="flex items-center gap-2">
            <span className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-bold uppercase text-[9px]">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Live News Wire
            </span>
            <span>Monday, August 3, 2026</span>
          </div>
          <span className="hidden sm:inline">Daily Morning Edition · Published at 06:00 UTC</span>
        </div>

        <div className="space-y-3 max-w-4xl">
          <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-editorial-accent dark:text-editorial-gold">
            The Daily Wire
          </span>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-serif font-bold text-neutral-900 dark:text-neutral-50 tracking-tight leading-tight">
            Daily Technical News & Engineering Dispatches
          </h1>
          <p className="text-base sm:text-lg font-serif italic text-neutral-600 dark:text-neutral-400 max-w-3xl leading-relaxed">
            Concise, peer-reviewed daily briefings covering breakthrough AI models, cloud infrastructure updates, security vulnerabilities, and silicon fabrication.
          </p>
        </div>

        {/* Quick Executive 60-Second Summary Bento Box */}
        <div className="p-5 rounded-2xl bg-neutral-900 dark:bg-zinc-900 text-white space-y-3 shadow-md border border-neutral-800">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono font-bold text-editorial-gold uppercase tracking-wider flex items-center gap-2">
              <Zap className="w-3.5 h-3.5 fill-editorial-gold" />
              60-Second Executive Summary
            </span>
            <span className="text-[10px] font-mono text-zinc-400">Updated 22m ago</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs font-sans pt-1">
            <div className="space-y-1">
              <span className="text-editorial-gold font-semibold text-[10px] block">01 · REASONING AI</span>
              <p className="text-zinc-200 leading-snug">Open-weights 14B reasoning model hits 94% MATH score with zero cloud API dependency.</p>
            </div>
            <div className="space-y-1 border-t md:border-t-0 md:border-l border-zinc-800 pt-2 md:pt-0 md:pl-4">
              <span className="text-editorial-gold font-semibold text-[10px] block">02 · LINUX KERNEL 6.14</span>
              <p className="text-zinc-200 leading-snug">Native zero-copy socket buffers merged into mainline kernel for 100GbE NICs.</p>
            </div>
            <div className="space-y-1 border-t md:border-t-0 md:border-l border-zinc-800 pt-2 md:pt-0 md:pl-4">
              <span className="text-editorial-gold font-semibold text-[10px] block">03 · POST-QUANTUM TLS</span>
              <p className="text-zinc-200 leading-snug">NIST sets Q3 2027 mandatory migration cutoff for ML-KEM lattice key encapsulation.</p>
            </div>
          </div>
        </div>
      </section>

      {/* ------------------------------------------------------------- */}
      {/* FILTER TABS & DAILY NEWS FEED                                 */}
      {/* ------------------------------------------------------------- */}
      <section className="space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-200 dark:border-zinc-800 pb-3">
          <h2 className="text-lg font-serif font-bold text-neutral-900 dark:text-neutral-100 flex items-center gap-2">
            <Newspaper className="w-4 h-4 text-editorial-accent" />
            Today&apos;s Dispatches
          </h2>

          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 no-scrollbar">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-3 py-1 rounded-md text-xs font-sans whitespace-nowrap transition-colors ${
                  activeCategory === cat
                    ? 'bg-neutral-900 text-white dark:bg-white dark:text-black font-semibold'
                    : 'text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-zinc-900'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* News Stream Feed */}
        <div className="space-y-6">
          {filteredNews.map((item) => (
            <article 
              key={item.id} 
              id={item.id}
              className="p-6 rounded-2xl border border-zinc-200/80 dark:border-zinc-850 bg-white dark:bg-zinc-950 hover:border-zinc-300 dark:hover:border-zinc-700 transition-all duration-200 space-y-4 shadow-sm"
            >
              <div className="flex flex-col lg:flex-row gap-6 items-start">
                
                {/* News Image */}
                <div className="w-full lg:w-48 h-32 rounded-xl overflow-hidden bg-neutral-100 dark:bg-zinc-900 flex-shrink-0">
                  <img 
                    src={item.image} 
                    alt={item.title}
                    className="w-full h-full object-cover"
                  />
                </div>

                {/* Content Details */}
                <div className="flex-1 space-y-2.5">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2 text-[10px] font-mono">
                      <span className="px-2.5 py-0.5 rounded-md bg-neutral-100 dark:bg-zinc-900 text-editorial-accent dark:text-editorial-gold font-bold uppercase">
                        {item.category}
                      </span>
                      <span className="text-neutral-400">·</span>
                      <span className="text-neutral-500 flex items-center gap-1">
                        <Clock className="w-3 h-3 text-editorial-accent" />
                        {item.time}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleShare(item.id, item.title)}
                        className="text-[10px] font-mono flex items-center gap-1 text-neutral-500 hover:text-neutral-900 dark:hover:text-neutral-100 px-2 py-1 rounded bg-neutral-50 dark:bg-zinc-900 border border-zinc-200/60 dark:border-zinc-800 transition-colors"
                        title="Copy News Link"
                      >
                        {copiedId === item.id ? (
                          <span className="text-emerald-500 font-bold flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3" /> Copied!
                          </span>
                        ) : (
                          <>
                            <Share2 className="w-3 h-3" />
                            <span>Share</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>

                  <h3 className="text-lg sm:text-xl font-serif font-bold text-neutral-900 dark:text-neutral-50 leading-snug">
                    {item.title}
                  </h3>

                  <p className="text-xs sm:text-sm font-sans text-neutral-600 dark:text-neutral-400 leading-relaxed">
                    {item.summary}
                  </p>

                  {/* Bulleted Takeaways */}
                  <div className="pt-2">
                    <span className="text-[10px] font-mono uppercase font-bold text-neutral-400 block mb-1.5">
                      Key Takeaways:
                    </span>
                    <ul className="space-y-1 text-xs font-sans text-neutral-700 dark:text-neutral-300">
                      {item.keyPoints.map((point, i) => (
                        <li key={i} className="flex items-start gap-2">
                          <span className="w-1.5 h-1.5 rounded-full bg-editorial-accent dark:bg-editorial-gold mt-1.5 flex-shrink-0" />
                          <span>{point}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="pt-3 flex items-center justify-between text-[11px] text-neutral-500 dark:text-neutral-400 font-sans border-t border-zinc-100 dark:border-zinc-900">
                    <span className="font-medium">Source: {item.source}</span>
                    <span className="font-mono text-[10px] text-neutral-400">{item.readTime}</span>
                  </div>
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* ------------------------------------------------------------- */}
      {/* NEWSLETTER DISPATCH FORM                                      */}
      {/* ------------------------------------------------------------- */}
      <NewsletterInline />
    </div>
  );
}
