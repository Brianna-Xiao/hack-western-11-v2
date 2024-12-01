require('dotenv').config();

class ChatService {
    constructor() {
        this.chatHistory = [];
    }

    async getAIResponse(message) {
        try {
            const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
            
            if (!OPENAI_API_KEY) {
                throw new Error('Please set your OpenAI API key in .env file!');
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
            
            // Store in chat history
            this.chatHistory.push(
                { role: 'user', content: message },
                { role: 'assistant', content: data.choices[0].message.content }
            );

            return data.choices[0].message.content;
        } catch (error) {
            console.error('Detailed error:', error);
            throw error;
        }
    }

    getChatHistory() {
        return this.chatHistory;
    }
}

module.exports = ChatService;