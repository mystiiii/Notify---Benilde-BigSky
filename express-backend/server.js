const express = require('express');
const { chromium } = require('playwright');
const fs = require('fs');
const cors = require('cors');

const app = express();
const PORT = 3000;

// Middleware
app.use(cors()); 
app.use(express.json()); 

const STORAGE_FILE = 'state.json';

app.post('/scrape-assignments', async (req, res) => {
  const { courseIds } = req.body; // Expecting ["436482", "438311", ...]

  if (!courseIds || !Array.isArray(courseIds)) {
    return res.status(400).json({ error: "courseIds must be an array" });
  }

  // Construct URLs dynamically
  const DROPBOX_URLS = courseIds.map(id => 
    `https://bigsky.benilde.edu.ph/d2l/lms/dropbox/user/folders_list.d2l?ou=${id}&isprv=0`
  );

  let browser;
  try {
    browser = await chromium.launch({ headless: false });
    const context = fs.existsSync(STORAGE_FILE)
      ? await browser.newContext({ storageState: STORAGE_FILE })
      : await browser.newContext();

    const page = await context.newPage();
    const assignments = [];

    for (const url of DROPBOX_URLS) {
      console.log(`Navigating to ${url}...`);
      await page.goto(url, { waitUntil: 'domcontentloaded' });

      // Wait for assignment container
      try {
        await page.waitForSelector('.dco.d2l-foldername', { timeout: 10000 });
      } catch (e) {
        console.log(`No assignments found for ${url}, skipping...`);
        continue;
      }

      // Scrape course name
      const courseName = await page.evaluate(() => {
        const courseAnchor = document.querySelector('a.d2l-navigation-s-link');
        return courseAnchor?.innerText.trim() || 'Unknown Course';
      });

      // Scrape assignment rows
      const data = await page.$$eval('tr', rows => {
        return rows.map(row => {
          const statusLink = row.querySelector('td.d_gt a.d2l-link-inline');
          const statusText = statusLink?.textContent.trim() || "";

          // Only keep "Not Submitted" items
          if (statusText !== 'Not Submitted') return null;

          const title = row.querySelector('.d2l-foldername')?.textContent.trim() || 'Untitled';
          const dueElement = row.querySelector('.d2l-folderdates-wrapper label strong');
          const due = dueElement 
            ? dueElement.textContent.replace('Due on ', '').trim() 
            : 'No Due Date';

          return { title, due };
        })
        .filter(item => item !== null);
      });

      // Attach course name to the objects
      data.forEach(a => a.course = courseName);
      assignments.push(...data);
    }

    // Save session state
    await context.storageState({ path: STORAGE_FILE });
    await browser.close();

    res.json(assignments);

  } catch (err) {
    if (browser) await browser.close();
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

app.listen(PORT, () => {
  console.log(`Scraper backend running at http://localhost:${PORT}`);
});