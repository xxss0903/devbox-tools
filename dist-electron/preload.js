"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const electron_1 = require("electron");
console.log('Preload script is running');
electron_1.contextBridge.exposeInMainWorld('electronAPI', {
    takeScreenshot: () => electron_1.ipcRenderer.send('take-screenshot'),
    onScreenshotCaptured: (callback) => electron_1.ipcRenderer.on('screenshot-captured', (_, dataURL) => callback(dataURL)),
    executeADB: (command) => {
        console.log('executeADB called with command:', command);
        return electron_1.ipcRenderer.invoke('execute-adb', command);
    },
    selectFolder: () => electron_1.ipcRenderer.invoke('select-folder'),
    saveDiaryEntry: (date, content, todos) => electron_1.ipcRenderer.invoke('save-diary-entry', { date, content, todos }),
    getDiaryEntries: () => electron_1.ipcRenderer.invoke('get-diary-entries'),
    getDiaryEntryByDate: (date) => electron_1.ipcRenderer.invoke('get-diary-entry-by-date', date),
    clearDatabase: () => electron_1.ipcRenderer.invoke('clear-database'),
    generateWeeklySummary: (startDate, endDate) => electron_1.ipcRenderer.invoke('generate-weekly-summary', startDate, endDate),
    registerScreenshotShortcut: (callback) => electron_1.ipcRenderer.on('SCREENSHOT_SHORTCUT', callback),
    unregisterScreenshotShortcut: () => electron_1.ipcRenderer.removeAllListeners('SCREENSHOT_SHORTCUT'),
    // ... 其他 API ...
    handleFileDrop: (callback) => {
        document.addEventListener('drop', (event) => {
            event.preventDefault();
            event.stopPropagation();
            const files = Array.from(event.dataTransfer.files)
                .filter((file) => file.path) // 确保文件有路径
                .map((file) => file.path);
            console.log('Dragged files:', files);
            if (files.length > 0) {
                electron_1.ipcRenderer.invoke('handle-file-drop', files).then(callback);
            }
            else {
                console.log('No valid files dropped');
            }
        });
        document.addEventListener('dragover', (event) => {
            event.preventDefault();
            event.stopPropagation();
        });
    },
    processDroppedFiles: (filePaths) => {
        console.log('Processing dropped files:', filePaths);
        return electron_1.ipcRenderer.invoke('handle-file-drop', filePaths);
    }
});
console.log('electronAPI exposed');
