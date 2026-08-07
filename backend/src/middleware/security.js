// backend/src/middleware/security.js
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const config = require('../config');
const logger = require('../utils/logger');

// CORS Configuration
const corsOptions = {
    origin: config.cors.frontendUrl, // Allow only your frontend to access
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
    optionsSuccessStatus: 200 // Some legacy browsers choke on 204
};

// Rate Limiting
const apiLimiter = rateLimit({
    windowMs: config.rateLimit.windowMs, // 1 minute
    max: config.rateLimit.maxRequests, // Max requests per windowMs
    message: 'Too many requests from this IP, please try again after a minute',
    handler: (req, res, next, options) => {
        logger.warn(`Rate limit exceeded for IP: ${req.ip}`);
        res.status(options.statusCode).send(options.message);
    },
    standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
    legacyHeaders: false, // Disable the `X-RateLimit-*` headers
});

module.exports = {
    corsMiddleware: cors(corsOptions),
    helmetMiddleware: helmet({
        contentSecurityPolicy: {
            directives: {
                defaultSrc: ["'self'"],
                scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'"], // Adjust as needed
                styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
                imgSrc: ["'self'", "data:", "*.unsplash.com", "*.placeholder.com", "*.randomuser.me"], // Add image sources
                fontSrc: ["'self'", "https://fonts.gstatic.com"],
                connectSrc: ["'self'", config.cors.frontendUrl],
                frameSrc: ["'self'"],
                mediaSrc: ["'self'", "https://www.youtube.com", "https://player.vimeo.com"], // For embedded videos
                objectSrc: ["'none'"],
                upgradeInsecureRequests: [], // Recommend for HTTPS
            },
        },
        hsts: {
            maxAge: 31536000, // 1 year
            includeSubDomains: true,
            preload: true
        },
        referrerPolicy: { policy: 'no-referrer' }
        // Add other helmet options as needed
    }),
    apiLimiter,
};