"use client";

export const dynamic = "force-dynamic";

import React, { useState, useEffect } from "react";
import AdminLayout from "@/components/AdminLayout";
import { commentsAPI } from "@/services/api";
import { useToast } from "@/context/ToastContext";
import { MessageSquare, Trash2, CheckCircle2, XCircle, Loader2 } from "lucide-react";

export default function CommentsPage() {
  const { showToast } = useToast();
  const [comments, setComments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState("");

  const fetchComments = async (status?: string) => {
    setLoading(true);
    try {
      const res = await commentsAPI.getAllComments(status || undefined);
      if (res.data.success) {
        setComments(res.data.comments);
      }
    } catch (err: any) {
      showToast("Failed to load comments.", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchComments(filterStatus);
  }, [filterStatus]);

  const handleUpdateStatus = async (id: string, status: string) => {
    try {
      const res = await commentsAPI.updateCommentStatus(id, status);
      if (res.data.success) {
        showToast(`Comment status updated to ${status}.`, "success");
        fetchComments(filterStatus);
      }
    } catch (err: any) {
      showToast("Failed to update comment status.", "error");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to permanently delete this comment?")) return;

    try {
      const res = await commentsAPI.deleteComment(id);
      if (res.data.success) {
        showToast("Comment deleted successfully.", "success");
        fetchComments(filterStatus);
      }
    } catch (err: any) {
      showToast("Failed to delete comment.", "error");
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="pb-4 border-b border-zinc-200/50 dark:border-neutral-900 flex justify-between items-center flex-wrap gap-4">
          <h1 className="text-sm font-bold uppercase tracking-widest text-neutral-900 dark:text-neutral-50">
            Comments Moderation
          </h1>

          <div className="flex items-center space-x-2">
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="text-xs px-3 py-1.5 bg-white dark:bg-zinc-950 border border-neutral-200 dark:border-neutral-800 rounded-lg focus:outline-none dark:text-neutral-250 font-semibold"
            >
              <option value="">All Comments</option>
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="spam">Spam</option>
            </select>
          </div>
        </div>

        {/* List Content */}
        <div className="bg-white dark:bg-zinc-950 border border-neutral-200/40 dark:border-neutral-850 rounded-2xl overflow-hidden shadow-xs">
          {loading ? (
            <div className="flex justify-center items-center py-16">
              <Loader2 className="w-6 h-6 animate-spin text-editorial-accent" />
            </div>
          ) : comments.length === 0 ? (
            <div className="py-16 text-center text-xs text-neutral-450 italic">
              No comments matching the selected criteria.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-neutral-50 dark:bg-neutral-900 border-b border-neutral-200/60 dark:border-neutral-800 text-[10px] uppercase font-bold text-neutral-400">
                  <tr>
                    <th className="p-3">Author</th>
                    <th className="p-3">Comment Content</th>
                    <th className="p-3">Article Slug / ID</th>
                    <th className="p-3">Status</th>
                    <th className="p-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-100 dark:divide-neutral-900">
                  {comments.map((comm) => (
                    <tr key={comm._id} className="hover:bg-neutral-50/40 dark:hover:bg-neutral-900/10">
                      <td className="p-3">
                        <div className="font-semibold text-neutral-850 dark:text-neutral-250">
                          {comm.authorName}
                        </div>
                        <div className="text-[10px] text-neutral-400 font-mono">
                          {comm.authorEmail}
                        </div>
                      </td>
                      <td className="p-3 max-w-sm">
                        <p className="text-[11px] text-neutral-600 dark:text-neutral-350 leading-relaxed break-words whitespace-pre-wrap">
                          {comm.content}
                        </p>
                        <span className="text-[9px] text-neutral-400 block mt-1">
                          Posted on {new Date(comm.createdAt).toLocaleString()}
                        </span>
                      </td>
                      <td className="p-3 text-[10px] text-neutral-500 font-mono">
                        {comm.post?.title || comm.post || "Unknown Post"}
                      </td>
                      <td className="p-3">
                        <span
                          className={`text-[9px] uppercase tracking-wider font-semibold px-2 py-0.5 rounded-sm ${
                            comm.status === "approved"
                              ? "bg-green-50 dark:bg-green-950/20 text-green-700 dark:text-green-400 border border-green-200 dark:border-green-900/50"
                              : comm.status === "spam"
                              ? "bg-red-50 dark:bg-red-950/20 text-red-700 dark:text-red-400 border border-red-200 dark:border-red-900/50"
                              : "bg-amber-50 dark:bg-amber-955/20 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-900/50"
                          }`}
                        >
                          {comm.status}
                        </span>
                      </td>
                      <td className="p-3 text-right flex items-center justify-end gap-1.5">
                        {comm.status !== "approved" && (
                          <button
                            onClick={() => handleUpdateStatus(comm._id, "approved")}
                            className="p-1.5 rounded border border-neutral-200 dark:border-neutral-800 text-green-600 hover:bg-green-50 dark:hover:bg-green-950/20 transition-colors"
                            title="Approve Comment"
                          >
                            <CheckCircle2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                        {comm.status !== "spam" && (
                          <button
                            onClick={() => handleUpdateStatus(comm._id, "spam")}
                            className="p-1.5 rounded border border-neutral-200 dark:border-neutral-800 text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-950/20 transition-colors"
                            title="Mark as Spam"
                          >
                            <XCircle className="w-3.5 h-3.5" />
                          </button>
                        )}
                        <button
                          onClick={() => handleDelete(comm._id)}
                          className="p-1.5 rounded border border-neutral-200 dark:border-neutral-800 text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 transition-colors"
                          title="Delete Comment"
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
    </AdminLayout>
  );
}
