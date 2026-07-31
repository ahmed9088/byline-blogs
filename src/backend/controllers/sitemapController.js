import Post from '../models/Post.js';
import Category from '../models/Category.js';
import Tag from '../models/Tag.js';

// @desc    Generate sitemap.xml
// @route   GET /sitemap.xml or /api/sitemap.xml
// @access  Public
export const getSitemap = async (req, res, next) => {
  try {
    const posts = await Post.find({ status: 'published' }).select('slug updatedAt');
    const categories = await Category.find({}).select('slug updatedAt');
    const tags = await Tag.find({}).select('slug updatedAt');

    const baseUrl = process.env.CLIENT_URL || 'http://localhost:5173';

    let xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>${baseUrl}/</loc>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>
  <url>
    <loc>${baseUrl}/posts</loc>
    <changefreq>daily</changefreq>
    <priority>0.8</priority>
  </url>
  <url>
    <loc>${baseUrl}/about</loc>
    <changefreq>monthly</changefreq>
    <priority>0.5</priority>
  </url>
  <url>
    <loc>${baseUrl}/contact</loc>
    <changefreq>monthly</changefreq>
    <priority>0.5</priority>
  </url>`;

    // Add Posts
    posts.forEach((post) => {
      const date = post.updatedAt ? new Date(post.updatedAt).toISOString() : new Date().toISOString();
      xml += `
  <url>
    <loc>${baseUrl}/post/${post.slug}</loc>
    <lastmod>${date}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.7</priority>
  </url>`;
    });

    // Add Categories
    categories.forEach((cat) => {
      const date = cat.updatedAt ? new Date(cat.updatedAt).toISOString() : new Date().toISOString();
      xml += `
  <url>
     <loc>${baseUrl}/category/${cat.slug}</loc>
     <lastmod>${date}</lastmod>
     <changefreq>weekly</changefreq>
     <priority>0.6</priority>
  </url>`;
    });

    // Add Tags
    tags.forEach((tag) => {
      const date = tag.updatedAt ? new Date(tag.updatedAt).toISOString() : new Date().toISOString();
      xml += `
  <url>
     <loc>${baseUrl}/tag/${tag.slug}</loc>
     <lastmod>${date}</lastmod>
     <changefreq>weekly</changefreq>
     <priority>0.4</priority>
  </url>`;
    });

    xml += '\n</urlset>';

    res.header('Content-Type', 'application/xml');
    res.status(200).send(xml);
  } catch (error) {
    next(error);
  }
};
