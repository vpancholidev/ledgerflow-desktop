import { ipcMain } from 'electron';
import { db, saveDb, getDbDirtyFlag, resetDbDirtyFlag, markDbDirty } from './index';
import { customers, transactions, appSettings } from './schema';
import crypto from 'crypto';
import { eq, and } from 'drizzle-orm';
import fs from 'fs';
import path from 'path';
import { app, dialog, BrowserWindow, shell } from 'electron';
import os from 'os';
import { createClient } from '@supabase/supabase-js';
import WebSocket from 'ws';
import { machineIdSync } from 'node-machine-id';

// ============================================================================
// CODCLAW CENTRAL KILL-SWITCH CREDENTIALS (SUPPLIED BY GITHUB SECRETS)
// ============================================================================
const CODCLAW_CENTRAL_URL = (import.meta as any).env.VITE_CODCLAW_URL || '';
const CODCLAW_CENTRAL_KEY = (import.meta as any).env.VITE_CODCLAW_KEY || '';
// ============================================================================

if (typeof globalThis.WebSocket === 'undefined') (globalThis as any).WebSocket = WebSocket;

export const getMachineId = () => {
    try {
        const mId = machineIdSync();
        return crypto.createHash('sha256').update(mId).digest('hex').substring(0, 12).toUpperCase();
    } catch (e) {
        const cpus = os.cpus();
        const raw = `${cpus[0].model}-${os.totalmem()}`;
        return crypto.createHash('sha256').update(raw).digest('hex').substring(0, 12).toUpperCase();
    }
};

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
        if (savedNames.length > 0) markDbDirty();
        return savedNames;
    });

    ipcMain.handle('save-file', async (_, sourcePath) => {
        try {
            if (!sourcePath) throw new Error("Rejected: The web-input path supplied was totally empty.");
            const ext = path.extname(sourcePath);
            const newName = crypto.randomUUID() + ext;
            const destPath = path.join(uploadsDir, newName);
            fs.copyFileSync(sourcePath, destPath);
            markDbDirty();
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

    const generateValidLicense = () => {
        const secretSalt = "VAIBHAV_SOFTWARE_LOCKED_2026_X99";
        const id = getMachineId();
        const hash = crypto.createHash('sha256').update(id + secretSalt).digest('hex').substring(0, 16).toUpperCase();
        return hash.match(/.{4}/g)?.join('-') || '';
    };

    const syncKillSwitch = async (machineId: string) => {
        if (!CODCLAW_CENTRAL_URL.startsWith('https://')) return; // Opt-out/Dev fallback

        try {
            const centralClient = createClient(CODCLAW_CENTRAL_URL, CODCLAW_CENTRAL_KEY, { auth: { persistSession: false } });

            // Try to find the machine in the central database
            const { data, error } = await centralClient.from('licenses')
                .select('*').eq('machine_id', machineId).single();

            if (error && error.code === 'PGRST116') {
                // Not found! Let's auto-register it.
                // We fetch the local company name for reference if it exists.
                const orgRec = await db.select().from(appSettings).where(eq(appSettings.key, 'companyName'));
                const orgName = orgRec[0]?.value || 'Unknown Client';
                await centralClient.from('licenses').insert({
                    machine_id: machineId,
                    client_name: orgName,
                    is_active: true,
                    app_version: app.getVersion()
                });
                // Ensure it's not revoked locally
                const existingRevoked = await db.select().from(appSettings).where(eq(appSettings.key, 'cloudRevoked'));
                if (existingRevoked.length > 0) {
                    await db.delete(appSettings).where(eq(appSettings.key, 'cloudRevoked'));
                    saveDb(false);
                }
            } else if (data) {
                // If the app version has updated, sync it with the database
                if (data.app_version !== app.getVersion()) {
                    await centralClient.from('licenses')
                        .update({ app_version: app.getVersion() })
                        .eq('machine_id', machineId);
                }

                // Record found. Is it revoked?
                if (data.is_active === false) {
                    const existingRevoked = await db.select().from(appSettings).where(eq(appSettings.key, 'cloudRevoked'));
                    if (existingRevoked.length === 0 || existingRevoked[0].value !== 'true') {
                        await db.insert(appSettings).values({ key: 'cloudRevoked', value: 'true' })
                            .onConflictDoUpdate({ target: appSettings.key, set: { value: 'true' } });
                        saveDb(false);
                    }
                    // Send instant lockout signal to UI
                    const wins = BrowserWindow.getAllWindows();
                    if (wins.length > 0) wins[0].webContents.send('remote-revocation');
                } else {
                    // It's active! Ensure local revoked flag is cleared.
                    const existingRevoked = await db.select().from(appSettings).where(eq(appSettings.key, 'cloudRevoked'));
                    if (existingRevoked.length > 0) {
                        await db.delete(appSettings).where(eq(appSettings.key, 'cloudRevoked'));
                        saveDb(false);
                    }
                }
            }
        } catch (e) {
            console.error('Kill-Switch Sync Failed (Offline or Central DB Down)', e);
        }
    };

    ipcMain.handle('get-machine-id', async () => {
        return getMachineId();
    });

    ipcMain.handle('get-auth-status', async () => {
        const licenseRec = await db.select().from(appSettings).where(eq(appSettings.key, 'licenseKey'));
        const pinRec = await db.select().from(appSettings).where(eq(appSettings.key, 'dailyPin'));
        const revokedRec = await db.select().from(appSettings).where(eq(appSettings.key, 'cloudRevoked'));

        const storedLicense = licenseRec[0]?.value;
        const isLicensed = storedLicense === generateValidLicense();
        const hasPin = !!pinRec[0]?.value;
        const isCloudRevoked = revokedRec[0]?.value === 'true';

        // Background Check (Fire & Forget heartbeat)
        if (isLicensed) {
            syncKillSwitch(getMachineId());
        }

        return { isLicensed, hasPin, isCloudRevoked };
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
            // Force a sync right away upon activation
            syncKillSwitch(getMachineId());
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

    ipcMain.handle('backup-to-cloud', async () => {
        try {
            await performAutoBackup(true);
            return { success: true };
        } catch (e: any) {
            console.error("Cloud Backup Error", e);
            return { success: false, error: e.message };
        }
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

    ipcMain.handle('delete-transaction', async (_, id) => {
        const result = await db.select().from(transactions).where(eq(transactions.id, id));
        if (result.length > 0) {
            const t = result[0];
            await db.delete(transactions).where(eq(transactions.id, id));

            if (t.counterpartyId) {
                const mirrorType = t.type === 'credit' ? 'debit' : 'credit';
                const peerResults = await db.select().from(transactions).where(
                    and(
                        eq(transactions.customerId, t.counterpartyId),
                        eq(transactions.counterpartyId, t.customerId),
                        eq(transactions.amount, t.amount),
                        eq(transactions.type, mirrorType),
                        eq(transactions.date, t.date)
                    )
                );
                if (peerResults.length > 0) {
                    await db.delete(transactions).where(eq(transactions.id, peerResults[0].id));
                }
            }
            saveDb();
        }
        return true;
    });

    ipcMain.handle('update-transaction', async (_, id, data) => {
        const result = await db.select().from(transactions).where(eq(transactions.id, id));
        if (result.length > 0) {
            const t = result[0];
            const parsedData: any = { ...data };
            if (data.date) parsedData.date = new Date(data.date);
            await db.update(transactions).set(parsedData).where(eq(transactions.id, id));

            if (t.counterpartyId) {
                const mirrorType = t.type === 'credit' ? 'debit' : 'credit';
                const peerResults = await db.select().from(transactions).where(
                    and(
                        eq(transactions.customerId, t.counterpartyId),
                        eq(transactions.counterpartyId, t.customerId),
                        eq(transactions.amount, t.amount),
                        eq(transactions.type, mirrorType),
                        eq(transactions.date, t.date)
                    )
                );
                if (peerResults.length > 0) {
                    const peerData: any = {};
                    if (data.amount) peerData.amount = data.amount;
                    if (data.date) peerData.date = new Date(data.date);
                    if (data.desc) {
                        peerData.desc = data.desc;
                        if (data.desc.includes('Transfer in:')) peerData.desc = data.desc.replace('Transfer in:', 'Transfer out:');
                        else if (data.desc.includes('Transfer out:')) peerData.desc = data.desc.replace('Transfer out:', 'Transfer in:');
                    }
                    await db.update(transactions).set(peerData).where(eq(transactions.id, peerResults[0].id));
                }
            }
            saveDb();
        }
        return true;
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

        // Sync Company Name to Central Supabase
        if (key === 'companyName' && CODCLAW_CENTRAL_URL.startsWith('https://')) {
            try {
                const centralClient = createClient(CODCLAW_CENTRAL_URL, CODCLAW_CENTRAL_KEY, { auth: { persistSession: false } });
                const machineId = getMachineId();
                await centralClient.from('licenses')
                    .update({ client_name: value })
                    .eq('machine_id', machineId);
            } catch (e) {
                console.error('Failed to sync company name to central DB', e);
            }
        }

        return true;
    });
}

export async function performAutoBackup(force = false) {
    try {
        if (!force && !getDbDirtyFlag()) {
            return;
        }

        const url = CODCLAW_CENTRAL_URL;
        const key = CODCLAW_CENTRAL_KEY;
        const machineId = getMachineId();

        if (!url || !key || !url.startsWith('https://')) return; // Opt-out/Dev fallback

        const supabase = createClient(url, key, {
            auth: { persistSession: false }
        });
        const dbPath = path.join(app.getPath('userData'), 'ledgerflow_data.db');
        const uploadsDir = path.join(app.getPath('userData'), 'uploads');

        if (fs.existsSync(dbPath)) {
            const dbBuffer = fs.readFileSync(dbPath);
            const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
            const backupFileName = `ledgerflow_data_${timestamp}.db`;

            // 1. Upload new timestamped backup
            const { error: dbErr } = await supabase.storage.from('backups').upload(`${machineId}/database/${backupFileName}`, dbBuffer);
            if (dbErr) throw dbErr;

            // 2. Fetch existing backups and enforce 15-revision strategy
            const { data: files, error: listErr } = await supabase.storage.from('backups').list(`${machineId}/database/`);

            if (!listErr && files) {
                // Filter actual database files & sort by newest first
                const dbFiles = files.filter(f => f.name.endsWith('.db'));
                const sortedFiles = dbFiles.sort((a, b) => new Date(b.created_at || '').getTime() - new Date(a.created_at || '').getTime());

                // If there are more than 15 files, slice the rest and delete them
                if (sortedFiles.length > 15) {
                    const toDelete = sortedFiles.slice(15).map(f => `${machineId}/database/${f.name}`);
                    await supabase.storage.from('backups').remove(toDelete);
                }
            }
        }

        if (fs.existsSync(uploadsDir)) {
            const files = fs.readdirSync(uploadsDir);
            for (const file of files) {
                const filePath = path.join(uploadsDir, file);
                const fileBuffer = fs.readFileSync(filePath);
                await supabase.storage.from('backups').upload(`${machineId}/images/${file}`, fileBuffer, { upsert: true });
            }
        }

        resetDbDirtyFlag();
    } catch (e: any) {
        console.error("Cloud Backup Sub-Routine Error", e);
        throw e;
    }
}
