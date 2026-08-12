// backend/src/routes/servicesRoutes.js
const express = require('express');
const servicesController = require('../controllers/servicesController');
const { authenticateToken, authorizeRoles } = require('../middleware/auth');
const { serviceValidationRules, idParamValidationRule, handleValidationErrors } = require('../middleware/validation');

const router = express.Router();

// Public routes
router.get('/', servicesController.getAllServices);
router.get('/:id', idParamValidationRule(), handleValidationErrors, servicesController.getServiceById);

// Admin-only routes
router.post(
    '/',
    authenticateToken,
    authorizeRoles('admin'),
    serviceValidationRules(),
    handleValidationErrors,
    servicesController.createService
);
router.put(
    '/:id',
    authenticateToken,
    authorizeRoles('admin'),
    idParamValidationRule(),
    serviceValidationRules(),
    handleValidationErrors,
    servicesController.updateService
);
router.delete(
    '/:id',
    authenticateToken,
    authorizeRoles('admin'),
    idParamValidationRule(),
    handleValidationErrors,
    servicesController.deleteService
);

module.exports = router;