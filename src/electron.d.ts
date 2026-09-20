interface ElectronAPI {
    selectFiles: (maxFiles?: number) => Promise<string[]>;
    saveFile: (sourcePath: string) => Promise<string | null>;
    getFileDir: () => Promise<string>;
    openFile: (filename: string) => Promise<void>;
    getMachineId: () => Promise<string>;
    getAuthStatus: () => Promise<{ isLicensed: boolean, hasPin: boolean }>;
    activateLicense: (key: string) => Promise<boolean>;
    setPin: (pin: string) => Promise<boolean>;
    verifyPin: (pin: string) => Promise<boolean>;
    resetPinViaLicense: (key: string) => Promise<boolean>;

    backupToCloud: (config: { url: string, key: string }) => Promise<{ success: boolean, error?: string }>;
    saveSupabaseConfig: (config: { url: string, key: string }) => Promise<boolean>;
    getSupabaseConfig: () => Promise<{ url: string, key: string }>;

    getCustomers: () => Promise<any[]>;
    addCustomer: (data: any) => Promise<string>;
    updateCustomer: (id: string, data: any) => Promise<boolean>;
    getTransactions: () => Promise<any[]>;
    addTransaction: (data: any) => Promise<string>;
    getSettings: () => Promise<any[]>;
    saveSetting: (key: string, value: string) => Promise<boolean>;

    // Window controls
    minimize: () => Promise<void>;
    maximize: () => Promise<void>;
    close: () => Promise<void>;
    isMaximized: () => Promise<boolean>;

    ipcRenderer: {
        send: (channel: string, ...args: any[]) => void;
        on: (channel: string, func: (...args: any[]) => void) => () => void;
        invoke: (channel: string, ...args: any[]) => Promise<any>;
    };
}

interface Window {
    electronAPI: ElectronAPI;
}
