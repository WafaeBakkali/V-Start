const express = require('express');
const path = require('path');
const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

require('dotenv').config();

const app = express();
const port = process.env.PORT || 8080;

app.use(express.json());
app.use(express.static(path.join(__dirname, '.')));

app.post('/api/generate', async (req, res) => {
    const { systemPrompt, contentParts } = req.body;
    const apiKey = process.env.API_KEY;

    if (!apiKey) {
        return res.status(500).json({ error: 'API Key is not configured on the server.' });
    }

    const model = 'gemini-2.5-pro';
    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

    const allParts = [{ text: systemPrompt }, ...(contentParts || [])];
    const payload = { contents: [{ role: "user", parts: allParts }] };

    try {
        const apiResponse = await fetch(apiUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });
        const result = await apiResponse.json();
        if (!apiResponse.ok) {
            return res.status(apiResponse.status).json({ error: result.error.message });
        }
        const text = result.candidates[0]?.content?.parts[0]?.text || '';
        res.json({ text: text.trim() });
    } catch (error) {
        res.status(500).json({ error: 'An internal server error occurred.' });
    }
});

app.listen(port, () => {
    console.log(`VeoStart app listening on port ${port}`);
});