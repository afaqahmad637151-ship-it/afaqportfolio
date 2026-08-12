// backend/src/server.js
const app = require('./app');
const config = require('./config');
const { connectToDatabase } = require('./db/db');
const { initializeAdmin } = require('./controllers/authController');
const logger = require('./utils/logger');

// Handle uncaught exceptions
process.on('uncaughtException', err => {
    logger.fatal('UNCAUGHT EXCEPTION! Shutting down...', err.name, err.message, err.stack);
    process.exit(1);
});

async function startServer() {
    // Connect to database
    await connectToDatabase();
    
    // Initialize default admin user if not exists
    await initializeAdmin();

    // Start the server
    const server = app.listen(config.port, () => {
        logger.info(`Server running in ${config.nodeEnv} mode on port ${config.port}`);
    });

    // Handle unhandled promise rejections
    process.on('unhandledRejection', err => {
        logger.error('UNHANDLED REJECTION! Shutting down...', err.name, err.message, err.stack);
        server.close(() => {
            process.exit(1);
        });
    });

    // Handle SIGTERM (e.g., from Docker graceful shutdown)
    process.on('SIGTERM', () => {
        logger.warn('SIGTERM RECEIVED. Shutting down gracefully.');
        server.close(() => {
            logger.info('Process terminated.');
        });
    });
}

startServer();