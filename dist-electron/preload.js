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
    takeScreenshot: () => electron_1.ipcRenderer.invoke('TAKE_SCREENSHOT'),
    registerScreenshotShortcut: (callback) => electron_1.ipcRenderer.on('SCREENSHOT_SHORTCUT', callback),
    unregisterScreenshotShortcut: () => electron_1.ipcRenderer.removeAllListeners('SCREENSHOT_SHORTCUT'),
    // ... 其他 API ...
    handleFileDrop: (callback) => {
        document.addEventListener('drop', (event) => {
            event.preventDefault();
            event.stopPropagation();
            const files = [];
            for (const f of event.dataTransfer.files) {
                files.push({ path: f.path, name: f.name, type: f.type });
            }
            callback(files);
        });
        document.addEventListener('dragover', (event) => {
            event.preventDefault();
            event.stopPropagation();
        });
    }
});
console.log('electronAPI exposed');
