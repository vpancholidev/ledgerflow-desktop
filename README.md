# LedgerFlow Desktop 💼

A secure, offline-first native Windows desktop application for managing finances, customer ledgers, and transactions. Powered by Electron, React, Drizzle ORM, and WebAssembly SQLite.

---

## 🛠️ End-To-End Build & Delivery Guide

This section is dedicated to instructions on securely building, packaging, and delivering the finished software to your client.

### Step 1: Prepare the Environment
Before attempting to compile the final `.exe` installer, you must ensure all dependencies are synchronized and perfectly clean.
Open your terminal at the root of the project and run:
```bash
npm install
```

### Step 2: Triggering the Build Pipeline
The application requires a two-step transpilation process (building the React UI first, then wrapping it within the Electron C++ Native environment).

Simply run the master build command:
```bash
npm run build
```
*Note: This command will automatically run `npm run build:vite` (which compiles your React components) and then `npm run build:electron` (which invokes `electron-builder` to generate the `.exe`).*

### Step 3: Finding Your Delivery Output
The heavily optimized packaging process will take approximately 1-2 minutes. Once it completes, you will see a new folder generated in the root of your project called:
**`dist-release/`**

Inside `dist-release/`, you will find your master file:
👉 **`LedgerFlow Setup 0.0.0.exe`** 

**This `.exe` file is the ONLY thing you need to send to your client!** It contains the entire application, Chromium rendering engine, and WebAssembly database sandbox safely packed into a standard, one-click Windows installer.

---

## 🔒 Post-Delivery: Hardware Licensing & Activation

LedgerFlow features a cryptographically secure, hardware-bound anti-piracy activation lock. When the client installs the `.exe` and opens it for the first time, they will be greeted by the **Activation Screen**. 

### How to Generate Their License Key:
1. When they open the application, they will see a **Hardware ID** (e.g., `INTEL-MAC-ADDRESS-RAM`).
2. Ask the client to copy that exact string and send it to you.
3. You must use the secret salt (`VAIBHAV_SOFTWARE_LOCKED_2026_X99`) to generate their personalized Activation Key. A quick utility script can be used to hash their ID + the salt using SHA256, extracting the first 16 characters formatted in chunks of 4.
4. Provide the client with that final key. 

*Once activated, the license is permanently locked to their physical motherboard/CPU!*

---

## ☁️ Cloud Backups (Supabase)
To ensure the client never loses data if their PC breaks:
1. Ask the client to create a free account at [Supabase](https://supabase.com/).
2. Create a generic project, and in the "Storage" tab, create a completely public bucket called exactly: **`backups`**.
3. Go to Project Settings -> API, and retrieve the **Project URL** and the **anon public API Key**.
4. Inside the LedgerFlow **Settings** menu, paste the URL and Key into their respective inputs, and immediately smash the **"Force Backup to Cloud Now"** button!

*Once configured, every time the client closes the Desktop Application, LedgerFlow will silently execute a shadow backup on exit, guaranteeing their local SQLite database is perfectly synchronized with the cloud!*

---

## 💻 Developer Commands

If you need to make changes down the line:

- **Run Developer Mode (Hot-Reloading):** 
  ```bash
  npm run dev
  ```
- **Lint Codebase:**
  ```bash
  npm run lint
  ```
