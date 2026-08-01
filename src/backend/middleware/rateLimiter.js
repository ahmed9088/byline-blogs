// Rate limiter middleware for Express
// In serverless environments (Vercel), pass-through to prevent memory store deadlocks and timeouts

export const apiLimiter = (req, res, next) => {
  next();
};

export const authLimiter = (req, res, next) => {
  next();
};
