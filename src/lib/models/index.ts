import mongoose, { Schema, model, models } from 'mongoose';

// Category Schema
const CategorySchema = new Schema({
  name: { type: String, required: true, trim: true },
  slug: { type: String, required: true, unique: true, lowercase: true, trim: true },
  description: { type: String, default: '' },
}, { timestamps: true });

export const Category = models.Category || model('Category', CategorySchema);

// Tag Schema
const TagSchema = new Schema({
  name: { type: String, required: true, trim: true },
  slug: { type: String, required: true, unique: true, lowercase: true, trim: true },
}, { timestamps: true });

export const Tag = models.Tag || model('Tag', TagSchema);

// User Schema
const UserSchema = new Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  password: { type: String, required: true, select: false },
  role: { type: String, enum: ['Super Admin', 'Admin', 'Author', 'Registered User'], default: 'Registered User' },
  avatar: { type: String, default: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=250&q=80' },
  bio: { type: String, default: '' },
}, { timestamps: true });

export const User = models.User || model('User', UserSchema);

// Post Schema
const PostSchema = new Schema({
  title: { type: String, required: true, trim: true },
  slug: { type: String, required: true, unique: true, lowercase: true, trim: true },
  content: { type: String, required: true },
  excerpt: { type: String, required: true },
  category: { type: Schema.Types.ObjectId, ref: 'Category', required: true },
  tags: [{ type: Schema.Types.ObjectId, ref: 'Tag' }],
  author: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  featuredImage: { type: String, default: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=800&q=80' },
  status: { type: String, enum: ['draft', 'published', 'scheduled'], default: 'published' },
  publishedAt: { type: Date, default: Date.now },
  views: { type: Number, default: 0 },
  likes: { type: Number, default: 0 },
  readTime: { type: String, default: '5 min read' },
  isFeatured: { type: Boolean, default: false }
}, { timestamps: true });

export const Post = models.Post || model('Post', PostSchema);

// Settings Schema
const SettingsSchema = new Schema({
  siteName: { type: String, default: 'Bylines.dev' },
  siteDescription: { type: String, default: 'An independent premium technical and editorial publishing platform.' },
  contactEmail: { type: String, default: 'contact@bylines.dev' },
  socialLinks: {
    twitter: { type: String, default: 'https://twitter.com/byline' },
    facebook: { type: String, default: 'https://facebook.com/byline' },
    instagram: { type: String, default: 'https://instagram.com/byline' },
    linkedin: { type: String, default: 'https://linkedin.com/company/byline' }
  },
  defaultMetaTitle: { type: String, default: 'Bylines.dev — Ultra-Premium Editorial Publishing' },
  defaultMetaDescription: { type: String, default: 'Expert-driven journalism covering technology, artificial intelligence, science, culture, design, and world affairs.' }
}, { timestamps: true });

export const Settings = models.Settings || model('Settings', SettingsSchema);

// Comment Schema
const CommentSchema = new Schema({
  post: { type: Schema.Types.ObjectId, ref: 'Post', required: true },
  user: { type: Schema.Types.ObjectId, ref: 'User' },
  guestName: { type: String },
  guestEmail: { type: String },
  content: { type: String, required: true },
  status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'approved' }
}, { timestamps: true });

export const Comment = models.Comment || model('Comment', CommentSchema);

// Newsletter Schema
const NewsletterSchema = new Schema({
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  status: { type: String, enum: ['active', 'unsubscribed'], default: 'active' }
}, { timestamps: true });

export const Newsletter = models.Newsletter || model('Newsletter', NewsletterSchema);
