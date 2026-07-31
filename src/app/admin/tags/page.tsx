"use client";

export const dynamic = "force-dynamic";

import React, { useState, useEffect } from "react";
import AdminLayout from "@/components/AdminLayout";
import { tagsAPI } from "@/services/api";
import { useToast } from "@/context/ToastContext";
import { Tag, Trash2, Edit2, Loader2, Save } from "lucide-react";

export default function TagsPage() {
  const { showToast } = useToast();
  const [tags, setTags] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Form states
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [description, setDescription] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // Edit states
  const [editId, setEditId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [editSlug, setEditSlug] = useState("");
  const [editDescription, setEditDescription] = useState("");

  const fetchTags = async () => {
    try {
      const res = await tagsAPI.getTags();
      if (res.data.success) {
        setTags(res.data.tags);
      }
    } catch (err: any) {
      showToast("Failed to load tags.", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTags();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    setSubmitting(true);
    const finalSlug = slug.trim() || name.toLowerCase().replace(/[^a-z0-9]+/g, "-");

    try {
      const res = await tagsAPI.createTag({
        name: name.trim(),
        slug: finalSlug,
        description: description.trim(),
      });
      if (res.data.success) {
        showToast("Tag created successfully.", "success");
        setName("");
        setSlug("");
        setDescription("");
        fetchTags();
      }
    } catch (err: any) {
      showToast(err.response?.data?.message || "Failed to create tag.", "error");
    } finally {
      setSubmitting(false);
    }
  };

  const handleEditInit = (tag: any) => {
    setEditId(tag._id);
    setEditName(tag.name);
    setEditSlug(tag.slug);
    setEditDescription(tag.description || "");
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editId || !editName.trim()) return;

    setSubmitting(true);
    try {
      const res = await tagsAPI.updateTag(editId, {
        name: editName.trim(),
        slug: editSlug.trim(),
        description: editDescription.trim(),
      });
      if (res.data.success) {
        showToast("Tag updated successfully.", "success");
        setEditId(null);
        fetchTags();
      }
    } catch (err: any) {
      showToast(err.response?.data?.message || "Failed to update tag.", "error");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this tag?")) return;

    try {
      const res = await tagsAPI.deleteTag(id);
      if (res.data.success) {
        showToast("Tag deleted successfully.", "success");
        fetchTags();
      }
    } catch (err: any) {
      showToast("Failed to delete tag.", "error");
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="pb-4 border-b border-zinc-200/50 dark:border-neutral-900">
          <h1 className="text-sm font-bold uppercase tracking-widest text-neutral-900 dark:text-neutral-50">
            Tags Directory
          </h1>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Form Column (Left 1 col) */}
          <div className="md:col-span-1 space-y-4">
            <div className="p-5 bg-white dark:bg-zinc-950 border border-neutral-200/40 dark:border-neutral-850 rounded-2xl shadow-xs">
              {editId ? (
                <form onSubmit={handleUpdate} className="space-y-4">
                  <h3 className="text-[10px] uppercase tracking-wider font-extrabold text-neutral-805 dark:text-neutral-200 pb-2 border-b border-neutral-100 dark:border-neutral-900">
                    Edit Tag
                  </h3>
                  <div className="space-y-1.5">
                    <label className="text-[9px] text-neutral-400 uppercase tracking-wider font-semibold">Name</label>
                    <input
                      type="text"
                      required
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      className="w-full text-xs px-3 py-2 bg-neutral-50 dark:bg-zinc-900 border border-neutral-200 dark:border-neutral-800 rounded-lg focus:outline-none dark:text-neutral-200"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[9px] text-neutral-400 uppercase tracking-wider font-semibold">Slug</label>
                    <input
                      type="text"
                      required
                      value={editSlug}
                      onChange={(e) => setEditSlug(e.target.value)}
                      className="w-full text-xs px-3 py-2 bg-neutral-50 dark:bg-zinc-900 border border-neutral-200 dark:border-neutral-800 rounded-lg focus:outline-none dark:text-neutral-200"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[9px] text-neutral-400 uppercase tracking-wider font-semibold">Description</label>
                    <textarea
                      rows={3}
                      value={editDescription}
                      onChange={(e) => setEditDescription(e.target.value)}
                      className="w-full text-xs px-3 py-2 bg-neutral-50 dark:bg-zinc-900 border border-neutral-200 dark:border-neutral-800 rounded-lg focus:outline-none dark:text-neutral-200"
                    />
                  </div>
                  <div className="flex gap-2 pt-2">
                    <button
                      type="submit"
                      disabled={submitting}
                      className="text-xs px-4 py-2 bg-neutral-900 hover:bg-editorial-accent dark:bg-neutral-100 dark:text-black text-white rounded-lg uppercase tracking-wider font-semibold flex items-center gap-1 transition-colors"
                    >
                      <Save className="w-3.5 h-3.5" /> Save
                    </button>
                    <button
                      type="button"
                      onClick={() => setEditId(null)}
                      className="text-xs px-4 py-2 border border-zinc-200 dark:border-neutral-800 text-neutral-500 rounded-lg uppercase tracking-wider font-semibold hover:bg-neutral-50 transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              ) : (
                <form onSubmit={handleCreate} className="space-y-4">
                  <h3 className="text-[10px] uppercase tracking-wider font-extrabold text-neutral-805 dark:text-neutral-200 pb-2 border-b border-neutral-100 dark:border-neutral-900">
                    Add New Tag
                  </h3>
                  <div className="space-y-1.5">
                    <label className="text-[9px] text-neutral-400 uppercase tracking-wider font-semibold">Name</label>
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="e.g. NextJS"
                      className="w-full text-xs px-3 py-2 bg-neutral-50 dark:bg-zinc-900 border border-neutral-200 dark:border-neutral-800 rounded-lg focus:outline-none dark:text-neutral-200"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[9px] text-neutral-400 uppercase tracking-wider font-semibold">Slug</label>
                    <input
                      type="text"
                      value={slug}
                      onChange={(e) => setSlug(e.target.value)}
                      placeholder="e.g. nextjs"
                      className="w-full text-xs px-3 py-2 bg-neutral-50 dark:bg-zinc-900 border border-neutral-200 dark:border-neutral-800 rounded-lg focus:outline-none dark:text-neutral-200"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[9px] text-neutral-400 uppercase tracking-wider font-semibold">Description</label>
                    <textarea
                      rows={3}
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="Brief tag summary..."
                      className="w-full text-xs px-3 py-2 bg-neutral-50 dark:bg-zinc-900 border border-neutral-200 dark:border-neutral-800 rounded-lg focus:outline-none dark:text-neutral-200"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="w-full text-xs py-2 bg-neutral-900 hover:bg-editorial-accent dark:bg-neutral-100 dark:text-black text-white rounded-lg uppercase tracking-wider font-semibold flex items-center justify-center gap-1.5 transition-colors pt-2.5"
                  >
                    <Tag className="w-3.5 h-3.5 text-editorial-accent" /> Create Tag
                  </button>
                </form>
              )}
            </div>
          </div>

          {/* List Column (Right 2 cols) */}
          <div className="md:col-span-2">
            <div className="bg-white dark:bg-zinc-950 border border-neutral-200/40 dark:border-neutral-850 rounded-2xl overflow-hidden shadow-xs">
              {loading ? (
                <div className="flex justify-center items-center py-16">
                  <Loader2 className="w-6 h-6 animate-spin text-editorial-accent" />
                </div>
              ) : tags.length === 0 ? (
                <div className="py-16 text-center text-xs text-neutral-455 italic">
                  No tags found.
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-neutral-50 dark:bg-neutral-900 border-b border-neutral-200/60 dark:border-neutral-800 text-[10px] uppercase font-bold text-neutral-400">
                      <tr>
                        <th className="p-3">Name</th>
                        <th className="p-3">Slug</th>
                        <th className="p-3">Description</th>
                        <th className="p-3 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-neutral-100 dark:divide-neutral-900">
                      {tags.map((tag) => (
                        <tr key={tag._id} className="hover:bg-neutral-50/40 dark:hover:bg-neutral-900/10">
                          <td className="p-3 font-serif font-bold text-neutral-850 dark:text-neutral-250">
                            #{tag.name}
                          </td>
                          <td className="p-3 text-[10px] text-neutral-550 dark:text-neutral-400 font-mono">
                            {tag.slug}
                          </td>
                          <td className="p-3 text-[11px] text-neutral-500 dark:text-neutral-455 max-w-xs truncate">
                            {tag.description || "—"}
                          </td>
                          <td className="p-3 text-right flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => handleEditInit(tag)}
                              className="p-1.5 rounded border border-neutral-200 dark:border-neutral-800 text-neutral-500 dark:text-neutral-400 hover:bg-neutral-50 dark:hover:bg-neutral-900 transition-colors"
                              title="Edit Tag"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleDelete(tag._id)}
                              className="p-1.5 rounded border border-neutral-200 dark:border-neutral-800 text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 transition-colors"
                              title="Delete Tag"
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
