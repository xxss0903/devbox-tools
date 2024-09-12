const { contextBridge, ipcRenderer } = require('electron');

console.log('Preload script is running');

contextBridge.exposeInMainWorld('electronAPI', {
  executeADB: (command: string) => {
    console.log('executeADB called with command:', command);
    return ipcRenderer.invoke('execute-adb', command);
  }
});

console.log('electronAPI exposed');