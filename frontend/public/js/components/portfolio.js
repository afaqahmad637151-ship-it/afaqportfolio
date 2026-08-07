// frontend/public/js/components/portfolio.js

import { getProjects } from '../api.js';

/**
 * Renders a single project card.
 * @param {object} project - The project object.
 * @returns {string} - HTML string for the project card.
 */
function renderProjectCard(project) {
    const techStackHtml = project.tech_stack
        .map(tech => `<span>${tech}</span>`)
        .join('');

    return `
        <div class="project-card glassmorphism-card">
            <img src="${project.image_url}" alt="${project.title} Project Image">
            <div class="project-content">
                <h3>${project.title}</h3>
                <p>${project.description}</p>
                <div class="project-tech-stack">
                    ${techStackHtml}
                </div>
                <div class="project-actions">
                    ${project.live_demo_url ? `<a href="${project.live_demo_url}" target="_blank" class="btn btn-primary btn-sm"><i class="fas fa-external-link-alt"></i> Live Demo</a>` : ''}
                    ${project.github_url ? `<a href="${project.github_url}" target="_blank" class="btn btn-outline btn-sm"><i class="fab fa-github"></i> GitHub</a>` : ''}
                </div>
            </div>
        </div>
    `;
}

/**
 * Fetches and renders all projects.
 */
export async function loadProjects() {
    const portfolioGrid = document.getElementById('portfolio-grid');
    if (!portfolioGrid) return;

    try {
        const response = await getProjects();
        const projects = response.data.projects;

        portfolioGrid.innerHTML = projects.map(renderProjectCard).join('');

        // Re-trigger ScrollTrigger refresh after content load
        if (window.ScrollTrigger) {
            window.ScrollTrigger.refresh();
        }

    } catch (error) {
        console.error('Error loading projects:', error);
        portfolioGrid.innerHTML = '<p class="error-message">Failed to load projects. Please try again later.</p>';
    }
}