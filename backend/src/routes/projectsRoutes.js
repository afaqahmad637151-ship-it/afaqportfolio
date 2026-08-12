// backend/src/routes/projectsRoutes.js
const express = require('express');
const projectsController = require('../controllers/projectsController');
const { authenticateToken, authorizeRoles } = require('../middleware/auth');
const { projectValidationRules, idParamValidationRule, handleValidationErrors } = require('../middleware/validation');

const router = express.Router();

// Public routes
router.get('/', projectsController.getAllProjects);
router.get('/:id', idParamValidationRule(), handleValidationErrors, projectsController.getProjectById);

// Admin-only routes (requires authentication and admin role)
router.post(
    '/',
    authenticateToken,
    authorizeRoles('admin'),
    projectValidationRules(),
    handleValidationErrors,
    projectsController.createProject
);
router.put(
    '/:id',
    authenticateToken,
    authorizeRoles('admin'),
    idParamValidationRule(),
    projectValidationRules(),
    handleValidationErrors,
    projectsController.updateProject
);
router.delete(
    '/:id',
    authenticateToken,
    authorizeRoles('admin'),
    idParamValidationRule(),
    handleValidationErrors,
    projectsController.deleteProject
);

module.exports = router;