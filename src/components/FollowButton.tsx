"use client";

import { useState, useEffect, useCallback } from "react";
import { UserPlus, UserMinus, Check } from "lucide-react";
import { authAPI } from "../services/api";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import { motion } from "framer-motion";

interface FollowButtonProps {
  authorId: string;
  initialFollowerCount?: number;
}

export default function FollowButton({ authorId, initialFollowerCount = 0 }: FollowButtonProps) {
  const { user, getProfile } = useAuth();
  const { showToast } = useToast();
  const [following, setFollowing] = useState(false);
  const [count, setCount] = useState(initialFollowerCount);
  const [loading, setLoading] = useState(false);

  // Sync follow state from active user object
  useEffect(() => {
    if (user && user.following) {
      const isFollowing = user.following.some(
        (id: any) => id === authorId || (typeof id === 'object' && id._id === authorId)
      );
      setFollowing(isFollowing);
    }
  }, [user, authorId]);

  const handleFollowToggle = useCallback(async () => {
    if (!user) {
      showToast("Please log in to follow authors.", "info");
      return;
    }
    if (user._id === authorId) {
      showToast("You cannot follow yourself.", "error");
      return;
    }

    setLoading(true);
    try {
      const res = await authAPI.toggleFollow(authorId);
      if (res.data.success) {
        const nextFollowing = res.data.isFollowing;
        setFollowing(nextFollowing);
        setCount(res.data.followerCount);
        showToast(
          nextFollowing ? "You are now following this author." : "Unfollowed author.",
          "success"
        );
        // Refresh local session profile to update the following list
        getProfile();
      }
    } catch {
      showToast("Could not update follow status.", "error");
    } finally {
      setLoading(false);
    }
  }, [user, authorId, showToast, getProfile]);

  if (user && user._id === authorId) return null;

  return (
    <div className="flex items-center gap-3 select-none">
      <button
        onClick={handleFollowToggle}
        disabled={loading}
        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-[10px] uppercase font-bold tracking-wider transition-all duration-150 ${
          following
            ? "bg-neutral-900 text-white dark:bg-neutral-100 dark:text-neutral-900 border-neutral-900 dark:border-neutral-100"
            : "border-neutral-200/60 dark:border-neutral-800 text-neutral-500 hover:border-editorial-accent/40 dark:hover:border-editorial-gold/40 hover:text-editorial-accent dark:hover:text-editorial-gold bg-transparent"
        }`}
      >
        <motion.span
          initial={false}
          animate={{ scale: loading ? 0.9 : 1 }}
        >
          {following ? (
            <span className="flex items-center gap-1">
              <Check className="w-3 h-3" />
              <span>Following</span>
            </span>
          ) : (
            <span className="flex items-center gap-1">
              <UserPlus className="w-3 h-3" />
              <span>Follow</span>
            </span>
          )}
        </motion.span>
      </button>
      <span className="text-[10px] text-neutral-450 dark:text-neutral-500 font-semibold font-sans">
        {count} {count === 1 ? "follower" : "followers"}
      </span>
    </div>
  );
}
