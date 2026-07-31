"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { authAPI, postsAPI } from "../../services/api";
import { Clock, Bookmark, Trash2, ArrowRight } from "lucide-react";
import SEOHead from "../../components/SEOHead";
import Breadcrumbs from "../../components/Breadcrumbs";
import { SkeletonCard } from "../../components/Skeleton";
import { useToast } from "../../context/ToastContext";
import ProtectedRoute from "../../components/ProtectedRoute";

function BookmarksContent() {
  const [bookmarks, setBookmarks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { showToast } = useToast();

  useEffect(() => {
    const fetchBookmarks = async () => {
      try {
        const res = await authAPI.getBookmarks();
        if (res.data.success) {
          setBookmarks(res.data.bookmarks || []);
        }
      } catch (err: any) {
        console.error("Failed to fetch bookmarks:", err.message);
        showToast("Could not load bookmarks.", "error");
      } finally {
        setLoading(false);
      }
    };
    fetchBookmarks();
  }, [showToast]);

  const handleRemoveBookmark = async (e: React.MouseEvent, postId: string) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      const res = await postsAPI.bookmarkPost(postId);
      if (res.data.success) {
        setBookmarks((prev) => prev.filter((b) => b._id !== postId));
        showToast("Bookmark removed", "success");
      }
    } catch (err: any) {
      console.error("Failed to remove bookmark:", err.message);
      showToast("Error removing bookmark.", "error");
    }
  };

  return (
    <div className="max-w-6xl mx-auto py-4 space-y-6">
      <SEOHead
        title="My Bookmarks"
        description="Browse your collection of saved editorial stories and publications."
      />

      <div className="flex flex-col gap-1">
        <Breadcrumbs items={[{ label: "Saved Collection" }]} />
        <div className="border-b border-neutral-200/60 dark:border-neutral-800/60 pb-5">
          <h1 className="text-3xl font-bold font-serif text-neutral-900 dark:text-neutral-50 flex items-center gap-2">
            <Bookmark className="w-7 h-7 text-editorial-accent" />
            <span>My Bookmarks</span>
          </h1>
          <p className="text-xs text-neutral-550 dark:text-neutral-450 mt-1">
            Your saved collection of human-reviewed publications and editorial reviews.
          </p>
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pt-4">
          <SkeletonCard />
          <SkeletonCard />
          <SkeletonCard />
        </div>
      ) : bookmarks.length === 0 ? (
        <div className="py-20 text-center space-y-4 max-w-md mx-auto">
          <div className="w-12 h-12 rounded-full bg-neutral-100 dark:bg-neutral-900 flex items-center justify-center mx-auto text-neutral-400">
            <Bookmark className="w-6 h-6" />
          </div>
          <h3 className="font-serif text-sm font-medium text-neutral-700 dark:text-neutral-300">
            Your collection is empty
          </h3>
          <p className="text-xs text-neutral-550 dark:text-neutral-400 leading-relaxed font-sans">
            Bookmark articles while browsing to save them here for offline reading or quick reference.
          </p>
          <Link
            href="/posts"
            className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-editorial-accent dark:text-editorial-gold hover:opacity-80 transition-opacity"
          >
            <span>Explore Articles</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pt-4">
          {bookmarks.map((post) => (
            <article
              key={post._id}
              className="article-card flex flex-col group p-4 rounded-sm border border-neutral-200/55 dark:border-neutral-800 bg-white/50 dark:bg-zinc-950/20 hover:border-neutral-300 dark:hover:border-neutral-700 transition-all duration-300 relative"
            >
              {post.featuredImage && (
                <div className="overflow-hidden rounded-sm mb-4 aspect-[16/10] bg-neutral-100 dark:bg-neutral-900">
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
                  <h3 className="text-sm font-bold leading-snug group-hover:text-editorial-accent dark:group-hover:text-editorial-gold transition-colors font-serif text-neutral-850 dark:text-neutral-100 pr-6">
                    {post.title}
                  </h3>
                </Link>
                <p className="text-xs text-neutral-550 dark:text-neutral-400 leading-relaxed font-sans line-clamp-3">
                  {post.summary}
                </p>
              </div>

              {/* Author and Date row */}
              <div className="flex items-center justify-between pt-4 mt-4 border-t border-neutral-100 dark:border-neutral-900">
                <div className="flex items-center space-x-2 text-[10px] text-neutral-400 dark:text-neutral-500 font-sans">
                  <span>By {post.author?.name}</span>
                  <span>•</span>
                  <span className="flex items-center">
                    <Clock className="w-3 h-3 mr-1" /> {post.readingTime} min
                  </span>
                </div>
                <button
                  onClick={(e) => handleRemoveBookmark(e, post._id)}
                  className="text-neutral-400 hover:text-red-500 transition-colors p-1"
                  title="Remove from saved list"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}

export default function Bookmarks() {
  return (
    <ProtectedRoute>
      <BookmarksContent />
    </ProtectedRoute>
  );
}
