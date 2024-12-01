require('dotenv').config();

class ChatService {
    constructor() {
        this.chatHistory = [];
        this.messagesArea = document.getElementById('chat-messages');
        this.form = document.getElementById('chat-form');
        this.input = document.getElementById('user-input');
        
        // Add event listeners
        this.form.addEventListener('submit', (e) => {
            e.preventDefault();
            this.sendMessage();
        });
    }

    async sendMessage() {
        const message = this.input.value.trim();
        if (!message) return;

        // Add user message to chat
        this.addMessageToChat('user', message);
        this.input.value = '';

        try {
            const response = await this.getAIResponse(message);
            this.addMessageToChat('ai', response);
        } catch (error) {
            console.error('Error:', error);
            this.addMessageToChat('error', `Error: ${error.message}`);
        }
    }

    async getAIResponse(message) {
        try {
            if (!OPENAI_API_KEY || OPENAI_API_KEY === 'your-api-key-here') {
                throw new Error('Please set your OpenAI API key first!');
            }

            const response = await fetch('https://api.openai.com/v1/chat/completions', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${OPENAI_API_KEY}`
                },
                body: JSON.stringify({
                    model: 'gpt-3.5-turbo',
                    messages: [
                        { role: 'user', content: message }
                    ],
                    temperature: 0.7
                })
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error?.message || 'API request failed');
            }

            const data = await response.json();
            return data.choices[0].message.content;
        } catch (error) {
            console.error('Detailed error:', error);
            throw error; // Re-throw to be caught by the calling function
        }
    }

    addMessageToChat(role, content) {
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${role}-message mb-2 p-2 rounded ${
            role === 'user' 
                ? 'bg-blue-500 text-white ml-auto' 
                : role === 'error'
                    ? 'bg-red-500 text-white'
                    : 'bg-gray-100'
        } max-w-[80%]`;
        messageDiv.textContent = content;
        this.messagesArea.appendChild(messageDiv);
        this.messagesArea.scrollTop = this.messagesArea.scrollHeight;
        
        // Store in chat history
        this.chatHistory.push({ role, content });
    }
}

// Initialize chat box
const chatBox = new ChatService();

// // Function to securely get the API key from Chrome storage
// async function getApiKey() {
//     try {
//         const result = await chrome.storage.sync.get(['openai_api_key']);
//         return result.openai_api_key;
//     } catch (error) {
//         console.error('Error getting API key:', error);
//         throw error;
//     }
// }

// // Add basic rate limiting
// class RateLimiter {
//     constructor() {
//         this.requests = [];
//         this.maxRequests = 20; // Max requests per minute
//         this.timeWindow = 60000; // 1 minute in milliseconds
//     }

//     checkLimit() {
//         const now = Date.now();
//         this.requests = this.requests.filter(time => now - time < this.timeWindow);
        
//         if (this.requests.length >= this.maxRequests) {
//             throw new Error('Rate limit exceeded. Please try again later.');
//         }
        
//         this.requests.push(now);
//         return true;
//     }
// }

// const rateLimiter = new RateLimiter();

// async function getChatGPTResponse(prompt) {
//     const OPENAI_API_KEY = await getApiKey();
//     const API_URL = 'https://api.openai.com/v1/chat/completions';

//     try {
//         const response = await fetch(API_URL, {
//             method: 'POST',
//             headers: {
//                 'Content-Type': 'application/json',
//                 'Authorization': `Bearer ${OPENAI_API_KEY}`
//             },
//             body: JSON.stringify({
//                 model: 'gpt-3.5-turbo',
//                 messages: [{
//                     role: 'user',
//                     content: prompt
//                 }],
//                 temperature: 0.7
//             })
//         });

//         const data = await response.json();
//         return data.choices[0].message.content;
//     } catch (error) {
//         console.error('Error:', error);
//         throw error;
//     }
// }

// // Add event listeners when DOM is loaded
// document.addEventListener('DOMContentLoaded', () => {
//     const chatInput = document.getElementById('chatInput');
//     const sendButton = document.getElementById('sendButton');
//     const responseArea = document.getElementById('responseArea');

//     async function handleChatSubmission() {
//         const message = chatInput.value.trim();
//         if (!message) return;

//         try {
//             responseArea.textContent = 'Loading...';
//             const response = await getChatGPTResponse(message);
//             responseArea.textContent = response;
//             chatInput.value = '';
//         } catch (error) {
//             responseArea.textContent = 'Error getting response. Please try again.';
//             console.error('Chat error:', error);
//         }
//     }

//     sendButton.addEventListener('click', handleChatSubmission);
//     chatInput.addEventListener('keypress', (e) => {
//         if (e.key === 'Enter') {
//             handleChatSubmission();
//         }
//     });
// });