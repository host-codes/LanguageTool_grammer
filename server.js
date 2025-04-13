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
// Updated /api/check-grammar endpoint (replace your existing one)
app.post('/api/check-grammar', async (req, res) => {
  try {
    const { text } = req.body;
    if (!text) return res.status(400).json({ error: "No text provided" });

    // Step 1: Call LanguageTool API
    const response = await fetch("https://api.languagetool.org/v2/check", {
      method: "POST",
      headers: { 
        "Content-Type": "application/x-www-form-urlencoded",
        "Accept": "application/json"
      },
      body: new URLSearchParams({ text, language: "en-US" }),
    });

    // Step 2: Process LanguageTool's response
    const ltData = await response.json();
    
    // Transform into human-readable format
    const corrections = ltData.matches.map(match => ({
      type: match.rule.category.id === "GRAMMAR" ? "grammar" : "style",
      issue: match.rule.description,
      incorrect: match.context.text.substring(
        match.context.offset, 
        match.context.offset + match.context.length
      ),
      correct: match.replacements?.[0]?.value || "N/A",
      explanation: match.message
    }));

    // Step 3: Generate corrected text
    let improvedText = text;
    corrections.forEach(c => {
      improvedText = improvedText.replace(c.incorrect, c.correct);
    });

    // Step 4: Send enhanced response
    res.json({
      original: text,
      corrections,
      improvedText,
      summary: `Found ${corrections.length} issues`
    });

  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ 
      error: "Grammar check failed",
      details: process.env.NODE_ENV === 'development' ? error.message : null
    });
  }
});

// Serve index.html for ALL routes
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(port, () => console.log(`Server running on port ${port}`));
