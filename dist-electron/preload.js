import { contextBridge } from "electron";
//#region electron/preload.ts
contextBridge.exposeInMainWorld("ipcRenderer", {
	on(...args) {
		const [channel, listener] = args;
		console.log(`Setting up mock listener for ${channel}`, listener);
	},
	off(...args) {
		console.log(`Setting up mock off listener`, args);
	},
	send(...args) {
		console.log(`Mock sending to ipcRenderer`, args);
	},
	invoke(...args) {
		console.log(`Mock invoking ipcRenderer`, args);
		return Promise.resolve();
	}
});
//#endregion
export {};
