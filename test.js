require('dotenv').config();

const conversationHistory = [
    { role: "system", content: "You are a helpful and friendly assistant." }
]; // Initialize conversation history with system instructions

async function getChatGPTResponse(prompt) {
    // Check API key first
    const result = await chrome.storage.sync.get(['openai_api_key']);
    const OPENAI_API_KEY = result.openai_api_key;
    
    if (!OPENAI_API_KEY) {
        throw new Error('⚠️ API key not found. Please right-click the extension icon, select "Options", and set your OpenAI API key.');
    }

    if (OPENAI_API_KEY === 'your-api-key-here') {
        throw new Error('⚠️ Please replace the default API key with your actual OpenAI API key in the extension options.');
    }

    const API_URL = 'https://api.openai.com/v1/chat/completions';

    // Add the user's message to the conversation history
    conversationHistory.push({ role: "user", content: prompt });

    try {
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${OPENAI_API_KEY}`
            },
            body: JSON.stringify({
                model: 'gpt-3.5-turbo', // Use GPT-3.5-turbo for conversational responses
                messages: conversationHistory,
                temperature: 0.7 // Adjust for more/less randomness in responses
            })
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error?.message || 'API request failed');
        }

        const data = await response.json();
        const reply = data.choices[0].message.content;
        conversationHistory.push({ role: "assistant", content: reply });

        return reply;
    } catch (error) {
        console.error('Error:', error);
        throw error;
    }
    

}

document.addEventListener('DOMContentLoaded', () => {
    const chatInput = document.getElementById('chatInput'); // Text input field
    const sendButton = document.getElementById('sendButton'); // Send button
    const responseArea = document.getElementById('responseArea'); // Chat display area

    // Add initial message about API key
    chrome.storage.sync.get(['openai_api_key'], (result) => {
        if (!result.openai_api_key) {
            const messageElement = document.createElement('div');
            messageElement.className = 'mb-2 p-2 bg-yellow-100 text-yellow-800 rounded max-w-[100%]';
            messageElement.textContent = '⚠️ Please set your OpenAI API key in the extension options (right-click extension icon → Options)';
            responseArea.appendChild(messageElement);
        }
    });

    async function handleChatSubmission() {
        const message = chatInput.value.trim(); // Get and sanitize user input
        if (!message) return; // Ignore empty input

        // Display user's message in the chat area
        const userMessageElement = document.createElement('div');
        userMessageElement.className = 'mb-2 p-2 bg-blue-500 text-white rounded max-w-[80%] ml-auto';
        userMessageElement.textContent = message;
        responseArea.appendChild(userMessageElement);

        try {
            // Show loading state
            const loadingMessage = document.createElement('div');
            loadingMessage.className = 'mb-2 p-2 bg-gray-100 rounded max-w-[80%]';
            loadingMessage.textContent = 'Typing...';
            responseArea.appendChild(loadingMessage);

            // Fetch the response from ChatGPT
            const response = await getChatGPTResponse(message);

            // Remove loading message
            loadingMessage.remove();

            // Display ChatGPT's response
            const assistantMessageElement = document.createElement('div');
            assistantMessageElement.className = 'mb-2 p-2 bg-gray-100 rounded max-w-[80%]';
            assistantMessageElement.textContent = response;
            responseArea.appendChild(assistantMessageElement);

            // Scroll to the bottom of the chat
            responseArea.scrollTop = responseArea.scrollHeight;

            // Clear the input field
            chatInput.value = '';
        } catch (error) {
            const errorMessage = document.createElement('div');
            errorMessage.className = 'mb-2 p-2 bg-red-100 text-red-800 rounded max-w-[100%]';
            errorMessage.textContent = error.message;
            responseArea.appendChild(errorMessage);
            responseArea.scrollTop = responseArea.scrollHeight;
        }
    }

    // Handle "Send" button click
    sendButton.addEventListener('click', handleChatSubmission);

    // Handle "Enter" key press in the input field
    chatInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            handleChatSubmission();
        }
    });
});
