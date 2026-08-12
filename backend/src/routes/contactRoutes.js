// backend/src/routes/contactRoutes.js
const express = require('express');
const contactController = require('../controllers/contactController');
const { authenticateToken, authorizeRoles } = require('../middleware/auth');
const { contactMessageValidationRules, idParamValidationRule, handleValidationErrors } = require('../middleware/validation');

const router = express.Router();

// Public route for submitting contact form
router.post(
    '/',
    contactMessageValidationRules(),
    handleValidationErrors,
    contactController.submitContactForm
);

// Admin-only routes for managing messages
router.get(
    '/',
    authenticateToken,
    authorizeRoles('admin'),
    contactController.getAllContactMessages
);
router.get(
    '/:id',
    authenticateToken,
    authorizeRoles('admin'),
    idParamValidationRule(),
    handleValidationErrors,
    contactController.getContactMessageById
);
router.patch(
    '/:id/read',
    authenticateToken,
    authorizeRoles('admin'),
    idParamValidationRule(),
    handleValidationErrors,
    contactController.markMessageAsRead
);
router.delete(
    '/:id',
    authenticateToken,
    authorizeRoles('admin'),
    idParamValidationRule(),
    handleValidationErrors,
    contactController.deleteContactMessage
);

module.exports = router;