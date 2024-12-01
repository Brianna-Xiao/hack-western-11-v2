require('dotenv').config();

const conversationHistory = [
    { role: "system", content: "You are a helpful and friendly assistant." }
]; // Initialize conversation history with system instructions

async function getChatGPTResponse(prompt) {
    // Get API key from chrome storage instead of process.env
    const result = await chrome.storage.sync.get(['openai_api_key']);
    const OPENAI_API_KEY = result.openai_api_key;
    
    if (!OPENAI_API_KEY) {
        throw new Error('API key not found. Please set your OpenAI API key in the extension settings.');
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
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();

        // Get ChatGPT's reply and add it to the conversation history
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

    async function handleChatSubmission() {
        const message = chatInput.value.trim(); // Get and sanitize user input
        if (!message) return; // Ignore empty input

        // Display user's message in the chat area
        const userMessageElement = document.createElement('div');
        userMessageElement.className = 'user-message';
        userMessageElement.textContent = `You: ${message}`;
        responseArea.appendChild(userMessageElement);

        try {
            // Show "typing..." indicator
            const loadingMessage = document.createElement('div');
            loadingMessage.className = 'assistant-message loading';
            loadingMessage.textContent = 'ChatGPT is typing...';
            responseArea.appendChild(loadingMessage);

            // Fetch the response from ChatGPT
            const response = await getChatGPTResponse(message);

            // Remove "typing..." indicator
            loadingMessage.remove();

            // Display ChatGPT's response
            const assistantMessageElement = document.createElement('div');
            assistantMessageElement.className = 'assistant-message';
            assistantMessageElement.textContent = `ChatGPT: ${response}`;
            responseArea.appendChild(assistantMessageElement);

            // Scroll to the bottom of the chat
            responseArea.scrollTop = responseArea.scrollHeight;

            // Clear the input field
            chatInput.value = '';
        } catch (error) {
            // Display an error message if ChatGPT cannot respond
            const errorMessage = document.createElement('div');
            errorMessage.className = 'error-message';
            errorMessage.textContent = 'Error: Could not get a response. Please try again.';
            responseArea.appendChild(errorMessage);
            console.error('Chat error:', error);
        }
    }

    // Handle "Send" button click
    sendButton.addEventListener('click', (e) => {
        e.stopPropagation(); // Ensure this doesn't interfere with other listeners
        handleChatSubmission();
    });

    // Handle "Enter" key press in the input field
    chatInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            e.stopPropagation(); // Ensure this doesn't interfere with other listeners
            handleChatSubmission();
        }
    });
});
