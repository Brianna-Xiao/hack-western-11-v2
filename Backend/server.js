const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
const port = 3001; // Using a different port from your main server

// Middleware
app.use(cors());
app.use(express.json());

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
                messages: [{
                    role: 'user',
                    content: prompt
                }],
                temperature: 0.7
            })
        });

        const data = await response.json();
        return data.choices[0].message.content;
    } catch (error) {
        console.error('Error:', error);
        throw error;
    }
}

// ChatGPT endpoint
app.post('/api/chat', async (req, res) => {
    try {
        const { message } = req.body;
        const response = await getChatGPTResponse(message);
        res.json({ response });
    } catch (error) {
        console.error('Server error:', error);
        res.status(500).json({ error: 'Failed to get response' });
    }
});

app.listen(port, () => {
    console.log(`ChatGPT service running on port ${port}`);
});

module.exports = { getChatGPTResponse };
