"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { authAPI } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { Clock, Rss, ArrowRight, Star, UserPlus } from 'lucide-react';
import SEOHead from '../../components/SEOHead';
import { SkeletonCard } from '../../components/Skeleton';
import FollowButton from '../../components/FollowButton';

export default function FollowerFeed() {
  const { user } = useAuth();
  const [posts, setPosts] = useState<any[]>([]);
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const fetchFeed = async (pageNumber: number) => {
    setLoading(true);
    try {
      const res = await authAPI.getFollowerFeed(pageNumber);
      if (res.data.success) {
        setPosts(res.data.posts);
        setTotalPages(res.data.pages || 1);
        setPage(res.data.page || 1);
      }
    } catch (err) {
      console.error("Error fetching follower feed:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchSuggestions = async () => {
    try {
      const res = await authAPI.getUsers();
      if (res.data.success) {
        // filter out current user and prioritize authors/admins
        const list = res.data.users
          .filter((u: any) => u._id !== user?._id && ['Author', 'Admin', 'Super Admin'].includes(u.role))
          .slice(0, 5);
        setSuggestions(list);
      }
    } catch (err) {
      console.error("Error fetching suggested authors:", err);
    }
  };

  useEffect(() => {
    if (user) {
      fetchFeed(1);
      fetchSuggestions();
    } else {
      setLoading(false);
    }
  }, [user]);

  if (!user) {
    return (
      <div className="max-w-3xl mx-auto py-20 px-4 text-center space-y-6">
        <SEOHead title="Personalized Feed - Byline" />
        <div className="w-16 h-16 bg-neutral-105 dark:bg-neutral-900 text-neutral-400 dark:text-neutral-500 rounded-full flex items-center justify-center mx-auto">
          <Rss className="w-6 h-6" />
        </div>
        <h1 className="text-2xl font-serif font-extrabold text-neutral-900 dark:text-neutral-550">
          Subscribe to your Feed
        </h1>
        <p className="text-xs text-neutral-500 dark:text-neutral-400 leading-relaxed max-w-sm mx-auto">
          Sign in or create an account to start following premium authors and build your personalized reading queue.
        </p>
        <div className="pt-2">
          <Link
            href="/login"
            className="inline-flex items-center gap-1.5 text-xs px-5 py-2.5 bg-neutral-900 dark:bg-neutral-100 text-white dark:text-black font-semibold uppercase tracking-wider rounded-lg transition-colors"
          >
            <span>Log In to Proceed</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 grid grid-cols-1 lg:grid-cols-12 gap-10">
      <SEOHead title="Personalized Feed - Byline" description="Latest publications from the journalists and editors you follow." />

      {/* Main Feed Content (8 Cols) */}
      <div className="lg:col-span-8 space-y-8">
        <div className="space-y-2 border-b border-neutral-150 dark:border-neutral-850 pb-5">
          <span className="text-[9px] uppercase tracking-widest font-extrabold text-editorial-accent dark:text-editorial-gold">
            Your Newsroom
          </span>
          <h1 className="text-3xl font-extrabold font-serif leading-tight text-neutral-900 dark:text-neutral-50 tracking-tight flex items-center gap-2">
            <Rss className="w-6 h-6 text-editorial-accent" />
            <span>Personalized Feed</span>
          </h1>
          <p className="text-xs text-neutral-500 dark:text-neutral-400">
            Real-time coverage from editors and contributors in your following network.
          </p>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
            <SkeletonCard />
            <SkeletonCard />
          </div>
        ) : posts.length === 0 ? (
          <div className="bg-neutral-50 dark:bg-zinc-950 p-8 border border-neutral-200/50 dark:border-neutral-900 rounded-3xl text-center space-y-4 py-12">
            <h3 className="font-serif text-lg font-bold text-neutral-800 dark:text-neutral-200">
              Your feed is currently quiet
            </h3>
            <p className="text-xs text-neutral-550 dark:text-neutral-400 max-w-sm mx-auto leading-relaxed">
              Explore outstanding journalists on the sidebar and click Follow to view their latest essays and investigations here.
            </p>
          </div>
        ) : (
          <div className="space-y-8">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
              {posts.map((post) => (
                <article key={post._id} className="flex flex-col group border border-zinc-150 dark:border-zinc-900 p-4 rounded-2xl bg-white/50 dark:bg-zinc-950/20 hover:border-zinc-200 dark:hover:border-zinc-800 transition-all duration-300 shadow-[0_2px_15px_rgba(0,0,0,0.01)] card-tilt">
                  {post.featuredImage && (
                    <div className="overflow-hidden rounded-xl mb-4 aspect-[16/10] bg-neutral-100 dark:bg-neutral-900">
                      <Link href={`/post/${post.slug}`}>
                        <img
                          src={post.featuredImage}
                          alt=""
                          className="w-full h-full object-cover group-hover:scale-[1.01] transition-transform duration-350"
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
                    <p className="text-xs text-neutral-500 dark:text-neutral-400 leading-relaxed font-sans line-clamp-3">
                      {post.summary}
                    </p>
                  </div>
                  <div className="flex items-center justify-between text-[9px] text-neutral-450 dark:text-neutral-500 font-sans pt-4 mt-4 border-t border-neutral-100 dark:border-neutral-900">
                    <span className="font-bold hover:text-editorial-accent">By {post.author?.name}</span>
                    <span className="flex items-center"><Clock className="w-3.5 h-3.5 mr-1 text-editorial-accent" /> {post.readingTime} min read</span>
                  </div>
                </article>
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center gap-2 pt-4">
                <button
                  onClick={() => fetchFeed(page - 1)}
                  disabled={page === 1}
                  className="px-3 py-1.5 rounded-lg border text-[10px] uppercase font-bold tracking-wider disabled:opacity-40"
                >
                  Previous
                </button>
                <button
                  onClick={() => fetchFeed(page + 1)}
                  disabled={page === totalPages}
                  className="px-3 py-1.5 rounded-lg border text-[10px] uppercase font-bold tracking-wider disabled:opacity-40"
                >
                  Next
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Suggested Authors Sidebar (4 Cols) */}
      <div className="lg:col-span-4 space-y-6">
        <div className="border border-zinc-200/50 dark:border-zinc-850 p-5 rounded-2xl bg-white dark:bg-zinc-950 space-y-4">
          <h4 className="text-[10px] uppercase tracking-widest font-extrabold text-neutral-800 dark:text-neutral-250 border-b pb-2 flex items-center gap-1.5">
            <Star className="w-3.5 h-3.5 text-editorial-accent fill-current" />
            <span>Suggested Contributors</span>
          </h4>

          {suggestions.length === 0 ? (
            <p className="text-[10px] text-neutral-400 italic">No suggestions available right now.</p>
          ) : (
            <div className="space-y-4">
              {suggestions.map((s) => (
                <div key={s._id} className="flex items-center justify-between gap-3">
                  <Link href={`/author/${s._id}`} className="flex items-center gap-2.5 min-w-0">
                    {s.profileImage ? (
                      <img src={s.profileImage} alt="" className="w-8 h-8 rounded-full object-cover border" />
                    ) : (
                      <div className="w-8 h-8 rounded-full bg-neutral-200 dark:bg-neutral-800 flex items-center justify-center font-bold text-[10px] uppercase text-neutral-500">
                        {(s.name || "?")[0]}
                      </div>
                    )}
                    <div className="min-w-0">
                      <h5 className="text-xs font-bold text-neutral-850 dark:text-neutral-200 truncate leading-snug">
                        {s.name}
                      </h5>
                      <span className="text-[9px] text-neutral-400 block truncate">
                        {s.role}
                      </span>
                    </div>
                  </Link>

                  <FollowButton authorId={s._id} initialFollowerCount={s.followers?.length || 0} />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
