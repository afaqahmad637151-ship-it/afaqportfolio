// frontend/public/js/utils.js

/**
 * Utility functions for the portfolio website.
 */

// Global state for theme management
export const appState = {
    isDarkMode: localStorage.getItem('theme') === 'dark' || (!localStorage.getItem('theme') && window.matchMedia('(prefers-color-scheme: dark)').matches),
    isAIAssistantOpen: false,
    backendUrl: 'http://localhost:5000/api', // Replace with your production backend URL
    adminToken: localStorage.getItem('adminToken') || null,
};

/**
 * Initializes dark mode based on user preference or system settings.
 */
export function initializeDarkMode() {
    if (appState.isDarkMode) {
        document.body.classList.add('dark-mode');
    } else {
        document.body.classList.remove('dark-mode');
    }
}

/**
 * Toggles dark/light mode.
 */
export function toggleDarkMode() {
    appState.isDarkMode = !appState.isDarkMode;
    if (appState.isDarkMode) {
        document.body.classList.add('dark-mode');
        localStorage.setItem('theme', 'dark');
    } else {
        document.body.classList.remove('dark-mode');
        localStorage.setItem('theme', 'light');
    }
}

/**
 * Typewriter effect for text.
 * @param {HTMLElement} element - The DOM element to apply the typing effect to.
 * @param {string[]} texts - An array of strings to type out.
 * @param {number} speed - Typing speed in milliseconds per character.
 * @param {number} delay - Delay before starting the next text.
 */
export function typewriterEffect(element, texts, speed = 100, delay = 1500) {
    let textIndex = 0;
    let charIndex = 0;
    let isDeleting = false;

    function type() {
        const currentText = texts[textIndex];
        if (isDeleting) {
            element.textContent = currentText.substring(0, charIndex - 1);
            charIndex--;
        } else {
            element.textContent = currentText.substring(0, charIndex + 1);
            charIndex++;
        }

        let typeSpeed = speed;
        if (isDeleting) typeSpeed /= 2; // Faster deleting

        if (!isDeleting && charIndex === currentText.length) {
            typeSpeed = delay; // Pause at end of typing
            isDeleting = true;
        } else if (isDeleting && charIndex === 0) {
            isDeleting = false;
            textIndex = (textIndex + 1) % texts.length;
            typeSpeed = 500; // Delay before starting new text
        }

        setTimeout(type, typeSpeed);
    }

    type();
}

/**
 * Updates the scroll progress indicator.
 */
export function updateScrollProgress() {
    const scrollProgress = document.getElementById('scroll-progress-indicator');
    if (!scrollProgress) return;

    const { scrollTop, scrollHeight, clientHeight } = document.documentElement;
    const progress = (scrollTop / (scrollHeight - clientHeight)) * 100;
    scrollProgress.style.width = `${progress}%`;
}

/**
 * Initializes and updates the custom cursor glow effect.
 */
export function initializeCursorGlow() {
    const cursorGlow = document.getElementById('cursor-glow');
    if (!cursorGlow) return;

    document.addEventListener('mousemove', (e) => {
        cursorGlow.style.left = `${e.clientX}px`;
        cursorGlow.style.top = `${e.clientY}px`;
    });

    document.addEventListener('mousedown', () => {
        cursorGlow.classList.add('hovered');
    });

    document.addEventListener('mouseup', () => {
        cursorGlow.classList.remove('hovered');
    });

    // Add subtle scaling on hover for interactive elements
    document.querySelectorAll('a, button, .btn, .card').forEach(el => {
        el.addEventListener('mouseenter', () => cursorGlow.classList.add('hovered'));
        el.addEventListener('mouseleave', () => cursorGlow.classList.remove('hovered'));
    });
}

/**
 * Helper to show temporary messages (e.g., form submissions).
 * @param {HTMLElement} element - The DOM element to display the message in.
 * @param {string} message - The message text.
 * @param {'success'|'error'} type - The type of message.
 * @param {number} duration - How long to show the message in ms.
 */
export function showMessage(element, message, type, duration = 3000) {
    element.textContent = message;
    element.className = `form-message ${type}`;
    setTimeout(() => {
        element.textContent = '';
        element.className = 'form-message';
    }, duration);
}

/**
 * Get the current year for the footer.
 */
export function getCurrentYear() {
    const yearElement = document.getElementById('current-year');
    if (yearElement) {
        yearElement.textContent = new Date().getFullYear();
    }
}

/**
 * Handles navigation to sections for smooth scrolling.
 * @param {Event} event - The click event.
 */
export function handleSmoothScrollNav(event) {
    event.preventDefault();
    const targetId = event.currentTarget.getAttribute('href').substring(1);
    const targetElement = document.getElementById(targetId);
    if (targetElement) {
        // Use Lenis scroll if available, otherwise native smooth scroll
        if (window.lenisInstance) {
            window.lenisInstance.scrollTo(targetElement, { offset: -70 }); // Adjust offset for fixed header
        } else {
            targetElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
            window.scrollBy(0, -70); // Adjust for fixed header
        }
    }
    // Close mobile nav if open
    const navLinks = document.querySelector('.nav-links');
    if (navLinks && navLinks.classList.contains('active')) {
        navLinks.classList.remove('active');
        document.querySelector('.menu-toggle').classList.remove('active');
    }
}

/**
 * Highlight active nav link based on scroll position.
 */
export function highlightNavLink() {
    const sections = document.querySelectorAll('section');
    const navLinks = document.querySelectorAll('.nav-link');
    let currentActive = null;

    sections.forEach(section => {
        const sectionTop = section.offsetTop - 100; // Offset for fixed header
        const sectionBottom = sectionTop + section.clientHeight;
        const scrollPosition = window.scrollY;

        if (scrollPosition >= sectionTop && scrollPosition < sectionBottom) {
            currentActive = section.id;
        }
    });

    navLinks.forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('href').includes(currentActive)) {
            link.classList.add('active');
        }
    });
}