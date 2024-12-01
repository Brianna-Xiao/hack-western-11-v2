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