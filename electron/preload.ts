import { contextBridge, ipcRenderer } from 'electron';

// Expose secure IPC API
contextBridge.exposeInMainWorld('electronAPI', {
    selectFiles: (maxFiles?: number) => ipcRenderer.invoke('select-files', maxFiles),
    saveFile: (sourcePath: string) => ipcRenderer.invoke('save-file', sourcePath),
    getFileDir: () => ipcRenderer.invoke('get-file-dir'),
    openFile: (filename: string) => ipcRenderer.invoke('open-file', filename),

    getMachineId: () => ipcRenderer.invoke('get-machine-id'),
    getAuthStatus: () => ipcRenderer.invoke('get-auth-status'),
    activateLicense: (key: string) => ipcRenderer.invoke('activate-license', key),
    setPin: (pin: string) => ipcRenderer.invoke('set-pin', pin),
    verifyPin: (pin: string) => ipcRenderer.invoke('verify-pin', pin),
    resetPinViaLicense: (key: string) => ipcRenderer.invoke('reset-pin-via-license', key),

    backupToCloud: (config: any) => ipcRenderer.invoke('backup-to-cloud', config),
    saveSupabaseConfig: (config: any) => ipcRenderer.invoke('save-supabase-config', config),
    getSupabaseConfig: () => ipcRenderer.invoke('get-supabase-config'),

    getCustomers: () => ipcRenderer.invoke('get-customers'),
    addCustomer: (data: any) => ipcRenderer.invoke('add-customer', data),
    updateCustomer: (id: string, data: any) => ipcRenderer.invoke('update-customer', id, data),

    getTransactions: () => ipcRenderer.invoke('get-transactions'),
    addTransaction: (data: any) => ipcRenderer.invoke('add-transaction', data),

    getSettings: () => ipcRenderer.invoke('get-settings'),
    saveSetting: (key: string, value: string) => ipcRenderer.invoke('save-setting', key, value),

    // Kept for general events handling and bridging
    ipcRenderer: {
        send: (channel: string, ...args: any[]) => ipcRenderer.send(channel, ...args),
        on: (channel: string, func: (...args: any[]) => void) => {
            const subscription = (_event: any, ...args: any[]) => func(...args);
            ipcRenderer.on(channel, subscription);
            return () => ipcRenderer.removeListener(channel, subscription);
        },
        invoke: (channel: string, ...args: any[]) => ipcRenderer.invoke(channel, ...args)
    }
});
