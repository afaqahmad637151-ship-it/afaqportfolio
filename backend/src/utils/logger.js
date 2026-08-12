// backend/src/utils/logger.js
const moment = require('moment');
const config = require('../config');

const LOG_LEVELS = {
    DEBUG: 0,
    INFO: 1,
    WARN: 2,
    ERROR: 3,
    FATAL: 4
};

// Set minimum log level based on environment
const MIN_LOG_LEVEL = config.nodeEnv === 'production' ? LOG_LEVELS.INFO : LOG_LEVELS.DEBUG;

const log = (level, message, ...args) => {
    if (LOG_LEVELS[level] < MIN_LOG_LEVEL) {
        return;
    }

    const timestamp = moment().format('YYYY-MM-DD HH:mm:ss');
    const logMessage = `[${timestamp}] [${level}] ${message}`;

    switch (level) {
        case 'DEBUG':
            console.debug(logMessage, ...args);
            break;
        case 'INFO':
            console.info(logMessage, ...args);
            break;
        case 'WARN':
            console.warn(logMessage, ...args);
            break;
        case 'ERROR':
        case 'FATAL':
            console.error(logMessage, ...args);
            break;
        default:
            console.log(logMessage, ...args);
    }
};

module.exports = {
    debug: (...args) => log('DEBUG', ...args),
    info: (...args) => log('INFO', ...args),
    warn: (...args) => log('WARN', ...args),
    error: (...args) => log('ERROR', ...args),
    fatal: (...args) => log('FATAL', ...args),
};