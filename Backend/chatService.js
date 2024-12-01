import express from "express";
import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config(); // To load the .env file

const app = express();
app.use(express.json());

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

app.post('/chat', async (req, res) => {
    try {
        const prompt = req.body.prompt;

        // Check if the prompt is provided
        if (!prompt) {
            return res.status(400).json({ error: 'Prompt is required' });
        }

        const response = await axios.post(
            'https://api.openai.com/v1/chat/completions',
            {
                model: 'gpt-3.5-turbo',
                messages: [{ role: 'user', content: prompt }],
                max_tokens: 150,
            },
            {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${OPENAI_API_KEY}`,
                },
            }
        );

        const reply = response.data.choices[0].message.content.trim();
        res.json({ reply });
    } catch (error) {
        console.error('Error communicating with OpenAI:', error);
        res.status(500).json({ error: 'An error occurred while processing your request' });
    }
});

const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
