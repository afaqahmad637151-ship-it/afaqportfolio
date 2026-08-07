// frontend/public/js/components/services.js

import { getServices } from '../api.js';

/**
 * Renders a single service card.
 * @param {object} service - The service object.
 * @returns {string} - HTML string for the service card.
 */
function renderServiceCard(service) {
    const iconClass = service.icon_class ? service.icon_class : 'fas fa-laptop-code'; // Fallback icon
    return `
        <div class="service-card glassmorphism-card">
            <i class="${iconClass}"></i>
            <h3>${service.title}</h3>
            <p>${service.description}</p>
        </div>
    `;
}

/**
 * Fetches and renders all services.
 */
export async function loadServices() {
    const servicesGrid = document.getElementById('services-grid');
    if (!servicesGrid) return;

    try {
        const response = await getServices();
        const services = response.data.services;

        servicesGrid.innerHTML = services.map(renderServiceCard).join('');

        // Re-trigger ScrollTrigger refresh after content load
        if (window.ScrollTrigger) {
            window.ScrollTrigger.refresh();
        }

    } catch (error) {
        console.error('Error loading services:', error);
        servicesGrid.innerHTML = '<p class="error-message">Failed to load services. Please try again later.</p>';
    }
}