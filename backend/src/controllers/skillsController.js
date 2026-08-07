// backend/src/controllers/skillsController.js
const { getPool } = require('../db/db');
const AppError = require('../utils/appError');

exports.getAllSkills = async (req, res, next) => {
    const pool = getPool();
    try {
        const [rows] = await pool.execute('SELECT * FROM skills ORDER BY category, order_index, name');
        res.status(200).json({
            status: 'success',
            results: rows.length,
            data: {
                skills: rows,
            },
        });
    } catch (err) {
        next(new AppError('Failed to retrieve skills.', 500));
    }
};

exports.getSkillById = async (req, res, next) => {
    const { id } = req.params;
    const pool = getPool();
    try {
        const [rows] = await pool.execute('SELECT * FROM skills WHERE id = ?', [id]);
        if (rows.length === 0) {
            return next(new AppError(`No skill found with ID: ${id}`, 404));
        }
        res.status(200).json({
            status: 'success',
            data: {
                skill: rows[0],
            },
        });
    } catch (err) {
        next(new AppError(`Failed to retrieve skill with ID: ${id}.`, 500));
    }
};

exports.createSkill = async (req, res, next) => {
    const { category, name, icon_class, order_index } = req.body;
    const pool = getPool();
    try {
        const [result] = await pool.execute(
            'INSERT INTO skills (category, name, icon_class, order_index) VALUES (?, ?, ?, ?)',
            [category, name, icon_class, order_index]
        );

        if (result.affectedRows === 0) {
            return next(new AppError('Failed to create skill.', 500));
        }

        const newSkill = { id: result.insertId, category, name, icon_class, order_index };
        res.status(201).json({
            status: 'success',
            data: {
                skill: newSkill,
            },
        });
    } catch (err) {
        next(new AppError('Failed to create skill. Possible duplicate name or invalid data.', 400));
    }
};

exports.updateSkill = async (req, res, next) => {
    const { id } = req.params;
    const { category, name, icon_class, order_index } = req.body;
    const pool = getPool();

    try {
        const [result] = await pool.execute(
            'UPDATE skills SET category = ?, name = ?, icon_class = ?, order_index = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
            [category, name, icon_class, order_index, id]
        );

        if (result.affectedRows === 0) {
            return next(new AppError(`No skill found with ID: ${id} to update.`, 404));
        }

        res.status(200).json({
            status: 'success',
            message: 'Skill updated successfully.',
            data: {
                skill: { id, category, name, icon_class, order_index }
            }
        });
    } catch (err) {
        next(new AppError(`Failed to update skill with ID: ${id}. Possible duplicate name or invalid data.`, 400));
    }
};

exports.deleteSkill = async (req, res, next) => {
    const { id } = req.params;
    const pool = getPool();
    try {
        const [result] = await pool.execute('DELETE FROM skills WHERE id = ?', [id]);
        if (result.affectedRows === 0) {
            return next(new AppError(`No skill found with ID: ${id} to delete.`, 404));
        }
        res.status(204).json({
            status: 'success',
            data: null,
        });
    } catch (err) {
        next(new AppError(`Failed to delete skill with ID: ${id}.`, 500));
    }
};