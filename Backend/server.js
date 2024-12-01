import express from "express";
const express = require('express');
const app = express();
import cors from "cors"

const PORT = 5000;

let remainingSeconds = 0;

app.use(cors());
app.use(express.json());

app.get("/timer", (req, res) => {
    res.json({remainingSeconds})
});

app.post("/timer", (req, res) => {
    const { seconds } = req.body;
    if (typeof seconds === 'number') {
        remainingSeconds = seconds;
        console.log(remainingSeconds);
        res.json({ remainingSeconds });  // Send back the updated timer state as JSON
    } else {
        res.status(400).json({ error: "Invalid input" });  // Send a JSON error response
    }
});



app.listen(PORT, (error) =>{
    if(!error)
        console.log(`Server is running at http://localhost:${PORT}/`);
    else
        console.log("Error occurred, server can't start", error);
})
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
