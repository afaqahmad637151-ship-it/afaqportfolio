// backend/src/controllers/testimonialsController.js
const { getPool } = require('../db/db');
const AppError = require('../utils/appError');

exports.getAllTestimonials = async (req, res, next) => {
    const pool = getPool();
    try {
        const [rows] = await pool.execute('SELECT * FROM testimonials ORDER BY created_at DESC');
        res.status(200).json({
            status: 'success',
            results: rows.length,
            data: {
                testimonials: rows,
            },
        });
    } catch (err) {
        next(new AppError('Failed to retrieve testimonials.', 500));
    }
};

exports.getTestimonialById = async (req, res, next) => {
    const { id } = req.params;
    const pool = getPool();
    try {
        const [rows] = await pool.execute('SELECT * FROM testimonials WHERE id = ?', [id]);
        if (rows.length === 0) {
            return next(new AppError(`No testimonial found with ID: ${id}`, 404));
        }
        res.status(200).json({
            status: 'success',
            data: {
                testimonial: rows[0],
            },
        });
    } catch (err) {
        next(new AppError(`Failed to retrieve testimonial with ID: ${id}.`, 500));
    }
};

exports.createTestimonial = async (req, res, next) => {
    const { client_name, client_title, avatar_url, quote, rating } = req.body;
    const pool = getPool();
    try {
        const [result] = await pool.execute(
            'INSERT INTO testimonials (client_name, client_title, avatar_url, quote, rating) VALUES (?, ?, ?, ?, ?)',
            [client_name, client_title, avatar_url, quote, rating]
        );

        if (result.affectedRows === 0) {
            return next(new AppError('Failed to create testimonial.', 500));
        }

        const newTestimonial = { id: result.insertId, client_name, client_title, avatar_url, quote, rating };
        res.status(201).json({
            status: 'success',
            data: {
                testimonial: newTestimonial,
            },
        });
    } catch (err) {
        next(new AppError('Failed to create testimonial. Invalid data.', 400));
    }
};

exports.updateTestimonial = async (req, res, next) => {
    const { id } = req.params;
    const { client_name, client_title, avatar_url, quote, rating } = req.body;
    const pool = getPool();

    try {
        const [result] = await pool.execute(
            'UPDATE testimonials SET client_name = ?, client_title = ?, avatar_url = ?, quote = ?, rating = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
            [client_name, client_title, avatar_url, quote, rating, id]
        );

        if (result.affectedRows === 0) {
            return next(new AppError(`No testimonial found with ID: ${id} to update.`, 404));
        }

        res.status(200).json({
            status: 'success',
            message: 'Testimonial updated successfully.',
            data: {
                testimonial: { id, client_name, client_title, avatar_url, quote, rating }
            }
        });
    } catch (err) {
        next(new AppError(`Failed to update testimonial with ID: ${id}. Invalid data.`, 400));
    }
};

exports.deleteTestimonial = async (req, res, next) => {
    const { id } = req.params;
    const pool = getPool();
    try {
        const [result] = await pool.execute('DELETE FROM testimonials WHERE id = ?', [id]);
        if (result.affectedRows === 0) {
            return next(new AppError(`No testimonial found with ID: ${id} to delete.`, 404));
        }
        res.status(204).json({
            status: 'success',
            data: null,
        });
    } catch (err) {
        next(new AppError(`Failed to delete testimonial with ID: ${id}.`, 500));
    }
};