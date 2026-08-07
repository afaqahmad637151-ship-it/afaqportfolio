// backend/src/db/db.js
const mysql = require('mysql2/promise');
const config = require('../config');
const logger = require('../utils/logger'); // Assuming a simple logger utility

const dbConfig = config.db;

let pool;

async function connectToDatabase() {
    try {
        pool = mysql.createPool({
            host: dbConfig.host,
            user: dbConfig.user,
            password: dbConfig.password,
            database: dbConfig.database,
            waitForConnections: true,
            connectionLimit: 10,
            queueLimit: 0
        });
        
        // Test the connection
        const connection = await pool.getConnection();
        logger.info('Successfully connected to MySQL database!');
        connection.release();
        return pool;
    } catch (error) {
        logger.error('Error connecting to MySQL database:', error.message);
        // In a real application, you might want to gracefully shut down or retry
        process.exit(1); 
    }
}

function getPool() {
    if (!pool) {
        throw new Error('Database pool not initialized. Call connectToDatabase first.');
    }
    return pool;
}

module.exports = {
    connectToDatabase,
    getPool,
};