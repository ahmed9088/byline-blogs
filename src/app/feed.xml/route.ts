import { NextResponse } from 'next/server';

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://bylines.dev';

const getApiUrl = () => {
  const envApi = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
  if (envApi.startsWith('http://') || envApi.startsWith('https://')) {
    return envApi;
  }
  return `${BASE_URL}${envApi.startsWith('/') ? '' : '/'}${envApi}`;
};

export const revalidate = 60; // Cache for 60 seconds

export async function GET() {
  let posts: any[] = [];
  try {
    const apiUrl = getApiUrl();
    const res = await fetch(`${apiUrl}/posts?status=published&limit=50`, { next: { revalidate: 60 } });
    if (res.ok) {
      const data = await res.json();
      if (data.success && Array.isArray(data.posts)) {
        posts = data.posts;
      }
    }
  } catch (err) {
    console.error('Error fetching posts for RSS feed:', err);
  }

  const itemsXml = posts.map((post) => {
    const postUrl = `${BASE_URL}/post/${post.slug}`;
    const pubDate = new Date(post.publishedAt || post.createdAt || Date.now()).toUTCString();
    const author = post.author?.name || 'Bylines.dev Desk';
    const category = post.category?.name || 'General';
    const description = (post.summary || post.title)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');

    return `
    <item>
      <title><![CDATA[${post.title}]]></title>
      <link>${postUrl}</link>
      <guid isPermaLink="true">${postUrl}</guid>
      <pubDate>${pubDate}</pubDate>
      <author><![CDATA[${author}]]></author>
      <category><![CDATA[${category}]]></category>
      <description><![CDATA[${description}]]></description>
    </item>`;
  }).join('');

  const rssXml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom" xmlns:content="http://purl.org/rss/1.0/modules/content/">
  <channel>
    <title>Bylines.dev — Independent Technical &amp; Editorial Publishing</title>
    <link>${BASE_URL}</link>
    <description>Expert-driven engineering papers, technical journalism, and research reports covering systems architecture, AI models, neuroscience, cybersecurity, and modern design.</description>
    <language>en-us</language>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
    <atom:link href="${BASE_URL}/feed.xml" rel="self" type="application/rss+xml" />
    ${itemsXml}
  </channel>
</rss>`;

  return new NextResponse(rssXml, {
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      'Cache-Control': 's-maxage=60, stale-while-revalidate=300',
    },
  });
}
