"use client";

export const dynamic = "force-dynamic";

import React, { useState, useEffect } from "react";
import AdminLayout from "@/components/AdminLayout";
import { mediaAPI } from "@/services/api";
import { useToast } from "@/context/ToastContext";
import { Upload, Trash2, Copy, Check, Loader2, Image as ImageIcon } from "lucide-react";

export default function MediaLibraryPage() {
  const { showToast } = useToast();
  const [mediaList, setMediaList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [copiedUrl, setCopiedUrl] = useState<string | null>(null);

  const fetchMedia = async () => {
    try {
      const res = await mediaAPI.getMediaAssets();
      if (res.data.success) {
        setMediaList(res.data.media);
      }
    } catch (err: any) {
      showToast("Failed to load media assets.", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMedia();
  }, []);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    const formData = new FormData();
    formData.append("image", file);

    try {
      const res = await mediaAPI.uploadImage(formData);
      if (res.data.success) {
        showToast("Media uploaded successfully.", "success");
        fetchMedia();
      }
    } catch (err: any) {
      showToast("Media upload failed.", "error");
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (filename: string) => {
    if (!confirm("Are you sure you want to delete this media file?")) return;

    try {
      const res = await mediaAPI.deleteMediaAsset(filename);
      if (res.data.success) {
        showToast("Media deleted successfully.", "success");
        fetchMedia();
      }
    } catch (err: any) {
      showToast("Failed to delete media asset.", "error");
    }
  };

  const handleCopyToClipboard = (url: string) => {
    navigator.clipboard.writeText(url);
    setCopiedUrl(url);
    showToast("URL copied to clipboard.", "info");
    setTimeout(() => setCopiedUrl(null), 2000);
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="pb-4 border-b border-zinc-200/50 dark:border-neutral-900 flex justify-between items-center flex-wrap gap-4">
          <h1 className="text-sm font-bold uppercase tracking-widest text-neutral-900 dark:text-neutral-50">
            Media Asset Library
          </h1>

          <label className="inline-flex items-center gap-1.5 text-xs px-4 py-2 bg-neutral-900 hover:bg-editorial-accent dark:bg-neutral-100 dark:text-black dark:hover:bg-editorial-gold text-white font-semibold uppercase tracking-wider rounded-lg transition-colors cursor-pointer disabled:opacity-50">
            {uploading ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Upload className="w-3.5 h-3.5" />
            )}
            <span>{uploading ? "Uploading..." : "Upload New File"}</span>
            <input type="file" accept="image/*" onChange={handleUpload} className="hidden" />
          </label>
        </div>

        {/* Media Grid */}
        {loading ? (
          <div className="flex justify-center items-center py-20">
            <Loader2 className="w-6 h-6 animate-spin text-editorial-accent" />
          </div>
        ) : mediaList.length === 0 ? (
          <div className="py-20 text-center border border-dashed border-zinc-200 dark:border-neutral-800 rounded-2xl bg-white dark:bg-zinc-950/20">
            <ImageIcon className="w-8 h-8 text-neutral-300 mx-auto mb-2" />
            <p className="text-xs text-neutral-450 italic">No media assets found in library.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {mediaList.map((asset) => (
              <div
                key={asset.url}
                className="group relative bg-white dark:bg-zinc-950 border border-neutral-200/40 dark:border-neutral-850 rounded-xl overflow-hidden shadow-xs hover:border-neutral-300 dark:hover:border-neutral-700 transition-all flex flex-col"
              >
                {/* Visual Thumbnail */}
                <div className="aspect-square bg-neutral-50 dark:bg-neutral-900 overflow-hidden relative border-b border-neutral-100 dark:border-neutral-900">
                  <img
                    src={asset.url}
                    alt={asset.name}
                    className="w-full h-full object-cover group-hover:scale-[1.01] transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-neutral-900/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                    <button
                      onClick={() => handleCopyToClipboard(asset.url)}
                      className="p-2 bg-white dark:bg-neutral-900 rounded-lg shadow-sm hover:scale-105 transition-transform"
                      title="Copy URL"
                    >
                      {copiedUrl === asset.url ? (
                        <Check className="w-4 h-4 text-green-600" />
                      ) : (
                        <Copy className="w-4 h-4 text-neutral-600 dark:text-neutral-300" />
                      )}
                    </button>
                    <button
                      onClick={() => handleDelete(asset.name)}
                      className="p-2 bg-white dark:bg-neutral-900 rounded-lg shadow-sm text-red-500 hover:scale-105 transition-transform"
                      title="Delete Asset"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Details Footer */}
                <div className="p-2.5 flex-grow flex flex-col justify-between">
                  <p className="text-[10px] font-semibold text-neutral-805 dark:text-neutral-250 truncate mb-0.5" title={asset.name}>
                    {asset.name}
                  </p>
                  <p className="text-[9px] text-neutral-450 dark:text-neutral-500 font-mono truncate">
                    {asset.size ? `${(asset.size / 1024).toFixed(1)} KB` : "Image Asset"}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
