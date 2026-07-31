"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { authAPI } from '../../../services/api';
import { Clock, User, Heart, MessageSquare, BookOpen } from 'lucide-react';
import SEOHead from '../../../components/SEOHead';
import FollowButton from '../../../components/FollowButton';
import { motion, AnimatePresence } from 'framer-motion';

export default function AuthorProfile() {
  const { id } = useParams();
  const [posts, setPosts] = useState<any[]>([]);
  const [author, setAuthor] = useState<any>(null);
  const [followerCount, setFollowerCount] = useState(0);
  const [followingCount, setFollowingCount] = useState(0);
  const [activeTab, setActiveTab] = useState<'articles' | 'followers' | 'following'>('articles');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAuthorData = async () => {
      if (!id) return;
      setLoading(true);
      try {
        const res = await authAPI.getUserProfile(id as string);
        if (res.data.success) {
          setAuthor(res.data.user);
          setPosts(res.data.posts);
          setFollowerCount(res.data.followerCount);
          setFollowingCount(res.data.followingCount);
        }
      } catch (err: any) {
        console.error('Author profile loading error:', err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchAuthorData();
  }, [id]);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20">
        <SEOHead title="Loading Profile - Byline" />
        <div className="animate-pulse font-serif text-xs tracking-widest text-neutral-400 uppercase text-center">
          Loading Profile...
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      <SEOHead 
        title={author?.name ? `${author.name} Profile - Byline` : 'Writer Profile'} 
        description={author?.bio || 'Read articles by this writer.'}
      />

      {/* Author Card Info */}
      {author ? (
        <div className="flex flex-col sm:flex-row items-center sm:items-start space-y-6 sm:space-y-0 sm:space-x-8 border-b border-neutral-200/50 dark:border-neutral-850 pb-8">
          <div className="w-24 h-24 rounded-full bg-neutral-200 dark:bg-neutral-850 overflow-hidden flex-shrink-0 flex items-center justify-center border border-neutral-300 dark:border-neutral-750">
            {author.profileImage ? (
              <img src={author.profileImage} alt={author.name} className="w-full h-full object-cover" />
            ) : (
              <User className="w-12 h-12 text-neutral-400" />
            )}
          </div>
          <div className="space-y-3 text-center sm:text-left flex-grow">
            <span className="text-[10px] uppercase font-bold text-editorial-accent dark:text-editorial-gold tracking-widest block">
              Contributor Profile
            </span>
            <div className="flex flex-col sm:flex-row sm:items-center gap-4">
              <h1 className="text-3xl font-extrabold font-serif leading-tight text-neutral-900 dark:text-neutral-50 tracking-tight">
                {author.name}
              </h1>
              <div className="flex justify-center">
                <FollowButton 
                  authorId={author._id} 
                  initialFollowerCount={followerCount} 
                />
              </div>
            </div>
            {author.bio ? (
              <p className="text-xs text-neutral-600 dark:text-neutral-400 leading-relaxed max-w-xl font-sans mt-1">
                {author.bio}
              </p>
            ) : (
              <p className="text-xs text-neutral-400 dark:text-neutral-500 italic font-sans mt-1">
                This contributor has not shared a biography.
              </p>
            )}

            {/* Social Counts & Nav Tabs */}
            <div className="flex items-center justify-center sm:justify-start gap-6 pt-2 font-sans text-xs">
              <button 
                onClick={() => setActiveTab('articles')}
                className={`pb-1 border-b-2 transition-colors ${activeTab === 'articles' ? 'border-editorial-accent text-editorial-accent dark:text-editorial-gold font-bold' : 'border-transparent text-neutral-450 hover:text-neutral-700'}`}
              >
                {posts.length} {posts.length === 1 ? 'Article' : 'Articles'}
              </button>
              <button 
                onClick={() => setActiveTab('followers')}
                className={`pb-1 border-b-2 transition-colors ${activeTab === 'followers' ? 'border-editorial-accent text-editorial-accent dark:text-editorial-gold font-bold' : 'border-transparent text-neutral-450 hover:text-neutral-700'}`}
              >
                {followerCount} {followerCount === 1 ? 'Follower' : 'Followers'}
              </button>
              <button 
                onClick={() => setActiveTab('following')}
                className={`pb-1 border-b-2 transition-colors ${activeTab === 'following' ? 'border-editorial-accent text-editorial-accent dark:text-editorial-gold font-bold' : 'border-transparent text-neutral-450 hover:text-neutral-700'}`}
              >
                {followingCount} Following
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="py-8 text-center text-xs text-neutral-550 italic font-serif">
          Contributor profile details unavailable.
        </div>
      )}

      {/* Tabbed Activity Views */}
      <div className="space-y-6">
        <AnimatePresence mode="wait">
          {activeTab === 'articles' && (
            <motion.div
              key="articles"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-6"
            >
              {posts.length === 0 ? (
                <p className="text-xs text-neutral-450 dark:text-neutral-550 italic py-4">This author has not published any articles yet.</p>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
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
                      <div className="flex items-center space-x-3 text-[10px] text-neutral-450 dark:text-neutral-500 font-sans pt-4 mt-4 border-t border-neutral-100 dark:border-neutral-900">
                        <span className="flex items-center"><Clock className="w-3.5 h-3.5 mr-1 text-editorial-accent" /> {post.readingTime} min read</span>
                      </div>
                    </article>
                  ))}
                </div>
              )}
            </motion.div>
          )}

          {activeTab === 'followers' && (
            <motion.div
              key="followers"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4"
            >
              {(!author.followers || author.followers.length === 0) ? (
                <p className="text-xs text-neutral-450 dark:text-neutral-500 italic py-4 col-span-full">No followers yet.</p>
              ) : (
                author.followers.map((f: any) => (
                  <Link 
                    key={f._id}
                    href={`/author/${f._id}`}
                    className="flex items-center gap-3 p-3 bg-neutral-50/50 dark:bg-zinc-950/40 border border-neutral-200/50 dark:border-neutral-900 rounded-xl hover:border-editorial-accent/30 dark:hover:border-editorial-gold/30 transition-all"
                  >
                    {f.profileImage ? (
                      <img src={f.profileImage} alt="" className="w-8 h-8 rounded-full object-cover border" />
                    ) : (
                      <div className="w-8 h-8 rounded-full bg-neutral-200 dark:bg-neutral-800 flex items-center justify-center font-bold text-[10px] uppercase text-neutral-500 border border-neutral-300 dark:border-neutral-750">
                        {(f.name || "?")[0]}
                      </div>
                    )}
                    <span className="text-xs font-bold text-neutral-800 dark:text-neutral-250 truncate">{f.name}</span>
                  </Link>
                ))
              )}
            </motion.div>
          )}

          {activeTab === 'following' && (
            <motion.div
              key="following"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4"
            >
              {(!author.following || author.following.length === 0) ? (
                <p className="text-xs text-neutral-450 dark:text-neutral-500 italic py-4 col-span-full">Not following anyone yet.</p>
              ) : (
                author.following.map((f: any) => (
                  <Link 
                    key={f._id}
                    href={`/author/${f._id}`}
                    className="flex items-center gap-3 p-3 bg-neutral-50/50 dark:bg-zinc-950/40 border border-neutral-200/50 dark:border-neutral-900 rounded-xl hover:border-editorial-accent/30 dark:hover:border-editorial-gold/30 transition-all"
                  >
                    {f.profileImage ? (
                      <img src={f.profileImage} alt="" className="w-8 h-8 rounded-full object-cover border" />
                    ) : (
                      <div className="w-8 h-8 rounded-full bg-neutral-200 dark:bg-neutral-800 flex items-center justify-center font-bold text-[10px] uppercase text-neutral-500 border border-neutral-300 dark:border-neutral-750">
                        {(f.name || "?")[0]}
                      </div>
                    )}
                    <span className="text-xs font-bold text-neutral-800 dark:text-neutral-250 truncate">{f.name}</span>
                  </Link>
                ))
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
