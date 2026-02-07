# NOT!FY 🚀

> **The Ultimate Privacy-Focused Assignment Tracker for Students**

**NOT!FY** is a powerful, local-first desktop application designed to streamline your academic life. Built for students using **Brightspace (BigSky)**, it automates assignment tracking by securely scraping pending tasks and providing universal export options for your favorite calendar and productivity tools.

**Keywords:** Student Planner, LMS Scraper, Assignment Tracker, Brightspace Integration, Privacy-First, Open Source, Electron App, React, Node.js, Playwright, Productivity Tool, Task Automation.

---

## 📖 About Not!fy

Managing multiple courses and assignments can be overwhelming. **NOT!FY** simplifies this by integrating directly with your Learning Management System (LMS). Unlike other tools that require you to manually input data, Not!fy does the heavy lifting for you—automatically syncing your assignments while keeping your data 100% private and local on your machine.

Whether you use **Google Calendar**, **Notion**, **Outlook**, or just a simple spreadsheet, Not!fy ensures you never miss a deadline.

## ✨ Key Features

- **Desktop Native Experience:** Built with [Electron](https://www.electronjs.org/) for a seamless, standalone application feel.
- **🔒 Privacy-First Architecture:** **Zero cloud storage.** Your credentials and data are processed entirely on your local machine. We never see or store your passwords.
- **🤖 Smart Automation:** Uses [Playwright](https://playwright.dev/) to intelligently navigate Brightspace and extract your current assignments.
- **📅 Universal Exports:**
  - **iCal (.ics):** Sync with Google Calendar, Apple Calendar, Microsoft To Do, and Outlook.
  - **Notion Ready:** Export specifically formatted CSVs for seamless import into Notion databases.
  - **Raw Data:** Standard CSV export for Excel or Google Sheets.
- **🎨 Modern User Interface:**
  - **Timeline View:** Visualize your deadlines chronologically.
  - **Course Filtering:** Focus on specific subjects.
  - **Urgency Highlights:** Instantly see assignments due within 3 days.
  - **Clean Aesthetic:** A student-focused design that prioritizes function and clarity without unnecessary clutter.

## 🏗 Tech Stack

- **Core:** [Electron](https://www.electronjs.org/)
- **Frontend:** [React](https://reactjs.org/) + [Tailwind CSS](https://tailwindcss.com/) (Vite)
- **Backend:** [Node.js](https://nodejs.org/) + [Express](https://expressjs.com/) (Bundled as a local micro-service)
- **Automation:** [Playwright](https://playwright.dev/) (Chromium)

---

## 🚀 Installation & Setup Guide

Follow these steps to get Not!fy running on your machine.

### Prerequisites

Before you begin, ensure you have the following installed:
- **[Node.js](https://nodejs.org/)** (Recommended: LTS version) - *Required to run the app.*
- **[Git](https://git-scm.com/)** - *Required to clone the repository.*
- A **Benilde BigSky (Brightspace)** account.

### Step-by-Step Instructions

#### 1. Open Your Terminal
You'll need to use a command line interface to set up the project.
- **Windows:** Press `Win + R`, type `cmd` or `powershell`, and hit Enter.
- **Mac:** Press `Cmd + Space`, type `Terminal`, and hit Enter.
- **VS Code:** If you have VS Code open, you can use the built-in terminal by pressing `Ctrl + ~` (tilde).

#### 2. Clone the Repository
Copy and paste the following command into your terminal to download the project files:

```bash
git clone https://github.com/mystiiii/Notify---Benilde-BigSky.git
```

#### 3. Navigate to the Project Directory
Enter the folder you just downloaded by running:

```bash
cd Notify---Benilde-BigSky
```

#### 4. Install Dependencies
This command downloads and installs all the necessary libraries for the project to run (this may take a minute):

```bash
npm install
```

#### 5. Install Browser Binaries
Not!fy uses a specific browser engine (Chromium) to communicate with Brightspace. Run this command to install it:

```bash
npx playwright install chromium
```

#### 6. Run the Application
Start the development server and the application:

```bash
npm run dev
```
*This command will concurrently start the backend service, the React development server, and the Electron app window.*

---

## 🔒 Privacy & Security

**NOT!FY** is built on a **"Privacy-by-Design"** principle.
- **Local Scraping:** All authentication and headless browsing happen strictly on *your* machine.
- **No Passwords Saved:** The tool uses session persistence but never stores your raw password.
- **Local Export:** Files like `.ics` and `.csv` are generated in-memory and saved directly to your device, never touching a remote server.

---

*Built for students, by a student.*
