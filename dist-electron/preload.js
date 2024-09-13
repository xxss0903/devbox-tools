"use strict";
const { contextBridge, ipcRenderer } = require('electron');
console.log('Preload script is running');
contextBridge.exposeInMainWorld('electronAPI', {
    saveDiaryEntry: (date, content, todos) => ipcRenderer.invoke('save-diary-entry', { date, content, todos }),
    getDiaryEntries: () => ipcRenderer.invoke('get-diary-entries'),
    getDiaryEntryByDate: (date) => ipcRenderer.invoke('get-diary-entry-by-date', date)
});
console.log('electronAPI exposed');
