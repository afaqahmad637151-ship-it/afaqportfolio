// frontend/public/js/api.js

import { appState } from './utils.js';

/**
 * Generic API call function.
 * @param {string} endpoint - The API endpoint (e.g., '/projects').
 * @param {string} method - HTTP method (GET, POST, PUT, DELETE).
 * @param {object} [data=null] - Request body data.
 * @param {boolean} [requiresAuth=false] - Whether the request needs authentication.
 * @returns {Promise<object>} - The JSON response from the API.
 */
export async function apiCall(endpoint, method, data = null, requiresAuth = false) {
    const headers = {
        'Content-Type': 'application/json',
    };

    if (requiresAuth && appState.adminToken) {
        headers['Authorization'] = `Bearer ${appState.adminToken}`;
    } else if (requiresAuth && !appState.adminToken) {
        // Handle cases where auth is required but token is missing
        console.error('Authentication required but token is missing.');
        throw new Error('Authentication required.');
    }

    const options = {
        method,
        headers,
    };

    if (data) {
        options.body = JSON.stringify(data);
    }

    try {
        const response = await fetch(`${appState.backendUrl}${endpoint}`, options);
        const responseData = await response.json();

        if (!response.ok) {
            // Backend sends { status: 'fail', message: '...' } or { status: 'error', message: '...' }
            throw new Error(responseData.message || 'Something went wrong with the API request.');
        }

        return responseData;
    } catch (error) {
        console.error(`API Call Error (${method} ${endpoint}):`, error);
        throw error;
    }
}

// --- Specific API Functions ---

// Auth
export async function loginAdmin(username, password) {
    const data = await apiCall('/auth/login', 'POST', { username, password });
    appState.adminToken = data.token; // Store token globally
    localStorage.setItem('adminToken', data.token); // Persist token
    return data;
}

export async function logoutAdmin() {
    appState.adminToken = null;
    localStorage.removeItem('adminToken');
    // No backend call needed for JWT logout unless it's a blacklist
}

// Projects
export async function getProjects() {
    return apiCall('/projects', 'GET');
}

export async function getProjectById(id) {
    return apiCall(`/projects/${id}`, 'GET');
}

export async function createProject(projectData) {
    return apiCall('/projects', 'POST', projectData, true);
}

export async function updateProject(id, projectData) {
    return apiCall(`/projects/${id}`, 'PUT', projectData, true);
}

export async function deleteProject(id) {
    return apiCall(`/projects/${id}`, 'DELETE', null, true);
}

// Skills
export async function getSkills() {
    return apiCall('/skills', 'GET');
}

export async function getSkillById(id) {
    return apiCall(`/skills/${id}`, 'GET');
}

export async function createSkill(skillData) {
    return apiCall('/skills', 'POST', skillData, true);
}

export async function updateSkill(id, skillData) {
    return apiCall(`/skills/${id}`, 'PUT', skillData, true);
}

export async function deleteSkill(id) {
    return apiCall(`/skills/${id}`, 'DELETE', null, true);
}

// Services
export async function getServices() {
    return apiCall('/services', 'GET');
}

export async function getServiceById(id) {
    return apiCall(`/services/${id}`, 'GET');
}

export async function createService(serviceData) {
    return apiCall('/services', 'POST', serviceData, true);
}

export async function updateService(id, serviceData) {
    return apiCall(`/services/${id}`, 'PUT', serviceData, true);
}

export async function deleteService(id) {
    return apiCall(`/services/${id}`, 'DELETE', null, true);
}

// Testimonials
export async function getTestimonials() {
    return apiCall('/testimonials', 'GET');
}

export async function getTestimonialById(id) {
    return apiCall(`/testimonials/${id}`, 'GET');
}

export async function createTestimonial(testimonialData) {
    return apiCall('/testimonials', 'POST', testimonialData, true);
}

export async function updateTestimonial(id, testimonialData) {
    return apiCall(`/testimonials/${id}`, 'PUT', testimonialData, true);
}

export async function deleteTestimonial(id) {
    return apiCall(`/testimonials/${id}`, 'DELETE', null, true);
}

// Contact Messages
export async function submitContactMessage(messageData) {
    return apiCall('/contact', 'POST', messageData);
}

export async function getContactMessages() {
    return apiCall('/contact', 'GET', null, true);
}

export async function getContactMessageById(id) {
    return apiCall(`/contact/${id}`, 'GET', null, true);
}

export async function markContactMessageAsRead(id) {
    return apiCall(`/contact/${id}/read`, 'PATCH', null, true);
}

export async function deleteContactMessage(id) {
    return apiCall(`/contact/${id}`, 'DELETE', null, true);
}

// AI Assistant (example integration, actual AI logic would be on backend)
export async function getAIResponse(prompt) {
    // This is a placeholder for an AI endpoint.
    // In a real app, this would call your backend endpoint that integrates with OpenAI/Gemini.
    console.log("Simulating AI response for:", prompt);
    const mockResponses = [
        "Afaq Ahmad specializes in full-stack web development, covering both frontend and backend technologies, database management, and cloud deployment.",
        "His core skills include modern JavaScript frameworks like React, Next.js, robust backend development with Node.js and Python, and database systems such as MySQL and PostgreSQL.",
        "Afaq has a strong focus on creating scalable, high-performance, and AI-powered web applications with beautiful user experiences.",
        "To view Afaq's projects, please navigate to the 'Portfolio' section on this website.",
        "You can contact Afaq Ahmad through the contact form, email, or LinkedIn, all details are available in the 'Contact' section.",
        "Afaq is also experienced in AI development, including working with OpenAI and Google Gemini APIs, LangChain, and building AI chatbots and RAG systems.",
        "He offers services like full-stack web app development, REST API design, AI automation, SaaS solutions, and website optimization.",
        "Thank you for your interest in Afaq Ahmad's work! Is there anything else I can help you with?"
    ];

    return new Promise(resolve => {
        setTimeout(() => {
            if (prompt.toLowerCase().includes("skills")) {
                resolve({ text: mockResponses[1] });
            } else if (prompt.toLowerCase().includes("projects")) {
                resolve({ text: mockResponses[3] });
            } else if (prompt.toLowerCase().includes("contact")) {
                resolve({ text: mockResponses[4] });
            } else if (prompt.toLowerCase().includes("ai")) {
                resolve({ text: mockResponses[5] });
            } else if (prompt.toLowerCase().includes("services")) {
                resolve({ text: mockResponses[6] });
            } else if (prompt.toLowerCase().includes("who is") || prompt.toLowerCase().includes("what does afaq do")) {
                resolve({ text: mockResponses[0] });
            }
            else {
                resolve({ text: mockResponses[Math.floor(Math.random() * mockResponses.length)] });
            }
        }, 1500 + Math.random() * 1000); // Simulate network delay
    });
}