// frontend/public/js/components/contact.js

import { submitContactMessage } from '../api.js';
import { showMessage } from '../utils.js';

/**
 * Initializes the contact form submission.
 */
export function initializeContactForm() {
    const contactForm = document.getElementById('contact-form');
    const formMessage = document.getElementById('form-message');

    if (contactForm) {
        contactForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const submitBtn = contactForm.querySelector('button[type="submit"]');
            submitBtn.disabled = true;
            submitBtn.textContent = 'Sending...';

            const formData = new FormData(contactForm);
            const data = Object.fromEntries(formData.entries());

            try {
                const response = await submitContactMessage(data);
                showMessage(formMessage, response.message, 'success');
                contactForm.reset();
            } catch (error) {
                showMessage(formMessage, error.message || 'Failed to send message.', 'error');
            } finally {
                submitBtn.disabled = false;
                submitBtn.innerHTML = 'Send Message <i class="fas fa-paper-plane"></i>';
            }
        });
    }
}

/**
 * Initializes the AI Assistant chat widget.
 */
export function initializeAIAssistant() {
    const aiAssistantToggle = document.getElementById('ai-assistant-toggle');
    const aiAssistantWidget = document.getElementById('ai-assistant-widget');
    const aiAssistantCloseBtn = aiAssistantWidget ? aiAssistantWidget.querySelector('.close-btn') : null;
    const aiChatInput = document.getElementById('ai-chat-input-field');
    const aiChatSendBtn = document.getElementById('ai-chat-send-btn');
    const aiChatVoiceBtn = document.getElementById('ai-chat-voice-btn');
    const aiChatMessages = aiAssistantWidget ? aiAssistantWidget.querySelector('.ai-chat-messages') : null;

    if (aiAssistantToggle && aiAssistantWidget && aiChatInput && aiChatSendBtn && aiChatMessages) {
        aiAssistantToggle.addEventListener('click', () => {
            aiAssistantWidget.classList.toggle('hidden');
            aiAssistantToggle.classList.toggle('active');
            if (!aiAssistantWidget.classList.contains('hidden')) {
                aiChatInput.focus();
            }
        });

        if (aiAssistantCloseBtn) {
            aiAssistantCloseBtn.addEventListener('click', () => {
                aiAssistantWidget.classList.add('hidden');
                aiAssistantToggle.classList.remove('active');
            });
        }

        const appendMessage = (sender, text) => {
            const messageDiv = document.createElement('div');
            messageDiv.classList.add('chat-message', `${sender}-message`);
            messageDiv.textContent = text;
            aiChatMessages.appendChild(messageDiv);
            aiChatMessages.scrollTop = aiChatMessages.scrollHeight; // Scroll to bottom
        };

        const sendMessage = async () => {
            const prompt = aiChatInput.value.trim();
            if (prompt) {
                appendMessage('user', prompt);
                aiChatInput.value = '';

                // Simulate bot typing indicator
                const typingIndicator = document.createElement('div');
                typingIndicator.classList.add('chat-message', 'bot-message', 'typing-indicator');
                typingIndicator.innerHTML = '<span>.</span><span>.</span><span>.</span>';
                aiChatMessages.appendChild(typingIndicator);
                aiChatMessages.scrollTop = aiChatMessages.scrollHeight;

                try {
                    const response = await fetch('http://localhost:5000/api/ai/chat', { // Replace with your actual AI backend endpoint
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({ prompt }),
                    });

                    const data = await response.json();
                    if (!response.ok) {
                        throw new Error(data.message || 'AI assistant error.');
                    }
                    aiChatMessages.removeChild(typingIndicator); // Remove typing indicator
                    appendMessage('bot', data.response);
                } catch (error) {
                    aiChatMessages.removeChild(typingIndicator); // Remove typing indicator
                    console.error('AI Assistant Error:', error);
                    appendMessage('bot', 'Sorry, I am having trouble connecting to AfaqAI right now. Please try again later.');
                }
            }
        };

        aiChatSendBtn.addEventListener('click', sendMessage);
        aiChatInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                sendMessage();
            }
        });

        // Voice search functionality (requires browser support)
        if (aiChatVoiceBtn && 'SpeechRecognition' in window || 'webkitSpeechRecognition' in window) {
            const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
            const recognition = new SpeechRecognition();
            recognition.continuous = false;
            recognition.lang = 'en-US';
            recognition.interimResults = false;
            recognition.maxAlternatives = 1;

            aiChatVoiceBtn.addEventListener('click', () => {
                aiChatVoiceBtn.classList.add('active');
                recognition.start();
            });

            recognition.onresult = (event) => {
                const speechResult = event.results[0][0].transcript;
                aiChatInput.value = speechResult;
                sendMessage();
            };

            recognition.onspeechend = () => {
                aiChatVoiceBtn.classList.remove('active');
                recognition.stop();
            };

            recognition.onerror = (event) => {
                aiChatVoiceBtn.classList.remove('active');
                console.error('Speech recognition error:', event.error);
                appendMessage('bot', 'Voice input failed. Please type your message.');
            };
        } else if (aiChatVoiceBtn) {
            aiChatVoiceBtn.style.display = 'none'; // Hide if not supported
        }
    }
}