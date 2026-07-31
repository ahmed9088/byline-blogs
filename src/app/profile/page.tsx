"use client";

import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { newsletterAPI } from '../../services/api';
import Link from 'next/link';
import { 
  User, KeyRound, Bookmark, Check, ShieldCheck, 
  CreditCard, Loader2, Lock, X, Sparkles, AlertCircle, BarChart3, 
  Clock, Calendar, Palette 
} from 'lucide-react';

export default function ProfilePage() {
  const { user, updateProfile } = useAuth();
  const { preset, setPreset } = useTheme();
  
  const [name, setName] = useState(user?.name || '');
  const [bio, setBio] = useState(user?.bio || '');
  const [profileImage, setProfileImage] = useState(user?.profileImage || '');
  const [password, setPassword] = useState('');
  const [isPremium, setIsPremium] = useState(user?.isPremium || false);
  
  const [msg, setMsg] = useState({ type: '', text: '' });
  const [loading, setLoading] = useState(false);

  // Tabs state
  const [activeTab, setActiveTab] = useState('insights'); // 'profile' | 'billing' | 'bookmarks' | 'insights'

  // Reading analytics states
  const [readingHistory, setReadingHistory] = useState<any[]>([]);
  const [totalReadingTime, setTotalReadingTime] = useState(0);
  const [categoryInterest, setCategoryInterest] = useState<any[]>([]);
  const [streakCount, setStreakCount] = useState(0);
  const [activityGrid, setActivityGrid] = useState<Record<string, number>>({});

  // Checkout Modal / Form States
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [cardName, setCardName] = useState(user?.name || '');
  const [cardNumber, setCardNumber] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvv, setCardCvv] = useState('');
  const [checkoutProgress, setCheckoutProgress] = useState<'idle' | 'verifying' | 'charging' | 'success'>('idle');
  const [cardLast4, setCardLast4] = useState('4242');

  useEffect(() => {
    if (typeof window === 'undefined') return;

    setCardLast4(localStorage.getItem('card_last4') || '4242');

    try {
      const history = JSON.parse(localStorage.getItem('reading_history') || '[]');
      setReadingHistory(history);

      const totalTime = history.reduce((sum: number, item: any) => sum + (item.readingTime || 5), 0);
      setTotalReadingTime(totalTime);

      const categoriesCount: Record<string, number> = {};
      history.forEach((item: any) => {
        categoriesCount[item.category] = (categoriesCount[item.category] || 0) + 1;
      });

      const totalArticles = history.length || 1;
      const sortedCategories = Object.keys(categoriesCount).map(cat => ({
        category: cat,
        count: categoriesCount[cat],
        percent: Math.round((categoriesCount[cat] / totalArticles) * 100)
      })).sort((a, b) => b.count - a.count);
      setCategoryInterest(sortedCategories);

      const grid = JSON.parse(localStorage.getItem('reading_activity_grid') || '{}');
      setActivityGrid(grid);

      // Streak calculation
      let currentStreak = 0;
      let checkDate = new Date();
      while (true) {
        const key = checkDate.toISOString().split('T')[0];
        if (grid[key] && grid[key] > 0) {
          currentStreak++;
          checkDate.setDate(checkDate.getDate() - 1);
        } else {
          const todayKey = new Date().toISOString().split('T')[0];
          if (currentStreak === 0 && key === todayKey) {
            checkDate.setDate(checkDate.getDate() - 1);
            const yestKey = checkDate.toISOString().split('T')[0];
            if (grid[yestKey] && grid[yestKey] > 0) {
              currentStreak++;
              checkDate.setDate(checkDate.getDate() - 1);
              continue;
            }
          }
          break;
        }
      }
      setStreakCount(currentStreak);
    } catch (err) {
      console.error('Failed to parse analytics logs:', err);
    }
  }, []);

  const formatCardNumber = (value: string) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    const matches = v.match(/\d{4,16}/g);
    const match = (matches && matches[0]) || '';
    const parts = [];

    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4));
    }

    return parts.length > 0 ? parts.join(' ') : v;
  };

  const formatExpiry = (value: string) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    if (v.length >= 2) {
      return `${v.slice(0, 2)}/${v.slice(2, 4)}`;
    }
    return v;
  };

  const handleStartCheckout = () => {
    setCheckoutOpen(true);
    setCheckoutProgress('idle');
    setCardNumber('');
    setCardExpiry('');
    setCardCvv('');
  };

  const handleProcessCheckout = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!cardNumber || !cardExpiry || !cardCvv || !cardName) return;
    
    setCheckoutProgress('verifying');
    
    setTimeout(() => {
      setCheckoutProgress('charging');
      setTimeout(async () => {
        setCheckoutProgress('success');
        
        const payload = { name, bio, profileImage, isPremium: true };
        const result = await updateProfile(payload);
        if (result.success) {
          setIsPremium(true);
          const last4 = cardNumber.slice(-4);
          setCardLast4(last4);
          localStorage.setItem('card_last4', last4);
          setTimeout(() => {
            setCheckoutOpen(false);
            setCheckoutProgress('idle');
          }, 1500);
        } else {
          setCheckoutProgress('idle');
          setMsg({ type: 'error', text: result.message || 'Subscription upgrade failed.' });
        }
      }, 1200);
    }, 1000);
  };

  const handleCancelSubscription = async () => {
    if (window.confirm("Are you sure you want to cancel your Premium Editorial Access? You will lose unlimited reading privileges.")) {
      setLoading(true);
      const payload = { name, bio, profileImage, isPremium: false };
      const result = await updateProfile(payload);
      setLoading(false);
      if (result.success) {
        setIsPremium(false);
        setMsg({ type: 'success', text: 'Premium subscription cancelled successfully.' });
        setTimeout(() => setMsg({ type: '', text: '' }), 4000);
      } else {
        setMsg({ type: 'error', text: result.message || 'Cancellation failed.' });
      }
    }
  };

  const handleSetPreset = (presetName: string) => {
    setPreset(presetName);
    setMsg({ type: 'success', text: `Accent theme preset changed to ${presetName}.` });
    setTimeout(() => setMsg({ type: '', text: '' }), 4000);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMsg({ type: '', text: '' });
    setLoading(true);

    const payload: any = { name, bio, profileImage, isPremium };
    if (password) {
      payload.password = password;
    }

    const result = await updateProfile(payload);
    setLoading(false);

    if (result.success) {
      setMsg({ type: 'success', text: 'Profile updated successfully.' });
      setPassword('');
      setTimeout(() => setMsg({ type: '', text: '' }), 4000);
    } else {
      setMsg({ type: 'error', text: result.message || 'Failed to update profile.' });
    }
  };

  const renderActivityGrid = () => {
    const cells = [];
    const today = new Date();
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(today.getDate() - i);
      const key = d.toISOString().split('T')[0];
      const count = activityGrid[key] || 0;
      const dayName = d.toLocaleDateString(undefined, { weekday: 'narrow' });
      
      cells.push(
        <div key={key} className="flex flex-col items-center gap-1 flex-1">
          <span className="text-[8px] text-neutral-400 uppercase font-bold">{dayName}</span>
          <div 
            className={`w-full aspect-square rounded-sm border ${count > 0 ? 'bg-editorial-accent border-editorial-accent/30 dark:bg-editorial-gold dark:border-editorial-gold/30 shadow-xs' : 'bg-neutral-100 dark:bg-neutral-900 border-neutral-200/50 dark:border-neutral-850'}`}
            title={`${count} post(s) read on ${key}`}
          />
        </div>
      );
    }
    return cells;
  };

  return (
    <div className="max-w-4xl mx-auto py-2 space-y-8 pb-10">
      
      {/* Header and User Badge */}
      <div className="border-b border-zinc-200/40 dark:border-zinc-900 pb-5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-xl font-bold font-serif text-neutral-900 dark:text-neutral-50">Subscriber Portal</h1>
          <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">
            Manage credentials, active subscriptions, accent color presets, and reading stats.
          </p>
        </div>
        
        {isPremium && (
          <div className="flex items-center gap-1.5 px-3 py-1 bg-amber-50 dark:bg-amber-950/20 text-amber-600 dark:text-amber-400 border border-amber-200/45 dark:border-amber-900/40 rounded-full">
            <Sparkles className="w-3.5 h-3.5 animate-pulse" />
            <span className="text-[10px] uppercase font-extrabold tracking-wider">Premium Access</span>
          </div>
        )}
      </div>

      {msg.text && (
        <p className={`text-xs p-3 border rounded-lg ${msg.type === 'success' ? 'bg-green-50/50 text-green-600 border-green-200 dark:bg-green-950/10 dark:border-green-900/40' : 'bg-red-50/50 text-red-500 border-red-200 dark:bg-red-950/10 dark:border-red-900/40'} font-medium flex items-center`}>
          {msg.type === 'success' ? <Check className="w-3.5 h-3.5 mr-1.5" /> : <AlertCircle className="w-3.5 h-3.5 mr-1.5" />} 
          {msg.text}
        </p>
      )}

      {/* Tabs Navigation */}
      <div className="flex border-b border-zinc-200/40 dark:border-zinc-900 gap-1 overflow-x-auto pb-px">
        <button
          onClick={() => setActiveTab('insights')}
          className={`flex items-center gap-1.5 px-4 py-2 border-b-2 text-xs font-semibold uppercase tracking-wider transition-colors ${activeTab === 'insights' ? 'border-editorial-accent dark:border-editorial-gold text-neutral-850 dark:text-neutral-100' : 'border-transparent text-neutral-450 hover:text-neutral-600'}`}
        >
          <BarChart3 className="w-3.5 h-3.5" />
          <span>Reading Insights</span>
        </button>
        <button
          onClick={() => setActiveTab('profile')}
          className={`flex items-center gap-1.5 px-4 py-2 border-b-2 text-xs font-semibold uppercase tracking-wider transition-colors ${activeTab === 'profile' ? 'border-editorial-accent dark:border-editorial-gold text-neutral-850 dark:text-neutral-100' : 'border-transparent text-neutral-450 hover:text-neutral-600'}`}
        >
          <User className="w-3.5 h-3.5" />
          <span>Profile Settings</span>
        </button>
        <button
          onClick={() => setActiveTab('billing')}
          className={`flex items-center gap-1.5 px-4 py-2 border-b-2 text-xs font-semibold uppercase tracking-wider transition-colors ${activeTab === 'billing' ? 'border-editorial-accent dark:border-editorial-gold text-neutral-850 dark:text-neutral-100' : 'border-transparent text-neutral-450 hover:text-neutral-600'}`}
        >
          <CreditCard className="w-3.5 h-3.5" />
          <span>Billing & Plan</span>
        </button>
        <button
          onClick={() => setActiveTab('bookmarks')}
          className={`flex items-center gap-1.5 px-4 py-2 border-b-2 text-xs font-semibold uppercase tracking-wider transition-colors ${activeTab === 'bookmarks' ? 'border-editorial-accent dark:border-editorial-gold text-neutral-850 dark:text-neutral-100' : 'border-transparent text-neutral-450 hover:text-neutral-600'}`}
        >
          <Bookmark className="w-3.5 h-3.5" />
          <span>Saved Articles</span>
        </button>
      </div>

      {/* Tab Panels */}
      <div className="z-10 relative">
        
        {/* Panel 1: Reading Insights Dashboard */}
        {activeTab === 'insights' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Stats Card */}
            <div className="space-y-4 border border-zinc-200/50 dark:border-zinc-850 p-5 rounded-2xl bg-white dark:bg-zinc-950 flex flex-col justify-between shadow-sm">
              <div className="space-y-4">
                <h3 className="text-[10px] uppercase tracking-wider font-extrabold text-neutral-400">Streak & Time</h3>
                
                <div className="flex items-center gap-3">
                  <div className="text-3xl">🔥</div>
                  <div>
                    <div className="text-base font-bold text-neutral-850 dark:text-neutral-100 font-serif">
                      {streakCount} Day Streak
                    </div>
                    <span className="text-[9px] text-neutral-400 uppercase tracking-wide block font-sans">Reading consistency</span>
                  </div>
                </div>

                <div className="flex items-center gap-3 pt-2">
                  <div className="p-2 bg-indigo-50 dark:bg-indigo-950/20 text-indigo-500 rounded-xl">
                    <Clock className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-base font-bold text-neutral-850 dark:text-neutral-100 font-serif">
                      {totalReadingTime} Mins
                    </div>
                    <span className="text-[9px] text-neutral-400 uppercase tracking-wide block font-sans">Time spent reading</span>
                  </div>
                </div>
              </div>

              {/* Last 7 Days Activity */}
              <div className="pt-4 border-t border-neutral-100 dark:border-neutral-900 space-y-2">
                <span className="text-[9px] uppercase tracking-wider font-bold text-neutral-400 block">Weekly Grid</span>
                <div className="flex gap-2">
                  {renderActivityGrid()}
                </div>
              </div>
            </div>

            {/* Topic Preferences Chart */}
            <div className="border border-zinc-200/50 dark:border-zinc-850 p-5 rounded-2xl bg-white dark:bg-zinc-950 space-y-4 shadow-sm">
              <div className="flex items-center justify-between border-b border-neutral-100 dark:border-neutral-900 pb-2">
                <h3 className="text-[10px] uppercase tracking-wider font-extrabold text-neutral-400">Category Preferences</h3>
                <BarChart3 className="w-3.5 h-3.5 text-neutral-400" />
              </div>
              
              {categoryInterest.length === 0 ? (
                <p className="text-xs text-neutral-405 italic py-6 text-center">No reading logs saved yet. Start browsing articles.</p>
              ) : (
                <div className="space-y-4 pt-2">
                  {categoryInterest.map((c) => (
                    <div key={c.category} className="space-y-1">
                      <div className="flex justify-between text-[10px] uppercase font-bold text-neutral-600 dark:text-neutral-400">
                        <span>{c.category}</span>
                        <span>{c.percent}%</span>
                      </div>
                      <div className="w-full bg-neutral-100 dark:bg-neutral-900 h-1.5 rounded-full overflow-hidden">
                        <div 
                          className="bg-editorial-accent dark:bg-editorial-gold h-full rounded-full transition-all duration-500"
                          style={{ width: `${c.percent}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Reading Timeline */}
            <div className="border border-zinc-200/50 dark:border-zinc-850 p-5 rounded-2xl bg-white dark:bg-zinc-950 space-y-4 shadow-sm">
              <div className="flex items-center justify-between border-b border-neutral-100 dark:border-neutral-900 pb-2">
                <h3 className="text-[10px] uppercase tracking-wider font-extrabold text-neutral-400">Recent Reads</h3>
                <Calendar className="w-3.5 h-3.5 text-neutral-400" />
              </div>
              
              {readingHistory.length === 0 ? (
                <p className="text-xs text-neutral-405 italic py-6 text-center">No recent reading history log.</p>
              ) : (
                <div className="space-y-3 pt-1 max-h-[220px] overflow-y-auto pr-1">
                  {readingHistory.slice(0, 5).map((post: any, idx: number) => (
                    <div key={idx} className="flex gap-3 text-xs items-start group">
                      <span className="w-1.5 h-1.5 rounded-full bg-editorial-accent dark:bg-editorial-gold mt-1.5 flex-shrink-0" />
                      <div className="space-y-0.5">
                        <Link href={`/post/${post.slug}`} className="font-serif font-bold text-neutral-800 dark:text-neutral-205 hover:text-editorial-accent dark:hover:text-editorial-gold transition-colors line-clamp-1 leading-snug">
                          {post.title}
                        </Link>
                        <span className="text-[9px] text-neutral-400 block uppercase tracking-wider">{post.category} • {new Date(post.viewedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Panel 2: Profile Settings & Accent Presets */}
        {activeTab === 'profile' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-2 space-y-4 bg-white dark:bg-neutral-950 p-6 border border-zinc-200/50 dark:border-zinc-850 rounded-2xl shadow-sm">
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-1">
                  <label className="text-[10px] text-neutral-400 uppercase tracking-wider font-bold">Display Name</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full text-xs px-2.5 py-1.5 bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-lg focus:outline-none focus:border-editorial-accent/60 dark:text-neutral-200"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] text-neutral-400 uppercase tracking-wider font-bold">Profile Image URL</label>
                  <input
                    type="text"
                    value={profileImage}
                    onChange={(e) => setProfileImage(e.target.value)}
                    placeholder="https://example.com/image.jpg"
                    className="w-full text-xs px-2.5 py-1.5 bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-lg focus:outline-none focus:border-editorial-accent/60 dark:text-neutral-200"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] text-neutral-400 uppercase tracking-wider font-bold">Biography</label>
                  <textarea
                    rows={3}
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    placeholder="A brief background about your editorial work..."
                    className="w-full text-xs px-2.5 py-1.5 bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-lg focus:outline-none focus:border-editorial-accent/60 dark:text-neutral-200"
                  />
                </div>

                <div className="space-y-1 pt-2 border-t border-neutral-100 dark:border-neutral-900">
                  <label className="text-[10px] text-neutral-450 uppercase tracking-wider font-bold flex items-center">
                    <KeyRound className="w-3.5 h-3.5 mr-1 text-neutral-450" /> Change Password (Leave blank to keep current)
                  </label>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="New Password (min 6 chars)"
                    className="w-full text-xs px-2.5 py-1.5 bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-lg focus:outline-none focus:border-editorial-accent/60 dark:text-neutral-200"
                  />
                </div>

                <div className="text-right">
                  <button
                    type="submit"
                    disabled={loading}
                    className="text-xs px-4 py-1.5 bg-neutral-900 dark:bg-neutral-100 text-white dark:text-black hover:bg-editorial-accent dark:hover:bg-editorial-gold font-medium rounded-lg uppercase tracking-wider transition-colors disabled:opacity-50"
                  >
                    {loading ? 'Saving...' : 'Save Settings'}
                  </button>
                </div>
              </form>
            </div>

            {/* Presets Theme Accent Panel */}
            <div className="bg-white dark:bg-neutral-950 p-6 border border-zinc-200/50 dark:border-zinc-850 rounded-2xl shadow-sm space-y-4">
              <div className="flex items-center gap-1.5 border-b border-neutral-100 dark:border-neutral-900 pb-2">
                <Palette className="w-4 h-4 text-editorial-accent dark:text-editorial-gold" />
                <h3 className="text-[10px] uppercase tracking-wider font-extrabold text-neutral-455">Accent Preset</h3>
              </div>
              
              <p className="text-[10px] text-neutral-400 leading-relaxed font-sans">
                Personalize your workspace aesthetics. Selecting a preset updates the color system dynamically across the site.
              </p>

              <div className="space-y-3 pt-2">
                <button
                  onClick={() => handleSetPreset('default')}
                  className={`w-full flex items-center justify-between p-2.5 rounded-xl border text-left transition-colors ${preset === 'default' ? 'border-editorial-accent bg-indigo-50/10 dark:border-editorial-gold' : 'border-neutral-200/60 dark:border-neutral-850 hover:bg-neutral-50 dark:hover:bg-neutral-900'}`}
                >
                  <div className="flex items-center gap-2">
                    <span className="w-3.5 h-3.5 rounded-full bg-indigo-600 dark:bg-indigo-400" />
                    <span className="text-[11px] font-bold text-neutral-800 dark:text-neutral-200">Indigo Sensation</span>
                  </div>
                  {preset === 'default' && <Check className="w-3.5 h-3.5 text-editorial-accent dark:text-editorial-gold" />}
                </button>

                <button
                  onClick={() => handleSetPreset('billboard')}
                  className={`w-full flex items-center justify-between p-2.5 rounded-xl border text-left transition-colors ${preset === 'billboard' ? 'border-neutral-900 dark:border-neutral-100 bg-neutral-50 dark:bg-neutral-900' : 'border-neutral-200/60 dark:border-neutral-850 hover:bg-neutral-50 dark:hover:bg-neutral-900'}`}
                >
                  <div className="flex items-center gap-2">
                    <span className="w-3.5 h-3.5 rounded-full bg-black dark:bg-white" />
                    <span className="text-[11px] font-bold text-neutral-800 dark:text-neutral-200">Stark Monochromatic</span>
                  </div>
                  {preset === 'billboard' && <Check className="w-3.5 h-3.5 text-neutral-900 dark:text-neutral-100" />}
                </button>

                <button
                  onClick={() => handleSetPreset('insider')}
                  className={`w-full flex items-center justify-between p-2.5 rounded-xl border text-left transition-colors ${preset === 'insider' ? 'border-purple-500 bg-purple-50/10' : 'border-neutral-200/60 dark:border-neutral-850 hover:bg-neutral-50 dark:hover:bg-neutral-900'}`}
                >
                  <div className="flex items-center gap-2">
                    <span className="w-3.5 h-3.5 rounded-full bg-purple-600" />
                    <span className="text-[11px] font-bold text-neutral-800 dark:text-neutral-200">Tech Violet</span>
                  </div>
                  {preset === 'insider' && <Check className="w-3.5 h-3.5 text-purple-650" />}
                </button>

                <button
                  onClick={() => handleSetPreset('people')}
                  className={`w-full flex items-center justify-between p-2.5 rounded-xl border text-left transition-colors ${preset === 'people' ? 'border-cyan-500 bg-cyan-50/10' : 'border-neutral-200/60 dark:border-neutral-850 hover:bg-neutral-50 dark:hover:bg-neutral-900'}`}
                >
                  <div className="flex items-center gap-2">
                    <span className="w-3.5 h-3.5 rounded-full bg-cyan-500" />
                    <span className="text-[11px] font-bold text-neutral-800 dark:text-neutral-200">Vibrant Cyan</span>
                  </div>
                  {preset === 'people' && <Check className="w-3.5 h-3.5 text-cyan-600" />}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Panel 3: Billing & Subscription */}
        {activeTab === 'billing' && (
          <div className="max-w-2xl bg-white dark:bg-neutral-950 p-6 border border-zinc-200/50 dark:border-zinc-850 rounded-2xl shadow-sm">
            <div className="space-y-4">
              <div className="flex items-center gap-1.5 border-b border-neutral-100 dark:border-neutral-900 pb-2">
                <CreditCard className="w-4 h-4 text-editorial-accent dark:text-editorial-gold" />
                <h3 className="text-[10px] uppercase tracking-wider font-extrabold text-neutral-450">Subscription & Billing</h3>
              </div>

              {isPremium ? (
                <div className="bg-amber-50/30 dark:bg-amber-950/10 border border-amber-200/50 dark:border-amber-900/40 p-4 rounded-xl space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-amber-500 animate-pulse" />
                      <span className="text-xs font-bold text-neutral-850 dark:text-neutral-100">Premium Access</span>
                    </div>
                    <span className="text-[9px] uppercase tracking-wider font-extrabold px-2 py-0.5 bg-green-50 text-green-700 dark:bg-green-950/30 dark:text-green-400 border border-green-200/50 rounded-sm">Active</span>
                  </div>
                  <p className="text-[10px] text-neutral-500 dark:text-neutral-455 leading-relaxed font-sans font-light">
                    You have unlimited access to all premium articles and archives. 
                    Your subscription renews automatically every month.
                  </p>
                  <div className="flex items-center justify-between text-[9px] text-neutral-450 border-t border-neutral-100 dark:border-neutral-900/50 pt-2.5">
                    <span>Card ending in {cardLast4}</span>
                    <button
                      type="button"
                      onClick={handleCancelSubscription}
                      className="text-red-500 hover:underline font-bold uppercase tracking-wider text-[9px]"
                    >
                      Cancel Membership
                    </button>
                  </div>
                </div>
              ) : (
                <div className="border border-neutral-200 dark:border-neutral-800 rounded-xl overflow-hidden bg-neutral-50/50 dark:bg-neutral-900/20">
                  <div className="p-4 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-neutral-850 dark:text-neutral-200">Standard Tier (Free)</span>
                      <span className="text-[10px] font-bold text-neutral-500">Free Account</span>
                    </div>
                    <p className="text-[10px] text-neutral-500 dark:text-neutral-450 leading-relaxed font-sans">
                      Limited to 3 premium reads per month. Standard content access.
                    </p>
                  </div>
                  <div className="bg-neutral-100/50 dark:bg-neutral-900/40 p-4 border-t border-neutral-200/60 dark:border-neutral-800/80 flex items-center justify-between gap-4">
                    <div className="space-y-0.5">
                      <div className="text-xs font-serif font-bold text-neutral-900 dark:text-neutral-100">
                        $5.00 <span className="text-[9px] text-neutral-400 uppercase font-sans">/ month</span>
                      </div>
                      <span className="text-[9px] text-editorial-accent dark:text-editorial-gold font-semibold uppercase tracking-wider block">Unlock Premium Access</span>
                    </div>
                    <button
                      type="button"
                      onClick={handleStartCheckout}
                      className="text-xs px-4 py-1.5 bg-neutral-900 dark:bg-neutral-100 text-white dark:text-black hover:bg-editorial-accent dark:hover:bg-editorial-gold font-medium rounded-lg uppercase tracking-wider transition-colors"
                    >
                      Subscribe Now
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Interactive Checkout Modal */}
            {checkoutOpen && (
              <div className="fixed inset-0 bg-neutral-950/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
                <div className="bg-white dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-850 rounded-2xl w-full max-w-sm overflow-hidden shadow-2xl relative">
                  
                  {checkoutProgress === 'idle' && (
                    <button
                      type="button"
                      onClick={() => setCheckoutOpen(false)}
                      className="absolute right-3.5 top-3.5 text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-300 transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}

                  <div className="p-6 space-y-6">
                    <div className="text-center space-y-1 pb-4 border-b border-neutral-100 dark:border-neutral-900">
                      <span className="text-[9px] text-editorial-accent dark:text-editorial-gold uppercase tracking-widest font-extrabold flex items-center justify-center gap-1.5">
                        <Lock className="w-3 h-3" /> Secure Checkout
                      </span>
                      <h3 className="font-serif text-base font-bold text-neutral-850 dark:text-neutral-100">
                        BYLINE PREMIUM
                      </h3>
                      <p className="text-[10px] text-neutral-450 font-sans uppercase tracking-wider pt-0.5">
                        Plan: Premium Access • $5.00/mo
                      </p>
                    </div>

                    {checkoutProgress !== 'idle' ? (
                      <div className="py-8 text-center space-y-4">
                        {checkoutProgress === 'verifying' && (
                          <>
                            <Loader2 className="w-10 h-10 text-editorial-accent mx-auto animate-spin" />
                            <h4 className="text-xs font-semibold text-neutral-700 dark:text-neutral-350">Verifying Card Details...</h4>
                          </>
                        )}
                        {checkoutProgress === 'charging' && (
                          <>
                            <Loader2 className="w-10 h-10 text-editorial-accent mx-auto animate-spin" />
                            <h4 className="text-xs font-semibold text-neutral-700 dark:text-neutral-350">Processing Subscription...</h4>
                          </>
                        )}
                        {checkoutProgress === 'success' && (
                          <div className="space-y-3">
                            <ShieldCheck className="w-12 h-12 text-green-500 mx-auto" />
                            <h4 className="text-sm font-bold text-neutral-850 dark:text-neutral-100">Subscription Active!</h4>
                          </div>
                        )}
                      </div>
                    ) : (
                      <form onSubmit={handleProcessCheckout} className="space-y-4">
                        <div className="space-y-1">
                          <label className="text-[8px] uppercase tracking-wider font-semibold text-neutral-455 dark:text-neutral-400">Cardholder Name</label>
                          <input
                            type="text"
                            required
                            placeholder="John Doe"
                            value={cardName}
                            onChange={(e) => setCardName(e.target.value)}
                            className="w-full text-xs px-3 py-1.5 bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-850 rounded-lg focus:outline-none dark:text-neutral-200 font-sans"
                          />
                        </div>

                        <div className="space-y-1">
                          <label className="text-[8px] uppercase tracking-wider font-semibold text-neutral-455 dark:text-neutral-400">Card Number</label>
                          <div className="relative">
                            <input
                              type="text"
                              required
                              maxLength={19}
                              placeholder="4242 4242 4242 4242"
                              value={cardNumber}
                              onChange={(e) => setCardNumber(formatCardNumber(e.target.value))}
                              className="w-full text-xs px-3 py-1.5 pl-8 bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-850 rounded-lg focus:outline-none dark:text-neutral-200 font-mono tracking-wider"
                            />
                            <CreditCard className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-neutral-400" />
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                          <div className="space-y-1">
                            <label className="text-[8px] uppercase tracking-wider font-semibold text-neutral-455 dark:text-neutral-400">Expiry Date</label>
                            <input
                              type="text"
                              required
                              maxLength={5}
                              placeholder="MM/YY"
                              value={cardExpiry}
                              onChange={(e) => setCardExpiry(formatExpiry(e.target.value))}
                              className="w-full text-xs px-3 py-1.5 bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-850 rounded-lg focus:outline-none dark:text-neutral-200 font-mono text-center"
                            />
                          </div>

                          <div className="space-y-1">
                            <label className="text-[8px] uppercase tracking-wider font-semibold text-neutral-455 dark:text-neutral-400">CVV / CVC</label>
                            <input
                              type="password"
                              required
                              maxLength={4}
                              placeholder="•••"
                              value={cardCvv}
                              onChange={(e) => setCardCvv(e.target.value.replace(/[^0-9]/g, ''))}
                              className="w-full text-xs px-3 py-1.5 bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-850 rounded-lg focus:outline-none dark:text-neutral-200 font-mono text-center"
                            />
                          </div>
                        </div>

                        <button
                          type="submit"
                          className="w-full inline-flex justify-center items-center px-4 py-2 bg-neutral-900 hover:bg-editorial-accent dark:bg-neutral-100 dark:text-black dark:hover:bg-editorial-gold text-white text-xs font-semibold uppercase tracking-wider rounded-lg transition-colors mt-2"
                        >
                          Confirm & Pay $5.00
                        </button>
                      </form>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Panel 4: Bookmarks List */}
        {activeTab === 'bookmarks' && (
          <div className="space-y-4">
            <div className="flex items-center gap-1.5 border-b border-neutral-100 dark:border-neutral-900 pb-2">
              <Bookmark className="w-4 h-4 text-editorial-accent dark:text-editorial-gold" />
              <h3 className="text-[10px] uppercase tracking-wider font-extrabold text-neutral-455">Saved Articles</h3>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {!user?.bookmarks || user.bookmarks.length === 0 ? (
                <p className="text-xs text-neutral-400 italic py-6 col-span-2">No bookmarks saved yet.</p>
              ) : (
                user.bookmarks.map((post: any) => (
                  <div key={post._id} className="p-4 border border-zinc-200/50 dark:border-zinc-850 rounded-2xl bg-white dark:bg-zinc-950 space-y-2 group hover:-translate-y-0.5 transition-all duration-200">
                    <span className="text-[8px] uppercase tracking-wider text-editorial-accent dark:text-editorial-gold font-bold">
                      Saved Article
                    </span>
                    <Link href={`/post/${post.slug}`} className="block hover:underline">
                      <h4 className="text-xs font-bold leading-snug font-serif text-neutral-850 dark:text-neutral-200 group-hover:text-editorial-accent dark:group-hover:text-editorial-gold transition-colors">
                        {post.title}
                      </h4>
                    </Link>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
