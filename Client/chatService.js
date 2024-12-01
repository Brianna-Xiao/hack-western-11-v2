// Chat service functionality
export class ChatService {
    constructor() {
        this.chatHistory = [];
        this.setupEventListeners();
    }

    setupEventListeners() {
        const sendButton = document.getElementById('sendButton');
        const chatInput = document.getElementById('chatInput');
        const responseArea = document.getElementById('responseArea');

        if (sendButton && chatInput) {
            sendButton.addEventListener('click', () => this.sendMessage(chatInput, responseArea));
            chatInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    this.sendMessage(chatInput, responseArea);
                }
            });
        }
    }

    sendMessage(input, responseArea) {
        const message = input.value.trim();
        if (!message) return;

        // Add user message to chat
        this.addMessageToChat('user', message, responseArea);
        input.value = '';

        // Here you would typically send the message to your backend
        // For now, just echo the message
        setTimeout(() => {
            this.addMessageToChat('assistant', `Echo: ${message}`, responseArea);
        }, 500);
    }

    addMessageToChat(role, content, responseArea) {
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${role} mb-2`;
        messageDiv.textContent = content;
        responseArea.appendChild(messageDiv);
        responseArea.scrollTop = responseArea.scrollHeight;
    }
}

// Initialize chat service
new ChatService(); 