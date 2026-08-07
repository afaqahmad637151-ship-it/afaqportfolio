// backend/src/middleware/auth.js
const jwt = require('jsonwebtoken');
const config = require('../config');
const AppError = require('../utils/appError');
const logger = require('../utils/logger');

const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
        return next(new AppError('No authentication token provided.', 401));
    }

    try {
        const decoded = jwt.verify(token, config.jwt.secret);
        req.user = decoded; // { id: '...', username: '...', role: 'admin' }
        next();
    } catch (err) {
        if (err.name === 'TokenExpiredError') {
            return next(new AppError('Authentication token expired.', 401));
        }
        logger.error('JWT verification failed:', err.message);
        return next(new AppError('Invalid authentication token.', 403));
    }
};

const authorizeRoles = (...roles) => {
    return (req, res, next) => {
        if (!req.user || !roles.includes(req.user.role)) {
            return next(new AppError('Unauthorized: You do not have permission to perform this action.', 403));
        }
        next();
    };
};

module.exports = {
    authenticateToken,
    authorizeRoles,
};