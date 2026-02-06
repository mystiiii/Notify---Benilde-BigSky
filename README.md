# NOT!FY 🚀

**NOT!FY** is a privacy-focused, local-first desktop application designed for students to automate assignment tracking. It securely scrapes pending tasks from Brightspace (BigSky) and provides universal export options for calendar and task management tools.

## ✨ Features

- **Desktop Experience:** Powered by Electron for a native, standalone experience.
- **Local-First & Private:** **Zero cloud storage.** Your credentials and data are processed entirely on your local machine. We do not have login access to your accounts.
- **Smart Sync:** Automatically navigates Brightspace using Playwright to extract current assignments.
- **Filter-Aware Exports:**
  - **iCal (.ics):** Universal sync for Google Calendar, Apple Calendar/Reminders, Microsoft To Do, and Outlook.
  - **Notion Import:** Specifically formatted CSV for seamless database creation in Notion.
  - **Raw Data:** Standard CSV for Excel or Google Sheets.
- **Advanced UI:**
  - Toggle between **Timeline** and **Grouped by Course** views.
  - **Multi-Course Filtering** and **Urgency Highlighting** (≤ 3 days).
  - Clean, modern student-focused design (no "AI" gradients, just functional polish).

## 🏗 Tech Stack

- **Desktop:** Electron
- **Frontend:** React + Tailwind CSS (Vite)
- **Backend:** Node.js + Express (Bundled as local micro-service)
- **Automation:** Playwright (Chromium)

## 🚀 Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) installed
- A Benilde BigSky (Brightspace) account

### Installation & Development

1. **Clone the repository:**
   ```bash
   git clone https://github.com/mystiiii/Notify---Benilde-BigSky.git
   cd Notify---Benilde-BigSky
   ```

2. **Install Dependencies:**
   ```bash
   npm install
   ```

3. **Install Browse Binaries (Playwright):**
   ```bash
   npx playwright install chromium
   ```

4. **Run Locally:**
   ```bash
   npm run dev
   ```
   *This will concurrently start the backend service, the React development server, and the Electron app window.*

## 🔒 Privacy & Security

NOT!FY is built on a "Privacy-by-Design" principle. 
- **Local Scraping:** All authentication and headless browsing happen on *your* machine.
- **No Passwords Saved:** The tool uses session persistence but never stores your raw password.
- **Local Export:** Files like `.ics` and `.csv` are generated in-memory and downloaded via your browser engine, never touching a remote server.

---
*Built for students, by a student.*

