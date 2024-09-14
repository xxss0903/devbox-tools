"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const electron_1 = require("electron");
console.log('Preload script is running');
electron_1.contextBridge.exposeInMainWorld('electronAPI', {
    executeADB: (command) => {
        console.log('executeADB called with command:', command);
        return electron_1.ipcRenderer.invoke('execute-adb', command);
    },
    processDroppedFiles: (filePaths) => electron_1.ipcRenderer.invoke('process-dropped-files', filePaths),
    selectFolder: () => electron_1.ipcRenderer.invoke('select-folder'),
    saveDiaryEntry: (date, content, todos) => electron_1.ipcRenderer.invoke('save-diary-entry', { date, content, todos }),
    getDiaryEntries: () => electron_1.ipcRenderer.invoke('get-diary-entries'),
    getDiaryEntryByDate: (date) => electron_1.ipcRenderer.invoke('get-diary-entry-by-date', date),
    clearDatabase: () => electron_1.ipcRenderer.invoke('clear-database'),
    generateWeeklySummary: (startDate, endDate) => electron_1.ipcRenderer.invoke('generate-weekly-summary', startDate, endDate),
    takeScreenshot: () => electron_1.ipcRenderer.invoke('TAKE_SCREENSHOT')
});
console.log('electronAPI exposed');
