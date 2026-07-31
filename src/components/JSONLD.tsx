"use client";

import React from 'react';

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || 
  (process.env.NEXT_PUBLIC_VERCEL_URL ? `https://${process.env.NEXT_PUBLIC_VERCEL_URL}` : 'https://bylines.dev');

// 1. Article / BlogPosting Schema.org JSON-LD
interface ArticleJSONLDProps {
  headline: string;
  description: string;
  url: string;
  image: string;
  datePublished: string;
  dateModified?: string;
  authorName: string;
  authorUrl?: string;
  publisherName?: string;
  publisherLogo?: string;
  section?: string;
  keywords?: string[];
}

export function ArticleJSONLD({
  headline,
  description,
  url,
  image,
  datePublished,
  dateModified,
  authorName,
  authorUrl,
  publisherName = "Bylines Dev Journal",
  publisherLogo = "https://bylines.dev/logo.png",
  section,
  keywords,
}: ArticleJSONLDProps) {
  const schema = {
    "@context": "https://schema.org",
    "@type": "NewsArticle",
    "mainEntityOfPage": {
      "@type": "WebPage",
      "@id": url,
    },
    "headline": headline,
    "description": description,
    "image": [image],
    "datePublished": datePublished,
    "dateModified": dateModified || datePublished,
    "author": {
      "@type": "Person",
      "name": authorName,
      "url": authorUrl || BASE_URL,
    },
    "publisher": {
      "@type": "Organization",
      "name": publisherName,
      "logo": {
        "@type": "ImageObject",
        "url": publisherLogo,
      },
    },
    "articleSection": section || "General",
    "keywords": keywords ? keywords.join(", ") : undefined,
    "inLanguage": "en-US",
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}

// 2. BreadcrumbList Schema.org JSON-LD
interface BreadcrumbItem {
  name: string;
  url: string;
}

export function BreadcrumbJSONLD({ items }: { items: BreadcrumbItem[] }) {
  const schema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": items.map((item, idx) => ({
      "@type": "ListItem",
      "position": idx + 1,
      "name": item.name,
      "item": item.url,
    })),
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}

// 3. WebSite & Sitelinks SearchBox Schema.org JSON-LD
export function WebSiteJSONLD() {
  const schema = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "name": "Bylines.dev",
    "alternateName": "Bylines Dev — Editorial Technical Publishing",
    "url": BASE_URL,
    "potentialAction": {
      "@type": "SearchAction",
      "target": {
        "@type": "EntryPoint",
        "urlTemplate": `${BASE_URL}/search?q={search_term_string}`,
      },
      "query-input": "required name=search_term_string",
    },
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}

// 4. CollectionPage / Category Schema.org JSON-LD
interface CollectionPageJSONLDProps {
  name: string;
  description: string;
  url: string;
}

export function CollectionPageJSONLD({ name, description, url }: CollectionPageJSONLDProps) {
  const schema = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    "name": name,
    "description": description,
    "url": url,
    "isPartOf": {
      "@type": "WebSite",
      "name": "Bylines.dev",
      "url": BASE_URL,
    },
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}
