"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import AdminLayout from "@/components/AdminLayout";
import { postsAPI, categoriesAPI, tagsAPI, mediaAPI } from "@/services/api";
import { ArrowLeft, Save, Upload, Image as ImageIcon, Loader2 } from "lucide-react";
import { useToast } from "@/context/ToastContext";
import Link from "next/link";

interface AdminPostEditorProps {
  id?: string;
}

export default function AdminPostEditor({ id }: AdminPostEditorProps) {
  const router = useRouter();
  const { showToast } = useToast();
  const isEditMode = !!id;

  // Metadata states
  const [categories, setCategories] = useState<any[]>([]);
  const [tagsList, setTagsList] = useState<any[]>([]);

  // Form states
  const [title, setTitle] = useState("");
  const [summary, setSummary] = useState("");
  const [content, setContent] = useState("");
  const [category, setCategory] = useState("");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [featuredImage, setFeaturedImage] = useState("");
  const [status, setStatus] = useState("draft");
  const [isFeatured, setIsFeatured] = useState(false);
  const [isSticky, setIsSticky] = useState(false);
  const [isPremium, setIsPremium] = useState(false);

  // SEO states
  const [metaTitle, setMetaTitle] = useState("");
  const [metaDescription, setMetaDescription] = useState("");

  // Loading/Saving states
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    const fetchMetadataAndPost = async () => {
      try {
        const catRes = await categoriesAPI.getCategories();
        if (catRes.data.success) {
          setCategories(catRes.data.categories);
        }
        const tagsRes = await tagsAPI.getTags();
        if (tagsRes.data.success) {
          setTagsList(tagsRes.data.tags);
        }

        if (isEditMode && id) {
          // In our API, getPostBySlug or getPosts filters
          // Let's load the post data
          const postRes = await postsAPI.getPostBySlug(id);
          if (postRes.data.success) {
            const p = postRes.data.post;
            setTitle(p.title || "");
            setSummary(p.summary || "");
            setContent(p.content || "");
            setCategory(p.category?._id || p.category || "");
            setSelectedTags(p.tags?.map((t: any) => t._id || t) || []);
            setFeaturedImage(p.featuredImage || "");
            setStatus(p.status || "draft");
            setIsFeatured(p.isFeatured || false);
            setIsSticky(p.isSticky || false);
            setIsPremium(p.isPremium || false);
            setMetaTitle(p.seo?.metaTitle || "");
            setMetaDescription(p.seo?.metaDescription || "");
          }
        }
      } catch (err: any) {
        console.error("Editor init error:", err.message);
        showToast("Error loading editor data.", "error");
      } finally {
        setLoading(false);
      }
    };

    fetchMetadataAndPost();
  }, [id, isEditMode]);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    const formData = new FormData();
    formData.append("image", file);

    try {
      const res = await mediaAPI.uploadImage(formData);
      if (res.data.success) {
        setFeaturedImage(res.data.url);
        showToast("Image uploaded successfully.", "success");
      }
    } catch (err: any) {
      showToast("Image upload failed.", "error");
    } finally {
      setUploading(false);
    }
  };

  const handleTagToggle = (tagId: string) => {
    setSelectedTags((prev) =>
      prev.includes(tagId) ? prev.filter((t) => t !== tagId) : [...prev, tagId]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !content) {
      showToast("Title and Content are required.", "warning");
      return;
    }

    setSaving(true);
    const payload = {
      title,
      summary,
      content,
      category: category || null,
      tags: selectedTags,
      featuredImage,
      status,
      isFeatured,
      isSticky,
      isPremium,
      seo: {
        metaTitle: metaTitle || title,
        metaDescription: metaDescription || summary,
      },
    };

    try {
      let res;
      if (isEditMode && id) {
        res = await postsAPI.updatePost(id, payload);
      } else {
        res = await postsAPI.createPost(payload);
      }

      if (res.data.success) {
        showToast(isEditMode ? "Article updated successfully." : "Article created successfully.", "success");
        router.push("/admin/posts");
      }
    } catch (err: any) {
      showToast(err.response?.data?.message || "Save failed.", "error");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex justify-center items-center py-20">
          <div className="animate-pulse font-serif text-sm tracking-widest text-neutral-450 dark:text-neutral-500 uppercase">
            Loading Article Editor...
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6 max-w-4xl">
        {/* Top Header */}
        <div className="pb-4 border-b border-zinc-200/50 dark:border-neutral-900 flex justify-between items-center">
          <div className="flex items-center space-x-3">
            <Link
              href="/admin/posts"
              className="p-1.5 border border-zinc-200 dark:border-neutral-800 rounded-lg hover:bg-neutral-50 dark:hover:bg-neutral-900 transition-colors"
            >
              <ArrowLeft className="w-4 h-4 text-neutral-500" />
            </Link>
            <h1 className="text-sm font-bold uppercase tracking-widest text-neutral-900 dark:text-neutral-50">
              {isEditMode ? "Edit Article" : "Create New Article"}
            </h1>
          </div>

          <button
            onClick={handleSubmit}
            disabled={saving}
            className="inline-flex items-center gap-1.5 text-xs px-4 py-2 bg-neutral-900 hover:bg-editorial-accent dark:bg-neutral-100 dark:text-black dark:hover:bg-editorial-gold text-white font-semibold uppercase tracking-wider rounded-lg transition-colors disabled:opacity-50"
          >
            {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
            <span>{isEditMode ? "Save Changes" : "Publish Article"}</span>
          </button>
        </div>

        {/* Editor Layout Grid */}
        <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content Area (Left 2 cols) */}
          <div className="lg:col-span-2 space-y-5">
            {/* Title Field */}
            <div className="space-y-1.5">
              <label className="text-[10px] text-neutral-400 uppercase tracking-wider font-semibold">Title</label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Enter article title..."
                className="w-full text-sm px-4 py-3 bg-white dark:bg-zinc-950 border border-neutral-200 dark:border-neutral-850 rounded-xl focus:outline-none dark:text-neutral-250 font-serif font-bold"
              />
            </div>

            {/* Summary Field */}
            <div className="space-y-1.5">
              <label className="text-[10px] text-neutral-400 uppercase tracking-wider font-semibold">Summary</label>
              <textarea
                rows={2}
                value={summary}
                onChange={(e) => setSummary(e.target.value)}
                placeholder="A brief overview of the article..."
                className="w-full text-xs px-4 py-3 bg-white dark:bg-zinc-950 border border-neutral-200 dark:border-neutral-850 rounded-xl focus:outline-none dark:text-neutral-250 leading-relaxed"
              />
            </div>

            {/* Main Content Body */}
            <div className="space-y-1.5">
              <label className="text-[10px] text-neutral-400 uppercase tracking-wider font-semibold">Content</label>
              <textarea
                rows={18}
                required
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Write your article in markdown or plain HTML..."
                className="w-full text-xs px-4 py-4 bg-white dark:bg-zinc-950 border border-neutral-200 dark:border-neutral-850 rounded-xl focus:outline-none dark:text-neutral-250 font-mono leading-relaxed"
              />
            </div>

            {/* SEO Options Accordion/Block */}
            <div className="p-5 border border-zinc-200/50 dark:border-neutral-850 bg-neutral-50/50 dark:bg-zinc-950/20 rounded-2xl space-y-4">
              <h3 className="text-[10px] uppercase tracking-wider font-extrabold text-neutral-450 dark:text-neutral-400 border-b border-neutral-200/40 dark:border-neutral-900 pb-2">
                Search Engine Optimization (SEO)
              </h3>
              <div className="space-y-3">
                <div className="space-y-1.5">
                  <label className="text-[9px] text-neutral-400 uppercase tracking-wider font-semibold">Meta Title</label>
                  <input
                    type="text"
                    value={metaTitle}
                    onChange={(e) => setMetaTitle(e.target.value)}
                    placeholder="Defaults to article title if empty"
                    className="w-full text-xs px-3.5 py-2 bg-white dark:bg-zinc-950 border border-neutral-200 dark:border-neutral-850 rounded-lg focus:outline-none dark:text-neutral-250"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[9px] text-neutral-400 uppercase tracking-wider font-semibold">Meta Description</label>
                  <textarea
                    rows={2}
                    value={metaDescription}
                    onChange={(e) => setMetaDescription(e.target.value)}
                    placeholder="Defaults to article summary if empty"
                    className="w-full text-xs px-3.5 py-2 bg-white dark:bg-zinc-950 border border-neutral-200 dark:border-neutral-850 rounded-lg focus:outline-none dark:text-neutral-250 leading-relaxed"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar Settings (Right 1 col) */}
          <div className="space-y-6">
            {/* Status & Options Card */}
            <div className="p-5 bg-white dark:bg-zinc-950 border border-neutral-200/40 dark:border-neutral-850 rounded-2xl space-y-4">
              <h3 className="text-[10px] uppercase tracking-wider font-extrabold text-neutral-800 dark:text-neutral-200 pb-2 border-b border-neutral-100 dark:border-neutral-900">
                Publish Status
              </h3>

              <div className="space-y-1.5">
                <label className="text-[9px] text-neutral-400 uppercase tracking-wider font-semibold">Status</label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  className="w-full text-xs px-3 py-2 bg-neutral-55/40 dark:bg-zinc-900 border border-neutral-200 dark:border-neutral-800 rounded-lg focus:outline-none dark:text-neutral-250"
                >
                  <option value="draft">Draft</option>
                  <option value="published">Published</option>
                  <option value="scheduled">Scheduled</option>
                </select>
              </div>

              {/* Flags checks */}
              <div className="space-y-3 pt-2">
                <label className="flex items-center space-x-2.5 text-xs text-neutral-600 dark:text-neutral-350 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isFeatured}
                    onChange={(e) => setIsFeatured(e.target.checked)}
                    className="rounded text-editorial-accent dark:text-editorial-gold"
                  />
                  <span>Featured Story</span>
                </label>

                <label className="flex items-center space-x-2.5 text-xs text-neutral-600 dark:text-neutral-350 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isSticky}
                    onChange={(e) => setIsSticky(e.target.checked)}
                    className="rounded text-editorial-accent dark:text-editorial-gold"
                  />
                  <span>Pin to Top (Sticky)</span>
                </label>

                <label className="flex items-center space-x-2.5 text-xs text-neutral-600 dark:text-neutral-350 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isPremium}
                    onChange={(e) => setIsPremium(e.target.checked)}
                    className="rounded text-editorial-accent dark:text-editorial-gold"
                  />
                  <span>Premium Paywall</span>
                </label>
              </div>
            </div>

            {/* Categories Selection */}
            <div className="p-5 bg-white dark:bg-zinc-950 border border-neutral-200/40 dark:border-neutral-850 rounded-2xl space-y-3">
              <h3 className="text-[10px] uppercase tracking-wider font-extrabold text-neutral-850 dark:text-neutral-200 pb-2 border-b border-neutral-100 dark:border-neutral-900">
                Category
              </h3>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full text-xs px-3 py-2 bg-neutral-55/40 dark:bg-zinc-900 border border-neutral-200 dark:border-neutral-800 rounded-lg focus:outline-none dark:text-neutral-250"
              >
                <option value="">Select Category...</option>
                {categories.map((c) => (
                  <option key={c._id} value={c._id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Featured Image URL & Upload */}
            <div className="p-5 bg-white dark:bg-zinc-950 border border-neutral-200/40 dark:border-neutral-850 rounded-2xl space-y-4">
              <h3 className="text-[10px] uppercase tracking-wider font-extrabold text-neutral-850 dark:text-neutral-200 pb-2 border-b border-neutral-100 dark:border-neutral-900">
                Featured Image
              </h3>
              
              {featuredImage && (
                <div className="aspect-[16/10] overflow-hidden rounded-xl bg-neutral-100 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800">
                  <img src={featuredImage} alt="Preview" className="w-full h-full object-cover" />
                </div>
              )}

              <div className="space-y-3">
                <input
                  type="text"
                  value={featuredImage}
                  onChange={(e) => setFeaturedImage(e.target.value)}
                  placeholder="Image URL..."
                  className="w-full text-xs px-3 py-2 bg-neutral-50 dark:bg-zinc-900 border border-neutral-200 dark:border-neutral-800 rounded-lg focus:outline-none dark:text-neutral-250"
                />

                <label className="flex items-center justify-center gap-2 border border-dashed border-zinc-200 dark:border-neutral-800 hover:bg-neutral-50 dark:hover:bg-neutral-900/50 p-4 rounded-xl cursor-pointer transition-colors text-xs font-semibold text-neutral-500">
                  {uploading ? (
                    <Loader2 className="w-4 h-4 animate-spin text-editorial-accent" />
                  ) : (
                    <Upload className="w-4 h-4 text-editorial-accent" />
                  )}
                  <span>{uploading ? "Uploading..." : "Upload Local Image"}</span>
                  <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
                </label>
              </div>
            </div>

            {/* Tags Selection Grid */}
            <div className="p-5 bg-white dark:bg-zinc-950 border border-neutral-200/40 dark:border-neutral-850 rounded-2xl space-y-3">
              <h3 className="text-[10px] uppercase tracking-wider font-extrabold text-neutral-850 dark:text-neutral-200 pb-2 border-b border-neutral-100 dark:border-neutral-900">
                Tags
              </h3>
              <div className="flex flex-wrap gap-1.5 max-h-48 overflow-y-auto pt-1">
                {tagsList.map((tag) => {
                  const isActive = selectedTags.includes(tag._id);
                  return (
                    <button
                      key={tag._id}
                      type="button"
                      onClick={() => handleTagToggle(tag._id)}
                      className={`text-[10px] px-2 py-0.5 rounded border transition-colors ${
                        isActive
                          ? "bg-editorial-accent/10 border-editorial-accent text-editorial-accent dark:border-editorial-gold dark:text-editorial-gold"
                          : "border-neutral-200 dark:border-neutral-800 text-neutral-500 dark:text-neutral-450 hover:bg-neutral-50"
                      }`}
                    >
                      {tag.name}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </form>
      </div>
    </AdminLayout>
  );
}
