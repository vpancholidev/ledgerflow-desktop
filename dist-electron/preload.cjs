import { contextBridge, ipcRenderer } from "electron";
//#region \0rolldown/runtime.js
var __commonJSMin = (cb, mod) => () => (mod || (cb((mod = { exports: {} }).exports, mod), cb = null), mod.exports);
//#endregion
//#region electron/preload.cts
var require_preload = /* @__PURE__ */ __commonJSMin((() => {
	contextBridge.exposeInMainWorld("electronAPI", {
		getCustomers: () => ipcRenderer.invoke("get-customers"),
		addCustomer: (data) => ipcRenderer.invoke("add-customer", data),
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
}));
//#endregion
export default require_preload();
export {};
