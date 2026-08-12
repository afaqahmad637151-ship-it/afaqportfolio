// backend/src/routes/skillsRoutes.js
const express = require('express');
const skillsController = require('../controllers/skillsController');
const { authenticateToken, authorizeRoles } = require('../middleware/auth');
const { skillValidationRules, idParamValidationRule, handleValidationErrors } = require('../middleware/validation');

const router = express.Router();

// Public routes
router.get('/', skillsController.getAllSkills);
router.get('/:id', idParamValidationRule(), handleValidationErrors, skillsController.getSkillById);

// Admin-only routes
router.post(
    '/',
    authenticateToken,
    authorizeRoles('admin'),
    skillValidationRules(),
    handleValidationErrors,
    skillsController.createSkill
);
router.put(
    '/:id',
    authenticateToken,
    authorizeRoles('admin'),
    idParamValidationRule(),
    skillValidationRules(),
    handleValidationErrors,
    skillsController.updateSkill
);
router.delete(
    '/:id',
    authenticateToken,
    authorizeRoles('admin'),
    idParamValidationRule(),
    handleValidationErrors,
    skillsController.deleteSkill
);

module.exports = router;