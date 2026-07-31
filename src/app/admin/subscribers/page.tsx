"use client";

export const dynamic = "force-dynamic";

import React, { useState, useEffect } from "react";
import AdminLayout from "@/components/AdminLayout";
import { newsletterAPI } from "@/services/api";
import { useToast } from "@/context/ToastContext";
import { MailPlus, Trash2, Mail, Loader2 } from "lucide-react";

export default function SubscribersPage() {
  const { showToast } = useToast();
  const [subscribers, setSubscribers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const fetchSubscribers = async () => {
    try {
      const res = await newsletterAPI.getSubscribers();
      if (res.data.success) {
        setSubscribers(res.data.subscribers);
      }
    } catch (err: any) {
      showToast("Failed to load subscribers.", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSubscribers();
  }, []);

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;

    setSubmitting(true);
    try {
      const res = await newsletterAPI.subscribe(email.trim());
      if (res.data.success) {
        showToast("Subscriber added successfully.", "success");
        setEmail("");
        fetchSubscribers();
      }
    } catch (err: any) {
      showToast(err.response?.data?.message || "Failed to add subscriber.", "error");
    } finally {
      setSubmitting(false);
    }
  };

  const handleUnsubscribe = async (subscriberEmail: string) => {
    if (!confirm(`Are you sure you want to remove ${subscriberEmail} from the list?`)) return;

    try {
      const res = await newsletterAPI.unsubscribe(subscriberEmail);
      if (res.data.success) {
        showToast("Subscriber removed successfully.", "success");
        fetchSubscribers();
      }
    } catch (err: any) {
      showToast("Failed to remove subscriber.", "error");
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="pb-4 border-b border-zinc-200/50 dark:border-neutral-900">
          <h1 className="text-sm font-bold uppercase tracking-widest text-neutral-900 dark:text-neutral-50">
            Newsletter Subscribers
          </h1>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Add form (Left 1 col) */}
          <div className="md:col-span-1 space-y-4">
            <div className="p-5 bg-white dark:bg-zinc-950 border border-neutral-200/40 dark:border-neutral-850 rounded-2xl shadow-xs">
              <form onSubmit={handleSubscribe} className="space-y-4">
                <h3 className="text-[10px] uppercase tracking-wider font-extrabold text-neutral-805 dark:text-neutral-200 pb-2 border-b border-neutral-100 dark:border-neutral-900">
                  Add Subscriber
                </h3>
                <div className="space-y-1.5">
                  <label className="text-[9px] text-neutral-400 uppercase tracking-wider font-semibold">Email Address</label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="e.g. reader@example.com"
                    className="w-full text-xs px-3 py-2 bg-neutral-50 dark:bg-zinc-900 border border-neutral-200 dark:border-neutral-800 rounded-lg focus:outline-none dark:text-neutral-250"
                  />
                </div>
                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full text-xs py-2 bg-neutral-900 hover:bg-editorial-accent dark:bg-neutral-100 dark:text-black text-white rounded-lg uppercase tracking-wider font-semibold flex items-center justify-center gap-1.5 transition-colors pt-2.5"
                >
                  <MailPlus className="w-3.5 h-3.5 text-editorial-accent" /> Add Subscriber
                </button>
              </form>
            </div>
          </div>

          {/* List (Right 2 cols) */}
          <div className="md:col-span-2">
            <div className="bg-white dark:bg-zinc-950 border border-neutral-200/40 dark:border-neutral-850 rounded-2xl overflow-hidden shadow-xs">
              {loading ? (
                <div className="flex justify-center items-center py-16">
                  <Loader2 className="w-6 h-6 animate-spin text-editorial-accent" />
                </div>
              ) : subscribers.length === 0 ? (
                <div className="py-16 text-center text-xs text-neutral-450 italic">
                  No subscribers listed in the system.
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-neutral-50 dark:bg-neutral-900 border-b border-neutral-200/60 dark:border-neutral-800 text-[10px] uppercase font-bold text-neutral-400">
                      <tr>
                        <th className="p-3">Email Address</th>
                        <th className="p-3">Subscription Date</th>
                        <th className="p-3 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-neutral-100 dark:divide-neutral-900">
                      {subscribers.map((sub) => (
                        <tr key={sub._id} className="hover:bg-neutral-50/40 dark:hover:bg-neutral-900/10">
                          <td className="p-3 font-medium text-neutral-805 dark:text-neutral-250 flex items-center gap-2">
                            <Mail className="w-3.5 h-3.5 text-neutral-400" />
                            <span>{sub.email}</span>
                          </td>
                          <td className="p-3 text-[10px] text-neutral-400 dark:text-neutral-500">
                            {new Date(sub.subscribedAt || sub.createdAt || Date.now()).toLocaleDateString()}
                          </td>
                          <td className="p-3 text-right">
                            <button
                              onClick={() => handleUnsubscribe(sub.email)}
                              className="p-1.5 rounded border border-neutral-200 dark:border-neutral-800 text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 transition-colors"
                              title="Remove Subscriber"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
