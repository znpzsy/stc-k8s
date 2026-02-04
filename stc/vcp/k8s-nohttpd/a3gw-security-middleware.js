// a3gw-security-middleware.js
// Optional defense-in-depth security headers for a3gw
// Place this in your a3gw Express.js application

/**
 * Security Headers Middleware
 * 
 * This provides defense-in-depth even though Ingress already sets headers.
 * Useful if traffic somehow bypasses Ingress or for internal service-to-service calls.
 * 
 * Install as Express middleware:
 * app.use(securityHeadersMiddleware);
 */

const securityHeadersMiddleware = (req, res, next) => {
  // Frame protection - prevent clickjacking
  res.setHeader('X-Frame-Options', 'DENY');
  
  // Prevent MIME type sniffing
  res.setHeader('X-Content-Type-Options', 'nosniff');
  
  // XSS Protection (legacy but still good for older browsers)
  res.setHeader('X-XSS-Protection', '1; mode=block');
  
  // Additional security headers from your httpd config
  res.setHeader('X-Download-Options', 'noopen');
  res.setHeader('X-Permitted-Cross-Domain-Policies', 'none');
  res.setHeader('Feature-Policy', "vibrate 'none'; geolocation 'none'");
  res.setHeader('Expect-CT', 'max-age=86400, enforce');
  
  // Referrer Policy
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  
  // Content Security Policy
  // Match your html5-boilerplate.conf CSP policy
  res.setHeader(
    'Content-Security-Policy',
    "default-src 'self' 'unsafe-eval' 'unsafe-inline' blob:; " +
    "base-uri 'self'; " +
    "form-action 'self'; " +
    "frame-ancestors 'none';"
  );
  
  // Remove server identification headers
  res.removeHeader('X-Powered-By');
  
  // If you want to set HTTPOnly on cookies (though this should be done at cookie creation)
  // This is a bit more complex and should be handled when setting cookies
  
  next();
};

/**
 * HTTPS Redirect Middleware (if needed)
 * Only use if not already handled by Ingress
 */
const httpsRedirectMiddleware = (req, res, next) => {
  // Check if request is not secure and not from internal k8s services
  if (!req.secure && req.get('x-forwarded-proto') !== 'https') {
    // Allow health check endpoints to work over HTTP
    if (req.path === '/health' || req.path === '/readiness' || req.path === '/liveness') {
      return next();
    }
    return res.redirect(301, `https://${req.hostname}${req.url}`);
  }
  next();
};

/**
 * Cookie Security Helper
 * Use this when setting cookies to ensure they're secure
 */
const setSecureCookie = (res, name, value, options = {}) => {
  const defaultOptions = {
    httpOnly: true,
    secure: true, // HTTPS only
    sameSite: 'lax',
    maxAge: 10800000, // 3 hours in milliseconds
    ...options
  };
  
  res.cookie(name, value, defaultOptions);
};

/**
 * CORS Middleware (if you need custom CORS logic)
 */
const corsMiddleware = (req, res, next) => {
  // For images and fonts - allow cross-origin
  const allowedOrigins = process.env.CORS_ALLOWED_ORIGINS 
    ? process.env.CORS_ALLOWED_ORIGINS.split(',') 
    : ['*'];
  
  const origin = req.headers.origin;
  
  if (allowedOrigins.includes('*') || allowedOrigins.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin || '*');
  }
  
  // For fonts and images
  if (req.path.match(/\.(eot|otf|ttf|ttc|woff|woff2|png|jpg|jpeg|gif|svg|webp|bmp|ico)$/i)) {
    res.setHeader('Access-Control-Allow-Origin', '*');
  }
  
  // Handle preflight
  if (req.method === 'OPTIONS') {
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');
    res.setHeader('Access-Control-Max-Age', '86400'); // 24 hours
    return res.sendStatus(204);
  }
  
  next();
};

/**
 * Compression Middleware Setup
 * Install: npm install compression
 */
const setupCompression = (app) => {
  const compression = require('compression');
  
  app.use(compression({
    // Compress all responses
    filter: (req, res) => {
      // Don't compress if client doesn't accept encoding
      if (req.headers['x-no-compression']) {
        return false;
      }
      // Use compression for common text types
      return compression.filter(req, res);
    },
    // Compression level (1-9, 6 is default)
    level: 6
  }));
};

/**
 * Rate Limiting Middleware (optional)
 * Install: npm install express-rate-limit
 */
const setupRateLimiting = (app) => {
  const rateLimit = require('express-rate-limit');
  
  const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // Limit each IP to 100 requests per windowMs
    message: 'Too many requests from this IP, please try again later.',
    standardHeaders: true,
    legacyHeaders: false,
  });
  
  // Apply to all routes
  app.use(limiter);
  
  // Stricter rate limit for auth endpoints
  const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 5, // Only 5 auth attempts per 15 minutes
    message: 'Too many authentication attempts, please try again later.',
  });
  
  app.use('/cmpf-auth-rest', authLimiter);
};

/**
 * Request ID Middleware
 * Useful for tracing requests through logs
 */
const requestIdMiddleware = (req, res, next) => {
  const requestId = req.headers['x-request-id'] || 
                   `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  
  req.id = requestId;
  res.setHeader('X-Request-ID', requestId);
  
  next();
};

/**
 * Access Logging Middleware
 * Creates Apache-style access logs
 */
const accessLogMiddleware = (req, res, next) => {
  const startTime = Date.now();
  
  // Log when response finishes
  res.on('finish', () => {
    const duration = Date.now() - startTime;
    const log = [
      req.ip || req.connection.remoteAddress,
      '-',
      '-',
      `[${new Date().toISOString()}]`,
      `"${req.method} ${req.url} HTTP/${req.httpVersion}"`,
      res.statusCode,
      res.get('content-length') || '-',
      `"${req.get('referer') || '-'}"`,
      `"${req.get('user-agent') || '-'}"`,
      `${duration}ms`
    ].join(' ');
    
    console.log(log);
  });
  
  next();
};

/**
 * Error Handling Middleware
 * Should be last middleware
 */
const errorHandlerMiddleware = (err, req, res, next) => {
  console.error('Error:', err);
  
  // Don't leak error details in production
  const isDevelopment = process.env.NODE_ENV === 'development';
  
  res.status(err.status || 500).json({
    error: {
      message: isDevelopment ? err.message : 'Internal server error',
      ...(isDevelopment && { stack: err.stack })
    }
  });
};

/**
 * Full Setup Example for Express App
 */
const setupAllSecurityMiddleware = (app) => {
  // 1. Request ID (should be first)
  app.use(requestIdMiddleware);
  
  // 2. Access logging
  app.use(accessLogMiddleware);
  
  // 3. Security headers
  app.use(securityHeadersMiddleware);
  
  // 4. CORS (if needed)
  app.use(corsMiddleware);
  
  // 5. HTTPS redirect (optional, usually handled by Ingress)
  // app.use(httpsRedirectMiddleware);
  
  // 6. Compression
  setupCompression(app);
  
  // 7. Rate limiting (optional)
  // setupRateLimiting(app);
  
  // ... your routes here ...
  
  // Last: Error handler
  app.use(errorHandlerMiddleware);
};

// Export for use in your a3gw application
module.exports = {
  securityHeadersMiddleware,
  httpsRedirectMiddleware,
  corsMiddleware,
  setSecureCookie,
  requestIdMiddleware,
  accessLogMiddleware,
  errorHandlerMiddleware,
  setupCompression,
  setupRateLimiting,
  setupAllSecurityMiddleware
};

/**
 * USAGE IN YOUR a3gw APP:
 * 
 * In your main app file (e.g., server.js or app.js):
 * 
 * const express = require('express');
 * const { setupAllSecurityMiddleware } = require('./middleware/security');
 * 
 * const app = express();
 * 
 * // Apply all security middleware
 * setupAllSecurityMiddleware(app);
 * 
 * // Your routes
 * app.get('/health', (req, res) => res.send('OK'));
 * 
 * // Start server
 * const PORT = process.env.PORT || 8444;
 * app.listen(PORT, () => {
 *   console.log(`Server running on port ${PORT}`);
 * });
 */

/**
 * DEPENDENCIES NEEDED:
 * 
 * npm install compression express-rate-limit
 * 
 * Or add to package.json:
 * {
 *   "dependencies": {
 *     "compression": "^1.7.4",
 *     "express-rate-limit": "^6.7.0"
 *   }
 * }
 */
