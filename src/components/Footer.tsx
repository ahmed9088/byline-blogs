"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { newsletterAPI } from '../services/api';
import { useToast } from '../context/ToastContext';
import { Mail, BookOpen, Send, Layers } from 'lucide-react';
import BylinesLogo from './BylinesLogo';

const Footer = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const { showToast } = useToast();

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setLoading(true);
    try {
      const res = await newsletterAPI.subscribe(email);
      if (res.data.success) {
        showToast('Successfully subscribed to weekly reports!', 'success');
        setEmail('');
      } else {
        showToast(res.data.message || 'Subscription failed.', 'error');
      }
    } catch (err: any) {
      showToast(err.response?.data?.message || 'Failed to subscribe.', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <footer className="border-t border-zinc-200/60 dark:border-zinc-900 bg-white/60 dark:bg-zinc-950/60 relative z-10 font-sans">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 md:gap-12">
          
          {/* Column 1: Logo, Description & Socials */}
          <div className="space-y-4">
            <Link href="/" className="select-none inline-block">
              <BylinesLogo size={28} />
            </Link>
            <p className="text-xs leading-relaxed text-neutral-500 dark:text-neutral-400 font-sans">
              An independent publishing platform for stories, essays, and ideas across 15 curated editorial categories.
            </p>
            <div className="flex space-x-3 text-neutral-400 dark:text-neutral-500">
              <a href="#" className="hover:text-editorial-accent transition-colors text-[10px] uppercase font-bold tracking-widest">Twitter</a>
              <span className="text-neutral-300 dark:text-neutral-800">•</span>
              <a href="#" className="hover:text-editorial-accent transition-colors text-[10px] uppercase font-bold tracking-widest">LinkedIn</a>
              <span className="text-neutral-300 dark:text-neutral-800">•</span>
              <a href="#" className="hover:text-editorial-accent transition-colors text-[10px] uppercase font-bold tracking-widest">RSS Feed</a>
            </div>
          </div>

          {/* Column 2: Sections */}
          <div className="space-y-3.5">
            <h4 className="text-[10px] uppercase tracking-widest font-extrabold text-neutral-400 dark:text-neutral-500">
              Publication Hubs
            </h4>
            <ul className="space-y-2 text-xs font-semibold text-neutral-600 dark:text-neutral-300">
              <li>
                <Link href="/category" className="hover:text-editorial-accent transition-colors flex items-center gap-1.5 text-editorial-accent dark:text-editorial-gold">
                  <Layers className="w-3.5 h-3.5" />
                  <span>All 15 Categories</span>
                </Link>
              </li>
              <li>
                <Link href="/category/systems-engineering" className="hover:text-editorial-accent transition-colors">Systems Engineering</Link>
              </li>
              <li>
                <Link href="/category/artificial-intelligence" className="hover:text-editorial-accent transition-colors">Artificial Intelligence</Link>
              </li>
              <li>
                <Link href="/category/modern-design" className="hover:text-editorial-accent transition-colors">Modern Design</Link>
              </li>
            </ul>
          </div>

          {/* Column 3: Resources */}
          <div className="space-y-3.5">
            <h4 className="text-[10px] uppercase tracking-widest font-extrabold text-neutral-400 dark:text-neutral-500">
              Resources
            </h4>
            <ul className="space-y-2 text-xs font-medium text-neutral-600 dark:text-neutral-400">
              <li>
                <Link href="/about" className="hover:text-editorial-accent transition-colors">About Journal</Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-editorial-accent transition-colors">Contact Editorial</Link>
              </li>
              <li>
                <Link href="/privacy-policy" className="hover:text-editorial-accent transition-colors">Privacy Policy</Link>
              </li>
              <li>
                <Link href="/terms-and-conditions" className="hover:text-editorial-accent transition-colors">Terms of Service</Link>
              </li>
            </ul>
          </div>

          {/* Column 4: Newsletter */}
          <div className="space-y-3.5">
            <h4 className="text-[10px] uppercase tracking-widest font-extrabold text-neutral-400 dark:text-neutral-500">
              Weekly Digest
            </h4>
            <p className="text-xs leading-relaxed text-neutral-500 dark:text-neutral-400 font-sans">
              Receive premium analyses and latest articles directly to your inbox.
            </p>
            <form onSubmit={handleSubscribe} className="relative mt-2">
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="email@example.com"
                className="w-full text-xs px-3 py-2.5 pr-10 bg-neutral-50 dark:bg-zinc-900 border border-neutral-200 dark:border-zinc-800 rounded-xl focus:outline-none focus:border-editorial-accent dark:text-neutral-200 font-sans shadow-xs"
              />
              <button
                type="submit"
                disabled={loading}
                className="absolute right-1.5 top-1.5 p-1.5 bg-neutral-900 dark:bg-white text-white dark:text-black hover:bg-editorial-accent dark:hover:bg-editorial-gold rounded-lg transition-colors disabled:opacity-50"
                aria-label="Subscribe"
              >
                <Send className="w-3.5 h-3.5" />
              </button>
            </form>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-neutral-150 dark:border-zinc-900 mt-12 pt-6 flex flex-col sm:flex-row justify-between items-center gap-4 text-[10px] uppercase tracking-wider text-neutral-500 font-semibold">
          <span>&copy; {new Date().getFullYear()} Byline. All rights reserved.</span>
          <div className="flex space-x-4">
            <Link href="/privacy-policy" className="hover:underline">Privacy</Link>
            <Link href="/terms-and-conditions" className="hover:underline">Terms</Link>
            <Link href="#" className="hover:underline">Cookies</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
