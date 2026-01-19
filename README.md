# NOTIFY 🚀

A personal micro-service for Benilde students to automate assignment tracking. NOTIFY scrapes pending tasks from BigSky and prepares them for seamless integration with Apple Reminders.

## 🛠 Features
- **Dynamic Scraping:** Enter BigSky course IDs directly via a React UI.
- **Headless Automation:** Uses Playwright to navigate BigSky and extract "Not Submitted" assignments.
- **Smart Formatting:** Converts human-readable dates into ISO 8601 for flawless Apple Shortcut sync.
- **Session Persistence:** Saves login states to minimize manual authentication.

## 🏗 Tech Stack
- **Frontend:** React + Tailwind CSS (Vite)
- **Backend:** Node.js + Express
- **Automation:** Playwright
- **Integration:** n8n

## 🚀 Getting Started

### Prerequisites
- Node.js installed
- A BigSky (Brightspace) account

### Installation
1. Clone the repository:
   ```bash
   git clone [https://github.com/yourusername/NOTIFY.git](https://github.com/yourusername/NOTIFY.git)```

2. Setup Backend:
   ```bash
   cd brightspace-scraper
   npm install
   npx playwright install chromium
   node server.js

3. Setup Frontend:
   ```bash
   cd react-frontend
   npm install
   npm run dev

