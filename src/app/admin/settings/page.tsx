"use client";

export const dynamic = "force-dynamic";

import React, { useState, useEffect } from "react";
import AdminLayout from "@/components/AdminLayout";
import { settingsAPI } from "@/services/api";
import { useToast } from "@/context/ToastContext";
import { Save, Loader2, Settings } from "lucide-react";

export default function SettingsPage() {
  const { showToast } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Form states
  const [siteName, setSiteName] = useState("");
  const [siteDescription, setSiteDescription] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [twitter, setTwitter] = useState("");
  const [facebook, setFacebook] = useState("");
  const [instagram, setInstagram] = useState("");
  const [linkedin, setLinkedin] = useState("");
  const [adsenseCode, setAdsenseCode] = useState("");
  const [analyticsId, setAnalyticsId] = useState("");

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const res = await settingsAPI.getSettings();
        if (res.data.success) {
          const s = res.data.settings;
          setSiteName(s.siteName || "");
          setSiteDescription(s.siteDescription || "");
          setContactEmail(s.contactEmail || "");
          setTwitter(s.socialLinks?.twitter || "");
          setFacebook(s.socialLinks?.facebook || "");
          setInstagram(s.socialLinks?.instagram || "");
          setLinkedin(s.socialLinks?.linkedin || "");
          setAdsenseCode(s.googleAdsenseCode || "");
          setAnalyticsId(s.googleAnalyticsId || "");
        }
      } catch (err: any) {
        showToast("Failed to fetch settings.", "error");
      } finally {
        setLoading(false);
      }
    };
    fetchSettings();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    const payload = {
      siteName,
      siteDescription,
      contactEmail,
      socialLinks: {
        twitter,
        facebook,
        instagram,
        linkedin,
      },
      googleAdsenseCode: adsenseCode,
      googleAnalyticsId: analyticsId,
    };

    try {
      const res = await settingsAPI.updateSettings(payload);
      if (res.data.success) {
        showToast("Global publication settings updated successfully.", "success");
      }
    } catch (err: any) {
      showToast(err.response?.data?.message || "Failed to update settings.", "error");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex justify-center items-center py-20">
          <Loader2 className="w-6 h-6 animate-spin text-editorial-accent" />
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6 max-w-2xl">
        {/* Header */}
        <div className="pb-4 border-b border-zinc-200/50 dark:border-neutral-900 flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <Settings className="w-4.5 h-4.5 text-neutral-500" />
            <h1 className="text-sm font-bold uppercase tracking-widest text-neutral-900 dark:text-neutral-50">
              Site Settings
            </h1>
          </div>

          <button
            onClick={handleSubmit}
            disabled={saving}
            className="inline-flex items-center gap-1.5 text-xs px-4 py-2 bg-neutral-900 hover:bg-editorial-accent dark:bg-neutral-100 dark:text-black dark:hover:bg-editorial-gold text-white font-semibold uppercase tracking-wider rounded-lg transition-colors disabled:opacity-50"
          >
            {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
            <span>Save Settings</span>
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* General Block */}
          <div className="p-6 bg-white dark:bg-zinc-950 border border-neutral-200/40 dark:border-neutral-850 rounded-2xl space-y-4">
            <h3 className="text-[10px] uppercase tracking-wider font-extrabold text-neutral-805 dark:text-neutral-250 border-b border-neutral-100 dark:border-neutral-900 pb-2">
              General Information
            </h3>
            <div className="space-y-1.5">
              <label className="text-[9px] text-neutral-400 uppercase tracking-wider font-semibold">Website Name</label>
              <input
                type="text"
                required
                value={siteName}
                onChange={(e) => setSiteName(e.target.value)}
                placeholder="e.g. Courier"
                className="w-full text-xs px-3.5 py-2.5 bg-neutral-50 dark:bg-zinc-900 border border-neutral-200 dark:border-neutral-800 rounded-lg focus:outline-none dark:text-neutral-200"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-[9px] text-neutral-400 uppercase tracking-wider font-semibold">Description</label>
              <textarea
                rows={3}
                value={siteDescription}
                onChange={(e) => setSiteDescription(e.target.value)}
                placeholder="Modern publications and editorial insights..."
                className="w-full text-xs px-3.5 py-2.5 bg-neutral-50 dark:bg-zinc-900 border border-neutral-200 dark:border-neutral-800 rounded-lg focus:outline-none dark:text-neutral-200 leading-relaxed"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-[9px] text-neutral-400 uppercase tracking-wider font-semibold">Contact Email</label>
              <input
                type="email"
                required
                value={contactEmail}
                onChange={(e) => setContactEmail(e.target.value)}
                placeholder="contact@domain.com"
                className="w-full text-xs px-3.5 py-2.5 bg-neutral-50 dark:bg-zinc-900 border border-neutral-200 dark:border-neutral-800 rounded-lg focus:outline-none dark:text-neutral-200"
              />
            </div>
          </div>

          {/* Social Links Block */}
          <div className="p-6 bg-white dark:bg-zinc-950 border border-neutral-200/40 dark:border-neutral-850 rounded-2xl space-y-4">
            <h3 className="text-[10px] uppercase tracking-wider font-extrabold text-neutral-805 dark:text-neutral-250 border-b border-neutral-100 dark:border-neutral-900 pb-2">
              Social Networks
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-[9px] text-neutral-400 uppercase tracking-wider font-semibold">Twitter URL</label>
                <input
                  type="text"
                  value={twitter}
                  onChange={(e) => setTwitter(e.target.value)}
                  placeholder="https://twitter.com/..."
                  className="w-full text-xs px-3.5 py-2 bg-neutral-50 dark:bg-zinc-900 border border-neutral-200 dark:border-neutral-800 rounded-lg focus:outline-none dark:text-neutral-200"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[9px] text-neutral-400 uppercase tracking-wider font-semibold">Facebook URL</label>
                <input
                  type="text"
                  value={facebook}
                  onChange={(e) => setFacebook(e.target.value)}
                  placeholder="https://facebook.com/..."
                  className="w-full text-xs px-3.5 py-2 bg-neutral-50 dark:bg-zinc-900 border border-neutral-200 dark:border-neutral-800 rounded-lg focus:outline-none dark:text-neutral-200"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[9px] text-neutral-400 uppercase tracking-wider font-semibold">Instagram URL</label>
                <input
                  type="text"
                  value={instagram}
                  onChange={(e) => setInstagram(e.target.value)}
                  placeholder="https://instagram.com/..."
                  className="w-full text-xs px-3.5 py-2 bg-neutral-50 dark:bg-zinc-900 border border-neutral-200 dark:border-neutral-800 rounded-lg focus:outline-none dark:text-neutral-200"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[9px] text-neutral-400 uppercase tracking-wider font-semibold">LinkedIn URL</label>
                <input
                  type="text"
                  value={linkedin}
                  onChange={(e) => setLinkedin(e.target.value)}
                  placeholder="https://linkedin.com/..."
                  className="w-full text-xs px-3.5 py-2 bg-neutral-50 dark:bg-zinc-900 border border-neutral-200 dark:border-neutral-800 rounded-lg focus:outline-none dark:text-neutral-200"
                />
              </div>
            </div>
          </div>

          {/* Third-Party Integrations */}
          <div className="p-6 bg-white dark:bg-zinc-950 border border-neutral-200/40 dark:border-neutral-850 rounded-2xl space-y-4">
            <h3 className="text-[10px] uppercase tracking-wider font-extrabold text-neutral-805 dark:text-neutral-250 border-b border-neutral-100 dark:border-neutral-900 pb-2">
              Third-Party Integrations
            </h3>
            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-[9px] text-neutral-400 uppercase tracking-wider font-semibold">Google Analytics Measurement ID</label>
                <input
                  type="text"
                  value={analyticsId}
                  onChange={(e) => setAnalyticsId(e.target.value)}
                  placeholder="e.g. G-XXXXXXX"
                  className="w-full text-xs px-3.5 py-2 bg-neutral-50 dark:bg-zinc-900 border border-neutral-200 dark:border-neutral-800 rounded-lg focus:outline-none dark:text-neutral-200"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[9px] text-neutral-400 uppercase tracking-wider font-semibold">Google AdSense Publisher ID</label>
                <input
                  type="text"
                  value={adsenseCode}
                  onChange={(e) => setAdsenseCode(e.target.value)}
                  placeholder="e.g. ca-pub-XXXXXXX"
                  className="w-full text-xs px-3.5 py-2 bg-neutral-50 dark:bg-zinc-900 border border-neutral-200 dark:border-neutral-800 rounded-lg focus:outline-none dark:text-neutral-200"
                />
              </div>
            </div>
          </div>
        </form>
      </div>
    </AdminLayout>
  );
}
