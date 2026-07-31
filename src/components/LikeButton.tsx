"use client";

import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Heart } from "lucide-react";
import { postsAPI } from "../services/api";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";

interface LikeButtonProps {
  postId: string;
  initialLikes: number;
  initialLiked: boolean;
}

export default function LikeButton({ postId, initialLikes, initialLiked }: LikeButtonProps) {
  const { user } = useAuth();
  const { showToast } = useToast();
  const [liked, setLiked] = useState(initialLiked);
  const [count, setCount] = useState(initialLikes);
  const [burst, setBurst] = useState(false);
  const [loading, setLoading] = useState(false);

  // Particle positions for the burst effect
  const particles = [
    { x: -20, y: -20 }, { x: 20, y: -20 }, { x: -20, y: 20 }, { x: 20, y: 20 },
    { x: 0, y: -28 }, { x: 0, y: 28 }, { x: -28, y: 0 }, { x: 28, y: 0 },
  ];

  const handleLike = useCallback(async () => {
    if (loading) return;
    if (!user) {
      showToast("Sign in to like articles.", "info");
      return;
    }
    setLoading(true);
    try {
      const res = await postsAPI.likePost(postId, !liked);
      if (res.data.success) {
        const wasLiked = liked;
        setLiked(!wasLiked);
        setCount((c) => wasLiked ? c - 1 : c + 1);
        if (!wasLiked) {
          setBurst(true);
          setTimeout(() => setBurst(false), 700);
        }
      }
    } catch {
      showToast("Could not update like.", "error");
    } finally {
      setLoading(false);
    }
  }, [liked, loading, postId, user, showToast]);

  return (
    <button
      onClick={handleLike}
      disabled={loading}
      className="relative flex items-center gap-2 group select-none"
      aria-label={liked ? "Unlike" : "Like this article"}
    >
      {/* Burst particles */}
      <AnimatePresence>
        {burst && particles.map((p, i) => (
          <motion.span
            key={i}
            initial={{ opacity: 1, x: 0, y: 0, scale: 0 }}
            animate={{ opacity: 0, x: p.x, y: p.y, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5, delay: i * 0.03, ease: "easeOut" }}
            className="absolute left-2 top-2 w-1.5 h-1.5 rounded-full bg-red-400 pointer-events-none"
          />
        ))}
      </AnimatePresence>

      <motion.span
        animate={burst ? { scale: [1, 1.5, 1], rotate: [0, -12, 12, 0] } : liked ? { scale: 1.1 } : { scale: 1 }}
        transition={{ duration: 0.4 }}
        className={`transition-colors ${liked ? "text-red-500" : "text-neutral-400 group-hover:text-red-400"}`}
      >
        <Heart className={`w-4 h-4 ${liked ? "fill-current" : ""}`} />
      </motion.span>

      <AnimatePresence mode="wait">
        <motion.span
          key={count}
          initial={{ opacity: 0, y: -6 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 6 }}
          transition={{ duration: 0.15 }}
          className={`text-xs font-bold ${liked ? "text-red-500" : "text-neutral-500 group-hover:text-red-400"}`}
        >
          {count}
        </motion.span>
      </AnimatePresence>
    </button>
  );
}
