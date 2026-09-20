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

## 🚀 Over-The-Air (OTA) Application Updates
The application has a robust, native Over-The-Air (OTA) updater built-in using `electron-updater`. Whenever you release a new version of the app (e.g., adding a new feature or fixing a bug), you do NOT need to ask the client to safely copy their database or manually uninstall the old application!

### How To Push A New Update:
1. Open this repository's `package.json` file.
2. Under `"publish"`, ensure you have updated the `"owner"` to your specific GitHub Username and `"repo"` to this repository's name.
3. Bump the `"version"` field at the very top of `package.json` (e.g., change `"0.0.0"` to `"1.0.1"`). 
4. Run the automated release compilation command using a GitHub Personal Access Token (which has `repo` permissions):
   ```powershell
   $env:GH_TOKEN="ghp_YourGitHubSecretToken"
   npm run build:electron -- -p always
   ```
   *Note: This strictly relies on your GitHub repository being Public so the client doesn't need a token to read it. If the repository is Private, you must securely embed a read-only GH_TOKEN inside the application code.*
5. The `electron-builder` will securely construct the new version and automatically upload both the `.exe` and a special tracker file called `latest.yml` straight your GitHub Repository's **Releases** page!

### How The Client Receives It:
- Every time the client launches LedgerFlow Desktop, `main.ts` silently pings your GitHub Releases page in the background.
- If it detects that a higher version (e.g., `1.0.1`) exists on GitHub, it quietly downloads the installation binaries into their Windows cache.
- The next time the client closes their application (or restarts their physical PC), the new update is seamlessly applied to the machine without touching their local `.db` file whatsoever!

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
