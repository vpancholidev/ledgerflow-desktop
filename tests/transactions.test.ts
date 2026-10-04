import { describe, it, expect, beforeAll, vi } from 'vitest';
import fs from 'fs';
import path from 'path';

// 1. Mock Electron entirely so the handlers can boot outside a real Electron process
vi.mock('electron', () => ({
    app: {
        getPath: () => path.join(__dirname, 'test-data'),
        getVersion: () => '1.0.0'
    },
    ipcMain: { handle: vi.fn(), on: vi.fn() },
    dialog: { showOpenDialog: vi.fn() },
    BrowserWindow: { fromWebContents: vi.fn(), getAllWindows: () => [] },
    shell: { openPath: vi.fn() }
}));

// We must import after mocking
import { ipcMain } from 'electron';
import { registerHandlers } from '../electron/database/handlers';
import { initDb, db } from '../electron/database/index';
import { transactions, customers } from '../electron/database/schema';
import { eq } from 'drizzle-orm';

describe('Deep Scenario: Transaction Engine & Double-Entry Ledger', () => {
    const registry: Record<string, Function> = {};

    beforeAll(async () => {
        // Setup local temporary DB for testing
        const testDataDir = path.join(__dirname, 'test-data');
        if (!fs.existsSync(testDataDir)) fs.mkdirSync(testDataDir);
        const dbPath = path.join(testDataDir, 'ledgerflow_data.db');
        if (fs.existsSync(dbPath)) fs.unlinkSync(dbPath); // start fresh

        await initDb();
        registerHandlers();

        // Capture all registered IPC handlers so we can trigger them programmatically
        const calls = (ipcMain.handle as any).mock.calls;
        calls.forEach((c: any) => {
            registry[c[0]] = c[1];
        });
    });

    it('Scenario 1: Creating a transaction should accurately reflect in the DB', async () => {
        // 1. Create a mock customer
        const custRes = await registry['add-customer']({}, {
            name: 'John Doe Testing',
            phone: '555-0192',
            customerNo: 'TEST-01'
        });
        const customerId = custRes.id;

        // 2. Add a basic credit transaction
        const txId = await registry['add-transaction']({}, {
            customerId,
            type: 'credit',
            amount: 500,
            desc: 'Initial Deposit',
            date: new Date().toISOString()
        });

        expect(txId).toBeDefined();

        // 3. Verify it landed in the DB correctly
        const txs = await registry['get-transactions']();
        const found = txs.find((t: any) => t.id === txId);

        expect(found).toBeDefined();
        expect(found.amount).toBe(500);
        expect(found.type).toBe('credit');
    });

    it('Scenario 2: Deleting a double-entry (counterparty) transaction must auto-delete its mirrored peer', async () => {
        // 1. Setup two customers
        const custA = await registry['add-customer']({}, { name: 'Alice', phone: '111', customerNo: 'TEST-A' });
        const custB = await registry['add-customer']({}, { name: 'Bob', phone: '222', customerNo: 'TEST-B' });

        const date = new Date().toISOString();

        // 2. Manually inject a matched pair (Alice pays Bob 100)
        // Alice Side: Debit 100
        const txAId = await registry['add-transaction']({}, {
            customerId: custA.id,
            counterpartyId: custB.id,
            type: 'debit',
            amount: 100,
            desc: 'Transfer out: Paid Bob',
            date
        });

        // Bob Side: Credit 100
        await registry['add-transaction']({}, {
            customerId: custB.id,
            counterpartyId: custA.id,
            type: 'credit', // Mirror
            amount: 100,
            desc: 'Transfer in: From Alice',
            date
        });

        // Verify there are exactly 3 transactions in the DB total (1 from Scenario 1 + 2 here)
        let allTx = await registry['get-transactions']();
        expect(allTx.length).toBe(3);

        // 3. Trigger deletion of Alice's transaction ONLY
        await registry['delete-transaction']({}, txAId);

        // 4. Verify Double-Entry logic worked (Bob's mirrored transaction should auto-delete!)
        allTx = await registry['get-transactions']();
        // We should be back down to exactly 1 transaction (the John Doe one)
        expect(allTx.length).toBe(1);
    });
});
