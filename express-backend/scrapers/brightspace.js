const { chromium } = require('playwright');
const fs = require('fs');

const STORAGE_FILE = process.env.STORAGE_PATH || 'state.json';

const parseDate = (dateStr) => {
    if (!dateStr || dateStr === 'No Due Date') return new Date(8640000000000000);
    try { return new Date(dateStr); } catch (e) { return new Date(8640000000000000); }
};

async function scrapeBrightspace() {
    const hasStorageState = fs.existsSync(STORAGE_FILE);
    const browser = await chromium.launch({ headless: hasStorageState });
    const context = hasStorageState
        ? await browser.newContext({ storageState: STORAGE_FILE })
        : await browser.newContext();

    const page = await context.newPage();

    let user = { name: null, avatar: "" };
    let assignments = [];

    try {
        // 2. HOME & LOGIN CHECK
        await page.goto('https://bigsky.benilde.edu.ph/d2l/home', { waitUntil: 'networkidle' });

        if (page.url().includes('login.d2l')) {
            console.log("Login required. Waiting for manual authentication...");
            await page.waitForURL('**/d2l/home**', { timeout: 120000 });
        }

        // 3. MANUAL PROFILE NAVIGATION
        console.log("Opening user menu for identity...");
        try {
            const userMenuButton = 'button[aria-label*="avatar"]';
            await page.waitForSelector(userMenuButton);
            await page.click(userMenuButton);

            await page.waitForSelector('ul.d2l-personal-tools-list', { state: 'visible' });

            const profileUrl = await page.evaluate(() => {
                const link = Array.from(document.querySelectorAll('ul.d2l-personal-tools-list a'))
                    .find(a => a.innerText.trim() === 'Profile');
                return link ? link.getAttribute('href') : null;
            });

            if (profileUrl) {
                await page.goto(`https://bigsky.benilde.edu.ph${profileUrl}`, { waitUntil: 'domcontentloaded' });
                await page.waitForSelector('h2.dhdg_1');

                // Wait for image to ensure it's loaded
                try {
                    await page.waitForSelector('img[src*="viewprofileimage"]', { timeout: 5000 });
                } catch (e) {
                    console.log("Profile image selector timed out, proceeding anyway.");
                }

                // Scrape dynamic user data
                user = await page.evaluate(async () => {
                    const nameEl = document.querySelector('h2.dhdg_1');
                    const imgEl = document.getElementById('z_n') || document.querySelector('img[src*="viewprofileimage"]');

                    let avatarDataUrl = "";
                    if (imgEl) {
                        const rawSrc = imgEl.getAttribute('src');
                        const fullUrl = rawSrc.startsWith('http') ? rawSrc : window.location.origin + rawSrc;

                        try {
                            const response = await fetch(fullUrl);
                            const blob = await response.blob();
                            avatarDataUrl = await new Promise((resolve) => {
                                const reader = new FileReader();
                                reader.onloadend = () => resolve(reader.result);
                                reader.readAsDataURL(blob);
                            });
                        } catch (e) {
                            console.error("Failed to convert avatar to base64", e);
                        }
                    }

                    return {
                        name: nameEl ? nameEl.innerText.trim() : null,
                        avatar: avatarDataUrl
                    };
                });
                console.log(`Authenticated: ${user.name}`);
            }
        } catch (profileErr) {
            console.error("Profile sync failed, using generic profile.");
        }

        // 4. COURSE DISCOVERY
        await page.goto('https://bigsky.benilde.edu.ph/d2l/home', { waitUntil: 'networkidle' });
        const pickerSelector = 'button[aria-label="Select a course..."]';
        await page.waitForSelector(pickerSelector);
        await page.click(pickerSelector);
        await page.waitForSelector('.d2l-course-selector-item');

        const courseIds = await page.evaluate(() => {
            return [...new Set(Array.from(document.querySelectorAll('div.d2l-course-selector-item'))
                .map(div => div.getAttribute('data-org-unit-id')))]
                .filter(Boolean);
        });

        // 5. ASSIGNMENT SCRAPING
        for (const id of courseIds) {
            await page.goto(`https://bigsky.benilde.edu.ph/d2l/lms/dropbox/user/folders_list.d2l?ou=${id}`, { waitUntil: 'domcontentloaded' });

            const courseName = await page.evaluate(() =>
                document.querySelector('a.d2l-navigation-s-link')?.innerText.trim() || 'Unknown Course'
            );

            const items = await page.$$eval('tr', (rows) => {
                return rows.map(row => {
                    const status = row.querySelector('td.d_gt a.d2l-link-inline')?.textContent.trim();
                    if (status !== 'Not Submitted') return null;

                    const title = row.querySelector('.d2l-foldername')?.textContent.trim();
                    const dueEl = row.querySelector('.d2l-folderdates-wrapper label strong');
                    const due = dueEl ? dueEl.textContent.replace('Due on ', '').trim() : 'No Due Date';

                    return { title, due };
                }).filter(Boolean);
            });

            items.forEach(i => i.course = courseName);
            assignments.push(...items);
        }

        // 6. FINAL SORTING
        assignments.sort((a, b) => parseDate(a.due) - parseDate(b.due));

        // Cleanup
        await context.storageState({ path: STORAGE_FILE });
        await browser.close();

        return { user, assignments };

    } catch (err) {
        if (browser) await browser.close();
        throw err;
    }
}

module.exports = { scrapeBrightspace };
