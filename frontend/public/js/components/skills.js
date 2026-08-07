// frontend/public/js/components/skills.js

import { getSkills } from '../api.js';

/**
 * Renders a single skill card.
 * @param {object} skill - The skill object.
 * @returns {string} - HTML string for the skill card.
 */
function renderSkillCard(skill) {
    const iconClass = skill.icon_class ? skill.icon_class : 'fas fa-code'; // Fallback icon
    return `
        <div class="skill-card glassmorphism-card">
            ${iconClass.startsWith('devicon-') ? `<i class="${iconClass}"></i>` : `<i class="${iconClass}"></i>`}
            <h4>${skill.name}</h4>
        </div>
    `;
}

/**
 * Fetches and renders all skills.
 */
export async function loadSkills() {
    const skillsGrid = document.getElementById('skills-grid');
    if (!skillsGrid) return;

    try {
        const response = await getSkills();
        const skills = response.data.skills;

        // Group skills by category for display
        const categorizedSkills = skills.reduce((acc, skill) => {
            if (!acc[skill.category]) {
                acc[skill.category] = [];
            }
            acc[skill.category].push(skill);
            return acc;
        }, {});

        let skillsHtml = '';
        for (const category in categorizedSkills) {
            skillsHtml += `
                <div class="skill-category">
                    <h3 class="skill-category-title">${category}</h3>
                    <div class="skill-category-grid">
                        ${categorizedSkills[category].map(renderSkillCard).join('')}
                    </div>
                </div>
            `;
        }
        skillsGrid.innerHTML = skills.map(renderSkillCard).join(''); // Simplified for single grid, can be grouped
        // For categorized display:
        // skillsGrid.innerHTML = Object.keys(categorizedSkills).map(category => `
        //     <div class="skill-category-block">
        //         <h3 class="skill-category-heading">${category}</h3>
        //         <div class="skills-grid-inner">
        //             ${categorizedSkills[category].map(renderSkillCard).join('')}
        //         </div>
        //     </div>
        // `).join('');

        // Re-trigger ScrollTrigger refresh after content load
        if (window.ScrollTrigger) {
            window.ScrollTrigger.refresh();
        }

    } catch (error) {
        console.error('Error loading skills:', error);
        skillsGrid.innerHTML = '<p class="error-message">Failed to load skills. Please try again later.</p>';
    }
}