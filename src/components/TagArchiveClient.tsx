"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { postsAPI, tagsAPI } from '../services/api';
import { Clock } from 'lucide-react';
import SEOHead from './SEOHead';

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://bylines.dev';

export default function TagArchiveClient({ slug }: { slug: string }) {
  const [posts, setPosts] = useState<any[]>([]);
  const [tagName, setTagName] = useState<string>(slug);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTagPosts = async () => {
      if (!slug) return;
      setLoading(true);
      setTagName(slug);
      try {
        const tagsRes = await tagsAPI.getTags();
        if (tagsRes.data.success) {
          const matched = tagsRes.data.tags.find((t: any) => t.slug === slug);
          if (matched) setTagName(matched.name);
        }

        const postsRes = await postsAPI.getPosts({ tag: slug, status: 'published', limit: 30 });
        if (postsRes.data.success) {
          setPosts(postsRes.data.posts);
        }
      } catch (err: any) {
        console.error('Tag archive load error:', err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchTagPosts();
  }, [slug]);

  const tagUrl = `${BASE_URL}/tag/${slug}`;

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20">
        <SEOHead title="Loading Tag Archive | Bylines.dev" />
        <div className="animate-pulse font-serif text-xs tracking-widest text-neutral-455 uppercase text-center">
          Loading tag archive...
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      <SEOHead 
        title={`#${tagName} Articles | Bylines.dev`} 
        description={`Browse technical essays and articles tagged with #${tagName}.`}
        url={tagUrl}
      />

      {/* Header */}
      <div className="border-b border-neutral-250/50 dark:border-neutral-850 pb-5 max-w-3xl">
        <span className="text-[10px] uppercase font-bold text-editorial-accent dark:text-editorial-gold tracking-widest">
          Tagged Articles
        </span>
        <h1 className="text-3xl sm:text-4xl font-extrabold font-serif mt-1 text-neutral-900 dark:text-neutral-50 tracking-tight">
          #{tagName}
        </h1>
      </div>

      {/* Grid List */}
      {posts.length === 0 ? (
        <div className="py-20 text-center text-xs text-neutral-500 font-serif italic">
          No articles published with this tag yet.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {posts.map((post) => (
            <article key={post._id} className="flex flex-col group border border-zinc-150 dark:border-zinc-900 p-4 rounded-2xl bg-white/50 dark:bg-zinc-950/20 hover:border-zinc-200 dark:hover:border-zinc-800 transition-all duration-300">
              {post.featuredImage && (
                <div className="overflow-hidden rounded-xl mb-4 aspect-[16/10] bg-neutral-100 dark:bg-neutral-900">
                  <Link href={`/post/${post.slug}`}>
                    <img
                      src={post.featuredImage}
                      alt={post.title || "Tagged article cover image"}
                      className="w-full h-full object-cover group-hover:scale-[1.01] transition-transform duration-300"
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
                <p className="text-xs text-neutral-550 dark:text-neutral-400 leading-relaxed font-sans line-clamp-3">
                  {post.summary}
                </p>
              </div>
              <div className="flex items-center space-x-3 text-[10px] text-neutral-455 dark:text-neutral-500 font-sans pt-4 mt-4 border-t border-neutral-100 dark:border-neutral-900">
                <span>By {post.author?.name || 'Byline Desk'}</span>
                <span>•</span>
                <span className="flex items-center"><Clock className="w-3.5 h-3.5 mr-1 text-editorial-accent" /> {post.readingTime} min read</span>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
