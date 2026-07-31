"use client";

export const dynamic = "force-dynamic";

import React, { useState } from "react";
import AdminLayout from "@/components/AdminLayout";
import { newsletterAPI } from "@/services/api";
import { useToast } from "@/context/ToastContext";
import { Send, Loader2 } from "lucide-react";

export default function NewsletterPage() {
  const { showToast } = useToast();
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [sending, setSending] = useState(false);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!subject.trim() || !body.trim()) {
      showToast("Please provide both a subject and body.", "warning");
      return;
    }

    if (!confirm("Are you sure you want to broadcast this dispatch to all active subscribers?")) return;

    setSending(true);
    try {
      const res = await newsletterAPI.sendNewsletter(subject.trim(), body.trim());
      if (res.data.success) {
        showToast("Newsletter broadcast sent successfully.", "success");
        setSubject("");
        setBody("");
      }
    } catch (err: any) {
      showToast(err.response?.data?.message || "Failed to broadcast newsletter.", "error");
    } finally {
      setSending(false);
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6 max-w-2xl">
        {/* Header */}
        <div className="pb-4 border-b border-zinc-200/50 dark:border-neutral-900">
          <h1 className="text-sm font-bold uppercase tracking-widest text-neutral-900 dark:text-neutral-50">
            Dispatch Newsletter Broadcast
          </h1>
        </div>

        {/* Dispatch Form */}
        <div className="p-6 bg-white dark:bg-zinc-950 border border-neutral-200/40 dark:border-neutral-850 rounded-2xl shadow-xs">
          <form onSubmit={handleSend} className="space-y-5">
            <div className="space-y-1.5">
              <label className="text-[10px] text-neutral-400 uppercase tracking-wider font-semibold">Subject Line</label>
              <input
                type="text"
                required
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="e.g. Weekly Insights & Global Updates"
                className="w-full text-xs px-4 py-2.5 bg-neutral-50 dark:bg-zinc-900 border border-neutral-200 dark:border-neutral-800 rounded-lg focus:outline-none dark:text-neutral-200 font-bold"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] text-neutral-400 uppercase tracking-wider font-semibold">Message Body (HTML Supported)</label>
              <textarea
                rows={12}
                required
                value={body}
                onChange={(e) => setBody(e.target.value)}
                placeholder="Write your email broadcast body here..."
                className="w-full text-xs px-4 py-3 bg-neutral-50 dark:bg-zinc-900 border border-neutral-200 dark:border-neutral-800 rounded-lg focus:outline-none dark:text-neutral-200 leading-relaxed font-sans"
              />
            </div>

            <button
              type="submit"
              disabled={sending}
              className="inline-flex items-center gap-1.5 text-xs px-5 py-2.5 bg-neutral-900 hover:bg-editorial-accent dark:bg-neutral-100 dark:text-black dark:hover:bg-editorial-gold text-white font-semibold uppercase tracking-wider rounded-lg transition-colors disabled:opacity-50"
            >
              {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
              <span>{sending ? "Broadcasting..." : "Broadcast to Subscribers"}</span>
            </button>
          </form>
        </div>
      </div>
    </AdminLayout>
  );
}
