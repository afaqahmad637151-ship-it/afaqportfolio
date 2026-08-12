// backend/src/routes/authRoutes.js
const express = require('express');
const authController = require('../controllers/authController');
const { userValidationRules, handleValidationErrors } = require('../middleware/validation');
const { authenticateToken, authorizeRoles } = require('../middleware/auth');

const router = express.Router();

// Public route for admin login
router.post('/login', userValidationRules(), handleValidationErrors, authController.login);

// Admin-only route for creating new admin users (only if no admin exists)
router.post('/register', authenticateToken, authorizeRoles('admin'), userValidationRules(), handleValidationErrors, authController.register);

module.exports = router;