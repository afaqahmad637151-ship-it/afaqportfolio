// backend/src/controllers/contactController.js
const { getPool } = require('../db/db');
const AppError = require('../utils/appError');
const logger = require('../utils/logger');

exports.submitContactForm = async (req, res, next) => {
    const { name, email, subject, message } = req.body;
    const pool = getPool();
    try {
        const [result] = await pool.execute(
            'INSERT INTO contact_messages (name, email, subject, message) VALUES (?, ?, ?, ?)',
            [name, email, subject, message]
        );

        if (result.affectedRows === 0) {
            return next(new AppError('Failed to submit contact message.', 500));
        }

        res.status(201).json({
            status: 'success',
            message: 'Your message has been sent successfully! I will get back to you soon.',
            data: {
                message: { id: result.insertId, name, email, subject, message },
            },
        });
    } catch (err) {
        logger.error('Contact form submission error:', err);
        next(new AppError('Failed to submit message. Please try again later.', 500));
    }
};

exports.getAllContactMessages = async (req, res, next) => {
    const pool = getPool();
    try {
        const [rows] = await pool.execute('SELECT * FROM contact_messages ORDER BY created_at DESC');
        res.status(200).json({
            status: 'success',
            results: rows.length,
            data: {
                messages: rows,
            },
        });
    } catch (err) {
        next(new AppError('Failed to retrieve contact messages.', 500));
    }
};

exports.getContactMessageById = async (req, res, next) => {
    const { id } = req.params;
    const pool = getPool();
    try {
        const [rows] = await pool.execute('SELECT * FROM contact_messages WHERE id = ?', [id]);
        if (rows.length === 0) {
            return next(new AppError(`No contact message found with ID: ${id}`, 404));
        }
        res.status(200).json({
            status: 'success',
            data: {
                message: rows[0],
            },
        });
    } catch (err) {
        next(new AppError(`Failed to retrieve contact message with ID: ${id}.`, 500));
    }
};

exports.markMessageAsRead = async (req, res, next) => {
    const { id } = req.params;
    const pool = getPool();
    try {
        const [result] = await pool.execute('UPDATE contact_messages SET read_status = TRUE WHERE id = ?', [id]);
        if (result.affectedRows === 0) {
            return next(new AppError(`No contact message found with ID: ${id} to mark as read.`, 404));
        }
        res.status(200).json({
            status: 'success',
            message: `Message with ID: ${id} marked as read.`,
        });
    } catch (err) {
        next(new AppError(`Failed to mark message with ID: ${id} as read.`, 500));
    }
};

exports.deleteContactMessage = async (req, res, next) => {
    const { id } = req.params;
    const pool = getPool();
    try {
        const [result] = await pool.execute('DELETE FROM contact_messages WHERE id = ?', [id]);
        if (result.affectedRows === 0) {
            return next(new AppError(`No contact message found with ID: ${id} to delete.`, 404));
        }
        res.status(204).json({
            status: 'success',
            data: null,
        });
    } catch (err) {
        next(new AppError(`Failed to delete contact message with ID: ${id}.`, 500));
    }
};