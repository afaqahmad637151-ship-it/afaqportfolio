// frontend/public/js/admin.js

import * as api from './api.js';
import { appState, showMessage } from './utils.js';

document.addEventListener('DOMContentLoaded', () => {
    const loginSection = document.getElementById('admin-login-section');
    const dashboardSection = document.getElementById('admin-dashboard-section');
    const adminLoginForm = document.getElementById('admin-login-form');
    const loginMessage = document.getElementById('login-message');
    const adminUsernameDisplay = document.getElementById('admin-username-display');
    const adminLogoutBtn = document.getElementById('admin-logout-btn');
    const tabButtons = document.querySelectorAll('.tab-button');
    const tabContents = document.querySelectorAll('.tab-content');

    // --- General Admin UI Functions ---
    function checkAuthAndRender() {
        if (appState.adminToken) {
            loginSection.classList.add('hidden');
            dashboardSection.classList.remove('hidden');
            // Decode token to get username if needed, or assume 'admin'
            // For a production app, refresh token or verify on backend
            adminUsernameDisplay.textContent = 'Admin'; // Placeholder, ideally from token
            showTab('projects'); // Default tab
        } else {
            loginSection.classList.remove('hidden');
            dashboardSection.classList.add('hidden');
        }
    }

    function showTab(tabId) {
        tabContents.forEach(content => content.classList.add('hidden'));
        tabButtons.forEach(button => button.classList.remove('active'));

        document.getElementById(`tab-${tabId}`).classList.remove('hidden');
        document.querySelector(`.tab-button[data-tab="${tabId}"]`).classList.add('active');

        // Load data for the active tab
        switch (tabId) {
            case 'projects': loadProjectsAdmin(); break;
            case 'skills': loadSkillsAdmin(); break;
            case 'services': loadServicesAdmin(); break;
            case 'testimonials': loadTestimonialsAdmin(); break;
            case 'messages': loadMessagesAdmin(); break;
        }
    }

    // --- Authentication ---
    if (adminLoginForm) {
        adminLoginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const username = document.getElementById('login-username').value;
            const password = document.getElementById('login-password').value;

            try {
                const response = await api.loginAdmin(username, password);
                showMessage(loginMessage, 'Login successful!', 'success');
                checkAuthAndRender();
            } catch (error) {
                showMessage(loginMessage, error.message || 'Login failed.', 'error');
            }
        });
    }

    if (adminLogoutBtn) {
        adminLogoutBtn.addEventListener('click', () => {
            api.logoutAdmin();
            checkAuthAndRender();
            showMessage(loginMessage, 'Logged out successfully.', 'success');
        });
    }

    // --- Tab Navigation ---
    tabButtons.forEach(button => {
        button.addEventListener('click', () => {
            const tabId = button.dataset.tab;
            showTab(tabId);
        });
    });

    // --- Projects Management ---
    const projectList = document.getElementById('projects-list');
    const projectFormContainer = document.getElementById('project-form-container');
    const projectForm = document.getElementById('project-form');
    const addProjectBtn = document.getElementById('add-project-btn');
    const cancelProjectFormBtn = projectFormContainer.querySelector('.cancel-form-btn');
    const projectFormMessage = document.getElementById('project-form-message');

    function renderProjectItem(project) {
        const item = document.createElement('div');
        item.classList.add('data-item', 'glassmorphism-card');
        item.innerHTML = `
            <div class="data-item-content">
                <h4>${project.title}</h4>
                <p>${project.description.substring(0, 100)}${project.description.length > 100 ? '...' : ''}</p>
                <div class="item-tags">${project.tech_stack.map(t => `<span>${t}</span>`).join('')}</div>
            </div>
            <div class="data-item-actions">
                <button class="btn btn-info btn-sm edit-project-btn" data-id="${project.id}">Edit</button>
                <button class="btn btn-danger btn-sm delete-project-btn" data-id="${project.id}">Delete</button>
            </div>
        `;
        return item;
    }

    async function loadProjectsAdmin() {
        try {
            const response = await api.getProjects();
            projectList.innerHTML = '';
            response.data.projects.forEach(project => projectList.appendChild(renderProjectItem(project)));
            setupProjectEventListeners();
        } catch (error) {
            showMessage(projectFormMessage, error.message || 'Failed to load projects.', 'error');
            projectList.innerHTML = '<p class="form-message error">Failed to load projects.</p>';
        }
    }

    function showProjectForm(project = {}) {
        document.getElementById('project-id').value = project.id || '';
        document.getElementById('project-title').value = project.title || '';
        document.getElementById('project-description').value = project.description || '';
        document.getElementById('project-image-url').value = project.image_url || '';
        document.getElementById('project-video-url').value = project.video_url || '';
        document.getElementById('project-tech-stack').value = (project.tech_stack && Array.isArray(project.tech_stack)) ? project.tech_stack.join(',') : '';
        document.getElementById('project-github-url').value = project.github_url || '';
        document.getElementById('project-live-demo-url').value = project.live_demo_url || '';
        projectFormContainer.classList.remove('hidden');
        projectForm.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }

    addProjectBtn.addEventListener('click', () => showProjectForm());
    cancelProjectFormBtn.addEventListener('click', () => projectFormContainer.classList.add('hidden'));

    projectForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const id = document.getElementById('project-id').value;
        const projectData = {
            title: document.getElementById('project-title').value,
            description: document.getElementById('project-description').value,
            image_url: document.getElementById('project-image-url').value,
            video_url: document.getElementById('project-video-url').value,
            tech_stack: document.getElementById('project-tech-stack').value.split(',').map(s => s.trim()).filter(s => s),
            github_url: document.getElementById('project-github-url').value,
            live_demo_url: document.getElementById('project-live-demo-url').value,
        };

        try {
            if (id) {
                await api.updateProject(id, projectData);
                showMessage(projectFormMessage, 'Project updated successfully!', 'success');
            } else {
                await api.createProject(projectData);
                showMessage(projectFormMessage, 'Project created successfully!', 'success');
            }
            projectForm.reset();
            projectFormContainer.classList.add('hidden');
            loadProjectsAdmin();
        } catch (error) {
            showMessage(projectFormMessage, error.message || 'Failed to save project.', 'error');
        }
    });

    function setupProjectEventListeners() {
        projectList.querySelectorAll('.edit-project-btn').forEach(btn => {
            btn.addEventListener('click', async () => {
                const id = btn.dataset.id;
                try {
                    const response = await api.getProjectById(id);
                    showProjectForm(response.data.project);
                } catch (error) {
                    showMessage(projectFormMessage, error.message || 'Failed to load project for editing.', 'error');
                }
            });
        });

        projectList.querySelectorAll('.delete-project-btn').forEach(btn => {
            btn.addEventListener('click', async () => {
                const id = btn.dataset.id;
                if (confirm('Are you sure you want to delete this project?')) {
                    try {
                        await api.deleteProject(id);
                        showMessage(projectFormMessage, 'Project deleted successfully!', 'success');
                        loadProjectsAdmin();
                    } catch (error) {
                        showMessage(projectFormMessage, error.message || 'Failed to delete project.', 'error');
                    }
                }
            });
        });
    }

    // --- Skills Management (Similar structure to Projects) ---
    const skillList = document.getElementById('skills-list');
    const skillFormContainer = document.getElementById('skill-form-container');
    const skillForm = document.getElementById('skill-form');
    const addSkillBtn = document.getElementById('add-skill-btn');
    const cancelSkillFormBtn = skillFormContainer.querySelector('.cancel-form-btn');
    const skillFormMessage = document.getElementById('skill-form-message');

    function renderSkillItem(skill) {
        const item = document.createElement('div');
        item.classList.add('data-item', 'glassmorphism-card');
        item.innerHTML = `
            <div class="data-item-content">
                <h4><i class="${skill.icon_class || 'fas fa-code'}"></i> ${skill.name} (${skill.category})</h4>
                <p>Order: ${skill.order_index}</p>
            </div>
            <div class="data-item-actions">
                <button class="btn btn-info btn-sm edit-skill-btn" data-id="${skill.id}">Edit</button>
                <button class="btn btn-danger btn-sm delete-skill-btn" data-id="${skill.id}">Delete</button>
            </div>
        `;
        return item;
    }

    async function loadSkillsAdmin() {
        try {
            const response = await api.getSkills();
            skillList.innerHTML = '';
            response.data.skills.forEach(skill => skillList.appendChild(renderSkillItem(skill)));
            setupSkillEventListeners();
        } catch (error) {
            showMessage(skillFormMessage, error.message || 'Failed to load skills.', 'error');
            skillList.innerHTML = '<p class="form-message error">Failed to load skills.</p>';
        }
    }

    function showSkillForm(skill = {}) {
        document.getElementById('skill-id').value = skill.id || '';
        document.getElementById('skill-category').value = skill.category || '';
        document.getElementById('skill-name').value = skill.name || '';
        document.getElementById('skill-icon-class').value = skill.icon_class || '';
        document.getElementById('skill-order-index').value = skill.order_index || 0;
        skillFormContainer.classList.remove('hidden');
        skillForm.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }

    addSkillBtn.addEventListener('click', () => showSkillForm());
    cancelSkillFormBtn.addEventListener('click', () => skillFormContainer.classList.add('hidden'));

    skillForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const id = document.getElementById('skill-id').value;
        const skillData = {
            category: document.getElementById('skill-category').value,
            name: document.getElementById('skill-name').value,
            icon_class: document.getElementById('skill-icon-class').value,
            order_index: parseInt(document.getElementById('skill-order-index').value),
        };
        try {
            if (id) {
                await api.updateSkill(id, skillData);
                showMessage(skillFormMessage, 'Skill updated successfully!', 'success');
            } else {
                await api.createSkill(skillData);
                showMessage(skillFormMessage, 'Skill created successfully!', 'success');
            }
        } catch (error) {
            console.error('Error saving skill:', error);
            showMessage(skillFormMessage, 'Failed to save skill.', 'error');
        }
    });
});
      