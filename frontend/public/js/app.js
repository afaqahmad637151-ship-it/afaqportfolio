// frontend/public/js/app.js

// Import utility functions
import {
    initializeDarkMode,
    toggleDarkMode,
    updateScrollProgress,
    initializeCursorGlow,
    getCurrentYear,
    handleSmoothScrollNav,
    highlightNavLink,
} from './utils.js';

// Import animation functions
import { initializeAnimations } from './animations.js';

// Import component-specific loading functions
import { initializeHero } from './components/hero.js';
// import { initializeAbout } from './components/about.js'; // Static content, no specific JS for now
import { loadSkills } from './components/skills.js';
import { loadServices } from './components/services.js';
import { loadProjects } from './components/portfolio.js';
import { loadTestimonials } from './components/testimonials.js';
import { initializeContactForm, initializeAIAssistant } from './components/contact.js';

/**
 * Main application initialization function.
 */
document.addEventListener('DOMContentLoaded', () => {
    // 1. Initialize Global Utilities
    initializeDarkMode();
    getCurrentYear();
    initializeCursorGlow();

    // 2. Setup Event Listeners
    setupEventListeners();

    // 3. Initialize Animations (GSAP, ScrollTrigger, Lenis)
    initializeAnimations();

    // 4. Initialize Components & Load Dynamic Data
    initializeHero();
    // initializeAbout(); // If it had dynamic parts
    loadSkills();
    loadServices();
    loadProjects();
    loadTestimonials();
    initializeContactForm();
    initializeAIAssistant(); // For the AI Chat Widget
});

/**
 * Sets up global event listeners.
 */
function setupEventListeners() {
    // Dark Mode Toggle
    const darkModeToggle = document.getElementById('dark-mode-toggle');
    if (darkModeToggle) {
        darkModeToggle.addEventListener('click', toggleDarkMode);
    }

    // Scroll Progress Indicator
    window.addEventListener('scroll', updateScrollProgress);

    // Smooth Scroll Navigation (for internal links)
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', handleSmoothScrollNav);
    });

    // Highlight active nav link on scroll
    window.addEventListener('scroll', highlightNavLink);
    window.addEventListener('resize', highlightNavLink);
    // Initial call
    highlightNavLink();

    // Mobile Navigation Toggle
    const menuToggle = document.querySelector('.menu-toggle');
    const navLinks = document.querySelector('.nav-links');
    if (menuToggle && navLinks) {
        menuToggle.addEventListener('click', () => {
            navLinks.classList.toggle('active');
            menuToggle.classList.toggle('active');
        });
    }

    // Close mobile nav when clicking outside (optional, but good UX)
    document.addEventListener('click', (e) => {
        if (navLinks && menuToggle && navLinks.classList.contains('active') && !navLinks.contains(e.target) && !menuToggle.contains(e.target)) {
            navLinks.classList.remove('active');
            menuToggle.classList.remove('active');
        }
    });
}