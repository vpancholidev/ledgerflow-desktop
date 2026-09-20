import { ipcMain } from 'electron';
import { db, saveDb } from './index';
import { customers, transactions, appSettings } from './schema';
import crypto from 'crypto';
import { eq } from 'drizzle-orm';
import fs from 'fs';
import path from 'path';
import { app, dialog, BrowserWindow, shell } from 'electron';
import os from 'os';
import { createClient } from '@supabase/supabase-js';
import WebSocket from 'ws';
if (typeof globalThis.WebSocket === 'undefined') (globalThis as any).WebSocket = WebSocket;

export function registerHandlers() {
    const uploadsDir = path.join(app.getPath('userData'), 'uploads');
    if (!fs.existsSync(uploadsDir)) {
        fs.mkdirSync(uploadsDir);
    }

    // File Interceptor
    ipcMain.handle('select-files', async (event, maxFiles = 2) => {
        const win = BrowserWindow.fromWebContents(event.sender);
        if (!win) return [];
        const { canceled, filePaths } = await dialog.showOpenDialog(win, {
            title: 'Select Attached Documents',
            buttonLabel: 'Attach Files',
            properties: ['openFile', 'multiSelections'],
            filters: [{ name: 'Documents & Images', extensions: ['pdf', 'png', 'jpg', 'jpeg'] }]
        });
        if (canceled || filePaths.length === 0) return [];

        let toProcess = filePaths;
        if (toProcess.length > maxFiles) {
            toProcess = toProcess.slice(0, maxFiles);
        }

        const savedNames = [];
        for (const sourcePath of toProcess) {
            try {
                const ext = path.extname(sourcePath);
                const newName = crypto.randomUUID() + ext;
                const destPath = path.join(uploadsDir, newName);
                fs.copyFileSync(sourcePath, destPath);
                savedNames.push(newName);
            } catch (e) {
                console.error('File copy critical error:', e);
            }
        }
        return savedNames;
    });

    ipcMain.handle('save-file', async (_, sourcePath) => {
        try {
            if (!sourcePath) throw new Error("Rejected: The web-input path supplied was totally empty.");
            const ext = path.extname(sourcePath);
            const newName = crypto.randomUUID() + ext;
            const destPath = path.join(uploadsDir, newName);
            fs.copyFileSync(sourcePath, destPath);
            return newName;
        } catch (e: any) {
            console.error('File copy critical error:', e);
            throw e;
        }
    });

    ipcMain.handle('get-file-dir', async () => {
        return uploadsDir;
    });

    ipcMain.handle('open-file', async (_, filename) => {
        const target = path.join(uploadsDir, filename);
        if (fs.existsSync(target)) {
            shell.openPath(target);
        }
    });

    // ----------------------------------------------------
    // SECURITY & LICENSING (PHASE 4)
    // ----------------------------------------------------
    const getMachineId = () => {
        const cpus = os.cpus();
        const mac = Object.values(os.networkInterfaces()).flat().find(i => i && !i.internal && i.mac)?.mac || 'NO-MAC';
        const raw = `${cpus[0].model}-${mac}-${os.totalmem()}`;
        return crypto.createHash('sha256').update(raw).digest('hex').substring(0, 12).toUpperCase();
    };

    const generateValidLicense = () => {
        const secretSalt = "VAIBHAV_SOFTWARE_LOCKED_2026_X99";
        const id = getMachineId();
        const hash = crypto.createHash('sha256').update(id + secretSalt).digest('hex').substring(0, 16).toUpperCase();
        return hash.match(/.{4}/g)?.join('-') || '';
    };

    ipcMain.handle('get-machine-id', async () => {
        return getMachineId();
    });

    ipcMain.handle('get-auth-status', async () => {
        const licenseRec = await db.select().from(appSettings).where(eq(appSettings.key, 'licenseKey'));
        const pinRec = await db.select().from(appSettings).where(eq(appSettings.key, 'dailyPin'));

        const storedLicense = licenseRec[0]?.value;
        const isLicensed = storedLicense === generateValidLicense();
        const hasPin = !!pinRec[0]?.value;

        return { isLicensed, hasPin };
    });

    ipcMain.handle('activate-license', async (_, key: string) => {
        const expected = generateValidLicense();
        if (key.trim().toUpperCase() === expected) {
            const existing = await db.select().from(appSettings).where(eq(appSettings.key, 'licenseKey'));
            if (existing.length > 0) {
                await db.update(appSettings).set({ value: expected }).where(eq(appSettings.key, 'licenseKey'));
            } else {
                await db.insert(appSettings).values({ key: 'licenseKey', value: expected });
            }
            saveDb();
            return true;
        }
        return false;
    });

    ipcMain.handle('set-pin', async (_, pin: string) => {
        const hash = crypto.createHash('sha256').update(pin).digest('hex');
        const existing = await db.select().from(appSettings).where(eq(appSettings.key, 'dailyPin'));
        if (existing.length > 0) {
            await db.update(appSettings).set({ value: hash }).where(eq(appSettings.key, 'dailyPin'));
        } else {
            await db.insert(appSettings).values({ key: 'dailyPin', value: hash });
        }
        saveDb();
        return true;
    });

    ipcMain.handle('verify-pin', async (_, pin: string) => {
        const hash = crypto.createHash('sha256').update(pin).digest('hex');
        const pinRec = await db.select().from(appSettings).where(eq(appSettings.key, 'dailyPin'));
        return pinRec[0]?.value === hash;
    });

    ipcMain.handle('reset-pin-via-license', async (_, key: string) => {
        const expected = generateValidLicense();
        if (key.trim().toUpperCase() === expected) {
            await db.delete(appSettings).where(eq(appSettings.key, 'dailyPin'));
            saveDb();
            return true;
        }
        return false;
    });

    ipcMain.handle('backup-to-cloud', async (_, { url, key }) => {
        try {
            await performAutoBackup(url, key);
            return { success: true };
        } catch (e: any) {
            console.error("Cloud Backup Error", e);
            return { success: false, error: e.message };
        }
    });


    ipcMain.handle('save-supabase-config', async (_, { url, key }) => {
        await db.delete(appSettings).where(eq(appSettings.key, 'supabaseUrl'));
        await db.delete(appSettings).where(eq(appSettings.key, 'supabaseKey'));
        if (url) await db.insert(appSettings).values({ key: 'supabaseUrl', value: url });
        if (key) await db.insert(appSettings).values({ key: 'supabaseKey', value: key });
        saveDb();
        return true;
    });

    ipcMain.handle('get-supabase-config', async () => {
        const urlRec = await db.select().from(appSettings).where(eq(appSettings.key, 'supabaseUrl'));
        const keyRec = await db.select().from(appSettings).where(eq(appSettings.key, 'supabaseKey'));
        return { url: urlRec[0]?.value || '', key: keyRec[0]?.value || '' };
    });

    // ----------------------------------------------------
    // CUSTOMERS
    // ----------------------------------------------------
    ipcMain.handle('get-customers', async () => {
        return await db.select().from(customers);
    });

    ipcMain.handle('add-customer', async (_, customerData) => {
        const id = crypto.randomUUID();
        let finalCustomerNo = customerData.customerNo || ('CUST-' + Date.now().toString().slice(-6));

        const existing = await db.select().from(customers).where(eq(customers.customerNo, finalCustomerNo));
        if (existing.length > 0) {
            if (!customerData.customerNo) {
                // If auto-generated collision happened randomly, tweak it
                finalCustomerNo = finalCustomerNo + '-' + Math.floor(Math.random() * 100);
            } else {
                throw new Error(`The Customer ID '${finalCustomerNo}' is already taken by another customer.`);
            }
        }

        await db.insert(customers).values({
            id,
            ...customerData,
            customerNo: finalCustomerNo,
            createdAt: new Date(),
            documents: customerData.documents || [],
        });
        saveDb();
        return { id, customerNo: finalCustomerNo };
    });

    ipcMain.handle('update-customer', async (_, id, data) => {
        if (data.customerNo) {
            const existing = await db.select().from(customers).where(eq(customers.customerNo, data.customerNo));
            if (existing.length > 0 && existing[0].id !== id) {
                throw new Error(`The Customer ID '${data.customerNo}' is already registered to another customer.`);
            }
        }

        await db.update(customers).set(data).where(eq(customers.id, id));
        saveDb();
        return true;
    });

    // Transactions
    ipcMain.handle('get-transactions', async () => {
        return await db.select().from(transactions);
    });

    ipcMain.handle('add-transaction', async (_, txData) => {
        const id = crypto.randomUUID();
        await db.insert(transactions).values({
            id,
            ...txData,
            date: new Date(txData.date)
        });
        saveDb();
        return id;
    });

    // Settings
    ipcMain.handle('get-settings', async () => {
        return await db.select().from(appSettings);
    });

    ipcMain.handle('save-setting', async (_, key, value) => {
        await db.insert(appSettings).values({ key, value }).onConflictDoUpdate({
            target: appSettings.key,
            set: { value }
        });
        saveDb();
        return true;
    });
}

export async function performAutoBackup(forceUrl?: string, forceKey?: string) {
    try {
        let url = forceUrl;
        let key = forceKey;

        if (!url || !key) {
            const urlRec = await db.select().from(appSettings).where(eq(appSettings.key, 'supabaseUrl'));
            const keyRec = await db.select().from(appSettings).where(eq(appSettings.key, 'supabaseKey'));
            url = urlRec[0]?.value;
            key = keyRec[0]?.value;
        }

        if (!url || !key) return; // Do not auto-backup if not configured

        const supabase = createClient(url, key, {
            auth: { persistSession: false }
        });
        const dbPath = path.join(app.getPath('userData'), 'ledgerflow_data.db');
        const uploadsDir = path.join(app.getPath('userData'), 'uploads');

        if (fs.existsSync(dbPath)) {
            const dbBuffer = fs.readFileSync(dbPath);
            const { error: dbErr } = await supabase.storage.from('backups').upload('database/ledgerflow_data.db', dbBuffer, { upsert: true });
            if (dbErr) throw dbErr;
        }

        if (fs.existsSync(uploadsDir)) {
            const files = fs.readdirSync(uploadsDir);
            for (const file of files) {
                const filePath = path.join(uploadsDir, file);
                const fileBuffer = fs.readFileSync(filePath);
                await supabase.storage.from('backups').upload(`images/${file}`, fileBuffer, { upsert: true });
            }
        }
    } catch (e: any) {
        console.error("Cloud Backup Sub-Routine Error", e);
        throw e;
    }
}
