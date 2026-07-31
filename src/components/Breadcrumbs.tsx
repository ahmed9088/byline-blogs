"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";

interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface BreadcrumbsProps {
  items: BreadcrumbItem[];
}

export default function Breadcrumbs({ items = [] }: BreadcrumbsProps) {
  const [siteUrl, setSiteUrl] = useState("https://byline.com");

  useEffect(() => {
    if (typeof window !== "undefined") {
      setSiteUrl(window.location.origin);
    }
  }, []);

  if (!items || items.length === 0) return null;

  const breadcrumbItems = [
    { label: "Home", href: "/" },
    ...items
  ];

  const schemaList = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: breadcrumbItems.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.label,
      item: item.href ? `${siteUrl}${item.href}` : siteUrl,
    })),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaList) }}
      />
      <nav
        aria-label="Breadcrumb"
        className="font-sans text-[10px] tracking-wider uppercase text-neutral-405 dark:text-neutral-500 py-4"
      >
        <ol className="flex flex-wrap items-center gap-1.5 list-none p-0 m-0">
          {breadcrumbItems.map((item, index) => {
            const isLast = index === breadcrumbItems.length - 1;
            return (
              <li key={index} className="flex items-center gap-1.5">
                {!isLast && item.href ? (
                  <Link
                    href={item.href}
                    className="hover:text-neutral-850 dark:hover:text-neutral-200 transition-colors duration-200"
                  >
                    {item.label}
                  </Link>
                ) : (
                  <span
                    className="text-neutral-500 dark:text-neutral-400 font-medium truncate max-w-[200px]"
                    aria-current="page"
                  >
                    {item.label}
                  </span>
                )}
                {!isLast && (
                  <span className="select-none text-neutral-300 dark:text-neutral-700">/</span>
                )}
              </li>
            );
          })}
        </ol>
      </nav>
    </>
  );
}
