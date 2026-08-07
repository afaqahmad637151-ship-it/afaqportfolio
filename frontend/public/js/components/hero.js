// frontend/public/js/components/hero.js

import { typewriterEffect } from '../utils.js';

/**
 * Initializes the Hero section specific functionalities.
 */
export function initializeHero() {
    const typingTextElement = document.getElementById('typing-text');
    if (typingTextElement) {
        const texts = [
            'Full Stack Developer',
            'Frontend Engineer',
            'Backend Developer',
            'AI Developer',
            'MERN Stack Developer',
            'Next.js Developer'
        ];
        typewriterEffect(typingTextElement, texts, 100, 1500);
    }

    // Additional hero-specific logic can go here.
    // Animations are primarily handled by animations.js
}