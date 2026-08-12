// backend/src/config/index.js
require('dotenv').config();

const config = {
    port: process.env.PORT || 5000,
    nodeEnv: process.env.NODE_ENV || 'development',
    db: {
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '3306', 10),
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || 'password',
    database: process.env.DB_NAME || 'afaq_portfolio',
},
    jwt: {
        secret: process.env.JWT_SECRET || 'supersecretjwtkeythatshouldbeverylongandrandom',
        expiresIn: process.env.JWT_EXPIRES_IN || '1h',
    },
    cors: {
        frontendUrl: process.env.FRONTEND_URL || 'http://localhost:3000',
    },
    rateLimit: {
        windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '60000', 10), // 1 minute
        maxRequests: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100', 10), // 100 requests per windowMs
    },
    admin: {
        username: process.env.ADMIN_USERNAME || 'admin',
        password: process.env.ADMIN_PASSWORD || 'adminpass',
    }
};

module.exports = config;