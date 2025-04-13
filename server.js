require('dotenv').config();
const express = require('express');
const cors = require('cors');
const fetch = require('node-fetch'); // Install with: npm install node-fetch

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// LanguageTool API Endpoint
app.post('/api/check-grammar', async (req, res) => {
  try {
    const { text } = req.body;
    if (!text) {
      return res.status(400).json({ error: "No text provided" });
    }

    // Call LanguageTool Public API
    const response = await fetch("https://api.languagetool.org/v2/check", {
      method: "POST",
      headers: { 
        "Content-Type": "application/x-www-form-urlencoded",
        "Accept": "application/json"
      },
      body: new URLSearchParams({
        text: text,
        language: "en-US", // Change to your target language
      }),
    });

    if (!response.ok) {
      throw new Error(`LanguageTool API error: ${response.statusText}`);
    }

    const data = await response.json();
    res.json({
      success: true,
      original: text,
      matches: data.matches || [], // Grammar errors found
    });

  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({
      success: false,
      error: "Could not check grammar",
      details: process.env.NODE_ENV === 'development' ? error.message : null,
    });
  }
});

app.listen(port, () => console.log(`Server running on port ${port}`));
