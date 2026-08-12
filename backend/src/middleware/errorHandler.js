// backend/src/middleware/errorHandler.js
const AppError = require('../utils/appError');
const logger = require('../utils/logger');
const config = require('../config');

// Catch all errors and format them
const errorHandler = (err, req, res, next) => {
    // Log the error for debugging
    logger.error('Caught by error handler:', err);

    let error = { ...err };
    error.message = err.message;
    error.statusCode = err.statusCode || 500;
    error.status = err.status || 'error';

    // Handle specific error types
    if (err.name === 'JsonWebTokenError') {
        error = new AppError('Invalid token, please log in again.', 401);
    }
    if (err.name === 'TokenExpiredError') {
        error = new AppError('Token has expired, please log in again.', 401);
    }
    if (err.name === 'CastError' && err.kind === 'ObjectId') {
        error = new AppError(`Resource not found with ID of ${err.value}`, 404);
    }
    if (err.code === 'ER_DUP_ENTRY') { // MySQL duplicate entry error
        const message = `Duplicate entry: ${err.sqlMessage || 'This record already exists'}`;
        error = new AppError(message, 409);
    }
    if (err.code === 'ER_NO_REFERENCED_ROW_2' || err.code === 'ER_NO_REFERENCED_ROW') { // MySQL foreign key constraint failed
        const message = `Foreign key constraint failed: ${err.sqlMessage || 'Related record not found'}`;
        error = new AppError(message, 400);
    }
    if (err.code === 'ER_BAD_FIELD_ERROR') { // MySQL bad field error
        const message = `Invalid field in query: ${err.sqlMessage}`;
        error = new AppError(message, 400);
    }
    
    // Custom AppError already has statusCode and status
    if (!(err instanceof AppError)) {
        // For unhandled non-AppError errors, make them 500
        error.statusCode = 500;
        error.status = 'error';
        error.message = 'Something went wrong!';
    }

    res.status(error.statusCode).json({
        status: error.status,
        message: error.message,
        // In development, send more error details
        ...(config.nodeEnv === 'development' && { error: err, stack: err.stack }),
    });
};

module.exports = errorHandler;