import React from "react";
import SEOHead from "../../components/SEOHead";
import Breadcrumbs from "../../components/Breadcrumbs";

export const metadata = {
  title: "Privacy Policy — Byline",
  description: "Review our policies regarding data logging, user privacy, and cookie usage.",
};

export default function PrivacyPolicy() {
  return (
    <div className="max-w-3xl mx-auto py-4 space-y-8">
      <SEOHead
        title="Privacy Policy"
        description="Review our policies regarding data logging, user privacy, and cookie usage."
      />

      <div className="flex flex-col gap-1">
        <Breadcrumbs items={[{ label: "Privacy Policy" }]} />
        <div className="text-center space-y-2 pt-4">
          <span className="text-[10px] uppercase font-bold text-neutral-450 tracking-widest block">
            Legal Terms
          </span>
          <h1 className="text-3xl sm:text-4xl font-bold font-serif leading-tight text-neutral-900 dark:text-neutral-50">
            Privacy Policy
          </h1>
          <p className="text-[10px] text-neutral-450 dark:text-neutral-500">
            Last updated: July 12, 2026
          </p>
        </div>
      </div>

      <div className="prose dark:prose-invert font-sans text-sm leading-relaxed space-y-6 text-neutral-600 dark:text-neutral-400 pt-6 border-t border-neutral-150 dark:border-neutral-900">
        <p>
          At <strong>Byline</strong>, we respect your privacy and are committed to protecting your personal data. This privacy policy outlines the types of information we collect, how we store and process it, and your rights under applicable data protection laws.
        </p>

        <h2 className="text-base font-bold uppercase tracking-wider text-neutral-800 dark:text-neutral-200 mt-8 mb-3 font-serif border-b pb-1">
          1. Data We Collect
        </h2>
        <p>
          We collect and process personal data only when necessary to deliver our services:
        </p>
        <ul className="list-disc pl-5 space-y-2">
          <li>
            <strong>Account Information:</strong> If you register a profile, we store your name, email address, password hashes, and optional profile settings securely.
          </li>
          <li>
            <strong>Newsletter Data:</strong> If you join our weekly subscription, we collect your email address for newsletter delivery.
          </li>
          <li>
            <strong>Discussion board data:</strong> Comment submissions (including names and email addresses) are stored securely on our servers to build discussion threads.
          </li>
        </ul>

        <h2 className="text-base font-bold uppercase tracking-wider text-neutral-800 dark:text-neutral-200 mt-8 mb-3 font-serif border-b pb-1">
          2. Analytics & Traffic Metrics
        </h2>
        <p>
          To monitor site performance and popular sections, we log anonymous page views. This includes request paths, device category tags (Desktop/Mobile), and referrer URLs. IP addresses are anonymized during processing. No individual user tracking is conducted.
        </p>

        <h2 className="text-base font-bold uppercase tracking-wider text-neutral-800 dark:text-neutral-200 mt-8 mb-3 font-serif border-b pb-1">
          3. Cookies & Local Session States
        </h2>
        <p>
          We use local storage and basic cookies solely to maintain your authentication state and persist your dark mode and design preset configurations. We do not use third-party tracking cookies or share metrics with advertising networks.
        </p>
      </div>
    </div>
  );
}
