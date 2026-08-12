// backend/src/middleware/validation.js
const { body, param, validationResult } = require('express-validator');
const AppError = require('../utils/appError');

const handleValidationErrors = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        const errorMessages = errors.array().map(err => err.msg);
        return next(new AppError(errorMessages.join(', '), 400));
    }
    next();
};

const userValidationRules = () => {
    return [
        body('username')
            .trim()
            .notEmpty().withMessage('Username is required')
            .isLength({ min: 3 }).withMessage('Username must be at least 3 characters long'),
        body('password')
            .notEmpty().withMessage('Password is required')
            .isLength({ min: 6 }).withMessage('Password must be at least 6 characters long'),
    ];
};

const projectValidationRules = () => {
    return [
        body('title').trim().notEmpty().withMessage('Project title is required').isLength({ max: 255 }).withMessage('Title too long'),
        body('description').trim().notEmpty().withMessage('Project description is required'),
        body('tech_stack').notEmpty().withMessage('Technology stack is required').isArray().withMessage('Tech stack must be an array'),
        body('github_url').optional({ nullable: true, checkFalsy: true }).isURL().withMessage('Invalid GitHub URL'),
        body('live_demo_url').optional({ nullable: true, checkFalsy: true }).isURL().withMessage('Invalid Live Demo URL'),
        body('image_url').optional({ nullable: true, checkFalsy: true }).isURL().withMessage('Invalid Image URL'),
        body('video_url').optional({ nullable: true, checkFalsy: true }).isURL().withMessage('Invalid Video URL'),
    ];
};

const skillValidationRules = () => {
    return [
        body('category').trim().notEmpty().withMessage('Skill category is required').isLength({ max: 255 }).withMessage('Category too long'),
        body('name').trim().notEmpty().withMessage('Skill name is required').isLength({ max: 255 }).withMessage('Name too long'),
        body('icon_class').optional({ nullable: true, checkFalsy: true }).isLength({ max: 255 }).withMessage('Icon class too long'),
        body('order_index').optional().isInt({ min: 0 }).withMessage('Order index must be a non-negative integer'),
    ];
};

const serviceValidationRules = () => {
    return [
        body('title').trim().notEmpty().withMessage('Service title is required').isLength({ max: 255 }).withMessage('Title too long'),
        body('description').trim().notEmpty().withMessage('Service description is required'),
        body('icon_class').optional({ nullable: true, checkFalsy: true }).isLength({ max: 255 }).withMessage('Icon class too long'),
        body('order_index').optional().isInt({ min: 0 }).withMessage('Order index must be a non-negative integer'),
    ];
};

const testimonialValidationRules = () => {
    return [
        body('client_name').trim().notEmpty().withMessage('Client name is required').isLength({ max: 255 }).withMessage('Client name too long'),
        body('client_title').optional({ nullable: true, checkFalsy: true }).isLength({ max: 255 }).withMessage('Client title too long'),
        body('quote').trim().notEmpty().withMessage('Testimonial quote is required'),
        body('avatar_url').optional({ nullable: true, checkFalsy: true }).isURL().withMessage('Invalid avatar URL'),
        body('rating').optional().isInt({ min: 1, max: 5 }).withMessage('Rating must be between 1 and 5'),
    ];
};

const contactMessageValidationRules = () => {
    return [
        body('name').trim().notEmpty().withMessage('Name is required').isLength({ max: 255 }).withMessage('Name too long'),
        body('email').trim().notEmpty().withMessage('Email is required').isEmail().withMessage('Invalid email format'),
        body('subject').optional({ nullable: true, checkFalsy: true }).isLength({ max: 255 }).withMessage('Subject too long'),
        body('message').trim().notEmpty().withMessage('Message is required'),
    ];
};

const idParamValidationRule = (paramName = 'id') => {
    return [
        param(paramName).isInt({ gt: 0 }).withMessage(`${paramName} must be a positive integer`),
    ];
};

module.exports = {
    handleValidationErrors,
    userValidationRules,
    projectValidationRules,
    skillValidationRules,
    serviceValidationRules,
    testimonialValidationRules,
    contactMessageValidationRules,
    idParamValidationRule,
};