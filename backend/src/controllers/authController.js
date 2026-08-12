// backend/src/controllers/authController.js
const jwt = require('jsonwebtoken');
const { getPool } = require('../db/db');
const { hashPassword, comparePassword } = require('../utils/hash');
const AppError = require('../utils/appError');
const config = require('../config');
const logger = require('../utils/logger');

const signToken = (user) => {
    return jwt.sign(
        { id: user.id, username: user.username, role: user.role },
        config.jwt.secret,
        { expiresIn: config.jwt.expiresIn }
    );
};

// Initialize Admin User if not exists
const initializeAdmin = async () => {
    const pool = getPool();
    try {
        const [rows] = await pool.execute('SELECT * FROM users WHERE username = ?', [config.admin.username]);
    if (rows.length === 0) {
    const hashedPassword = await hashPassword(config.admin.password);

    await pool.execute(
        'INSERT INTO users (username, password, role) VALUES (?, ?, ?)',
        [config.admin.username, hashedPassword, 'admin']
    );

    logger.info('Default admin user created successfully.');
} else {
    const hashedPassword = await hashPassword(config.admin.password);

    await pool.execute(
        'UPDATE users SET password = ?, role = ? WHERE username = ?',
        [hashedPassword, 'admin', config.admin.username]
    );

    logger.info('Admin password reset successfully.');
}
};


exports.register = async (req, res, next) => {
    const { username, password } = req.body;
    const pool = getPool();

    try {
        // Only allow registration if no admin exists, or specific logic
        // For a portfolio, we might only allow one admin to be created manually or via seed
        // Here, we'll restrict it to only one admin to keep it simple.
        const [existingUsers] = await pool.execute('SELECT COUNT(*) AS count FROM users WHERE role = "admin"');
        if (existingUsers[0].count > 0) {
            return next(new AppError('Admin user already exists. Registration denied.', 403));
        }

        const hashedPassword = await hashPassword(password);
        const [result] = await pool.execute(
            'INSERT INTO users (username, password, role) VALUES (?, ?, ?)',
            [username, hashedPassword, 'admin']
        );

        if (result.affectedRows === 0) {
            return next(new AppError('User registration failed.', 500));
        }

        const newUser = { id: result.insertId, username, role: 'admin' };
        const token = signToken(newUser);

        res.status(201).json({
            status: 'success',
            token,
            user: {
                id: newUser.id,
                username: newUser.username,
                role: newUser.role,
            },
        });
    } catch (err) {
        logger.error('Registration error:', err);
        next(new AppError('Failed to register user. Possible duplicate username.', 400));
    }
};

exports.login = async (req, res, next) => {
    const { username, password } = req.body;
    const pool = getPool();

    if (!username || !password) {
        return next(new AppError('Please provide username and password!', 400));
    }

    try {
        const [users] = await pool.execute('SELECT * FROM users WHERE username = ?', [username]);

        if (users.length === 0) {
            return next(new AppError('Incorrect username or password.', 401));
        }

        const user = users[0];
        const isMatch = await comparePassword(password, user.password);

        if (!isMatch) {
            return next(new AppError('Incorrect username or password.', 401));
        }

        const token = signToken(user);

        res.status(200).json({
            status: 'success',
            token,
            user: {
                id: user.id,
                username: user.username,
                role: user.role,
            },
        });
    } catch (err) {
        logger.error('Login error:', err);
        next(new AppError('Login failed due to a server error.', 500));
    }
};

module.exports.initializeAdmin = initializeAdmin; // Export for server startup
