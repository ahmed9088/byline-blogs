// API response status codes and messages
export const API_STATUS = {
  SUCCESS: 200,
  CREATED: 201,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  VALIDATION_ERROR: 422,
  SERVER_ERROR: 500
};

// User roles
export const USER_ROLES = {
  SUPER_ADMIN: 'Super Admin',
  ADMIN: 'Admin',
  AUTHOR: 'Author',
  REGISTERED_USER: 'Registered User'
};

// Post status
export const POST_STATUS = {
  DRAFT: 'draft',
  SCHEDULED: 'scheduled',
  PUBLISHED: 'published'
};

// Pagination defaults
export const PAGINATION = {
  DEFAULT_PAGE: 1,
  DEFAULT_LIMIT: 10,
  MAX_LIMIT: 100
};

// File upload limits
export const FILE_UPLOAD = {
  MAX_SIZE: 10485760, // 10MB
  ALLOWED_TYPES: ['jpg', 'jpeg', 'png', 'gif', 'webp'],
  MAX_WIDTH: 2048,
  MAX_HEIGHT: 2048
};

// Token expiration
export const TOKEN_EXPIRY = {
  JWT: '30d',
  REFRESH: '7d'
};

// Rate limiting
export const RATE_LIMITS = {
  API_WINDOW_MS: 15 * 60 * 1000, // 15 minutes
  API_MAX_REQUESTS: 100,
  AUTH_WINDOW_MS: 60 * 60 * 1000, // 1 hour
  AUTH_MAX_ATTEMPTS: 15
};

// API endpoints
export const API_ENDPOINTS = {
  AUTH: '/api/auth',
  POSTS: '/api/posts',
  CATEGORIES: '/api/categories',
  TAGS: '/api/tags',
  COMMENTS: '/api/comments',
  MEDIA: '/api/media',
  NEWSLETTER: '/api/newsletter',
  ANALYTICS: '/api/analytics',
  SETTINGS: '/api/settings',
  AUDIT_LOG: '/api/audit-log'
};
