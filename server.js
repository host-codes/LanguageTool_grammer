require('dotenv').config();
const express = require('express');
const path = require('path');
const cors = require('cors');

const app = express();
const port = process.env.PORT || 10000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// API Endpoint
app.post('/api/check-grammar', async (req, res) => {
  try {
    const { text } = req.body;
    if (!text) return res.status(400).json({ error: "No text provided" });

    // Call LanguageTool API
    const response = await fetch("https://api.languagetool.org/v2/check", {
      method: "POST",
      headers: { 
        "Content-Type": "application/x-www-form-urlencoded",
        "Accept": "application/json"
      },
      body: new URLSearchParams({ text, language: "en-US" }),
    });

    const data = await response.json();
    res.json({
      original: text,
      corrections: data.matches || []
    });

  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ error: "Grammar check failed" });
  }
});

// Serve index.html for ALL routes
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(port, () => console.log(`Server running on port ${port}`));
