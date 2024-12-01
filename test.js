require('dotenv').config();

async function getChatGPTResponse(prompt) {
    const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
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

// Add event listeners for the chat interface
document.addEventListener('DOMContentLoaded', () => {
    const chatInput = document.getElementById('chatInput');
    const sendButton = document.getElementById('sendButton');
    const responseArea = document.getElementById('responseArea');

    async function handleChatSubmission() {
        const message = chatInput.value.trim();
        if (!message) return;

        try {
            // Show loading state
            responseArea.textContent = 'Loading...';
            
            // Get response from ChatGPT
            const response = await getChatGPTResponse(message);
            
            // Display the response
            responseArea.textContent = response;
            
            // Clear input
            chatInput.value = '';
        } catch (error) {
            responseArea.textContent = 'Error: Could not get a response. Please try again.';
            console.error('Chat error:', error);
        }
    }

    // Handle send button click
    sendButton.addEventListener('click', handleChatSubmission);

    // Handle Enter key
    chatInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            handleChatSubmission();
        }
    });
});
