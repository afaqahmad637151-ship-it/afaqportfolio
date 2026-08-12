const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');
const config = require('../config');
const logger = require('../utils/logger');

const dbConfig = config.db;

let pool;

async function connectToDatabase() {
    try {
        pool = mysql.createPool({
            host: dbConfig.host,
            port: dbConfig.port,
            user: dbConfig.user,
            password: dbConfig.password,
            database: dbConfig.database,
            waitForConnections: true,
            connectionLimit: 10,
            queueLimit: 0,
            multipleStatements: true
        });

        const connection = await pool.getConnection();

        logger.info('Successfully connected to MySQL database!');

        // Read schema.sql from backend root
        const schemaPath = path.join(__dirname, '../../schema.sql');

        if (fs.existsSync(schemaPath)) {
            const schema = fs.readFileSync(schemaPath, 'utf8');

            if (schema.trim()) {
                await connection.query(schema);
                logger.info('Database tables initialized successfully!');
            }
        } else {
            logger.error(`schema.sql not found at: ${schemaPath}`);
        }

        connection.release();

        return pool;
    } catch (error) {
        console.error('MYSQL ERROR:', {
            message: error.message,
            code: error.code,
            errno: error.errno,
            sqlState: error.sqlState,
            host: dbConfig.host,
            port: dbConfig.port,
            user: dbConfig.user,
            database: dbConfig.database
        });

        process.exit(1);
    }
}

function getPool() {
    if (!pool) {
        throw new Error(
            'Database pool not initialized. Call connectToDatabase first.'
        );
    }

    return pool;
}

module.exports = {
    connectToDatabase,
    getPool
};
