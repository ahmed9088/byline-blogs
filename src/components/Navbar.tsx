"use client";

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { categoriesAPI, settingsAPI } from '../services/api';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Sun, Moon, AlignLeft, User, LogOut, 
  LayoutDashboard, X, ChevronDown, 
  Sparkles, BookOpen, PenSquare, ArrowRight,
  Layers
} from 'lucide-react';
import SearchOverlay from './SearchOverlay';
import NotificationBell from './NotificationBell';
import BylinesLogo from './BylinesLogo';

const Navbar = () => {
  const { user, logout } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const [categories, setCategories] = useState<any[]>([]);
  const [siteName, setSiteName] = useState('Byline');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [mobileCategoriesOpen, setMobileCategoriesOpen] = useState(false);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const [categoriesMenuOpen, setCategoriesMenuOpen] = useState(false);
  
  const profileRef = useRef<HTMLDivElement>(null);
  const categoriesRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchNavbarData = async () => {
      try {
        const catRes = await categoriesAPI.getCategories();
        if (catRes.data.success) {
          setCategories(catRes.data.categories);
        }
        const settingsRes = await settingsAPI.getSettings();
        if (settingsRes.data.success && settingsRes.data.settings.siteName) {
          setSiteName(settingsRes.data.settings.siteName);
        }
      } catch (err: any) {
        console.error('Navbar data fetch error:', err.message);
      }
    };
    fetchNavbarData();
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setProfileMenuOpen(false);
        setCategoriesMenuOpen(false);
        setMobileMenuOpen(false);
      }
    };

    const handleClickOutside = (e: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
        setProfileMenuOpen(false);
      }
      if (categoriesRef.current && !categoriesRef.current.contains(e.target as Node)) {
        setCategoriesMenuOpen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <nav className="fixed top-0 left-0 right-0 w-full h-[72px] z-50 border-b border-zinc-200/60 dark:border-zinc-800/60 backdrop-blur-xl bg-white/80 dark:bg-zinc-950/80 shadow-[0_2px_15px_rgba(0,0,0,0.02)] transition-all duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full">
        <div className="flex justify-between items-center h-full">
          
          {/* Brand Logo - Vector Monogram & Typography */}
          <div className="flex items-center">
            <Link href="/" className="select-none">
              <BylinesLogo size={32} />
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-6 text-xs uppercase tracking-wider font-semibold text-neutral-600 dark:text-neutral-400">
            <Link href="/" className="hover:text-editorial-accent dark:hover:text-editorial-gold transition-colors">Home</Link>
            <Link href="/posts" className="hover:text-editorial-accent dark:hover:text-editorial-gold transition-colors">Latest</Link>
            {user && (
              <Link href="/feed" className="hover:text-editorial-accent dark:hover:text-editorial-gold transition-colors">Feed</Link>
            )}
            
            {/* Mega Menu Dropdown for Categories */}
            <div className="relative" ref={categoriesRef}>
              <button
                onClick={() => setCategoriesMenuOpen(!categoriesMenuOpen)}
                className="flex items-center space-x-1 hover:text-editorial-accent dark:hover:text-editorial-gold transition-colors focus:outline-none uppercase"
              >
                <span>Categories ({categories.length || 15})</span>
                <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-250 ${categoriesMenuOpen ? 'rotate-180' : ''}`} />
              </button>

              <AnimatePresence>
                {categoriesMenuOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.96 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.96 }}
                    transition={{ duration: 0.15 }}
                    className="absolute left-1/2 -translate-x-1/2 mt-3 w-[720px] max-h-[80vh] overflow-y-auto bg-white dark:bg-zinc-950 border border-zinc-200/80 dark:border-zinc-800 rounded-2xl shadow-2xl p-6 text-left normal-case z-50"
                  >
                    <div className="border-b border-neutral-100 dark:border-neutral-900 pb-3 mb-4 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Layers className="w-4 h-4 text-editorial-accent" />
                        <span className="font-sans text-xs tracking-wider uppercase text-neutral-900 dark:text-neutral-100 font-bold">
                          Explore All Publication Sections ({categories.length})
                        </span>
                      </div>
                      <Link 
                        href="/category" 
                        onClick={() => setCategoriesMenuOpen(false)}
                        className="text-xs font-semibold text-editorial-accent dark:text-editorial-gold hover:underline flex items-center gap-1"
                      >
                        <span>View All Hub</span>
                        <ArrowRight className="w-3 h-3" />
                      </Link>
                    </div>

                    <div className="grid grid-cols-3 gap-3">
                      {categories.length > 0 ? (
                        categories.map((cat) => (
                          <Link
                            key={cat._id}
                            href={`/category/${cat.slug}`}
                            onClick={() => setCategoriesMenuOpen(false)}
                            className="group flex flex-col p-2.5 rounded-xl hover:bg-neutral-50 dark:hover:bg-zinc-900 transition-colors border border-transparent hover:border-neutral-200/60 dark:hover:border-zinc-800"
                          >
                            <span className="font-sans text-xs font-bold text-neutral-900 dark:text-neutral-100 group-hover:text-editorial-accent dark:group-hover:text-editorial-gold transition-colors flex items-center gap-1.5">
                              <span className="w-1.5 h-1.5 rounded-full bg-editorial-accent dark:bg-editorial-gold group-hover:scale-125 transition-transform" />
                              {cat.name}
                            </span>
                            <span className="font-sans text-[10px] text-neutral-500 dark:text-neutral-400 mt-1 line-clamp-1 leading-normal">
                              {cat.description || `Browse articles in ${cat.name}.`}
                            </span>
                          </Link>
                        ))
                      ) : (
                        <span className="col-span-3 text-neutral-400 text-xs italic">Loading categories...</span>
                      )}
                    </div>

                    <div className="mt-4 pt-3 border-t border-neutral-100 dark:border-neutral-900 flex justify-between items-center text-xs">
                      <span className="text-neutral-400">Curated editorial streams updated daily</span>
                      <Link
                        href="/category"
                        onClick={() => setCategoriesMenuOpen(false)}
                        className="px-3.5 py-1.5 rounded-xl bg-editorial-accent text-white font-semibold hover:bg-editorial-accent/90 transition-colors flex items-center gap-1 shadow-sm"
                      >
                        <span>Explore Directory</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </Link>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <Link href="/about" className="hover:text-editorial-accent dark:hover:text-editorial-gold transition-colors">About</Link>
            <Link href="/contact" className="hover:text-editorial-accent dark:hover:text-editorial-gold transition-colors">Contact</Link>
            <Link 
              href={user ? "/admin/posts/new" : "/login?redirect=/admin/posts/new"} 
              className="flex items-center gap-1 hover:text-editorial-accent dark:hover:text-editorial-gold transition-colors text-editorial-accent dark:text-editorial-gold font-bold"
            >
              <PenSquare className="w-3.5 h-3.5" />
              <span>Write</span>
            </Link>
          </div>

          {/* Right Action Items */}
          <div className="hidden md:flex items-center space-x-4">
            <SearchOverlay />
            <NotificationBell />

            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-full hover:bg-neutral-100 dark:hover:bg-zinc-800 text-neutral-600 dark:text-neutral-350 transition-colors"
              title="Toggle theme"
            >
              {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>

            {/* Profile Dropdown */}
            {user ? (
              <div className="relative" ref={profileRef}>
                <button
                  onClick={() => setProfileMenuOpen(!profileMenuOpen)}
                  className="flex items-center space-x-2 focus:outline-none"
                >
                  <img
                    src={user.profileImage || 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=facearea&facepad=2&w=256&h=256&q=80'}
                    alt={user.name}
                    className="w-8 h-8 rounded-full object-cover border border-neutral-300 dark:border-neutral-700"
                  />
                </button>

                <AnimatePresence>
                  {profileMenuOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.95 }}
                      className="absolute right-0 mt-3 w-56 bg-white dark:bg-zinc-950 border border-neutral-200 dark:border-neutral-800 rounded-2xl shadow-xl py-2 text-xs normal-case z-50"
                    >
                      <div className="px-4 py-2 border-b border-neutral-100 dark:border-neutral-800">
                        <p className="font-bold text-neutral-900 dark:text-neutral-100 truncate">{user.name}</p>
                        <p className="text-neutral-450 text-[10px] truncate">{user.email}</p>
                      </div>
                      {['Super Admin', 'Admin', 'Author'].includes(user.role) && (
                        <Link
                          href="/admin"
                          onClick={() => setProfileMenuOpen(false)}
                          className="flex items-center space-x-2 px-4 py-2 hover:bg-neutral-50 dark:hover:bg-neutral-900 text-editorial-accent dark:text-editorial-gold font-medium"
                        >
                          <LayoutDashboard className="w-3.5 h-3.5" />
                          <span>CMS Dashboard</span>
                        </Link>
                      )}
                      <Link
                        href="/profile"
                        onClick={() => setProfileMenuOpen(false)}
                        className="flex items-center space-x-2 px-4 py-2 hover:bg-neutral-50 dark:hover:bg-neutral-900"
                      >
                        <User className="w-3.5 h-3.5 text-neutral-450" />
                        <span>Subscriber Portal</span>
                      </Link>
                      <button
                        onClick={() => {
                          logout();
                          setProfileMenuOpen(false);
                        }}
                        className="w-full text-left flex items-center space-x-2 px-4 py-2 hover:bg-neutral-50 dark:hover:bg-neutral-900 text-red-500 font-medium"
                      >
                        <LogOut className="w-3.5 h-3.5 text-red-550" />
                        <span>Log Out</span>
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <Link
                href="/login"
                className="text-xs uppercase tracking-wider font-semibold px-4 py-1.5 border border-neutral-900 dark:border-neutral-50 hover:bg-neutral-900 hover:text-white dark:hover:bg-white dark:hover:text-black transition-colors rounded-lg"
              >
                Log In
              </Link>
            )}
          </div>

          {/* Mobile hamburger menu button */}
          <div className="flex md:hidden items-center space-x-3">
            <button
              onClick={toggleTheme}
              className="p-2 rounded-full text-neutral-500 dark:text-neutral-450"
            >
              {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-neutral-600 dark:text-neutral-350"
              aria-label="Toggle Navigation Menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <AlignLeft className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Menu - 100% Fully Responsive */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-neutral-200 dark:border-zinc-800 bg-white/95 dark:bg-zinc-950/95 backdrop-blur-xl px-4 py-4 space-y-4 max-h-[85vh] overflow-y-auto font-sans">
          <div className="w-full">
            <SearchOverlay />
          </div>

          <div className="flex flex-col space-y-2 text-xs uppercase tracking-wider font-semibold text-neutral-700 dark:text-neutral-300">
            <Link href="/" onClick={() => setMobileMenuOpen(false)} className="py-2 px-2 rounded-lg hover:bg-neutral-100 dark:hover:bg-zinc-900">Home</Link>
            <Link href="/posts" onClick={() => setMobileMenuOpen(false)} className="py-2 px-2 rounded-lg hover:bg-neutral-100 dark:hover:bg-zinc-900">Latest Articles</Link>
            
            {/* Mobile Expandable Categories */}
            <div>
              <button
                onClick={() => setMobileCategoriesOpen(!mobileCategoriesOpen)}
                className="w-full flex items-center justify-between py-2 px-2 rounded-lg hover:bg-neutral-100 dark:hover:bg-zinc-900 text-editorial-accent dark:text-editorial-gold font-bold"
              >
                <span>Categories ({categories.length || 15})</span>
                <ChevronDown className={`w-4 h-4 transition-transform ${mobileCategoriesOpen ? 'rotate-180' : ''}`} />
              </button>

              {mobileCategoriesOpen && (
                <div className="ml-3 mt-1 pl-3 border-l-2 border-neutral-200 dark:border-zinc-800 grid grid-cols-2 gap-1 text-[11px] normal-case">
                  <Link
                    href="/category"
                    onClick={() => setMobileMenuOpen(false)}
                    className="col-span-2 py-1.5 font-bold text-editorial-accent dark:text-editorial-gold uppercase tracking-wider text-[9px]"
                  >
                    → Explore All Category Hub
                  </Link>
                  {categories.map((cat) => (
                    <Link
                      key={cat._id}
                      href={`/category/${cat.slug}`}
                      onClick={() => setMobileMenuOpen(false)}
                      className="py-1.5 px-2 rounded hover:bg-neutral-100 dark:hover:bg-zinc-900 text-neutral-800 dark:text-neutral-200 truncate"
                    >
                      {cat.name}
                    </Link>
                  ))}
                </div>
              )}
            </div>

            {user && (
              <Link href="/feed" onClick={() => setMobileMenuOpen(false)} className="py-2 px-2 rounded-lg hover:bg-neutral-100 dark:hover:bg-zinc-900">Your Feed</Link>
            )}
            <Link href="/about" onClick={() => setMobileMenuOpen(false)} className="py-2 px-2 rounded-lg hover:bg-neutral-100 dark:hover:bg-zinc-900">About Us</Link>
            <Link href="/contact" onClick={() => setMobileMenuOpen(false)} className="py-2 px-2 rounded-lg hover:bg-neutral-100 dark:hover:bg-zinc-900">Contact</Link>
            <Link 
              href={user ? "/admin/posts/new" : "/login?redirect=/admin/posts/new"} 
              onClick={() => setMobileMenuOpen(false)} 
              className="py-2 px-2 rounded-lg flex items-center gap-1.5 text-editorial-accent dark:text-editorial-gold font-bold"
            >
              <PenSquare className="w-3.5 h-3.5" />
              <span>Write Article</span>
            </Link>
            
            <hr className="border-neutral-200 dark:border-zinc-800 my-1" />
            
            {user ? (
              <>
                {['Super Admin', 'Admin', 'Author'].includes(user.role) && (
                  <Link href="/admin" onClick={() => setMobileMenuOpen(false)} className="py-2 px-2 rounded-lg flex items-center space-x-2 text-editorial-accent font-bold">
                    <LayoutDashboard className="w-3.5 h-3.5" />
                    <span>CMS Dashboard</span>
                  </Link>
                )}
                <Link href="/profile" onClick={() => setMobileMenuOpen(false)} className="py-2 px-2 rounded-lg">Portal Settings</Link>
                <button
                  onClick={() => {
                    logout();
                    setMobileMenuOpen(false);
                  }}
                  className="text-left py-2 px-2 rounded-lg text-red-500 font-semibold"
                >
                  Log Out
                </button>
              </>
            ) : (
              <Link
                href="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="py-2.5 text-center bg-neutral-900 text-white dark:bg-white dark:text-black uppercase tracking-widest text-xs inline-block rounded-xl font-bold shadow-sm"
              >
                Log In
              </Link>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
