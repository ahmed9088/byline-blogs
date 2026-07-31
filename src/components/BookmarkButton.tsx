"use client";

import { useState, useCallback } from "react";
import { motion } from "framer-motion";
import { Bookmark, BookmarkCheck } from "lucide-react";
import { useToast } from "../context/ToastContext";

interface BookmarkButtonProps {
  postId: string;
  postTitle: string;
  postSlug: string;
  size?: "sm" | "md";
  showLabel?: boolean;
}

const BOOKMARKS_KEY = "byline_bookmarks";

export default function BookmarkButton({
  postId, postTitle, postSlug, size = "md", showLabel = false,
}: BookmarkButtonProps) {
  const { showToast } = useToast();
  const getBookmarks = (): any[] => {
    try { return JSON.parse(localStorage.getItem(BOOKMARKS_KEY) || "[]"); } catch { return []; }
  };

  const [bookmarked, setBookmarked] = useState(() => {
    return getBookmarks().some((b: any) => b.id === postId);
  });
  const [animating, setAnimating] = useState(false);

  const toggle = useCallback(() => {
    const bookmarks = getBookmarks();
    let updated: any[];
    if (bookmarked) {
      updated = bookmarks.filter((b: any) => b.id !== postId);
      setBookmarked(false);
      showToast("Removed from saved articles.", "info");
    } else {
      updated = [...bookmarks, { id: postId, title: postTitle, slug: postSlug, savedAt: Date.now() }];
      setBookmarked(true);
      setAnimating(true);
      setTimeout(() => setAnimating(false), 500);
      showToast("Article saved to your library.", "success");
    }
    try { localStorage.setItem(BOOKMARKS_KEY, JSON.stringify(updated)); } catch {}
  }, [bookmarked, postId, postTitle, postSlug, showToast]);

  const iconClass = size === "sm" ? "w-3.5 h-3.5" : "w-4 h-4";

  return (
    <button
      onClick={toggle}
      className={`flex items-center gap-1.5 transition-all duration-150 group ${
        showLabel
          ? `text-[10px] uppercase font-bold tracking-wider px-3 py-1.5 rounded-lg border ${
              bookmarked
                ? "text-editorial-accent dark:text-editorial-gold border-editorial-accent/40 dark:border-editorial-gold/40 bg-editorial-accent/5 dark:bg-editorial-gold/5"
                : "text-neutral-500 border-neutral-200/60 dark:border-neutral-800 hover:border-editorial-accent/40 dark:hover:border-editorial-gold/40 hover:text-editorial-accent dark:hover:text-editorial-gold"
            }`
          : bookmarked
          ? "text-editorial-accent dark:text-editorial-gold"
          : "text-neutral-400 hover:text-editorial-accent dark:hover:text-editorial-gold"
      }`}
      aria-label={bookmarked ? "Remove bookmark" : "Bookmark this article"}
    >
      <motion.span
        animate={animating ? { scale: [1, 1.4, 1], rotate: [0, -10, 10, 0] } : {}}
        transition={{ duration: 0.4 }}
      >
        {bookmarked ? (
          <BookmarkCheck className={iconClass} />
        ) : (
          <Bookmark className={iconClass} />
        )}
      </motion.span>
      {showLabel && <span>{bookmarked ? "Saved" : "Save"}</span>}
    </button>
  );
}
