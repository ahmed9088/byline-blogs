import dotenv from 'dotenv';
dotenv.config();

import path from 'path';
import { fileURLToPath } from 'url';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import morgan from 'morgan';
import connectDB from './config/db.js';
import { errorHandler } from './middleware/error.js';
import { sanitizeInput, xssSanitize } from './middleware/sanitize.js';

import authRoutes from './routes/auth.js';
import postRoutes from './routes/posts.js';
import categoryRoutes from './routes/categories.js';
import tagRoutes from './routes/tags.js';
import commentRoutes from './routes/comments.js';
import mediaRoutes from './routes/media.js';
import newsletterRoutes from './routes/newsletter.js';
import analyticsRoutes from './routes/analytics.js';
import settingsRoutes from './routes/settings.js';
import auditLogRoutes from './routes/auditlog.js';
import sitemapRoutes from './routes/sitemap.js';
import Post from './models/Post.js';

// Ensure JWT secret is always present
if (!process.env.JWT_SECRET || process.env.JWT_SECRET.length < 16) {
  process.env.JWT_SECRET = 'bylines_dev_default_super_secure_jwt_secret_key_2026';
}

const app = express();

app.get('/api/simple-health', (req, res) => {
  res.json({ status: 'healthy', database: 'supabase' });
});

// Serverless DB Connection Middleware
app.use(async (req, res, next) => {
  try {
    await connectDB();
    next();
  } catch (error) {
    next(error);
  }
});

// Body parser
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Gzip compression
app.use(compression());

// Logging
if (process.env.NODE_ENV !== 'production') {
  app.use(morgan('dev'));
}

// Security sanitization
app.use(sanitizeInput);
app.use(xssSanitize);

// Enable CORS
app.use(
  cors({
    origin: '*',
    credentials: true
  })
);

// Security Headers
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: 'cross-origin' },
    contentSecurityPolicy: false
  })
);

// Static uploads
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
app.use('/uploads', express.static(path.join(__dirname, 'public/uploads')));

// Routes
app.use(['/api/auth', '/api/backend/auth'], authRoutes);
app.use(['/api/posts', '/api/backend/posts'], postRoutes);
app.use(['/api/categories', '/api/backend/categories'], categoryRoutes);
app.use(['/api/tags', '/api/backend/tags'], tagRoutes);
app.use(['/api/comments', '/api/backend/comments'], commentRoutes);
app.use(['/api/media', '/api/backend/media'], mediaRoutes);
app.use(['/api/newsletter', '/api/backend/newsletter'], newsletterRoutes);
app.use(['/api/analytics', '/api/backend/analytics'], analyticsRoutes);
app.use(['/api/settings', '/api/backend/settings'], settingsRoutes);
app.use(['/api/audit-log', '/api/backend/audit-log'], auditLogRoutes);
app.use(['/sitemap.xml', '/api/sitemap.xml', '/api/backend/sitemap.xml'], sitemapRoutes);

// Health check
app.get(['/health', '/api/health', '/api/backend/health'], (req, res) => {
  res.json({ status: 'healthy', timestamp: new Date(), app: 'Bylines.dev API' });
});



// Error handler
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

if (!process.env.VERCEL) {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}

export default app;
