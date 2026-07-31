"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../context/AuthContext';
import { settingsAPI } from '../../services/api';
import { ArrowLeft, KeyRound, Mail, Eye, EyeOff } from 'lucide-react';
import SEOHead from '../../components/SEOHead';
import BylinesLogo from '../../components/BylinesLogo';

export default function LoginPage() {
  const { login, user } = useAuth();
  const router = useRouter();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [siteName, setSiteName] = useState('Byline');
  const [redirectTo, setRedirectTo] = useState('');

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      setRedirectTo(params.get('redirect') || '');
    }
  }, []);

  useEffect(() => {
    if (user) {
      if (redirectTo) {
        router.push(redirectTo);
      } else if (['Super Admin', 'Admin', 'Author', 'Registered User'].includes(user.role)) {
        router.push('/admin');
      } else {
        router.push('/');
      }
    }

    const fetchSiteName = async () => {
      try {
        const res = await settingsAPI.getSettings();
        if (res.data.success && res.data.settings.siteName) {
          setSiteName(res.data.settings.siteName);
        }
      } catch (err: any) {
        console.error('Login settings fetch error:', err.message);
      }
    };
    fetchSiteName();
  }, [user, router, redirectTo]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const result = await login(email, password);
    setLoading(false);

    if (result.success) {
      if (redirectTo) {
        router.push(redirectTo);
      } else if (result.user && ['Super Admin', 'Admin', 'Author', 'Registered User'].includes(result.user.role)) {
        router.push('/admin');
      } else {
        router.push('/');
      }
    } else {
      setError(result.message || 'Login failed');
    }
  };

  return (
    <div className="min-h-[80vh] flex flex-col justify-center px-4">
      <SEOHead title="Sign In - Byline" />
      <div className="max-w-md w-full mx-auto space-y-6">
        <div>
          <Link
            href="/"
            className="inline-flex items-center text-[10px] uppercase font-bold text-neutral-450 hover:text-editorial-accent dark:hover:text-editorial-gold transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5 mr-1" /> Back to Home
          </Link>
        </div>

        <div className="bg-white dark:bg-zinc-950 p-8 border border-neutral-200/50 dark:border-neutral-850 rounded-2xl shadow-xs space-y-6">
          <div className="flex flex-col items-center justify-center space-y-3 text-center">
            <BylinesLogo size={40} showText={false} />
            <h2 className="font-sans text-lg font-bold tracking-wider uppercase text-neutral-900 dark:text-neutral-50">
              Sign In to Bylines.dev
            </h2>
            <p className="text-[10px] text-neutral-400 uppercase tracking-widest font-semibold">
              Enter credentials to sign in
            </p>
          </div>

          {error && (
            <div className="text-[11px] bg-red-50 dark:bg-red-950/20 text-red-500 border border-red-100/50 dark:border-red-900 p-2.5 rounded-lg">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1">
              <label className="text-[10px] text-neutral-400 uppercase tracking-wider font-semibold flex items-center">
                <Mail className="w-3 h-3 mr-1" /> Email Address
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full text-xs px-2.5 py-2 bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-lg focus:outline-none focus:border-editorial-accent/60 dark:text-neutral-200"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[10px] text-neutral-400 uppercase tracking-wider font-semibold flex items-center justify-between">
                <span className="flex items-center"><KeyRound className="w-3 h-3 mr-1" /> Password</span>
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full text-xs px-2.5 py-2 bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-lg focus:outline-none focus:border-editorial-accent/60 dark:text-neutral-200 pr-8"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-2.5 top-2.5 text-neutral-400 hover:text-neutral-500"
                >
                  {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full text-xs py-2 bg-neutral-900 dark:bg-neutral-100 text-white dark:text-black hover:bg-editorial-accent dark:hover:bg-editorial-gold transition-colors font-semibold rounded-lg uppercase tracking-widest disabled:opacity-50"
            >
              {loading ? 'Processing...' : 'Sign In'}
            </button>
          </form>

          <div className="text-center text-[10px] text-neutral-450 dark:text-neutral-500 border-t border-neutral-100 dark:border-neutral-900 pt-4">
            New to the platform?{' '}
            <Link href="/register" className="text-editorial-accent font-semibold hover:underline">
              Create an account
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
