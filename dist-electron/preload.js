import { contextBridge, ipcRenderer } from "electron";
//#region electron/preload.ts
contextBridge.exposeInMainWorld("electronAPI", {
	selectFiles: (maxFiles) => ipcRenderer.invoke("select-files", maxFiles),
	saveFile: (sourcePath) => ipcRenderer.invoke("save-file", sourcePath),
	getFileDir: () => ipcRenderer.invoke("get-file-dir"),
	openFile: (filename) => ipcRenderer.invoke("open-file", filename),
	getMachineId: () => ipcRenderer.invoke("get-machine-id"),
	getAuthStatus: () => ipcRenderer.invoke("get-auth-status"),
	activateLicense: (key) => ipcRenderer.invoke("activate-license", key),
	setPin: (pin) => ipcRenderer.invoke("set-pin", pin),
	verifyPin: (pin) => ipcRenderer.invoke("verify-pin", pin),
	resetPinViaLicense: (key) => ipcRenderer.invoke("reset-pin-via-license", key),
	backupToCloud: (config) => ipcRenderer.invoke("backup-to-cloud", config),
	saveSupabaseConfig: (config) => ipcRenderer.invoke("save-supabase-config", config),
	getSupabaseConfig: () => ipcRenderer.invoke("get-supabase-config"),
	getCustomers: () => ipcRenderer.invoke("get-customers"),
	addCustomer: (data) => ipcRenderer.invoke("add-customer", data),
	updateCustomer: (id, data) => ipcRenderer.invoke("update-customer", id, data),
	getTransactions: () => ipcRenderer.invoke("get-transactions"),
	addTransaction: (data) => ipcRenderer.invoke("add-transaction", data),
	getSettings: () => ipcRenderer.invoke("get-settings"),
	saveSetting: (key, value) => ipcRenderer.invoke("save-setting", key, value),
	ipcRenderer: {
		send: (channel, ...args) => ipcRenderer.send(channel, ...args),
		on: (channel, func) => {
			const subscription = (_event, ...args) => func(...args);
			ipcRenderer.on(channel, subscription);
			return () => ipcRenderer.removeListener(channel, subscription);
		},
		invoke: (channel, ...args) => ipcRenderer.invoke(channel, ...args)
	}
});
//#endregion
export {};
