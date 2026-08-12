// backend/src/controllers/servicesController.js
const { getPool } = require('../db/db');
const AppError = require('../utils/appError');

exports.getAllServices = async (req, res, next) => {
    const pool = getPool();
    try {
        const [rows] = await pool.execute('SELECT * FROM services ORDER BY order_index, title');
        res.status(200).json({
            status: 'success',
            results: rows.length,
            data: {
                services: rows,
            },
        });
    } catch (err) {
        next(new AppError('Failed to retrieve services.', 500));
    }
};

exports.getServiceById = async (req, res, next) => {
    const { id } = req.params;
    const pool = getPool();
    try {
        const [rows] = await pool.execute('SELECT * FROM services WHERE id = ?', [id]);
        if (rows.length === 0) {
            return next(new AppError(`No service found with ID: ${id}`, 404));
        }
        res.status(200).json({
            status: 'success',
            data: {
                service: rows[0],
            },
        });
    } catch (err) {
        next(new AppError(`Failed to retrieve service with ID: ${id}.`, 500));
    }
};

exports.createService = async (req, res, next) => {
    const { title, description, icon_class, order_index } = req.body;
    const pool = getPool();
    try {
        const [result] = await pool.execute(
            'INSERT INTO services (title, description, icon_class, order_index) VALUES (?, ?, ?, ?)',
            [title, description, icon_class, order_index]
        );

        if (result.affectedRows === 0) {
            return next(new AppError('Failed to create service.', 500));
        }

        const newService = { id: result.insertId, title, description, icon_class, order_index };
        res.status(201).json({
            status: 'success',
            data: {
                service: newService,
            },
        });
    } catch (err) {
        next(new AppError('Failed to create service. Invalid data.', 400));
    }
};

exports.updateService = async (req, res, next) => {
    const { id } = req.params;
    const { title, description, icon_class, order_index } = req.body;
    const pool = getPool();

    try {
        const [result] = await pool.execute(
            'UPDATE services SET title = ?, description = ?, icon_class = ?, order_index = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
            [title, description, icon_class, order_index, id]
        );

        if (result.affectedRows === 0) {
            return next(new AppError(`No service found with ID: ${id} to update.`, 404));
        }

        res.status(200).json({
            status: 'success',
            message: 'Service updated successfully.',
            data: {
                service: { id, title, description, icon_class, order_index }
            }
        });
    } catch (err) {
        next(new AppError(`Failed to update service with ID: ${id}. Invalid data.`, 400));
    }
};

exports.deleteService = async (req, res, next) => {
    const { id } = req.params;
    const pool = getPool();
    try {
        const [result] = await pool.execute('DELETE FROM services WHERE id = ?', [id]);
        if (result.affectedRows === 0) {
            return next(new AppError(`No service found with ID: ${id} to delete.`, 404));
        }
        res.status(204).json({
            status: 'success',
            data: null,
        });
    } catch (err) {
        next(new AppError(`Failed to delete service with ID: ${id}.`, 500));
    }
};