"use client";

export const dynamic = "force-dynamic";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import AdminLayout from "../../../components/AdminLayout";
import { postsAPI, categoriesAPI } from "../../../services/api";
import { Plus, Edit, Trash2, ExternalLink } from "lucide-react";
import { useToast } from "../../../context/ToastContext";

export default function AdminPostsPage() {
  const [posts, setPosts] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const { showToast } = useToast();

  // Filters & Pagination
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [status, setStatus] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalPosts, setTotalPosts] = useState(0);

  const fetchPosts = async () => {
    setLoading(true);
    try {
      const params = {
        page,
        limit: 10,
        status: status || undefined,
        category: category || undefined,
        search: search || undefined,
      };
      const res = await postsAPI.getPosts(params);
      if (res.data.success) {
        setPosts(res.data.posts);
        setTotalPages(res.data.pages);
        setTotalPosts(res.data.total);
      }
    } catch (err: any) {
      console.error("Admin posts load error:", err.message);
      showToast("Failed to load publications.", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, [page, category, status]);

  useEffect(() => {
    const fetchMetadata = async () => {
      try {
        const res = await categoriesAPI.getCategories();
        if (res.data.success) {
          setCategories(res.data.categories);
        }
      } catch (err: any) {
        console.error("Failed to load categories metadata:", err.message);
      }
    };
    fetchMetadata();
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchPosts();
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this publication? This action is irreversible.")) return;

    try {
      const res = await postsAPI.deletePost(id);
      if (res.data.success) {
        setPosts(posts.filter((p) => p._id !== id));
        setTotalPosts(totalPosts - 1);
        showToast("Publication deleted successfully.", "success");
      }
    } catch (err: any) {
      showToast(err.response?.data?.message || "Delete failed", "error");
    }
  };

  return (
    <AdminLayout>
      {/* Header Panel */}
      <div className="flex justify-between items-center pb-4 border-b border-neutral-200/80 dark:border-neutral-850">
        <div>
          <h1 className="text-sm font-bold uppercase tracking-widest text-neutral-850 dark:text-neutral-50">
            Articles Library
          </h1>
          <p className="text-[10px] text-neutral-450 dark:text-neutral-500 uppercase tracking-widest font-semibold mt-0.5">
            Manage your articles, drafts, and scheduled editorial publications.
          </p>
        </div>
        <Link
          href="/admin/posts/new"
          className="inline-flex items-center text-[10px] uppercase font-bold tracking-widest px-3 py-1.5 bg-neutral-900 dark:bg-neutral-100 text-white dark:text-black rounded-sm transition-colors hover:bg-editorial-accent dark:hover:bg-editorial-gold"
        >
          <Plus className="w-3.5 h-3.5 mr-1" /> New Article
        </Link>
      </div>

      {/* Filter Toolbar */}
      <div className="bg-white dark:bg-neutral-950 p-4 border border-neutral-200/40 dark:border-neutral-850 rounded-sm">
        <form onSubmit={handleSearchSubmit} className="grid grid-cols-1 sm:grid-cols-4 gap-3 items-end">
          <div className="space-y-1">
            <label className="text-[9px] uppercase tracking-wider font-semibold text-neutral-400">Search Keywords</label>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Title/Summary..."
              className="w-full text-xs px-2 py-1 bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded focus:outline-none dark:text-neutral-200"
            />
          </div>
          <div className="space-y-1">
            <label className="text-[9px] uppercase tracking-wider font-semibold text-neutral-400">Category</label>
            <select
              value={category}
              onChange={(e) => {
                setCategory(e.target.value);
                setPage(1);
              }}
              className="w-full text-xs px-2 py-1 bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded focus:outline-none dark:text-neutral-205"
            >
              <option value="">All Categories</option>
              {categories.map((cat) => (
                <option key={cat._id} value={cat.slug}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>
          <div className="space-y-1">
            <label className="text-[9px] uppercase tracking-wider font-semibold text-neutral-400">Status</label>
            <select
              value={status}
              onChange={(e) => {
                setStatus(e.target.value);
                setPage(1);
              }}
              className="w-full text-xs px-2 py-1 bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded focus:outline-none dark:text-neutral-205"
            >
              <option value="">All Statuses</option>
              <option value="draft">Draft</option>
              <option value="published">Published</option>
              <option value="scheduled">Scheduled</option>
            </select>
          </div>
          <div className="text-right">
            <button
              type="submit"
              className="text-xs px-4 py-1.5 border border-neutral-900 dark:border-neutral-100 text-neutral-900 dark:text-neutral-100 hover:bg-neutral-900 hover:text-white dark:hover:bg-white dark:hover:text-black uppercase tracking-wider font-semibold rounded-sm transition-colors w-full sm:w-auto"
            >
              Search
            </button>
          </div>
        </form>
      </div>

      {/* Posts Table */}
      <div className="bg-white dark:bg-neutral-950 border border-neutral-200/40 dark:border-neutral-850 rounded-sm overflow-hidden">
        {loading ? (
          <div className="flex justify-center items-center py-16">
            <div className="animate-pulse font-serif text-sm tracking-widest text-neutral-400 dark:text-neutral-550 uppercase">
              Querying Posts...
            </div>
          </div>
        ) : posts.length === 0 ? (
          <div className="py-16 text-center text-xs text-neutral-500">
            No articles found matching the criteria.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-neutral-50 dark:bg-neutral-900 border-b border-neutral-200/60 dark:border-neutral-800 text-[10px] uppercase font-bold text-neutral-400">
                <tr>
                  <th className="p-3">Title</th>
                  <th className="p-3">Category</th>
                  <th className="p-3">Author</th>
                  <th className="p-3">Status</th>
                  <th className="p-3">Date</th>
                  <th className="p-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100 dark:divide-neutral-900">
                {posts.map((post) => (
                  <tr key={post._id} className="hover:bg-neutral-50/40 dark:hover:bg-neutral-900/10">
                    <td className="p-3 font-serif font-bold text-neutral-805 dark:text-neutral-200 max-w-xs truncate">
                      {post.title}
                    </td>
                    <td className="p-3 text-[11px] text-neutral-550 dark:text-neutral-400">
                      {post.category?.name || "Uncategorized"}
                    </td>
                    <td className="p-3 text-[11px] text-neutral-550 dark:text-neutral-400">
                      {post.author?.name}
                    </td>
                    <td className="p-3">
                      <span
                        className={`text-[9px] uppercase tracking-wider font-semibold px-2 py-0.5 rounded-sm ${
                          post.status === "published"
                            ? "bg-green-50 dark:bg-green-950/20 text-green-700 dark:text-green-400 border border-green-200 dark:border-green-900/50"
                            : post.status === "draft"
                            ? "bg-neutral-100 dark:bg-neutral-900 text-neutral-500 dark:text-neutral-450 border border-neutral-250/30"
                            : "bg-blue-50 dark:bg-blue-950/20 text-blue-700 dark:text-blue-400 border border-blue-200 dark:border-blue-900/50"
                        }`}
                      >
                        {post.status}
                      </span>
                    </td>
                    <td className="p-3 text-[10px] text-neutral-400 dark:text-neutral-500">
                      {new Date(post.publishedAt || post.createdAt).toLocaleDateString()}
                    </td>
                    <td className="p-3 text-right flex items-center justify-end gap-1.5">
                      <Link
                        href={`/post/${post.slug}`}
                        target="_blank"
                        className="p-1.5 rounded border border-neutral-200 dark:border-neutral-800 text-neutral-500 dark:text-neutral-400 hover:bg-neutral-50 dark:hover:bg-neutral-900 transition-colors"
                        title="View Public Post"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                      </Link>
                      <button
                        onClick={() => router.push(`/admin/posts/edit/${post._id}`)}
                        className="p-1.5 rounded border border-neutral-200 dark:border-neutral-800 text-neutral-500 dark:text-neutral-400 hover:bg-neutral-50 dark:hover:bg-neutral-900 transition-colors"
                        title="Edit Post"
                      >
                        <Edit className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDelete(post._id)}
                        className="p-1.5 rounded border border-neutral-200 dark:border-neutral-800 text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 transition-colors"
                        title="Delete Post"
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

        {/* Pagination bar */}
        {totalPages > 1 && (
          <div className="flex justify-between items-center p-3 bg-neutral-50 dark:bg-neutral-900 border-t border-neutral-200/60 dark:border-neutral-800">
            <button
              onClick={() => setPage(Math.max(1, page - 1))}
              disabled={page === 1}
              className="text-xs text-neutral-500 hover:text-editorial-accent disabled:opacity-30 flex items-center transition-colors"
            >
              Previous
            </button>
            <span className="text-xs text-neutral-400 font-medium">
              Page {page} of {totalPages}
            </span>
            <button
              onClick={() => setPage(Math.min(totalPages, page + 1))}
              disabled={page === totalPages}
              className="text-xs text-neutral-500 hover:text-editorial-accent disabled:opacity-30 flex items-center transition-colors"
            >
              Next
            </button>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
