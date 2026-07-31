"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

const REACTIONS = [
  { emoji: "❤️", label: "Love", key: "love" },
  { emoji: "🔥", label: "Fire", key: "fire" },
  { emoji: "💡", label: "Insightful", key: "insightful" },
  { emoji: "👏", label: "Clap", key: "clap" },
  { emoji: "😮", label: "Surprised", key: "surprised" },
];

interface ReactionBarProps {
  postId: string;
}

export default function ReactionBar({ postId }: ReactionBarProps) {
  const storageKey = `reactions_${postId}`;
  const [selected, setSelected] = useState<string | null>(null);
  const [counts, setCounts] = useState<Record<string, number>>({
    love: 12, fire: 8, insightful: 24, clap: 5, surprised: 3,
  });
  const [burst, setBurst] = useState<string | null>(null);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(storageKey);
      if (saved) setSelected(saved);
    } catch {}
  }, [storageKey]);

  const handleReact = (key: string) => {
    const prev = selected;

    if (prev === key) {
      // Deselect
      setSelected(null);
      setCounts((c) => ({ ...c, [key]: Math.max(0, c[key] - 1) }));
      localStorage.removeItem(storageKey);
    } else {
      // Switch reaction
      if (prev) setCounts((c) => ({ ...c, [prev]: Math.max(0, c[prev] - 1) }));
      setCounts((c) => ({ ...c, [key]: c[key] + 1 }));
      setSelected(key);
      setBurst(key);
      setTimeout(() => setBurst(null), 600);
      try { localStorage.setItem(storageKey, key); } catch {}
    }
  };

  return (
    <div className="flex items-center gap-2 flex-wrap">
      <span className="text-[9px] uppercase tracking-widest font-bold text-neutral-400 mr-1">
        React
      </span>
      {REACTIONS.map((r) => {
        const isActive = selected === r.key;
        const isBursting = burst === r.key;
        return (
          <button
            key={r.key}
            onClick={() => handleReact(r.key)}
            title={r.label}
            className={`relative flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold border transition-all duration-200 select-none ${
              isActive
                ? "bg-editorial-accent/10 border-editorial-accent/50 text-editorial-accent dark:border-editorial-gold/50 dark:text-editorial-gold dark:bg-editorial-gold/10"
                : "border-neutral-200/60 dark:border-neutral-800 text-neutral-500 dark:text-neutral-400 hover:bg-neutral-50 dark:hover:bg-neutral-900 hover:border-neutral-300 dark:hover:border-neutral-700"
            }`}
          >
            <motion.span
              animate={isBursting ? { scale: [1, 1.5, 1], rotate: [0, -15, 10, 0] } : {}}
              transition={{ duration: 0.4 }}
              className="text-sm leading-none"
            >
              {r.emoji}
            </motion.span>
            <AnimatePresence mode="wait">
              <motion.span
                key={counts[r.key]}
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 6 }}
                transition={{ duration: 0.15 }}
                className="text-[10px] font-bold"
              >
                {counts[r.key]}
              </motion.span>
            </AnimatePresence>
          </button>
        );
      })}
    </div>
  );
}
