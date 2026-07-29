const rateLimit = require('express-rate-limit');

/**
 * Rate Limiter for Authentication endpoints
 * 100 requests per 15 minutes window
 */
const authRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  standardHeaders: true, // Return rate limit info in `RateLimit-*` headers
  legacyHeaders: false, // Disable `X-RateLimit-*` headers
  message: {
    success: false,
    message: 'Too many requests from this IP for auth endpoints, please try again after 15 minutes.',
    errors: []
  }
});

/**
 * General API Rate Limiter
 * 500 requests per 15 minutes
 */
const apiRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 500,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many requests from this IP, please try again later.',
    errors: []
  }
});

module.exports = {
  authRateLimiter,
  apiRateLimiter
};
