"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { useTheme } from "@/context/ThemeContext";
import {
  LayoutDashboard,
  FileText,
  FolderKanban,
  Tag,
  MessageSquareCode,
  Image as ImageIcon,
  Users,
  Mail,
  Settings as SettingsIcon,
  Sun,
  Moon,
  LogOut,
  ArrowLeft,
  Menu,
  X,
  ShieldAlert,
} from "lucide-react";
import BylinesLogo from "./BylinesLogo";

interface AdminLayoutProps {
  children: React.ReactNode;
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  const { user, loading, logout } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const pathname = usePathname();
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    if (!loading && !user) {
      router.replace("/login");
    }
  }, [loading, user, router]);

  const navigation = [
    { name: "Dashboard", href: "/admin", icon: LayoutDashboard, roles: ["Super Admin", "Admin", "Author", "Registered User"] },
    { name: "Articles", href: "/admin/posts", icon: FileText, roles: ["Super Admin", "Admin", "Author", "Registered User"] },
    { name: "Categories", href: "/admin/categories", icon: FolderKanban, roles: ["Super Admin", "Admin"] },
    { name: "Tags", href: "/admin/tags", icon: Tag, roles: ["Super Admin", "Admin", "Author", "Registered User"] },
    { name: "Comments", href: "/admin/comments", icon: MessageSquareCode, roles: ["Super Admin", "Admin"] },
    { name: "Media Library", href: "/admin/media", icon: ImageIcon, roles: ["Super Admin", "Admin", "Author", "Registered User"] },
    { name: "Users", href: "/admin/users", icon: Users, roles: ["Super Admin", "Admin"] },
    { name: "Subscribers", href: "/admin/subscribers", icon: Mail, roles: ["Super Admin", "Admin"] },
    { name: "Dispatch News", href: "/admin/newsletter", icon: Mail, roles: ["Super Admin", "Admin"] },
    { name: "Audit Log", href: "/admin/audit-log", icon: ShieldAlert, roles: ["Super Admin"] },
    { name: "Site Settings", href: "/admin/settings", icon: SettingsIcon, roles: ["Super Admin", "Admin"] },
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-neutral-50 dark:bg-neutral-900/40 flex justify-center items-center py-20">
        <div className="animate-pulse font-serif text-sm tracking-widest text-neutral-405 dark:text-neutral-500 uppercase">
          Verifying Authority...
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  const userRole = user?.role || "User";
  const filteredNav = navigation.filter((item) => item.roles.includes(userRole));
  const currentItem = navigation.find((item) => item.href === pathname);
  
  // Check if current route is allowed for the user
  const isAllowed = currentItem ? currentItem.roles.includes(userRole) : true;

  const handleLogout = () => {
    logout();
    router.push("/login");
  };

  if (!isAllowed) {
    return (
      <div className="min-h-screen bg-neutral-50 dark:bg-neutral-900/40 flex flex-col justify-center items-center py-20 px-4 text-center">
        <ShieldAlert className="w-12 h-12 text-red-500 mb-4" />
        <h1 className="font-serif text-2xl font-bold text-neutral-900 dark:text-neutral-50 mb-2">Access Denied</h1>
        <p className="text-sm text-neutral-500 dark:text-neutral-400 max-w-md mb-6">
          Your account role ({userRole}) does not have permissions to access this administrative route.
        </p>
        <Link
          href="/admin"
          className="px-4 py-2 bg-neutral-900 text-white dark:bg-neutral-100 dark:text-black rounded-lg text-xs font-bold uppercase tracking-wider hover:bg-neutral-800 dark:hover:bg-neutral-200 transition-colors"
        >
          Return to Admin Dashboard
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-neutral-900/40 text-neutral-800 dark:text-neutral-250 flex transition-colors duration-200">
      {/* 1. Desktop Sidebar */}
      <aside className="hidden md:flex flex-col w-56 bg-white dark:bg-neutral-950 border-r border-neutral-200/80 dark:border-neutral-850 h-screen sticky top-0 flex-shrink-0 z-30">
        {/* Brand */}
        <div className="h-14 border-b border-neutral-100 dark:border-neutral-900 px-5 flex items-center justify-between">
          <Link href="/" className="select-none">
            <BylinesLogo size={24} />
          </Link>
        </div>

        {/* Navigation Links */}
        <nav className="flex-grow p-4 space-y-1 overflow-y-auto text-[10px] uppercase tracking-wider font-semibold">
          {filteredNav.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`flex items-center space-x-3 px-3 py-2 rounded-sm transition-all duration-200 ${
                  isActive
                    ? "bg-neutral-900 text-white dark:bg-neutral-100 dark:text-black shadow-xs"
                    : "text-neutral-500 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-900"
                }`}
              >
                <Icon className="w-4 h-4 flex-shrink-0" />
                <span>{item.name}</span>
              </Link>
            );
          })}
        </nav>

        {/* Footer Actions */}
        <div className="p-4 border-t border-neutral-100 dark:border-neutral-900 space-y-2 text-[10px] font-semibold uppercase tracking-wider">
          <Link
            href="/"
            className="flex items-center space-x-3 px-3 py-2 text-neutral-500 hover:bg-neutral-100 dark:hover:bg-neutral-900 rounded-sm"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>View Site</span>
          </Link>
          <button
            onClick={handleLogout}
            className="w-full flex items-center space-x-3 px-3 py-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 rounded-sm text-left"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* 2. Mobile Drawer Navigation */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/40 md:hidden"
          onClick={() => setMobileOpen(false)}
        >
          <aside
            className="w-56 bg-white dark:bg-neutral-950 border-r border-neutral-200/80 dark:border-neutral-850 h-full flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="h-14 px-5 flex items-center justify-between border-b border-neutral-100 dark:border-neutral-900">
              <span className="font-serif text-xs tracking-widest font-bold text-neutral-900 dark:text-neutral-50 uppercase">
                CMS PANEL
              </span>
              <button onClick={() => setMobileOpen(false)}>
                <X className="w-4 h-4 text-neutral-450" />
              </button>
            </div>
            <nav className="flex-grow p-4 space-y-1 text-[10px] uppercase tracking-wider font-semibold">
              {filteredNav.map((item) => {
                const isActive = pathname === item.href;
                const Icon = item.icon;
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    onClick={() => setMobileOpen(false)}
                    className={`flex items-center space-x-3 px-3 py-2 rounded-sm transition-all duration-250 ${
                      isActive
                        ? "bg-neutral-900 text-white dark:bg-neutral-100 dark:text-black"
                        : "text-neutral-500 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-900"
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{item.name}</span>
                  </Link>
                );
              })}
            </nav>
            <div className="p-4 border-t border-neutral-100 dark:border-neutral-900 space-y-2 text-[10px] font-semibold uppercase tracking-wider">
              <Link
                href="/"
                onClick={() => setMobileOpen(false)}
                className="flex items-center space-x-3 px-3 py-2 text-neutral-500"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>View Site</span>
              </Link>
              <button
                onClick={handleLogout}
                className="w-full flex items-center space-x-3 px-3 py-2 text-red-500 text-left"
              >
                <LogOut className="w-4 h-4" />
                <span>Sign Out</span>
              </button>
            </div>
          </aside>
        </div>
      )}

      {/* 3. Main Workspace Area */}
      <div className="flex-grow flex flex-col min-w-0">
        {/* Top Header */}
        <header className="h-14 border-b border-neutral-200/80 dark:border-neutral-850 bg-white dark:bg-neutral-950 px-4 sm:px-6 flex items-center justify-between sticky top-0 z-40 transition-colors duration-200">
          <div className="flex items-center space-x-3">
            <button
              onClick={() => setMobileOpen(true)}
              className="md:hidden p-1 text-neutral-500"
            >
              <Menu className="w-5 h-5" />
            </button>
            <h2 className="text-[10px] uppercase tracking-widest font-bold text-neutral-450 dark:text-neutral-500">
              CMS Dashboard / {currentItem?.name || "Editor"}
            </h2>
          </div>

          <div className="flex items-center space-x-4">
            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="p-1 rounded text-neutral-500 hover:bg-neutral-50 dark:hover:bg-neutral-900 transition-colors"
            >
              {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>

            {/* Profile Summary */}
            <div className="flex items-center space-x-2 text-xs">
              <div className="text-right hidden sm:block">
                <p className="font-semibold text-neutral-800 dark:text-neutral-200 leading-none">
                  {user?.name}
                </p>
                <span className="text-[9px] text-neutral-450 dark:text-neutral-500 font-medium uppercase tracking-wider">
                  {user?.role}
                </span>
              </div>
              <div className="w-7 h-7 rounded-full bg-neutral-200 dark:bg-neutral-800 overflow-hidden flex items-center justify-center border border-neutral-300 dark:border-neutral-700">
                {user?.profileImage ? (
                  <img
                    src={user.profileImage}
                    alt={user.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="font-bold text-[10px] text-neutral-550">
                    {(user?.name || "A")[0].toUpperCase()}
                  </span>
                )}
              </div>
            </div>
          </div>
        </header>

        {/* Inner Content Wrapper */}
        <main className="flex-grow p-4 sm:p-6 max-w-6xl w-full mx-auto space-y-6">
          {children}
        </main>
      </div>
    </div>
  );
}
