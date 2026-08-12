// backend/src/controllers/projectsController.js
const { getPool } = require('../db/db');
const AppError = require('../utils/appError');

exports.getAllProjects = async (req, res, next) => {
    const pool = getPool();
    try {
        const [rows] = await pool.execute('SELECT * FROM projects ORDER BY created_at DESC');
        // Ensure tech_stack is parsed from JSON string
        const projects = rows.map(project => ({
            ...project,
            tech_stack: JSON.parse(project.tech_stack || '[]')
        }));
        res.status(200).json({
            status: 'success',
            results: projects.length,
            data: {
                projects,
            },
        });
    } catch (err) {
        next(new AppError('Failed to retrieve projects.', 500));
    }
};

exports.getProjectById = async (req, res, next) => {
    const { id } = req.params;
    const pool = getPool();
    try {
        const [rows] = await pool.execute('SELECT * FROM projects WHERE id = ?', [id]);
        if (rows.length === 0) {
            return next(new AppError(`No project found with ID: ${id}`, 404));
        }
        const project = {
            ...rows[0],
            tech_stack: JSON.parse(rows[0].tech_stack || '[]')
        };
        res.status(200).json({
            status: 'success',
            data: {
                project,
            },
        });
    } catch (err) {
        next(new AppError(`Failed to retrieve project with ID: ${id}.`, 500));
    }
};

exports.createProject = async (req, res, next) => {
    const { title, description, image_url, video_url, tech_stack, github_url, live_demo_url } = req.body;
    const pool = getPool();
    try {
        const [result] = await pool.execute(
            'INSERT INTO projects (title, description, image_url, video_url, tech_stack, github_url, live_demo_url) VALUES (?, ?, ?, ?, ?, ?, ?)',
            [title, description, image_url, video_url, JSON.stringify(tech_stack), github_url, live_demo_url]
        );

        if (result.affectedRows === 0) {
            return next(new AppError('Failed to create project.', 500));
        }

        const newProject = { id: result.insertId, title, description, image_url, video_url, tech_stack, github_url, live_demo_url };
        res.status(201).json({
            status: 'success',
            data: {
                project: newProject,
            },
        });
    } catch (err) {
        next(new AppError('Failed to create project. Possible duplicate title or invalid data.', 400));
    }
};

exports.updateProject = async (req, res, next) => {
    const { id } = req.params;
    const { title, description, image_url, video_url, tech_stack, github_url, live_demo_url } = req.body;
    const pool = getPool();

    try {
        const [result] = await pool.execute(
            'UPDATE projects SET title = ?, description = ?, image_url = ?, video_url = ?, tech_stack = ?, github_url = ?, live_demo_url = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
            [title, description, image_url, video_url, JSON.stringify(tech_stack), github_url, live_demo_url, id]
        );

        if (result.affectedRows === 0) {
            return next(new AppError(`No project found with ID: ${id} to update.`, 404));
        }

        res.status(200).json({
            status: 'success',
            message: 'Project updated successfully.',
            data: {
                project: { id, title, description, image_url, video_url, tech_stack, github_url, live_demo_url }
            }
        });
    } catch (err) {
        next(new AppError(`Failed to update project with ID: ${id}. Possible duplicate title or invalid data.`, 400));
    }
};

exports.deleteProject = async (req, res, next) => {
    const { id } = req.params;
    const pool = getPool();
    try {
        const [result] = await pool.execute('DELETE FROM projects WHERE id = ?', [id]);
        if (result.affectedRows === 0) {
            return next(new AppError(`No project found with ID: ${id} to delete.`, 404));
        }
        res.status(204).json({
            status: 'success',
            data: null,
        });
    } catch (err) {
        next(new AppError(`Failed to delete project with ID: ${id}.`, 500));
    }
};