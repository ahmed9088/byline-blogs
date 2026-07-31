"use client";

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { newsletterAPI } from '../../services/api';
import { Mail, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
import SEOHead from '../../components/SEOHead';

function UnsubscribeContent() {
  const searchParams = useSearchParams();
  const emailParam = searchParams.get('email') || '';
  
  const [email, setEmail] = useState(emailParam);
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (emailParam) {
      setEmail(emailParam);
    }
  }, [emailParam]);

  const handleUnsubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;

    setStatus('loading');
    setMessage('');

    try {
      const res = await newsletterAPI.unsubscribe(email.trim());
      if (res.data.success) {
        setStatus('success');
        setMessage(res.data.message || 'You have successfully unsubscribed.');
      } else {
        setStatus('error');
        setMessage(res.data.message || 'Failed to process unsubscribe request.');
      }
    } catch (err: any) {
      setStatus('error');
      setMessage(err.response?.data?.message || 'An error occurred while unsubscribing.');
    }
  };

  return (
    <div className="max-w-md mx-auto py-12 px-4">
      <SEOHead 
        title="Unsubscribe" 
        description="Unsubscribe from our newsletter and updates."
      />

      <div className="bg-white dark:bg-zinc-950 border border-zinc-200/50 dark:border-zinc-850 p-8 rounded-3xl shadow-xl text-center space-y-6">
        {/* Header Branding */}
        <div className="border-b border-neutral-100 dark:border-neutral-900 pb-4">
          <Link href="/" className="font-serif text-sm tracking-widest font-extrabold text-neutral-900 dark:text-neutral-50 uppercase">
            Byline
          </Link>
        </div>

        {status === 'success' ? (
          <div className="space-y-4 py-4">
            <CheckCircle2 className="w-12 h-12 text-green-500 mx-auto" />
            <p className="text-xs text-neutral-555 dark:text-neutral-400 leading-relaxed font-sans max-w-xs mx-auto">
              {message} You will no longer receive our newsletter updates.
            </p>
            <div className="pt-4">
              <Link
                href="/"
                className="inline-flex justify-center items-center px-5 py-2 bg-neutral-900 dark:bg-neutral-100 hover:bg-editorial-accent dark:hover:bg-editorial-gold text-white dark:text-black text-xs font-semibold uppercase tracking-wider rounded-lg transition-colors"
              >
                Return Home
              </Link>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="w-12 h-12 rounded-full bg-neutral-50 dark:bg-neutral-900/50 flex items-center justify-center mx-auto border border-neutral-200/50 dark:border-neutral-800">
              <Mail className="w-5 h-5 text-neutral-455 dark:text-neutral-550" />
            </div>
            
            <div className="space-y-1">
              <h2 className="font-serif text-base font-bold text-neutral-850 dark:text-neutral-100">
                Cancel Subscription
              </h2>
              <p className="text-xs text-neutral-555 dark:text-neutral-400 leading-relaxed font-sans max-w-xs mx-auto">
                Enter your email address below to unsubscribe from our updates.
              </p>
            </div>

            {status === 'error' && (
              <div className="text-left text-[11px] bg-red-50 dark:bg-red-950/20 text-red-600 dark:text-red-450 border border-red-200 dark:border-red-900 p-2.5 rounded-lg flex items-start gap-1.5">
                <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                <span>{message}</span>
              </div>
            )}

            <form onSubmit={handleUnsubscribe} className="space-y-4 pt-2">
              <div className="text-left space-y-1">
                <label className="text-[9px] uppercase tracking-wider font-semibold text-neutral-400">Email Address</label>
                <input
                  type="email"
                  required
                  disabled={status === 'loading'}
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full text-xs px-3 py-2 bg-neutral-50 dark:bg-neutral-900 border border-neutral-250 dark:border-neutral-800 rounded-lg focus:outline-none focus:border-editorial-accent disabled:opacity-50 dark:text-neutral-200"
                />
              </div>

              <button
                type="submit"
                disabled={status === 'loading' || !email}
                className="w-full inline-flex justify-center items-center px-4 py-2 bg-neutral-900 hover:bg-red-600 hover:text-white dark:bg-neutral-100 dark:text-black dark:hover:bg-red-600 dark:hover:text-white text-white text-xs font-semibold uppercase tracking-wider rounded-lg transition-colors disabled:opacity-50"
              >
                {status === 'loading' ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" />
                    <span>Processing...</span>
                  </>
                ) : (
                  <span>Unsubscribe Now</span>
                )}
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}

export default function Unsubscribe() {
  return (
    <Suspense fallback={
      <div className="py-20 text-center text-xs text-neutral-450">
        Loading preferences...
      </div>
    }>
      <UnsubscribeContent />
    </Suspense>
  );
}
