import React from "react";
import SEOHead from "../../components/SEOHead";
import Breadcrumbs from "../../components/Breadcrumbs";

export const metadata = {
  title: "Terms and Conditions — Byline",
  description: "Review the terms of service, content licensing, and comment rules of Byline.",
};

export default function TermsAndConditions() {
  return (
    <div className="max-w-3xl mx-auto py-4 space-y-8">
      <SEOHead
        title="Terms and Conditions"
        description="Review the terms of service, content licensing, and comment rules of Byline."
      />

      <div className="flex flex-col gap-1">
        <Breadcrumbs items={[{ label: "Terms and Conditions" }]} />
        <div className="text-center space-y-2 pt-4">
          <span className="text-[10px] uppercase font-bold text-neutral-450 tracking-widest block">
            Legal Terms
          </span>
          <h1 className="text-3xl sm:text-4xl font-bold font-serif leading-tight text-neutral-900 dark:text-neutral-50">
            Terms and Conditions
          </h1>
          <p className="text-[10px] text-neutral-450 dark:text-neutral-500">
            Last updated: July 12, 2026
          </p>
        </div>
      </div>

      <div className="prose dark:prose-invert font-sans text-sm leading-relaxed space-y-6 text-neutral-600 dark:text-neutral-400 pt-6 border-t border-neutral-150 dark:border-neutral-900">
        <p>
          Welcome to <strong>Byline</strong>. By accessing, browsing, or utilizing this publishing platform, you agree to comply with and be bound by the following terms of service.
        </p>

        <h2 className="text-base font-bold uppercase tracking-wider text-neutral-800 dark:text-neutral-200 mt-8 mb-3 font-serif border-b pb-1">
          1. Intellectual Property & Syndication
        </h2>
        <p>
          All articles, reviews, custom graphics, layouts, and branding are the property of Byline. You may share short snippets or quote paragraphs from our publications, provided that you link back to the original article page. Full reproduction of articles without prior written consent is strictly prohibited.
        </p>

        <h2 className="text-base font-bold uppercase tracking-wider text-neutral-800 dark:text-neutral-200 mt-8 mb-3 font-serif border-b pb-1">
          2. Comment Board Moderation
        </h2>
        <p>
          To maintain a constructive and respectful space for discussions, we moderate all comment submissions. We reserve the right to edit, decline to publish, or permanently remove comments that:
        </p>
        <ul className="list-disc pl-5 space-y-2">
          <li>Contain promotional links, spam materials, or irrelevant advertisements.</li>
          <li>Are abusive, hateful, or harass our writers or other community members.</li>
          <li>Infringe upon the intellectual property rights of third parties.</li>
        </ul>

        <h2 className="text-base font-bold uppercase tracking-wider text-neutral-800 dark:text-neutral-200 mt-8 mb-3 font-serif border-b pb-1">
          3. Disclaimer of Warranties
        </h2>
        <p>
          All information, articles, and reviews on this website are provided for general educational and reading purposes. While we strive to ensure factual accuracy, we provide all content on an "as-is" basis without warranties of any kind.
        </p>
      </div>
    </div>
  );
}
