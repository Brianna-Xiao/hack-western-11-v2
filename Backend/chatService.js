import express from "express";
import axios from "axios";
import cors from "cors";
import dotenv from 'dotenv';
dotenv.config(); // Load .env variables

const app = express();
app.use(express.json());


app.use(cors()); // Enable CORS for frontend-backend communication

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

app.post("/chat", async (req, res) => {
    try {
        const prompt = req.body.prompt;

        // Validate prompt
        if (!prompt) {
            return res.status(400).json({ error: "Prompt is required" });
        }

        // Call OpenAI API
        const response = await axios.post(
            "https://api.openai.com/v1/chat/completions",
            {
                model: "gpt-3.5-turbo",
                messages: [{ role: "user", content: prompt }],
                max_tokens: 150,
            },
            {
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${OPENAI_API_KEY}`,
                },
            }
        );

        // Extract the reply and send it back
        const reply = response.data.choices[0].message.content.trim();
        res.json({ reply });
    } catch (error) {
        console.error("Error communicating with OpenAI:", error.response?.data || error.message);
        res.status(500).json({ error: "An error occurred while processing your request." });
    }
});

const PORT = process.env.PORT || 5000; // Use the PORT environment variable or default to 5000
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});

