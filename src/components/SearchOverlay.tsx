"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Search, X, Clock, TrendingUp, ArrowUpRight } from "lucide-react";
import { postsAPI } from "../services/api";

const RECENT_KEY = "byline_recent_searches";

function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState(value);
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);
  return debouncedValue;
}

export default function SearchOverlay() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<any[]>([]);
  const [searching, setSearching] = useState(false);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  const debouncedQuery = useDebounce(query, 280);

  // Keyboard shortcut: Cmd/Ctrl+K
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setOpen((o) => !o);
      }
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 80);
      try {
        const saved = JSON.parse(localStorage.getItem(RECENT_KEY) || "[]");
        setRecentSearches(saved);
      } catch {}
    } else {
      setQuery("");
      setResults([]);
    }
  }, [open]);

  useEffect(() => {
    if (!debouncedQuery.trim()) {
      setResults([]);
      return;
    }
    let cancelled = false;
    setSearching(true);
    postsAPI.getPosts({ search: debouncedQuery, limit: 5 }).then((res) => {
      if (!cancelled && res.data.success) setResults(res.data.posts || []);
    }).catch(() => {}).finally(() => { if (!cancelled) setSearching(false); });
    return () => { cancelled = true; };
  }, [debouncedQuery]);

  const saveSearch = useCallback((q: string) => {
    try {
      const existing: string[] = JSON.parse(localStorage.getItem(RECENT_KEY) || "[]");
      const updated = [q, ...existing.filter((s) => s !== q)].slice(0, 5);
      localStorage.setItem(RECENT_KEY, JSON.stringify(updated));
      setRecentSearches(updated);
    } catch {}
  }, []);

  const handleSubmit = (q: string) => {
    if (!q.trim()) return;
    saveSearch(q.trim());
    setOpen(false);
    router.push(`/search?q=${encodeURIComponent(q.trim())}`);
  };

  const clearRecent = () => {
    localStorage.removeItem(RECENT_KEY);
    setRecentSearches([]);
  };

  return (
    <>
      {/* Trigger Button */}
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs text-neutral-500 dark:text-neutral-400 border border-neutral-200/60 dark:border-neutral-800 hover:border-neutral-300 dark:hover:border-neutral-700 bg-white/60 dark:bg-zinc-950/60 backdrop-blur-sm transition-all hover:bg-neutral-50 dark:hover:bg-zinc-900"
        aria-label="Open search (Ctrl+K)"
      >
        <Search className="w-3.5 h-3.5" />
        <span className="hidden sm:inline font-sans text-[11px]">Search articles...</span>
        <kbd className="hidden sm:inline px-1.5 py-0.5 rounded text-[9px] font-mono bg-neutral-100 dark:bg-neutral-800 text-neutral-400 dark:text-neutral-500 border border-neutral-200/60 dark:border-neutral-700">
          ⌘K
        </kbd>
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="fixed inset-0 z-[200] flex items-start justify-center pt-[12vh] px-4"
          >
            {/* Backdrop */}
            <div
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
              onClick={() => setOpen(false)}
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.97, y: -12 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.97, y: -12 }}
              transition={{ duration: 0.18 }}
              className="relative w-full max-w-xl bg-white dark:bg-zinc-950 rounded-2xl shadow-2xl border border-neutral-200/60 dark:border-neutral-800 overflow-hidden"
            >
              {/* Input */}
              <div className="flex items-center gap-3 px-4 border-b border-neutral-100 dark:border-neutral-900">
                <Search className="w-4 h-4 text-neutral-400 flex-shrink-0" />
                <input
                  ref={inputRef}
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSubmit(query)}
                  placeholder="Search articles, authors, topics..."
                  className="flex-1 py-4 text-sm bg-transparent outline-none text-neutral-900 dark:text-neutral-100 placeholder-neutral-400 dark:placeholder-neutral-600 font-sans"
                  autoComplete="off"
                />
                {query && (
                  <button onClick={() => setQuery("")} className="text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-300 p-1">
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
                <button onClick={() => setOpen(false)} className="text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-300">
                  <kbd className="px-1.5 py-0.5 rounded text-[9px] font-mono bg-neutral-100 dark:bg-neutral-800 text-neutral-400 border border-neutral-200/60 dark:border-neutral-700">
                    ESC
                  </kbd>
                </button>
              </div>

              {/* Results */}
              <div className="max-h-[380px] overflow-y-auto">
                {searching && (
                  <div className="flex items-center justify-center py-8 gap-2">
                    <div className="w-3 h-3 rounded-full bg-editorial-accent animate-bounce" style={{ animationDelay: "0ms" }} />
                    <div className="w-3 h-3 rounded-full bg-editorial-accent animate-bounce" style={{ animationDelay: "120ms" }} />
                    <div className="w-3 h-3 rounded-full bg-editorial-accent animate-bounce" style={{ animationDelay: "240ms" }} />
                  </div>
                )}

                {!searching && query && results.length === 0 && (
                  <div className="py-10 text-center text-xs text-neutral-400">
                    No results for &ldquo;<span className="font-semibold text-neutral-600 dark:text-neutral-300">{query}</span>&rdquo;
                  </div>
                )}

                {!searching && results.length > 0 && (
                  <div className="p-2">
                    {results.map((post) => (
                      <button
                        key={post._id}
                        onClick={() => { saveSearch(query); setOpen(false); router.push(`/post/${post.slug}`); }}
                        className="w-full flex items-start gap-3 p-3 rounded-xl hover:bg-neutral-50 dark:hover:bg-zinc-900 transition-colors text-left group"
                      >
                        {post.featuredImage && (
                          <img src={post.featuredImage} alt="" className="w-10 h-10 rounded-lg object-cover flex-shrink-0" />
                        )}
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-bold text-neutral-800 dark:text-neutral-100 line-clamp-1 group-hover:text-editorial-accent dark:group-hover:text-editorial-gold transition-colors font-serif">
                            {post.title}
                          </p>
                          <p className="text-[10px] text-neutral-400 mt-0.5">
                            {post.category?.name} · {post.readingTime} min read
                          </p>
                        </div>
                        <ArrowUpRight className="w-3.5 h-3.5 text-neutral-300 group-hover:text-editorial-accent dark:group-hover:text-editorial-gold flex-shrink-0 mt-0.5 transition-colors" />
                      </button>
                    ))}
                    <button
                      onClick={() => handleSubmit(query)}
                      className="w-full mt-1 py-2 text-[10px] font-bold uppercase tracking-wider text-editorial-accent dark:text-editorial-gold hover:bg-editorial-accent/5 dark:hover:bg-editorial-gold/5 rounded-xl transition-colors flex items-center justify-center gap-1"
                    >
                      See all results for &ldquo;{query}&rdquo; <ArrowUpRight className="w-3 h-3" />
                    </button>
                  </div>
                )}

                {!query && (
                  <div className="p-3 space-y-4">
                    {recentSearches.length > 0 && (
                      <div>
                        <div className="flex items-center justify-between px-2 mb-1">
                          <span className="text-[9px] uppercase tracking-widest font-bold text-neutral-400 flex items-center gap-1">
                            <Clock className="w-3 h-3" /> Recent
                          </span>
                          <button onClick={clearRecent} className="text-[9px] text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-300">
                            Clear
                          </button>
                        </div>
                        {recentSearches.map((s) => (
                          <button
                            key={s}
                            onClick={() => { setQuery(s); }}
                            className="w-full flex items-center gap-2 px-3 py-2 rounded-xl hover:bg-neutral-50 dark:hover:bg-zinc-900 transition-colors text-left"
                          >
                            <Clock className="w-3 h-3 text-neutral-400" />
                            <span className="text-xs text-neutral-600 dark:text-neutral-400">{s}</span>
                          </button>
                        ))}
                      </div>
                    )}

                    <div>
                      <span className="text-[9px] uppercase tracking-widest font-bold text-neutral-400 flex items-center gap-1 px-2 mb-1">
                        <TrendingUp className="w-3 h-3" /> Trending topics
                      </span>
                      {["AI & Technology", "Design Systems", "Climate Policy", "Financial Markets"].map((topic) => (
                        <button
                          key={topic}
                          onClick={() => setQuery(topic)}
                          className="w-full flex items-center gap-2 px-3 py-2 rounded-xl hover:bg-neutral-50 dark:hover:bg-zinc-900 transition-colors text-left"
                        >
                          <TrendingUp className="w-3 h-3 text-editorial-accent dark:text-editorial-gold" />
                          <span className="text-xs text-neutral-600 dark:text-neutral-400">{topic}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Footer hint */}
              <div className="px-4 py-2.5 border-t border-neutral-100 dark:border-neutral-900 flex items-center justify-between text-[9px] text-neutral-400 font-mono">
                <span>↑↓ Navigate &nbsp; ↵ Select</span>
                <span>Powered by Byline Search</span>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
