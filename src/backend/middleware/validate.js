import Joi from 'joi';

// Reusable validation schemas
export const schemas = {
  registerUser: Joi.object({
    name: Joi.string().min(2).max(50).required().messages({
      'string.empty': 'Name is required',
      'string.min': 'Name must be at least 2 characters',
      'string.max': 'Name cannot exceed 50 characters'
    }),
    email: Joi.string().email().required().messages({
      'string.email': 'Please provide a valid email address',
      'string.empty': 'Email is required'
    }),
    password: Joi.string().min(6).max(100).required().messages({
      'string.min': 'Password must be at least 6 characters',
      'string.empty': 'Password is required'
    })
  }),

  loginUser: Joi.object({
    email: Joi.string().email().required().messages({
      'string.email': 'Please provide a valid email address',
      'string.empty': 'Email is required'
    }),
    password: Joi.string().required().messages({
      'string.empty': 'Password is required'
    })
  }),

  createPost: Joi.object({
    title: Joi.string().min(5).max(200).required().messages({
      'string.empty': 'Title is required',
      'string.min': 'Title must be at least 5 characters',
      'string.max': 'Title cannot exceed 200 characters'
    }),
    content: Joi.string().min(50).required().messages({
      'string.empty': 'Content is required',
      'string.min': 'Content must be at least 50 characters'
    }),
    summary: Joi.string().min(10).max(300).required().messages({
      'string.empty': 'Summary is required',
      'string.max': 'Summary cannot exceed 300 characters'
    }),
    category: Joi.string().required().messages({
      'string.empty': 'Category is required'
    }),
    tags: Joi.array().items(Joi.string()).optional(),
    featuredImage: Joi.string().optional().allow('', null),
    status: Joi.string().valid('draft', 'scheduled', 'published').default('draft'),
    isPremium: Joi.boolean().default(false),
    isFeatured: Joi.boolean().optional(),
    isSticky: Joi.boolean().optional(),
    slug: Joi.string().optional().allow('', null),
    seo: Joi.object().optional().allow(null),
    publishedAt: Joi.alternatives().try(Joi.string(), Joi.date()).optional().allow(null)
  }),

  createCategory: Joi.object({
    name: Joi.string().min(2).max(50).required().messages({
      'string.empty': 'Category name is required',
      'string.min': 'Name must be at least 2 characters'
    }),
    description: Joi.string().max(500).optional()
  }),

  createTag: Joi.object({
    name: Joi.string().min(2).max(30).required().messages({
      'string.empty': 'Tag name is required',
      'string.min': 'Name must be at least 2 characters'
    })
  }),

  createComment: Joi.object({
    content: Joi.string().min(2).max(1000).required().messages({
      'string.empty': 'Comment content is required',
      'string.max': 'Comment cannot exceed 1000 characters'
    }),
    post: Joi.string().required(),
    postId: Joi.string().optional(),
    guestName: Joi.string().optional().allow(''),
    guestEmail: Joi.string().optional().allow(''),
    parentId: Joi.string().optional().allow(null),
    mentions: Joi.array().items(Joi.string()).optional()
  })
};

// Validation middleware factory
export const validate = (schema) => {
  return (req, res, next) => {
    const { error, value } = schema.validate(req.body, {
      abortEarly: false,
      stripUnknown: true
    });

    if (error) {
      const messages = error.details.map(detail => ({
        field: detail.path.join('.'),
        message: detail.message
      }));
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: messages
      });
    }

    req.body = value;
    next();
  };
};

// Query parameter validation
export const validateQuery = (schema) => {
  return (req, res, next) => {
    const { error, value } = schema.validate(req.query, {
      abortEarly: false,
      stripUnknown: true
    });

    if (error) {
      const messages = error.details.map(detail => ({
        field: detail.path.join('.'),
        message: detail.message
      }));
      return res.status(400).json({
        success: false,
        message: 'Invalid query parameters',
        errors: messages
      });
    }

    req.query = value;
    next();
  };
};
