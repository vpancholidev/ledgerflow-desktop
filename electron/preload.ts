import { contextBridge } from 'electron'

contextBridge.exposeInMainWorld('ipcRenderer', {
    on(...args: unknown[]) {
        const [channel, listener] = args as [string, (...args: unknown[]) => void];
        console.log(`Setting up mock listener for ${channel}`, listener);
    },
    off(...args: unknown[]) {
        console.log(`Setting up mock off listener`, args);
    },
    send(...args: unknown[]) {
        console.log(`Mock sending to ipcRenderer`, args);
    },
    invoke(...args: unknown[]) {
        console.log(`Mock invoking ipcRenderer`, args);
        return Promise.resolve();
    },
})
