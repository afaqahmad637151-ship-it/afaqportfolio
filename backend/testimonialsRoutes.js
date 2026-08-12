// backend/src/routes/testimonialsRoutes.js
const express = require('express');
const testimonialsController = require('../controllers/testimonialsController');
const { authenticateToken, authorizeRoles } = require('../middleware/auth');
const { testimonialValidationRules, idParamValidationRule, handleValidationErrors } = require('../middleware/validation');

const router = express.Router();

// Public routes
router.get('/', testimonialsController.getAllTestimonials);
router.get('/:id', idParamValidationRule(), handleValidationErrors, testimonialsController.getTestimonialById);

// Admin-only routes
router.post(
    '/',
    authenticateToken,
    authorizeRoles('admin'),
    testimonialValidationRules(),
    handleValidationErrors,
    testimonialsController.createTestimonial
);
router.put(
    '/:id',
    authenticateToken,
    authorizeRoles('admin'),
    idParamValidationRule(),
    testimonialValidationRules(),
    handleValidationErrors,
    testimonialsController.updateTestimonial
);
router.delete(
    '/:id',
    authenticateToken,
    authorizeRoles('admin'),
    idParamValidationRule(),
    handleValidationErrors,
    testimonialsController.deleteTestimonial
);

module.exports = router;