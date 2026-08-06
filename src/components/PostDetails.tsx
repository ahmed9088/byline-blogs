"use client";

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { useGeolocation } from '../hooks/useGeolocation';
import { postsAPI, commentsAPI } from '../services/api';
import { 
  Clock, Share2, CornerDownRight, 
  MessageSquare, Play, Pause, Square, Volume2, Lock, 
  ShieldCheck, Printer, Eye 
} from 'lucide-react';
import SEOHead from './SEOHead';
import { ArticleJSONLD, BreadcrumbJSONLD } from './JSONLD';
import LikeButton from './LikeButton';
import BookmarkButton from './BookmarkButton';
import SharePanel from './SharePanel';
import ReactionBar from './ReactionBar';
import WhoIsReading from './WhoIsReading';
import FollowButton from './FollowButton';
import CommentLike from './CommentLike';
import MentionInput from './MentionInput';


const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.bylines.dev';

interface PostDetailsProps {
  slug: string;
}

export default function PostDetails({ slug }: PostDetailsProps) {
  const { user } = useAuth();
  const { showToast } = useToast();
  const geo = useGeolocation();

  const [post, setPost] = useState<any>(null);
  const [comments, setComments] = useState<any[]>([]);
  const [related, setRelated] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Likes & Bookmarks
  const [liked, setLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(0);
  const [bookmarked, setBookmarked] = useState(false);

  // Comment input form states
  const [commentContent, setCommentContent] = useState('');
  const [commentMentions, setCommentMentions] = useState<string[]>([]);
  const [guestName, setGuestName] = useState('');
  const [guestEmail, setGuestEmail] = useState('');
  const [activeReplyId, setActiveReplyId] = useState<string | null>(null);
  const [replyContent, setReplyContent] = useState('');
  const [replyMentions, setReplyMentions] = useState<string[]>([]);

  
  // Reading progress and active heading
  const [scrollProgress, setScrollProgress] = useState(0);
  const [activeHeading, setActiveHeading] = useState('');

  // TTS Read-Aloud States
  const [ttsSpeaking, setTtsSpeaking] = useState(false);
  const [ttsPaused, setTtsPaused] = useState(false);
  const [ttsRate, setTtsRate] = useState(1);
  const synthRef = useRef<SpeechSynthesis | null>(null);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  // Metered Paywall States
  const [paywallBlocked, setPaywallBlocked] = useState(false);
  const [remainingFreeArticles, setRemainingFreeArticles] = useState(3);

  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      synthRef.current = window.speechSynthesis;
    }
  }, []);

  const getLocalizedPrice = () => {
    if (geo.currency === 'PKR') return '₨ 800 PKR';
    if (geo.currency === 'INR') return '₹400 INR';
    if (geo.currency === 'GBP') return '£4.00 GBP';
    if (geo.currency === 'EUR') return '€4.50 EUR';
    return '$5.00 USD';
  };

  const handlePrint = () => {
    window.print();
  };

  // Scroll Progress
  useEffect(() => {
    const handleScroll = () => {
      const totalScroll = document.documentElement.scrollHeight - window.innerHeight;
      if (totalScroll <= 0) return;
      const progress = (window.scrollY / totalScroll) * 100;
      setScrollProgress(progress);

      if (post?.tableOfContents?.length > 0) {
        let currentActive = '';
        for (const heading of post.tableOfContents) {
          const el = document.getElementById(heading.id);
          if (el) {
            const rect = el.getBoundingClientRect();
            if (rect.top <= 120) {
              currentActive = heading.id;
            }
          }
        }
        if (currentActive) {
          setActiveHeading(currentActive);
        }
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [post]);

  // Load details
  useEffect(() => {
    const fetchPostDetails = async () => {
      setLoading(true);
      setPaywallBlocked(false);
      try {
        const response = await postsAPI.getPostBySlug(slug);
        if (response.data.success) {
          const fetchedPost = response.data.post;
          setPost(fetchedPost);
          setRelated(response.data.related || []);
          setLikesCount(fetchedPost.likesCount || 0);

          // Check if liked locally
          const localLiked = localStorage.getItem(`liked_${fetchedPost._id}`);
          setLiked(!!localLiked);

          // Check if bookmarked
          if (user) {
            const isBookmarked = user.bookmarks?.some((b: any) => b === fetchedPost._id || b._id === fetchedPost._id);
            setBookmarked(!!isBookmarked);
          }

          // Evaluate metered paywall
          let blockPaywall = false;
          if (fetchedPost.isPremium) {
            const isStaff = user && ['Super Admin', 'Admin', 'Author'].includes(user.role);
            const isSubscriber = user && user.isPremium;

            if (!isStaff && !isSubscriber) {
              const currentMonthKey = `premium_reads_${new Date().getFullYear()}_${new Date().getMonth()}`;
              let readPosts = JSON.parse(localStorage.getItem(currentMonthKey) || '[]');
              
              if (readPosts.includes(fetchedPost._id)) {
                setRemainingFreeArticles(Math.max(0, 3 - readPosts.length));
              } else {
                if (readPosts.length >= 3) {
                  setPaywallBlocked(true);
                  setRemainingFreeArticles(0);
                  blockPaywall = true;
                } else {
                  readPosts.push(fetchedPost._id);
                  localStorage.setItem(currentMonthKey, JSON.stringify(readPosts));
                  setRemainingFreeArticles(3 - readPosts.length);
                  showToast(`Premium story unlocked. ${3 - readPosts.length} free articles remaining this month.`, 'info');
                }
              }
            }
          }

          if (!blockPaywall) {
            // Save to reading history & update daily activity
            try {
              const historyItem = {
                id: fetchedPost._id,
                title: fetchedPost.title,
                slug: fetchedPost.slug,
                category: fetchedPost.category?.name || 'General',
                readingTime: fetchedPost.readingTime || 5,
                viewedAt: new Date().toISOString()
              };
              let history = JSON.parse(localStorage.getItem('reading_history') || '[]');
              if (history.length === 0 || history[0].id !== fetchedPost._id) {
                history.unshift(historyItem);
                localStorage.setItem('reading_history', JSON.stringify(history.slice(0, 10)));
              }

              const todayKey = new Date().toISOString().split('T')[0];
              let readsGrid = JSON.parse(localStorage.getItem('reading_activity_grid') || '{}');
              readsGrid[todayKey] = (readsGrid[todayKey] || 0) + 1;
              localStorage.setItem('reading_activity_grid', JSON.stringify(readsGrid));
            } catch (err) {
              console.error('Failed to log history:', err);
            }
          }

          // Fetch comments
          const commentsResponse = await commentsAPI.getCommentsForPost(fetchedPost._id);
          if (commentsResponse.data.success) {
            setComments(commentsResponse.data.comments);
          }
        }
      } catch (err: any) {
        console.error('Details fetch error:', err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchPostDetails();
  }, [slug, user]);

  // TTS Read-Aloud Controls
  const handlePlayTTS = () => {
    if (!post || !synthRef.current) return;
    synthRef.current.cancel();

    // Parse plain text content from HTML body
    const div = document.createElement('div');
    div.innerHTML = post.content;
    const text = `${post.title}. ${post.summary}. ${div.innerText || div.textContent || ''}`;

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = ttsRate;
    utterance.onend = () => {
      setTtsSpeaking(false);
      setTtsPaused(false);
    };
    utterance.onerror = () => {
      setTtsSpeaking(false);
      setTtsPaused(false);
    };

    utteranceRef.current = utterance;
    setTtsSpeaking(true);
    setTtsPaused(false);
    synthRef.current.speak(utterance);
  };

  const handlePauseTTS = () => {
    if (synthRef.current && ttsSpeaking) {
      synthRef.current.pause();
      setTtsPaused(true);
      setTtsSpeaking(false);
    }
  };

  const handleStopTTS = () => {
    if (synthRef.current) {
      synthRef.current.cancel();
      setTtsSpeaking(false);
      setTtsPaused(false);
    }
  };

  const handleRateChange = (newRate: number) => {
    setTtsRate(newRate);
    if (ttsSpeaking && synthRef.current) {
      handlePlayTTS(); // restart with new rate
    }
  };

  const handleLike = async () => {
    if (!post) return;
    const newLiked = !liked;
    setLiked(newLiked);

    try {
      const response = await postsAPI.likePost(post._id, newLiked);
      if (response.data.success) {
        setLikesCount(response.data.likesCount);
        if (newLiked) {
          localStorage.setItem(`liked_${post._id}`, 'true');
          showToast('Article liked', 'success');
        } else {
          localStorage.removeItem(`liked_${post._id}`);
        }
      }
    } catch (err: any) {
      console.error('Like error:', err.message);
      setLiked(!newLiked);
    }
  };

  const handleBookmark = async () => {
    if (!user) {
      showToast('Please log in to save bookmarks.', 'warning');
      return;
    }
    if (!post) return;

    try {
      const response = await postsAPI.bookmarkPost(post._id);
      if (response.data.success) {
        setBookmarked(response.data.isBookmarked);
        showToast(
          response.data.isBookmarked ? 'Article added to bookmarks' : 'Article removed from bookmarks',
          'success'
        );
      }
    } catch (err: any) {
      console.error('Bookmark error:', err.message);
    }
  };

  const handleCommentSubmit = async (e: React.FormEvent, parentId: string | null = null) => {
    e.preventDefault();
    const content = parentId ? replyContent : commentContent;
    if (!content.trim()) return;

    try {
      const payload: any = { 
        content,
        post: post._id,
        postId: post._id,
        mentions: parentId ? replyMentions : commentMentions
      };
      if (!user) {
        payload.guestName = guestName;
        payload.guestEmail = guestEmail;
      }
      if (parentId) {
        payload.parentId = parentId;
      }

      const res = await commentsAPI.createComment(payload);
      if (res.data.success) {
        showToast('Comment submitted for moderation.', 'success');
        setCommentContent('');
        setCommentMentions([]);
        setReplyContent('');
        setReplyMentions([]);
        setGuestName('');
        setGuestEmail('');
        setActiveReplyId(null);


        // Reload comments
        const commentsResponse = await commentsAPI.getCommentsForPost(post._id);
        if (commentsResponse.data.success) {
          setComments(commentsResponse.data.comments);
        }
      }
    } catch (err: any) {
      showToast(err.response?.data?.message || 'Error publishing comment.', 'error');
    }
  };

  const handleShare = () => {
    if (typeof navigator !== 'undefined' && navigator.share) {
      navigator.share({
        title: post.title,
        text: post.summary,
        url: window.location.href
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(window.location.href);
      showToast('Publication URL copied to clipboard.', 'success');
    }
  };

  const handleTOCClick = (e: React.MouseEvent, id: string) => {
    e.preventDefault();
    const el = document.getElementById(id);
    if (el) {
      const offset = 90;
      const bodyRect = document.body.getBoundingClientRect().top;
      const elementRect = el.getBoundingClientRect().top;
      const elementPosition = elementRect - bodyRect;
      const offsetPosition = elementPosition - offset;

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      });
    }
  };

  const renderCommentContentWithMentions = (text: string, mentionsList: any[]) => {
    if (!mentionsList || mentionsList.length === 0) return <span>{text}</span>;
    let renderedText = text;
    mentionsList.forEach((m) => {
      const name = typeof m === 'object' ? m?.name : m;
      if (typeof name !== 'string') return;
      const escapedName = name.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
      const regex = new RegExp(`@${escapedName}\\b`, 'g');
      renderedText = renderedText.replace(
        regex,
        `<span class="px-1.5 py-0.5 rounded bg-editorial-accent/10 dark:bg-editorial-gold/10 text-editorial-accent dark:text-editorial-gold font-bold">@${name}</span>`
      );
    });
    return <span dangerouslySetInnerHTML={{ __html: renderedText }} />;
  };

  const renderCommentNode = (c: any) => {
    return (
      <div key={c._id} className="py-4 space-y-3">
        <div className="flex justify-between items-start">
          <div>
            <span className="text-xs font-bold text-neutral-850 dark:text-neutral-200">
              {c.user ? c.user.name : c.guestName}
            </span>
            <span className="text-[9px] text-neutral-450 block font-sans mt-0.5">
              {new Date(c.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
            </span>
          </div>
          <div className="flex items-center gap-3">
            <CommentLike commentId={c._id} initialLikes={c.likes} />
            {!paywallBlocked && (
              <button
                onClick={() => setActiveReplyId(activeReplyId === c._id ? null : c._id)}
                className="text-[9px] uppercase tracking-wider font-extrabold text-editorial-accent dark:text-editorial-gold"
              >
                Reply
              </button>
            )}
          </div>
        </div>
        <p className="text-xs text-neutral-600 dark:text-neutral-400 leading-relaxed font-sans">
          {renderCommentContentWithMentions(c.content, c.mentions)}
        </p>


        {/* Reply Editor */}
        {activeReplyId === c._id && (
          <form onSubmit={(e) => handleCommentSubmit(e, c._id)} className="pl-4 border-l-2 border-neutral-200 dark:border-neutral-800 space-y-2 mt-2">
            {!user && (
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="text"
                  required
                  placeholder="Guest Name"
                  value={guestName}
                  onChange={(e) => setGuestName(e.target.value)}
                  className="text-xs p-1.5 bg-neutral-50 dark:bg-neutral-900 border rounded-lg"
                />
                <input
                  type="email"
                  required
                  placeholder="Email"
                  value={guestEmail}
                  onChange={(e) => setGuestEmail(e.target.value)}
                  className="text-xs p-1.5 bg-neutral-50 dark:bg-neutral-900 border rounded-lg"
                />
              </div>
            )}
            <MentionInput
              value={replyContent}
              onChange={setReplyContent}
              onMentionsChange={setReplyMentions}
              placeholder="Write your reply... Use @ to mention someone."
              rows={2}
            />

            <div className="text-right">
              <button type="submit" className="text-[9px] uppercase px-3 py-1 bg-neutral-900 text-white rounded-lg">
                Submit Reply
              </button>
            </div>
          </form>
        )}

        {/* Nested replies */}
        {c.replies && c.replies.map((rep: any) => (
          <div key={rep._id} className="pl-6 pt-3 space-y-2 border-l border-neutral-100 dark:border-neutral-900/60">
            <div className="flex items-center gap-1.5">
              <CornerDownRight className="w-3.5 h-3.5 text-neutral-400" />
              <span className="text-xs font-bold text-neutral-850 dark:text-neutral-250">
                {rep.user ? rep.user.name : rep.guestName}
              </span>
              <span className="text-[8px] text-neutral-400">
                {new Date(rep.createdAt).toLocaleDateString()}
              </span>
            </div>
            <p className="text-xs text-neutral-600 dark:text-neutral-450 leading-relaxed font-sans">
              {renderCommentContentWithMentions(rep.content, rep.mentions)}
            </p>
          </div>
        ))}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="py-20 text-center text-xs text-neutral-400 font-serif tracking-widest uppercase">
        Loading Article...
      </div>
    );
  }

  if (!post) {
    return (
      <div className="py-20 text-center text-xs text-red-500 italic">
        Article not found. Try search or return home.
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 relative">
      <SEOHead 
        title={post.seo?.metaTitle || post.title} 
        description={post.seo?.metaDescription || post.summary}
        url={`${SITE_URL}/post/${post.slug}`}
        image={post.featuredImage}
        type="article"
        publishedTime={post.publishedAt}
        modifiedTime={post.updatedAt || post.publishedAt}
        author={post.author?.name || 'Byline Desk'}
        section={post.category?.name || 'Journal'}
        keywords={post.tags?.map((t: any) => typeof t === 'object' ? t.name : t)}
      />
      <ArticleJSONLD
        headline={post.title}
        description={post.summary || post.title}
        url={`${SITE_URL}/post/${post.slug}`}
        image={post.featuredImage || "https://images.unsplash.com/photo-1513542789411-b6a5d4f31634"}
        datePublished={post.publishedAt || new Date().toISOString()}
        dateModified={post.updatedAt || post.publishedAt || new Date().toISOString()}
        authorName={post.author?.name || 'Byline Desk'}
        section={post.category?.name || 'Journal'}
        keywords={post.tags?.map((t: any) => typeof t === 'object' ? t.name : t)}
      />
      <BreadcrumbJSONLD
        items={[
          { name: "Home", url: SITE_URL },
          { name: post.category?.name || "Section", url: `${SITE_URL}/category/${post.category?.slug || 'all'}` },
          { name: post.title, url: `${SITE_URL}/post/${post.slug}` },
        ]}
      />

      {/* Dynamic Left Sidebar: Likes & Bookmarks (Sticky) */}
      <div className="hidden lg:block lg:col-span-1">
        <div className="sticky top-24 space-y-6 flex flex-col items-center">
          <LikeButton
            postId={post._id}
            initialLikes={likesCount}
            initialLiked={liked}
          />

          <BookmarkButton
            postId={post._id}
            postTitle={post.title}
            postSlug={post.slug}
          />
          
          <SharePanel
            url={typeof window !== 'undefined' ? window.location.href : ''}
            title={post.title}
          />

          {/* Reading Progress Circle */}
          <div className="relative w-8 h-8 mt-4 flex items-center justify-center">
            <svg className="w-full h-full transform -rotate-90">
              <circle cx="16" cy="16" r="14" strokeWidth="2" stroke="currentColor" className="text-neutral-100 dark:text-neutral-900" fill="transparent" />
              <circle cx="16" cy="16" r="14" strokeWidth="2" stroke="currentColor" className="text-editorial-accent" fill="transparent" strokeDasharray={88} strokeDashoffset={88 - (88 * scrollProgress) / 100} />
            </svg>
            <span className="absolute text-[8px] font-extrabold text-neutral-500">{Math.round(scrollProgress)}%</span>
          </div>
        </div>
      </div>

      {/* Main Content Workspace (7 cols, 760px max content width) */}
      <div className="lg:col-span-8 space-y-12">
        <article className="space-y-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Link href={`/category/${post.category?.slug}`} className="text-[9px] uppercase tracking-widest text-editorial-accent dark:text-editorial-gold font-bold">
                  {post.category?.name}
                </Link>
                <WhoIsReading postId={post._id} />
              </div>
              {post.isPremium && (
                <span className="inline-flex items-center gap-1 text-[8px] uppercase tracking-wider font-extrabold px-2.5 py-0.5 bg-amber-50 text-amber-705 dark:bg-amber-950/40 dark:text-amber-400 border border-amber-250/50 rounded-full">
                  <Lock className="w-2.5 h-2.5" /> Premium Article
                </span>
              )}
            </div>


            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold leading-tight font-serif text-neutral-900 dark:text-neutral-50 tracking-tight">
              {post.title}
            </h1>
            
            <p className="text-base md:text-lg italic text-neutral-500 dark:text-neutral-400 leading-relaxed font-serif pt-1">
              {post.summary}
            </p>

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-[10px] text-neutral-450 dark:text-neutral-500 font-sans pt-4 border-y border-neutral-150 dark:border-neutral-900 py-3">
              <div className="flex items-center space-x-3">
                {post.author?.profileImage ? (
                  <img src={post.author.profileImage} alt="" className="w-6 h-6 rounded-full object-cover" />
                ) : (
                  <div className="w-6 h-6 rounded-full bg-neutral-200 dark:bg-neutral-800 flex items-center justify-center font-bold text-[8px] uppercase text-neutral-600">
                    {(post.author?.name || "?")[0]}
                  </div>
                )}
                <span className="font-bold text-neutral-650 dark:text-neutral-400">By {post.author?.name}</span>
                <span>•</span>
                <span>{new Date(post.publishedAt).toLocaleDateString(undefined, { month: 'long', day: 'numeric', year: 'numeric' })}</span>
                <span>•</span>
                <span>{post.readingTime} min read</span>
              </div>

              {/* TTS Read-Aloud */}
              {!paywallBlocked && (
                <div className="flex items-center gap-2 bg-white/50 dark:bg-zinc-950/50 border border-zinc-200/50 dark:border-zinc-800 px-3 py-1 rounded-full shadow-2xs">
                  <Volume2 className="w-3.5 h-3.5 text-editorial-accent" />
                  <span className="font-bold text-[8px] uppercase text-neutral-500 mr-1.5">Listen:</span>
                  <div className="flex items-center gap-1.5">
                    {!ttsSpeaking ? (
                      <button onClick={handlePlayTTS} className="p-1 text-neutral-600 hover:text-editorial-accent transition-colors" title="Play">
                        <Play className="w-3 h-3 fill-current" />
                      </button>
                    ) : (
                      <button onClick={handlePauseTTS} className="p-1 text-neutral-600 hover:text-editorial-accent transition-colors" title="Pause">
                        <Pause className="w-3 h-3 fill-current" />
                      </button>
                    )}
                    {(ttsSpeaking || ttsPaused) && (
                      <button onClick={handleStopTTS} className="p-1 text-neutral-605 hover:text-red-500 transition-colors" title="Stop">
                        <Square className="w-2.5 h-2.5 fill-current" />
                      </button>
                    )}
                    <select
                      value={ttsRate}
                      onChange={(e) => handleRateChange(parseFloat(e.target.value))}
                      className="text-[9px] bg-transparent border-none text-neutral-500 font-semibold focus:outline-none cursor-pointer"
                    >
                      <option value="0.75">0.75x</option>
                      <option value="1">1.0x</option>
                      <option value="1.25">1.25x</option>
                      <option value="1.5">1.5x</option>
                    </select>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Cover Image */}
          {post.featuredImage && (
            <div className="w-full overflow-hidden rounded-3xl bg-neutral-100 dark:bg-neutral-900 my-8 shadow-sm">
              <img
                src={post.featuredImage}
                alt=""
                className="w-full h-auto max-h-[460px] object-cover"
              />
            </div>
          )}

          {/* Paywall Blocker */}
          {paywallBlocked ? (
            <div className="relative border border-zinc-200/50 dark:border-zinc-800 rounded-3xl overflow-hidden my-8 shadow-xl bg-white dark:bg-zinc-950">
              <div className="p-6 opacity-10 select-none pointer-events-none space-y-4">
                <p className="font-serif text-sm">Independent reportage and in-depth analysis on modern systems design, artificial intelligence trends, and cultural transformation. In the modern platformized economy, maintaining structural independence requires direct, unmediated reader subscription.</p>
              </div>
              <div className="absolute inset-0 bg-white/85 dark:bg-zinc-950/85 backdrop-blur-md flex items-center justify-center p-6 text-center">
                <div className="max-w-md space-y-5">
                  <div className="w-12 h-12 rounded-full bg-amber-50 dark:bg-amber-950/30 text-amber-500 flex items-center justify-center mx-auto border border-amber-200/40">
                    <Lock className="w-5 h-5" />
                  </div>
                  <h3 className="font-serif text-base font-bold text-neutral-850 dark:text-neutral-50 uppercase tracking-wider">
                    Premium Story Locked
                  </h3>
                  <p className="text-xs text-neutral-500 dark:text-neutral-450 leading-relaxed">
                    You have consumed your quota of <strong>3 free premium articles</strong> this month. 
                    Subscribe to unlock unlimited access to Byline premium archives for only <strong>{getLocalizedPrice()}/month</strong>.
                  </p>
                  <div className="pt-2">
                    {user ? (
                      <Link
                        href="/profile"
                        className="inline-flex items-center gap-1.5 text-xs px-5 py-2 bg-neutral-900 hover:bg-editorial-accent dark:bg-neutral-100 dark:text-black dark:hover:bg-editorial-gold text-white font-semibold uppercase tracking-wider rounded-lg transition-colors"
                      >
                        <ShieldCheck className="w-4 h-4" />
                        <span>Upgrade Profile</span>
                      </Link>
                    ) : (
                      <div className="space-y-3">
                        <Link
                          href="/register"
                          className="inline-flex items-center gap-1.5 text-xs px-5 py-2 bg-neutral-900 hover:bg-editorial-accent text-white font-semibold uppercase tracking-wider rounded-lg transition-colors"
                        >
                          <span>Create Free Profile</span>
                        </Link>
                        <p className="text-[10px] text-neutral-400 font-sans">
                          Already registered? <Link href="/login" className="underline font-bold text-neutral-600">Log in</Link> to apply settings.
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ) : (
            /* Article Content (Prose Source Serif font width 760px) */
            <div 
              ref={contentRef}
              className="prose dark:prose-invert max-w-[760px] serif-article-body"
              dangerouslySetInnerHTML={{ __html: post.content }}
            />
          )}

          {/* Tags */}
          {!paywallBlocked && post.tags && post.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 pt-8 border-t border-neutral-200/50 dark:border-neutral-900">
              {post.tags.map((tag: any) => (
                <Link
                  key={tag._id}
                  href={`/tag/${tag.slug}`}
                  className="text-[9px] uppercase font-bold tracking-wider px-2.5 py-1 border border-neutral-200 dark:border-neutral-850 rounded-lg text-neutral-500 hover:border-editorial-accent hover:text-editorial-accent transition-colors"
                >
                  #{tag.name}
                </Link>
              ))}
            </div>
          )}

          {/* Bottom Interaction Bar */}
          {!paywallBlocked && (
            <div className="flex flex-wrap items-center justify-between gap-4 pt-6 border-t border-neutral-200/50 dark:border-neutral-900">
              <ReactionBar postId={post._id} />
              <div className="flex items-center gap-3">
                <LikeButton postId={post._id} initialLikes={likesCount} initialLiked={liked} />
                <BookmarkButton postId={post._id} postTitle={post.title} postSlug={post.slug} showLabel size="sm" />
                <SharePanel url={typeof window !== 'undefined' ? window.location.href : ''} title={post.title} />
              </div>
            </div>
          )}
        </article>

        {/* Author Bio Card */}
        {!paywallBlocked && post.author && (
          <div className="bg-white/50 dark:bg-zinc-950/50 backdrop-blur-xs border border-zinc-200/50 dark:border-zinc-850 p-6 rounded-3xl flex flex-col sm:flex-row gap-4 items-center sm:items-start text-center sm:text-left shadow-xs">
            {post.author.profileImage ? (
              <img src={post.author.profileImage} alt="" className="w-12 h-12 rounded-full object-cover border" />
            ) : (
              <div className="w-12 h-12 rounded-full bg-neutral-200 dark:bg-neutral-800 flex items-center justify-center font-bold text-xs uppercase text-neutral-500">
                {(post.author.name || "?")[0]}
              </div>
            )}
            <div className="space-y-1">
              <span className="text-[8px] uppercase tracking-widest text-neutral-400 block font-bold">About the Author</span>
              <div className="flex flex-wrap items-center gap-3">
                <span className="font-serif text-sm font-bold text-neutral-900 dark:text-neutral-100">
                  {post.author.name}
                </span>
                <FollowButton authorId={post.author._id} initialFollowerCount={post.author.followers?.length || 0} />
              </div>
              <p className="text-xs text-neutral-550 dark:text-neutral-400 leading-relaxed mt-1">
                {post.author.bio || `${post.author.name} is an editorial contributor and researcher.`}
              </p>

            </div>
          </div>
        )}

        {/* Comments Section */}
        {!paywallBlocked && (
          <section className="space-y-6 border-t border-neutral-200/50 dark:border-neutral-900 pt-10">
            <h3 className="text-xs uppercase tracking-widest font-bold text-neutral-900 dark:text-neutral-100 flex items-center">
              <MessageSquare className="w-4 h-4 mr-1.5 text-neutral-450" /> Discussion ({comments.length})
            </h3>

            <div className="space-y-4 divide-y divide-neutral-100 dark:divide-neutral-900">
              {comments.length === 0 ? (
                <p className="text-xs text-neutral-400 italic py-4">No comments posted yet. Join the conversation.</p>
              ) : (
                comments.map((comment) => renderCommentNode(comment))
              )}
            </div>

            <form onSubmit={(e) => handleCommentSubmit(e)} className="bg-neutral-50 dark:bg-zinc-950 p-6 border border-zinc-205 dark:border-zinc-900 rounded-3xl space-y-4">
              <h4 className="text-xs uppercase tracking-wider font-semibold text-neutral-750 dark:text-neutral-350">
                Leave a Comment
              </h4>

              {!user && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-[10px] text-neutral-400 uppercase tracking-wider">Name</label>
                    <input
                      type="text"
                      required
                      value={guestName}
                      onChange={(e) => setGuestName(e.target.value)}
                      className="w-full text-xs px-2.5 py-1.5 bg-white dark:bg-neutral-900 border rounded-lg focus:outline-none"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] text-neutral-400 uppercase tracking-wider">Email (Not published)</label>
                    <input
                      type="email"
                      required
                      value={guestEmail}
                      onChange={(e) => setGuestEmail(e.target.value)}
                      className="w-full text-xs px-2.5 py-1.5 bg-white dark:bg-neutral-900 border rounded-lg focus:outline-none"
                    />
                  </div>
                </div>
              )}

              <div className="space-y-1">
                <label className="text-[10px] text-neutral-400 uppercase tracking-wider">Your Comment</label>
                <MentionInput
                  value={commentContent}
                  onChange={setCommentContent}
                  onMentionsChange={setCommentMentions}
                  placeholder="Share your reviews or insights... Use @ to mention someone."
                />
              </div>


              <div className="text-right">
                <button
                  type="submit"
                  className="text-xs px-5 py-1.5 bg-neutral-900 dark:bg-neutral-100 text-white dark:text-black hover:bg-editorial-accent dark:hover:bg-editorial-gold font-medium rounded-lg uppercase tracking-wider transition-colors"
                >
                  Submit Comment
                </button>
              </div>
            </form>
          </section>
        )}
      </div>

      {/* Dynamic Right Sidebar: TOC & Related (Sticky) */}
      <div className="hidden lg:block lg:col-span-3">
        <div className="sticky top-24 space-y-6 pt-2">
          
          {post.isPremium && (
            <div className="border border-zinc-200/50 dark:border-zinc-850 p-5 rounded-2xl bg-amber-50/10 dark:bg-amber-950/5 space-y-3">
              <h4 className="text-[10px] uppercase tracking-widest font-extrabold text-amber-700 dark:text-amber-400 flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5 animate-pulse" /> Access Settings
              </h4>
              <p className="text-[11px] text-neutral-500 dark:text-neutral-400 leading-normal">
                {paywallBlocked ? 'Monthly premium read limit exhausted.' : `This is a premium article. ${remainingFreeArticles} free reads left.`}
              </p>
            </div>
          )}

          {/* Table of Contents */}
          {!paywallBlocked && post.tableOfContents && post.tableOfContents.length > 0 && (
            <div className="border border-zinc-200/50 dark:border-zinc-850 p-5 rounded-2xl bg-white dark:bg-zinc-950">
              <h4 className="text-[10px] uppercase tracking-widest font-bold text-neutral-800 dark:text-neutral-250 border-b pb-2 mb-3 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-editorial-accent" />
                <span>Table of Contents</span>
              </h4>
              <ul className="space-y-2.5 text-xs">
                {post.tableOfContents.map((heading: any, idx: number) => (
                  <li key={idx} style={{ paddingLeft: `${(heading.level - 2) * 10}px` }}>
                    <a
                      href={`#${heading.id}`}
                      onClick={(e) => handleTOCClick(e, heading.id)}
                      className={`block transition-all border-l pl-2 leading-relaxed ${activeHeading === heading.id ? 'border-editorial-accent text-editorial-accent dark:text-editorial-gold font-bold' : 'border-transparent text-neutral-450 hover:text-neutral-750'}`}
                    >
                      {heading.text}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Related Articles */}
          {related.length > 0 && (
            <div className="space-y-4">
              <h4 className="text-[10px] uppercase tracking-widest font-bold text-neutral-400 dark:text-neutral-500 border-b pb-2">
                Related Articles
              </h4>
              <div className="space-y-4">
                {related.map((rel) => (
                  <div key={rel._id} className="group space-y-1">
                    <Link href={`/post/${rel.slug}`}>
                      <h5 className="font-serif text-xs font-semibold leading-snug text-neutral-850 dark:text-neutral-200 group-hover:text-editorial-accent transition-colors line-clamp-2">
                        {rel.title}
                      </h5>
                    </Link>
                    <span className="text-[9px] text-neutral-400 font-sans">
                      By {rel.author?.name}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
