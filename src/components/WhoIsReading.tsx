"use client";

import { useState, useEffect } from "react";
import { Users } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface WhoIsReadingProps {
  postId: string;
}

export default function WhoIsReading({ postId }: WhoIsReadingProps) {
  // Generate a base reading count seeded by the postId to keep it stable but randomized
  const getSeededCount = (seed: string) => {
    let hash = 0;
    for (let i = 0; i < seed.length; i++) {
      hash = seed.charCodeAt(i) + ((hash << 5) - hash);
    }
    return Math.abs((hash % 18) + 3); // 3 to 20 base readers
  };

  const [count, setCount] = useState(() => getSeededCount(postId));

  useEffect(() => {
    // Fluctuates count periodically to look alive
    const interval = setInterval(() => {
      setCount((prev) => {
        const change = Math.random() > 0.5 ? 1 : -1;
        const next = prev + change;
        return next < 2 ? 2 : next > 25 ? 24 : next;
      });
    }, 12000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-neutral-100 dark:border-neutral-900 bg-white/40 dark:bg-neutral-950/40 backdrop-blur-xs text-[10px] uppercase font-bold tracking-wider text-neutral-500 select-none">
      <span className="relative flex h-1.5 w-1.5">
        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
        <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500"></span>
      </span>
      
      <span className="flex items-center gap-1">
        <Users className="w-3 h-3 text-neutral-400" />
        <AnimatePresence mode="wait">
          <motion.span
            key={count}
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 4 }}
            transition={{ duration: 0.2 }}
          >
            {count}
          </motion.span>
        </AnimatePresence>
        <span>reading now</span>
      </span>
    </div>
  );
}
