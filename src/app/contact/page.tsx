"use client";

import React, { useState } from "react";
import { Mail, MapPin, Phone } from "lucide-react";
import SEOHead from "../../components/SEOHead";
import Breadcrumbs from "../../components/Breadcrumbs";
import { useToast } from "../../context/ToastContext";

export default function ContactPage() {
  const [form, setForm] = useState({ name: "", email: "", subject: "", message: "" });
  const [submitting, setSubmitting] = useState(false);
  const { showToast } = useToast();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.subject || !form.message) {
      showToast("Please fill out all contact fields.", "warning");
      return;
    }
    setSubmitting(true);
    setTimeout(() => {
      showToast("Thank you. Your message has been sent.", "success");
      setForm({ name: "", email: "", subject: "", message: "" });
      setSubmitting(false);
    }, 800);
  };

  return (
    <div className="max-w-4xl mx-auto py-4 space-y-10 px-4">
      <SEOHead
        title="Contact Us"
        description="Get in touch with the team or send us your feedback."
      />

      <div className="flex flex-col gap-1">
        <Breadcrumbs items={[{ label: "Contact" }]} />
        <div className="text-center space-y-2 pt-4">
          <span className="text-[10px] uppercase font-bold text-editorial-accent dark:text-editorial-gold tracking-widest">
            Get in Touch
          </span>
          <h1 className="text-3xl sm:text-4xl font-extrabold font-serif leading-tight text-neutral-900 dark:text-neutral-50 tracking-tight">
            Contact Byline
          </h1>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pt-6 border-t border-neutral-150 dark:border-neutral-900">
        {/* Info Column */}
        <div className="space-y-6 md:col-span-1 border-r border-neutral-200/40 dark:border-neutral-850 pr-4">
          <p className="text-xs text-neutral-550 dark:text-neutral-400 leading-relaxed font-sans">
            Have feedback on an article or want to contribute? Contact us using the details below or fill out the form.
          </p>

          <div className="space-y-4 text-xs font-medium">
            <div className="flex items-center space-x-3 text-neutral-605 dark:text-neutral-350">
              <Mail className="w-4 h-4 text-editorial-accent" />
              <span>contact@bylines.dev</span>
            </div>
            <div className="flex items-center space-x-3 text-neutral-605 dark:text-neutral-350">
              <MapPin className="w-4 h-4 text-editorial-accent" />
              <span>London Office, WC1N 3AX, UK</span>
            </div>
            <div className="flex items-center space-x-3 text-neutral-605 dark:text-neutral-350">
              <Phone className="w-4 h-4 text-editorial-accent" />
              <span>+44 20 7946 0912</span>
            </div>
          </div>
        </div>

        {/* Contact Form Column */}
        <div className="md:col-span-2 space-y-4 bg-white dark:bg-zinc-950 p-6 border border-neutral-200/40 dark:border-neutral-850 rounded-2xl shadow-xs">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-[10px] text-neutral-400 uppercase tracking-wider font-semibold">Your Name</label>
                <input
                  type="text"
                  required
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="w-full text-xs px-3 py-2 bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-lg focus:outline-none dark:text-neutral-200"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] text-neutral-400 uppercase tracking-wider font-semibold">Email Address</label>
                <input
                  type="email"
                  required
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  className="w-full text-xs px-3 py-2 bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-lg focus:outline-none dark:text-neutral-200"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] text-neutral-400 uppercase tracking-wider font-semibold">Subject</label>
              <input
                type="text"
                required
                value={form.subject}
                onChange={(e) => setForm({ ...form, subject: e.target.value })}
                className="w-full text-xs px-3 py-2 bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-lg focus:outline-none dark:text-neutral-200"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] text-neutral-400 uppercase tracking-wider font-semibold">Message</label>
              <textarea
                required
                rows={5}
                value={form.message}
                onChange={(e) => setForm({ ...form, message: e.target.value })}
                placeholder="Write your message here..."
                className="w-full text-xs px-3 py-2 bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-lg focus:outline-none dark:text-neutral-200"
              />
            </div>

            <div className="text-right">
              <button
                type="submit"
                disabled={submitting}
                className="text-xs px-5 py-2.5 bg-neutral-900 dark:bg-neutral-100 text-white dark:text-black hover:bg-editorial-accent dark:hover:bg-editorial-gold font-semibold rounded-lg uppercase tracking-wider transition-colors disabled:opacity-50"
              >
                {submitting ? "Sending..." : "Send Message"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
