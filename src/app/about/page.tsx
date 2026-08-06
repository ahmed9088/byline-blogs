import React from "react";
import type { Metadata } from "next";
import SEOHead from "../../components/SEOHead";
import Breadcrumbs from "../../components/Breadcrumbs";

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.bylines.dev';

export const metadata: Metadata = {
  title: "About Us & Editorial Policies — Bylines.dev Journal",
  description: "Learn about the mission, editorial standards, corrections policy, and publishing ethics of Bylines.dev.",
  alternates: {
    canonical: `${BASE_URL}/about`,
  },
  openGraph: {
    title: "About Us & Editorial Policies — Bylines.dev Journal",
    description: "Learn about the mission, editorial standards, corrections policy, and publishing ethics of Bylines.dev.",
    url: `${BASE_URL}/about`,
    type: "website",
  },
};

export default function AboutPage() {
  return (
    <div className="max-w-4xl mx-auto py-4 space-y-8 px-4">
      <SEOHead
        title="About Us & Publication Policies"
        description="Learn about the mission, history, corrections policy, and editorial standards of Bylines.dev."
        url={`${BASE_URL}/about`}
      />

      <div className="flex flex-col gap-1">
        <Breadcrumbs items={[{ label: "About Us & Policies" }]} />
        <div className="text-center space-y-3 pt-4">
          <span className="text-[10px] uppercase font-bold text-editorial-accent dark:text-editorial-gold tracking-widest">
            Publication Policies & Editorial Governance
          </span>
          <h1 className="text-4xl md:text-5xl font-extrabold font-serif leading-tight text-neutral-900 dark:text-neutral-50 max-w-2xl mx-auto tracking-tight">
            About Bylines.dev
          </h1>
          <p className="text-xs text-neutral-550 dark:text-neutral-400 uppercase tracking-widest font-sans font-bold">
            Est. 2026 — Independent Editorial Publishing
          </p>
        </div>
      </div>

      <div className="prose dark:prose-invert font-sans text-xs leading-relaxed space-y-6 text-neutral-600 dark:text-neutral-400 max-w-3xl mx-auto pt-6 border-t border-neutral-150 dark:border-neutral-900">
        <p>
          Founded on the core values of independence and high-fidelity reporting, <strong>Bylines.dev</strong> serves as a premium publishing platform. We cover topics in modern engineering, systems architecture, AI research, technology ethics, design principles, and business, keeping our text focused on quality reading and intellectual depth.
        </p>

        <p className="border-l-2 border-editorial-accent pl-5 italic text-sm my-8 text-neutral-800 dark:text-neutral-350 font-serif leading-relaxed">
          “In a world filled with noise and automated content, we offer thoughtful, peer-reviewed stories and analytical reports. Every article published is edited and fact-checked to maintain high standards of accuracy.”
        </p>

        <h2 className="text-sm font-bold uppercase tracking-wider text-neutral-800 dark:text-neutral-200 mt-10 mb-4 border-b border-neutral-100 dark:border-neutral-900 pb-2 font-serif">
          Editorial Philosophy & Fact Verification
        </h2>
        <p>
          To maintain absolute trust with our audience, we hold our contributors to the highest professional standards of technical journalism:
        </p>
        <ul className="list-disc pl-5 space-y-2.5">
          <li>
            <strong>Fact Verification:</strong> All claims, statistics, code benchmarks, and research references must be sourced from primary documentation, academic journals, or verified experiments.
          </li>
          <li>
            <strong>Zero Plagiarism:</strong> Every paragraph must be original, human-written prose. We do not tolerate copying or uncredited content under any circumstance.
          </li>
          <li>
            <strong>Conflict Disclosure:</strong> Writers are required to declare any financial or personal interests related to their reporting targets prior to publication.
          </li>
        </ul>

        <h2 className="text-sm font-bold uppercase tracking-wider text-neutral-800 dark:text-neutral-200 mt-10 mb-4 border-b border-neutral-100 dark:border-neutral-900 pb-2 font-serif">
          Corrections & Feedback Policy
        </h2>
        <p>
          We are committed to swift transparency. If an error of fact or code specification is identified in any published piece:
        </p>
        <ul className="list-disc pl-5 space-y-2">
          <li>Factual corrections are issued promptly at the top or bottom of the article with explicit timestamping.</li>
          <li>Readers can submit correction requests directly via our <a href="/contact" className="underline font-bold text-neutral-800 dark:text-neutral-200">Contact Desk</a>.</li>
        </ul>

        <h2 className="text-sm font-bold uppercase tracking-wider text-neutral-800 dark:text-neutral-200 mt-10 mb-4 border-b border-neutral-100 dark:border-neutral-900 pb-2 font-serif">
          Legal & Governance Links
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
          <a
            href="/terms-and-conditions"
            className="p-4 border border-neutral-200 dark:border-neutral-800 rounded-xl block hover:border-editorial-accent transition-colors"
          >
            <h3 className="font-bold text-neutral-850 dark:text-neutral-100 text-xs">Terms of Service</h3>
            <p className="text-[10px] text-neutral-450 mt-1">Review content licensing, syndication rules, and comment board policies.</p>
          </a>
          <a
            href="/privacy-policy"
            className="p-4 border border-neutral-200 dark:border-neutral-800 rounded-xl block hover:border-editorial-accent transition-colors"
          >
            <h3 className="font-bold text-neutral-850 dark:text-neutral-100 text-xs">Privacy Policy</h3>
            <p className="text-[10px] text-neutral-450 mt-1">Information on data protection, analytics, and cookie policies.</p>
          </a>
        </div>
      </div>
    </div>
  );
}
