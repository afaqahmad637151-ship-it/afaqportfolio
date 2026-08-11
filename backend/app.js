// backend/src/app.js
const express = require('express');
const morgan = require('morgan');
const config = require('./config');
const { corsMiddleware, helmetMiddleware, apiLimiter } = require('./middleware/security');
const errorHandler = require('./middleware/errorHandler');
const AppError = require('./utils/appError');
const logger = require('./utils/logger');

// Import Routes
const authRoutes = require('./routes/authRoutes');
const projectsRoutes = require('./routes/projectsRoutes');
const skillsRoutes = require('./routes/skillsRoutes');
const testimonialsRoutes = require('./routes/testimonialsRoutes');
const servicesRoutes = require('./routes/servicesRoutes');
const contactRoutes = require('./routes/contactRoutes');

const app = express();

// 1. GLOBAL MIDDLEWARES

// Enable CORS
app.use(corsMiddleware);

// Set security HTTP headers
app.use(helmetMiddleware);

// Development logging
if (config.nodeEnv === 'development') {
    app.use(morgan('dev'));
}

// Limit requests from same API
app.use('/api', apiLimiter);

// Body parser, reading data from body into req.body
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));

// Serving static files (e.g., frontend admin panel if deployed together)
// For this setup, we're assuming the frontend is served separately or by a web server like Nginx/Apache.
// If you want to serve the admin frontend directly from Express:
// app.use(express.static('public/admin')); // Assuming admin.html and its assets are here.

// 2. ROUTES
app.get('/', (req, res) => {
    res.send('Afaq Ahmad Portfolio API is running!');
});

app.use('/api/auth', authRoutes);
app.use('/api/projects', projectsRoutes);
app.use('/api/skills', skillsRoutes);
app.use('/api/testimonials', testimonialsRoutes);
app.use('/api/services', servicesRoutes);
app.use('/api/contact', contactRoutes);

// Handle undefined routes
app.all('*', (req, res, next) => {
    next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
});

// 3. GLOBAL ERROR HANDLER
app.use(errorHandler);

module.exports = app;