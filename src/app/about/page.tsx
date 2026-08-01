import React from "react";
import type { Metadata } from "next";
import SEOHead from "../../components/SEOHead";
import Breadcrumbs from "../../components/Breadcrumbs";

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://bylines.dev';

export const metadata: Metadata = {
  title: "About Us — Bylines.dev Journal",
  description: "Learn about the mission, editorial standards, and truth & transparency guidelines of Bylines.dev.",
  alternates: {
    canonical: `${BASE_URL}/about`,
  },
  openGraph: {
    title: "About Us — Bylines.dev Journal",
    description: "Learn about the mission, editorial standards, and truth & transparency guidelines of Bylines.dev.",
    url: `${BASE_URL}/about`,
    type: "website",
  },
};

export default function AboutPage() {
  return (
    <div className="max-w-4xl mx-auto py-4 space-y-8 px-4">
      <SEOHead
        title="About Us"
        description="Learn about the mission, history, and standards of Bylines.dev."
        url={`${BASE_URL}/about`}
      />

      <div className="flex flex-col gap-1">
        <Breadcrumbs items={[{ label: "About Us" }]} />
        <div className="text-center space-y-3 pt-4">
          <span className="text-[10px] uppercase font-bold text-editorial-accent dark:text-editorial-gold tracking-widest">
            Who We Are
          </span>
          <h1 className="text-4xl md:text-5xl font-extrabold font-serif leading-tight text-neutral-900 dark:text-neutral-50 max-w-xl mx-auto tracking-tight">
            About Bylines.dev
          </h1>
          <p className="text-xs text-neutral-550 dark:text-neutral-400 uppercase tracking-widest font-sans font-bold">
            Est. 2026 — Independent Journalism
          </p>
        </div>
      </div>

      <div className="prose dark:prose-invert font-sans text-xs leading-relaxed space-y-6 text-neutral-600 dark:text-neutral-400 max-w-3xl mx-auto pt-6 border-t border-neutral-150 dark:border-neutral-900">
        <p>
          Founded on the core values of independence and high-fidelity reporting, <strong>Bylines.dev</strong> serves as a premium publishing platform. We cover topics in modern literature, science, design principles, technology, and business, keeping our text focused on quality reading and intellectual depth.
        </p>

        <p className="border-l-2 border-editorial-accent pl-5 italic text-sm my-8 text-neutral-800 dark:text-neutral-350 font-serif leading-relaxed">
          “In a world filled with noise and automated content, we strive to offer thoughtful stories and analytical pieces. Every article and analysis published is edited and fact-checked to maintain high standards of accuracy.”
        </p>

        <h2 className="text-sm font-bold uppercase tracking-wider text-neutral-800 dark:text-neutral-200 mt-10 mb-4 border-b border-neutral-100 dark:border-neutral-900 pb-2 font-serif">
          Our Editorial Philosophy
        </h2>
        <p>
          We believe that readers deserve clear presentation, clean typography, and a design that gets out of the way of the content. We reject artificial, over-spaced layout patterns in favor of clean margins, classic publication grids, and compact design elements.
        </p>

        <h2 className="text-sm font-bold uppercase tracking-wider text-neutral-800 dark:text-neutral-200 mt-10 mb-4 border-b border-neutral-100 dark:border-neutral-900 pb-2 font-serif">
          Truth & Transparency Guidelines
        </h2>
        <p>
          To maintain absolute trust with our audience, we hold our contributors to the highest professional standards of journalism:
        </p>
        <ul className="list-disc pl-5 space-y-2.5">
          <li>
            <strong>Fact Verification:</strong> All claims, statistics, and references must be sourced from reputable databases, journals, or first-hand interviews.
          </li>
          <li>
            <strong>Zero Plagiarism:</strong> Every paragraph must be original, human-written prose. We do not tolerate copying or spinning content under any circumstance.
          </li>
          <li>
            <strong>Conflict Disclosure:</strong> Writers are required to declare any financial or personal interests related to their reporting targets prior to publication.
          </li>
        </ul>
      </div>
    </div>
  );
}
