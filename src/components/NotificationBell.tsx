"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Bell, Check, UserPlus, Heart, MessageSquare, AtSign } from "lucide-react";
import Link from "next/link";
import { authAPI } from "../services/api";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";

interface Notification {
  _id: string;
  type: 'follow' | 'comment_like' | 'comment_reply' | 'mention' | 'new_post';
  from: {
    _id: string;
    name: string;
    profileImage?: string;
  };
  message: string;
  link: string;
  read: boolean;
  createdAt: string;
}

export default function NotificationBell() {
  const { user } = useAuth();
  const { showToast } = useToast();
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const menuRef = useRef<HTMLDivElement>(null);

  const fetchNotifications = async () => {
    if (!user) return;
    try {
      const res = await authAPI.getNotifications();
      if (res.data.success) {
        setNotifications(res.data.notifications);
        setUnreadCount(res.data.unreadCount);
      }
    } catch (err) {
      console.error("Failed to fetch notifications:", err);
    }
  };

  useEffect(() => {
    if (user) {
      fetchNotifications();
      const interval = setInterval(fetchNotifications, 30000);
      return () => clearInterval(interval);
    }
  }, [user]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleMarkAllRead = async () => {
    try {
      const res = await authAPI.markNotificationsRead();
      if (res.data.success) {
        setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
        setUnreadCount(0);
        showToast("All notifications marked as read", "success");
      }
    } catch {
      showToast("Could not clear notifications", "error");
    }
  };

  const getIcon = (type: Notification['type']) => {
    switch (type) {
      case 'follow':
        return <UserPlus className="w-3.5 h-3.5 text-blue-500" />;
      case 'comment_like':
        return <Heart className="w-3.5 h-3.5 text-red-500 fill-current" />;
      case 'comment_reply':
        return <MessageSquare className="w-3.5 h-3.5 text-green-500" />;
      case 'mention':
        return <AtSign className="w-3.5 h-3.5 text-purple-500" />;
      default:
        return <Bell className="w-3.5 h-3.5 text-neutral-500" />;
    }
  };

  if (!user) return null;

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setOpen(!open)}
        className="p-2 rounded-full hover:bg-neutral-100 dark:hover:bg-neutral-900 text-neutral-500 dark:text-neutral-450 relative transition-colors focus:outline-none"
        aria-label="Notifications"
      >
        <Bell className="w-4 h-4" />
        {unreadCount > 0 && (
          <span className="absolute top-1.5 right-1.5 w-4 h-4 bg-editorial-accent dark:bg-editorial-gold text-white dark:text-black font-sans text-[9px] font-extrabold flex items-center justify-center rounded-full scale-95 animate-pulse">
            {unreadCount}
          </span>
        )}
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className="absolute right-0 mt-2.5 w-[320px] bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-850 rounded-2xl shadow-xl z-50 overflow-hidden"
          >
            <div className="p-3.5 border-b border-neutral-100 dark:border-neutral-900 flex items-center justify-between">
              <span className="text-[10px] uppercase tracking-widest font-extrabold text-neutral-805 dark:text-neutral-200">
                Notifications
              </span>
              {unreadCount > 0 && (
                <button
                  onClick={handleMarkAllRead}
                  className="flex items-center gap-1 text-[9px] uppercase tracking-wider font-extrabold text-editorial-accent dark:text-editorial-gold hover:opacity-80 transition-opacity"
                >
                  <Check className="w-3 h-3" />
                  <span>Mark all read</span>
                </button>
              )}
            </div>

            <div className="max-h-[300px] overflow-y-auto divide-y divide-neutral-100 dark:divide-neutral-900 font-sans">
              {notifications.length === 0 ? (
                <div className="py-8 px-4 text-center text-xs text-neutral-400 dark:text-neutral-500 italic">
                  No notifications yet.
                </div>
              ) : (
                notifications.map((n) => (
                  <Link
                    key={n._id}
                    href={n.link || "/"}
                    onClick={() => {
                      setOpen(false);
                      setNotifications((prev) =>
                        prev.map((notif) =>
                          notif._id === n._id ? { ...notif, read: true } : notif
                        )
                      );
                    }}
                    className={`flex items-start gap-3 p-3 transition-colors ${
                      n.read
                        ? "bg-transparent hover:bg-neutral-50 dark:hover:bg-neutral-900/40"
                        : "bg-editorial-accent/5 dark:bg-editorial-gold/5 hover:bg-editorial-accent/[0.08] dark:hover:bg-editorial-gold/[0.08]"
                    }`}
                  >
                    {n.from.profileImage ? (
                      <img
                        src={n.from.profileImage}
                        alt=""
                        className="w-7 h-7 rounded-full object-cover border border-neutral-200 dark:border-neutral-800 flex-shrink-0"
                      />
                    ) : (
                      <div className="w-7 h-7 rounded-full bg-neutral-100 dark:bg-neutral-900 flex items-center justify-center font-bold text-[9px] uppercase text-neutral-500 border dark:border-neutral-800 flex-shrink-0">
                        {n.from.name ? n.from.name[0] : "?"}
                      </div>
                    )}

                    <div className="flex-grow min-w-0 space-y-0.5">
                      <p className="text-[11px] font-semibold text-neutral-800 dark:text-neutral-200 leading-snug">
                        {n.message}
                      </p>
                      <span className="text-[8px] text-neutral-450 dark:text-neutral-500 block">
                        {new Date(n.createdAt).toLocaleDateString(undefined, {
                          month: "short",
                          day: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                    </div>

                    <div className="mt-0.5 flex-shrink-0 bg-neutral-50 dark:bg-neutral-900/80 p-1 rounded-md border border-neutral-200/40 dark:border-neutral-800">
                      {getIcon(n.type)}
                    </div>
                  </Link>
                ))
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
