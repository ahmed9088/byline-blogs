"use client";

import React from "react";
import { usePathname } from "next/navigation";
import Navbar from "./Navbar";
import Footer from "./Footer";
import ScrollToTop from "./ScrollToTop";
import ReadingProgress from "./ReadingProgress";
import LiveNotifications from "./LiveNotifications";

interface ClientLayoutWrapperProps {
  children: React.ReactNode;
}

export default function ClientLayoutWrapper({ children }: ClientLayoutWrapperProps) {
  const pathname = usePathname();
  const isAdmin = pathname.startsWith("/admin");
  const isArticle = pathname.startsWith("/post/");

  if (isAdmin) {
    return <>{children}</>;
  }

  return (
    <>
      {/* Thin reading progress bar — only shown on article pages */}
      {isArticle && <ReadingProgress />}

      <Navbar />
      <main className="flex-grow max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 mt-[72px]">
        {children}
      </main>
      <Footer />

      {/* Global UI interactions */}
      <ScrollToTop />
      <LiveNotifications />
    </>
  );
}
