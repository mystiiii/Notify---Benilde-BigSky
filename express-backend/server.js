const express = require('express');
const { chromium } = require('playwright');
const fs = require('fs');
const cors = require('cors');

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());

const STORAGE_FILE = process.env.STORAGE_PATH || 'state.json';

const parseDate = (dateStr) => {
  if (!dateStr || dateStr === 'No Due Date') return new Date(8640000000000000);
  try { return new Date(dateStr); } catch (e) { return new Date(8640000000000000); }
};

app.get('/scrape-assignments', async (req, res) => {
  try {
    const { scrapeBrightspace } = require('./scrapers/brightspace');
    const data = await scrapeBrightspace();
    res.json(data);
  } catch (err) {
    console.error("Fatal Scraper Error:", err);
    res.status(500).json({ error: err.message });
  }
});

app.post('/logout', (req, res) => {
  try {
    if (fs.existsSync(STORAGE_FILE)) {
      fs.unlinkSync(STORAGE_FILE);
    }
    res.json({ success: true });
  } catch (err) {
    console.error("Logout Error:", err);
    res.status(500).json({ error: err.message });
  }
});

// Auto-delete state.json every 2.5 hours (9,000,000 ms) to handle cookie expiration
setInterval(() => {
  if (fs.existsSync(STORAGE_FILE)) {
    try {
      fs.unlinkSync(STORAGE_FILE);
      console.log(`[Auto-Cleanup] Deleted ${STORAGE_FILE} at ${new Date().toISOString()}`);
    } catch (err) {
      console.error(`[Auto-Cleanup] Failed to delete ${STORAGE_FILE}:`, err);
    }
  }
}, 9000000);

app.listen(PORT, () => console.log(`NOT!FY Backend: http://localhost:${PORT}`));