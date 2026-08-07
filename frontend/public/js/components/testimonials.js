// frontend/public/js/components/testimonials.js

import { getTestimonials } from '../api.js';

/**
 * Renders a star rating.
 * @param {number} rating - The rating value (1-5).
 * @returns {string} - HTML string for star icons.
 */
function renderStarRating(rating) {
    let stars = '';
    for (let i = 1; i <= 5; i++) {
        stars += `<i class="fas fa-star ${i <= rating ? 'filled' : ''}"></i>`;
    }
    return `<div class="star-rating">${stars}</div>`;
}

/**
 * Renders a single testimonial card.
 * @param {object} testimonial - The testimonial object.
 * @returns {string} - HTML string for the testimonial card.
 */
function renderTestimonialCard(testimonial) {
    return `
        <div class="testimonial-card glassmorphism-card">
            <img src="${testimonial.avatar_url}" alt="${testimonial.client_name} Avatar" class="testimonial-avatar">
            <p class="testimonial-quote">"${testimonial.quote}"</p>
            <h4 class="testimonial-client-name">${testimonial.client_name}</h4>
            <p class="testimonial-client-title">${testimonial.client_title}</p>
            ${renderStarRating(testimonial.rating)}
        </div>
    `;
}

/**
 * Fetches and renders all testimonials.
 */
export async function loadTestimonials() {
    const testimonialsCarousel = document.getElementById('testimonials-carousel');
    if (!testimonialsCarousel) return;

    try {
        const response = await getTestimonials();
        const testimonials = response.data.testimonials;

        testimonialsCarousel.innerHTML = testimonials.map(renderTestimonialCard).join('');

        // Re-trigger ScrollTrigger refresh after content load
        if (window.ScrollTrigger) {
            window.ScrollTrigger.refresh();
        }

    } catch (error) {
        console.error('Error loading testimonials:', error);
        testimonialsCarousel.innerHTML = '<p class="error-message">Failed to load testimonials. Please try again later.</p>';
    }
}