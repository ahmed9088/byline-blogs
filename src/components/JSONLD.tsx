"use client";

import React from 'react';

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.bylines.dev';

// 1. Organization Schema.org JSON-LD
export function OrganizationJSONLD() {
  const schema = {
    "@context": "https://schema.org",
    "@type": "NewsMediaOrganization",
    "name": "Bylines.dev",
    "alternateName": "Bylines.dev Journal",
    "url": BASE_URL,
    "logo": {
      "@type": "ImageObject",
      "url": `${BASE_URL}/icon.svg`,
      "width": 512,
      "height": 512
    },
    "sameAs": [
      "https://twitter.com/bylines_dev",
      "https://github.com/bylines-dev"
    ],
    "publishingPrinciples": `${BASE_URL}/about`,
    "diversityPolicy": `${BASE_URL}/about`,
    "ethicsPolicy": `${BASE_URL}/about`,
    "correctionsPolicy": `${BASE_URL}/about`
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}

// 2. Article / NewsArticle Schema.org JSON-LD
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
  publisherName = "Bylines.dev Journal",
  publisherLogo = `${BASE_URL}/icon.svg`,
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
    "isPartOf": {
      "@type": ["Product"],
      "name": "Bylines.dev Journal",
      "productID": "CAowrbLMDA:openaccess"
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

// 3. BreadcrumbList Schema.org JSON-LD
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
      "item": item.url.startsWith('http') ? item.url : `${BASE_URL}${item.url}`,
    })),
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}

// 4. WebSite & Sitelinks SearchBox Schema.org JSON-LD
export function WebSiteJSONLD() {
  const schema = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "name": "Bylines.dev",
    "alternateName": "Bylines Dev — Technical & Editorial Publishing",
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

// 5. CollectionPage / Category Schema.org JSON-LD
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
    "url": url.startsWith('http') ? url : `${BASE_URL}${url}`,
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

