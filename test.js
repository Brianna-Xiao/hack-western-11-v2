// Remove the require statement as it won't work in browser
// require('dotenv').config();

async function getChatGPTResponse(prompt) {
    // Get API key from chrome storage instead of process.env
    const result = await chrome.storage.sync.get(['openai_api_key']);
    const OPENAI_API_KEY = result.openai_api_key;
    
    if (!OPENAI_API_KEY) {
        throw new Error('API key not found. Please set your OpenAI API key in the extension settings.');
    }

    const API_URL = 'https://api.openai.com/v1/chat/completions';

    try {
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${OPENAI_API_KEY}`
            },
            body: JSON.stringify({
                model: 'gpt-3.5-turbo',
                messages: [
                    {
                        role: 'user',
                        content: prompt
                    }
                ],
                temperature: 0.7
            })
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        return data.choices[0].message.content;
    } catch (error) {
        console.error('Error:', error);
        throw error;
    }
}

document.addEventListener('DOMContentLoaded', () => {
    const chatInput = document.getElementById('user-input');
    const responseArea = document.getElementById('chat-messages');
    const chatHistory = [];

    function addMessageToChat(role, content) {
        const messageDiv = document.createElement('div');
        
        // Add specific positioning classes based on role
        if (role === 'user') {
            messageDiv.className = 'flex justify-end mb-2';
            messageDiv.innerHTML = `
                <div class="bg-blue-500 text-white rounded-lg py-2 px-4 max-w-[70%]">
                    ${content}
                </div>
            `;
        } else if (role === 'error') {
            messageDiv.className = 'flex justify-center mb-2';
            messageDiv.innerHTML = `
                <div class="bg-red-500 text-white rounded-lg py-2 px-4 max-w-[70%]">
                    ${content}
                </div>
            `;
        } else {
            messageDiv.className = 'flex justify-start mb-2';
            messageDiv.innerHTML = `
                <div class="bg-gray-200 rounded-lg py-2 px-4 max-w-[70%]">
                    ${content}
                </div>
            `;
        }
        
        responseArea.appendChild(messageDiv);
        responseArea.scrollTop = responseArea.scrollHeight;
        chatHistory.push({ role, content });
    }

    async function handleChatSubmission(e) {
        e.preventDefault();
        const message = chatInput.value.trim();
        if (!message) return;

        // Add user message
        addMessageToChat('user', message);
        chatInput.value = '';

        try {
            // Show loading message
            const loadingId = setTimeout(() => {
                addMessageToChat('ai', 'Thinking...');
            }, 300);

            const response = await getChatGPTResponse(message);
            
            // Clear loading message if it was added
            clearTimeout(loadingId);
            // Remove last message if it was "Thinking..."
            if (responseArea.lastChild && responseArea.lastChild.textContent.includes('Thinking...')) {
                responseArea.removeChild(responseArea.lastChild);
            }
            
            addMessageToChat('ai', response);
        } catch (error) {
            console.error('Chat error:', error);
            addMessageToChat('error', 'Error: Could not get a response. Please try again.');
        }
    }

    // Handle form submission
    document.getElementById('chat-form').addEventListener('submit', handleChatSubmission);
});
