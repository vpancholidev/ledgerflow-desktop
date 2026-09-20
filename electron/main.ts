import { app, BrowserWindow, protocol, net, ipcMain } from 'electron'
import { createRequire } from 'node:module'
import { fileURLToPath } from 'node:url'
import path from 'node:path'
import { autoUpdater } from 'electron-updater'
import log from 'electron-log'

const require = createRequire(import.meta.url)
const __dirname = path.dirname(fileURLToPath(import.meta.url))

import { registerHandlers, performAutoBackup } from './database/handlers'
import { initDb } from './database/index'

process.env.APP_ROOT = path.join(__dirname, '..')

export const VITE_DEV_SERVER_URL = process.env['VITE_DEV_SERVER_URL']
export const MAIN_DIST = path.join(process.env.APP_ROOT, 'dist-electron')
export const RENDERER_DIST = path.join(process.env.APP_ROOT, 'dist-client')

process.env.VITE_PUBLIC = VITE_DEV_SERVER_URL ? path.join(process.env.APP_ROOT, 'public') : RENDERER_DIST

autoUpdater.logger = log
autoUpdater.logger.transports.file.level = 'info'
autoUpdater.autoDownload = false

autoUpdater.on('checking-for-update', () => {
    win?.webContents.send('update-checking')
})
autoUpdater.on('update-available', (info) => {
    win?.webContents.send('update-available', info)
})
autoUpdater.on('update-not-available', () => {
    win?.webContents.send('update-not-available')
})
autoUpdater.on('error', (err) => {
    win?.webContents.send('update-error', err.message)
})
autoUpdater.on('download-progress', (progress) => {
    win?.webContents.send('update-progress', progress)
})
autoUpdater.on('update-downloaded', (info) => {
    win?.webContents.send('update-downloaded', info)
})

let win: BrowserWindow | null

function createWindow() {
    win = new BrowserWindow({
        width: 1200,
        height: 800,
        titleBarStyle: 'hidden',
        webPreferences: {
            sandbox: false,
            contextIsolation: true,
            preload: path.join(__dirname, 'preload.js'),
        },
    })

    if (VITE_DEV_SERVER_URL) {
        win.loadURL(VITE_DEV_SERVER_URL)
        win.webContents.openDevTools()
    } else {
        win.loadFile(path.join(RENDERER_DIST, 'index.html'))
    }
}

let isQuitting = false;

app.on('before-quit', async (event) => {
    if (isQuitting) return;

    event.preventDefault();
    try {
        // Execute background shadow backup to Supabase
        await performAutoBackup();
    } catch (e) {
        console.error("Auto Backup Failed slightly, quitting anyway...", e);
    }

    isQuitting = true;
    app.quit();
});

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit()
        win = null
    }
})

app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
        createWindow()
    }
})

ipcMain.handle('check-for-updates', async () => {
    try {
        const result = await autoUpdater.checkForUpdates()
        return result
    } catch (err: any) {
        return { error: err.message }
    }
})

ipcMain.handle('download-update', async () => {
    try {
        await autoUpdater.downloadUpdate()
        return { success: true }
    } catch (err: any) {
        return { error: err.message }
    }
})

ipcMain.handle('install-update', async () => {
    autoUpdater.quitAndInstall()
    return { success: true }
})

ipcMain.handle('window-minimize', () => {
    win?.minimize()
    return { success: true }
})

ipcMain.handle('window-maximize', () => {
    if (win?.isMaximized()) {
        win.unmaximize()
    } else {
        win?.maximize()
    }
    return { success: true }
})

ipcMain.handle('window-close', () => {
    win?.close()
    return { success: true }
})

ipcMain.handle('window-is-maximized', () => {
    return win?.isMaximized() ?? false
})

app.whenReady().then(async () => {
    protocol.handle('local', (request) => {
        const filePath = request.url.replace('local://', '');
        return net.fetch('file://' + decodeURIComponent(filePath));
    });
    await initDb();
    registerHandlers();
    createWindow();

    if (!VITE_DEV_SERVER_URL) {
        autoUpdater.checkForUpdatesAndNotify()
    }
})
