import Post from '../models/Post.js';
import User from '../models/User.js';
import Category from '../models/Category.js';
import Tag from '../models/Tag.js';
import { logAction } from '../utils/auditLogger.js';

// Helper to safely extract an ID from a populated field or plain ID string
const extractId = (field) => {
  if (!field) return null;
  if (typeof field === 'string') return field;
  if (typeof field === 'number') return String(field);
  return field._id || field.id || String(field);
};

// Helper to check slug availability and generate unique one if needed
const generateUniqueSlug = async (title, currentPostId = null) => {
  let slug = title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)+/g, '');

  let baseSlug = slug;
  let isUnique = false;
  let counter = 1;

  while (!isUnique) {
    const query = { slug };
    if (currentPostId) {
      query._id = { $ne: currentPostId };
    }
    const existing = await Post.findOne(query);
    if (!existing) {
      isUnique = true;
    } else {
      slug = `${baseSlug}-${counter}`;
      counter++;
    }
  }
  return slug;
};

// @desc    Get all posts
// @route   GET /api/posts
// @access  Public
export const getPosts = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const query = {};

    // Filters
    if (req.query.category) {
      const cat = await Category.findOne({ slug: req.query.category });
      if (cat) query.category = cat._id;
    }

    if (req.query.tag) {
      const tagObj = await Tag.findOne({ slug: req.query.tag });
      if (tagObj) query.tags = tagObj._id;
    }

    if (req.query.author) {
      query.author = req.query.author;
    }

    if (req.query.featured) {
      query.isFeatured = req.query.featured === 'true';
    }

    if (req.query.sticky) {
      query.isSticky = req.query.sticky === 'true';
    }

    if (req.query.premium) {
      query.isPremium = req.query.premium === 'true';
    }

    // Search query in title/summary/content
    if (req.query.search) {
      query.$or = [
        { title: { $regex: req.query.search, $options: 'i' } },
        { summary: { $regex: req.query.search, $options: 'i' } },
        { content: { $regex: req.query.search, $options: 'i' } }
      ];
    }

    // Role-based visibility
    // By default, public queries only see 'published' status
    if (req.query.status) {
      query.status = req.query.status;
    } else {
      query.status = 'published';
    }

    // Sort order: sticky first, then publishedAt desc
    const sort = { isSticky: -1, publishedAt: -1 };

    const posts = await Post.find(query)
      .populate('author', 'name profileImage bio')
      .populate('category', 'name slug')
      .populate('tags', 'name slug')
      .sort(sort)
      .skip(skip)
      .limit(limit);

    const total = await Post.countDocuments(query);

    res.json({
      success: true,
      count: posts.length,
      page,
      pages: Math.ceil(total / limit),
      total,
      posts
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single post by slug
// @route   GET /api/posts/slug/:slug
// @access  Public
export const getPostBySlug = async (req, res, next) => {
  try {
    // Try to find by slug first; if it looks like a UUID, also try by ID
    const isUUID = /^[0-9a-fA-F-]{36}$/.test(req.params.slug);
    let post;
    
    if (isUUID) {
      // Try finding by ID first, then by slug
      post = await Post.findById(req.params.slug)
        .populate('author', 'name profileImage bio')
        .populate('category', 'name slug')
        .populate('tags', 'name slug');
      
      if (!post) {
        post = await Post.findOne({ slug: req.params.slug })
          .populate('author', 'name profileImage bio')
          .populate('category', 'name slug')
          .populate('tags', 'name slug');
      }
    } else {
      post = await Post.findOne({ slug: req.params.slug })
        .populate('author', 'name profileImage bio')
        .populate('category', 'name slug')
        .populate('tags', 'name slug');
    }

    if (!post) {
      return res.status(404).json({ success: false, message: 'Post not found' });
    }

    // Increment views count on visit
    const newViewsCount = (post.viewsCount || 0) + 1;
    await Post.findByIdAndUpdate(post._id, { viewsCount: newViewsCount });
    post.viewsCount = newViewsCount;

    // Log reading history if user is authenticated
    if (req.user) {
      try {
        const user = await User.findById(req.user._id || req.user.id);
        if (user) {
          let readingHistory = (user.readingHistory || []).filter(
            (item) => {
              const itemPostId = extractId(item.post || item.postId);
              return itemPostId && itemPostId !== post._id;
            }
          );
          readingHistory.unshift({ post: post._id, readAt: new Date().toISOString() });
          if (readingHistory.length > 50) {
            readingHistory = readingHistory.slice(0, 50);
          }
          await User.findByIdAndUpdate(user._id, { readingHistory });
        }
      } catch (err) {
        console.error('[PostController] Reading history save failed:', err.message);
      }
    }

    // Fetch related articles (same category, excluding current post)
    const categoryId = extractId(post.category);
    let related = [];
    if (categoryId) {
      related = await Post.find({
        category: categoryId,
        _id: { $ne: post._id },
        status: 'published'
      })
        .limit(3)
        .populate('author', 'name profileImage');
    }

    res.json({ success: true, post, related });
  } catch (error) {
    next(error);
  }
};

// @desc    Check slug availability
// @route   GET /api/posts/check-slug
// @access  Private/Author
export const checkSlug = async (req, res, next) => {
  try {
    const { title, currentId } = req.query;
    if (!title) {
      return res.status(400).json({ success: false, message: 'Title is required' });
    }
    const slug = await generateUniqueSlug(title, currentId);
    res.json({ success: true, slug });
  } catch (error) {
    next(error);
  }
};

// @desc    Create new post
// @route   POST /api/posts
// @access  Private/Author
export const createPost = async (req, res, next) => {
  try {
    const { title, content, summary, featuredImage, category, tags, status, isFeatured, isSticky, isPremium, seo } = req.body;

    const slug = await generateUniqueSlug(title);

    const post = await Post.create({
      title,
      slug,
      content,
      summary,
      featuredImage,
      author: req.user.id,
      category,
      tags,
      status,
      isFeatured,
      isSticky,
      isPremium,
      seo,
      publishedAt: status === 'published' ? new Date().toISOString() : undefined
    });

    // Audit log
    await logAction(req, 'CREATE_POST', post.title, 'Post', post._id, `Created post in status "${status}"`);

    res.status(201).json({ success: true, post });
  } catch (error) {
    next(error);
  }
};

// @desc    Update post
// @route   PUT /api/posts/:id
// @access  Private/Author
export const updatePost = async (req, res, next) => {
  try {
    let post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({ success: false, message: 'Post not found' });
    }

    // Check ownership (Authors can only update their own posts, Admins can update any)
    const postAuthorId = extractId(post.author);
    if (postAuthorId !== req.user.id && !['Admin', 'Super Admin'].includes(req.user.role)) {
      return res.status(403).json({ success: false, message: 'Not authorized to update this post' });
    }

    // Regulate slug changes
    if (req.body.title && req.body.title !== post.title) {
      req.body.slug = await generateUniqueSlug(req.body.title, post._id);
    }

    // Update publishedAt timestamp if status changed to published
    const statusChangedToPublished = req.body.status === 'published' && post.status !== 'published';
    if (statusChangedToPublished) {
      req.body.publishedAt = new Date().toISOString();
    }

    post = await Post.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    // Audit log
    const auditAction = statusChangedToPublished ? 'PUBLISH_POST' : 'UPDATE_POST';
    await logAction(req, auditAction, post.title, 'Post', post._id, `Updated post details. Status: "${post.status}"`);

    res.json({ success: true, post });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete post
// @route   DELETE /api/posts/:id
// @access  Private/Author
export const deletePost = async (req, res, next) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({ success: false, message: 'Post not found' });
    }

    // Check ownership
    const postAuthorId = extractId(post.author);
    if (postAuthorId !== req.user.id && !['Admin', 'Super Admin'].includes(req.user.role)) {
      return res.status(403).json({ success: false, message: 'Not authorized to delete this post' });
    }

    // Audit log before deletion
    await logAction(req, 'DELETE_POST', post.title, 'Post', post._id, `Deleted post written by author ID: ${postAuthorId}`);

    await Post.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Post deleted successfully' });
  } catch (error) {
    next(error);
  }
};

// @desc    Like post
// @route   POST /api/posts/:id/like
// @access  Public (registered and guests)
export const likePost = async (req, res, next) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ success: false, message: 'Post not found' });
    }

    const currentLikes = post.likesCount || 0;
    const isLiked = req.body.isLiked;
    const newLikesCount = isLiked ? currentLikes + 1 : Math.max(0, currentLikes - 1);
    
    await Post.findByIdAndUpdate(post._id, { likesCount: newLikesCount });

    res.json({ success: true, likesCount: newLikesCount });
  } catch (error) {
    next(error);
  }
};

// @desc    Bookmark/unbookmark a post
// @route   POST /api/posts/:id/bookmark
// @access  Private
export const bookmarkPost = async (req, res, next) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ success: false, message: 'Post not found' });
    }

    const user = await User.findById(req.user.id);
    const bookmarks = user.bookmarks || [];
    const index = bookmarks.indexOf(post._id);

    let isBookmarked = false;
    let newBookmarks;
    let newBookmarksCount = post.bookmarksCount || 0;

    if (index > -1) {
      // Remove bookmark
      newBookmarks = bookmarks.filter(id => id !== post._id);
      newBookmarksCount = Math.max(0, newBookmarksCount - 1);
    } else {
      // Add bookmark
      newBookmarks = [...bookmarks, post._id];
      newBookmarksCount += 1;
      isBookmarked = true;
    }

    await User.findByIdAndUpdate(req.user.id, { bookmarks: newBookmarks });
    await Post.findByIdAndUpdate(post._id, { bookmarksCount: newBookmarksCount });

    res.json({ success: true, isBookmarked, bookmarksCount: newBookmarksCount });
  } catch (error) {
    next(error);
  }
};
