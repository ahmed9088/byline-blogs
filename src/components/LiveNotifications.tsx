"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Zap, Bell, Volume2 } from "lucide-react";

interface ToastItem {
  id: string;
  message: string;
  type: "breaking" | "new_post" | "trending";
  title: string;
}

const DEMO_NOTIFICATIONS: ToastItem[] = [
  { id: "1", title: "Breaking Coverage", message: "New analysis published: The AI Governance Debate.", type: "breaking" },
  { id: "2", title: "Trending Now", message: "This week's most-read: Climate Policy Deep-Dive", type: "trending" },
  { id: "3", title: "New Release", message: "Latest from the editors: Future of Open Source Software.", type: "new_post" },
];

export default function LiveNotifications() {
  const [queue, setQueue] = useState<ToastItem[]>([]);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const indexRef = useRef(0);

  useEffect(() => {
    // Show first notification after 8s, then one every 45s
    const showNext = () => {
      const item = DEMO_NOTIFICATIONS[indexRef.current % DEMO_NOTIFICATIONS.length];
      setQueue((q) => [...q, { ...item, id: `${item.id}-${Date.now()}` }]);
      indexRef.current++;
      timerRef.current = setTimeout(showNext, 45000);
    };

    timerRef.current = setTimeout(showNext, 8000);
    return () => { if (timerRef.current) clearTimeout(timerRef.current); };
  }, []);

  const dismiss = (id: string) => setQueue((q) => q.filter((n) => n.id !== id));

  const iconMap = {
    breaking: <Zap className="w-3.5 h-3.5 text-amber-400" />,
    trending: <Bell className="w-3.5 h-3.5 text-indigo-400" />,
    new_post: <Volume2 className="w-3.5 h-3.5 text-green-400" />,
  };

  return (
    <div className="fixed bottom-20 left-4 z-50 space-y-2 max-w-[320px] pointer-events-none">
      <AnimatePresence>
        {queue.map((n) => (
          <motion.div
            key={n.id}
            initial={{ opacity: 0, x: -40, scale: 0.96 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: -40, scale: 0.96 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            onAnimationComplete={() => {
              // Auto dismiss after 7s
              setTimeout(() => dismiss(n.id), 7000);
            }}
            className="pointer-events-auto flex items-start gap-3 p-3.5 bg-white dark:bg-zinc-900 border border-neutral-200/60 dark:border-neutral-800 rounded-2xl shadow-xl"
          >
            <div className="mt-0.5 flex-shrink-0">{iconMap[n.type]}</div>
            <div className="flex-1 min-w-0">
              <p className="text-[9px] uppercase tracking-widest font-bold text-neutral-400 mb-0.5">{n.title}</p>
              <p className="text-[11px] font-semibold text-neutral-800 dark:text-neutral-200 leading-snug">{n.message}</p>
            </div>
            <button
              onClick={() => dismiss(n.id)}
              className="flex-shrink-0 text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-300 transition-colors mt-0.5"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
