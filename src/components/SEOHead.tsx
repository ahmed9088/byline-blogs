"use client";

import { useEffect } from 'react';

interface SEOHeadProps {
  title: string;
  description?: string;
  url?: string;
  image?: string;
  type?: 'website' | 'article';
  publishedTime?: string;
  modifiedTime?: string;
  author?: string;
  section?: string;
  keywords?: string[];
  noindex?: boolean;
}

export default function SEOHead({
  title,
  description = "Byline — An independent premium publishing platform covering deep technology, AI, design, science, geopolitics, and lifestyle.",
  url,
  image = "https://images.unsplash.com/photo-1513542789411-b6a5d4f31634?auto=format&fit=crop&w=1200&h=630&q=80",
  type = "website",
  publishedTime,
  modifiedTime,
  author = "Byline Editorial Board",
  section,
  keywords,
  noindex = false,
}: SEOHeadProps) {
  useEffect(() => {
    const siteTitle = `${title} | Byline`;
    document.title = siteTitle;

    const currentUrl = url || (typeof window !== 'undefined' ? window.location.href : 'https://byline.com');

    // Helper to set or create meta tag
    const setMeta = (nameAttr: string, attrValue: string, content: string) => {
      let el = document.querySelector(`meta[${nameAttr}="${attrValue}"]`);
      if (!el) {
        el = document.createElement('meta');
        el.setAttribute(nameAttr, attrValue);
        document.head.appendChild(el);
      }
      el.setAttribute('content', content);
    };

    // Helper to set link tag (e.g., canonical)
    const setLink = (rel: string, href: string) => {
      let el = document.querySelector(`link[rel="${rel}"]`);
      if (!el) {
        el = document.createElement('link');
        el.setAttribute('rel', rel);
        document.head.appendChild(el);
      }
      el.setAttribute('href', href);
    };

    // Basic Meta
    setMeta('name', 'description', description);
    setMeta('name', 'robots', noindex ? 'noindex, nofollow' : 'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1');
    if (keywords && keywords.length > 0) {
      setMeta('name', 'keywords', keywords.join(', '));
    }

    // Canonical Link
    setLink('canonical', currentUrl);

    // OpenGraph Tags
    setMeta('property', 'og:site_name', 'Byline Journal');
    setMeta('property', 'og:type', type);
    setMeta('property', 'og:title', title);
    setMeta('property', 'og:description', description);
    setMeta('property', 'og:url', currentUrl);
    setMeta('property', 'og:image', image);
    setMeta('property', 'og:image:width', '1200');
    setMeta('property', 'og:image:height', '630');
    setMeta('property', 'og:image:alt', title);
    setMeta('property', 'og:locale', 'en_US');

    if (type === 'article') {
      if (publishedTime) setMeta('property', 'article:published_time', publishedTime);
      if (modifiedTime) setMeta('property', 'article:modified_time', modifiedTime);
      if (author) setMeta('property', 'article:author', author);
      if (section) setMeta('property', 'article:section', section);
    }

    // Twitter Card Tags
    setMeta('name', 'twitter:card', 'summary_large_image');
    setMeta('name', 'twitter:site', '@byline_journal');
    setMeta('name', 'twitter:creator', '@byline_journal');
    setMeta('name', 'twitter:title', title);
    setMeta('name', 'twitter:description', description);
    setMeta('name', 'twitter:image', image);
  }, [title, description, url, image, type, publishedTime, modifiedTime, author, section, keywords, noindex]);

  return null;
}
