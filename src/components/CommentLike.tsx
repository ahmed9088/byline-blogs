"use client";

import { useState, useEffect, useCallback } from "react";
import { Heart } from "lucide-react";
import { commentsAPI } from "../services/api";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import { motion, AnimatePresence } from "framer-motion";

interface CommentLikeProps {
  commentId: string;
  initialLikes?: any[]; // Array of user profiles or IDs
}

export default function CommentLike({ commentId, initialLikes = [] }: CommentLikeProps) {
  const { user } = useAuth();
  const { showToast } = useToast();
  const [liked, setLiked] = useState(false);
  const [count, setCount] = useState(initialLikes.length);
  const [loading, setLoading] = useState(false);
  const [animating, setAnimating] = useState(false);

  useEffect(() => {
    if (user) {
      const isLiked = initialLikes.some(
        (lk: any) => lk === user._id || lk._id === user._id
      );
      setLiked(isLiked);
    }
  }, [user, initialLikes]);

  const handleLike = useCallback(async () => {
    if (loading) return;
    if (!user) {
      showToast("Please log in to like comments.", "info");
      return;
    }

    setLoading(true);
    try {
      const res = await commentsAPI.likeComment(commentId);
      if (res.data.success) {
        const nextLiked = res.data.isLiked;
        setLiked(nextLiked);
        setCount(res.data.likesCount);
        if (nextLiked) {
          setAnimating(true);
          setTimeout(() => setAnimating(false), 400);
        }
      }
    } catch {
      showToast("Could not update comment like.", "error");
    } finally {
      setLoading(false);
    }
  }, [user, commentId, loading, showToast]);

  return (
    <button
      onClick={handleLike}
      disabled={loading}
      className={`flex items-center gap-1 group text-[10px] font-sans font-bold select-none ${
        liked
          ? "text-red-500"
          : "text-neutral-450 dark:text-neutral-500 hover:text-red-400 dark:hover:text-red-400"
      }`}
      aria-label={liked ? "Unlike comment" : "Like comment"}
    >
      <motion.span
        animate={animating ? { scale: [1, 1.4, 1] } : {}}
        transition={{ duration: 0.3 }}
      >
        <Heart className={`w-3.5 h-3.5 ${liked ? "fill-current" : ""}`} />
      </motion.span>
      <span>{count}</span>
    </button>
  );
}
