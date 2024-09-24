"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const electron_1 = require("electron");
console.log('Preload script is running');
electron_1.contextBridge.exposeInMainWorld('electronAPI', {
    setDailyWorkDiaryAlarm: () => electron_1.ipcRenderer.send('set-daily-work-diary-alarm'),
    // 工作提醒
    setReminder: (time) => electron_1.ipcRenderer.send('set-reminder', time),
    closeReminder: () => electron_1.ipcRenderer.send('close-reminder'),
    // 预览粘贴板的图片
    previewClipboardImage: (text) => electron_1.ipcRenderer.invoke('preview-clipboard-image', text),
    openClipboardUrl: (text) => electron_1.ipcRenderer.invoke('open-url', text),
    writeTextToClipboard: (text) => electron_1.ipcRenderer.invoke('write-text-to-clipboard', text),
    writeImageToClipboard: (dataURL) => electron_1.ipcRenderer.invoke('write-image-to-clipboard', dataURL),
    // 删除粘贴板单个内容
    deleteClipboardItem: (id) => electron_1.ipcRenderer.invoke('delete-clipboard-item', id),
    onClipboardHistoryUpdate: (callback) => electron_1.ipcRenderer.on('clipboard-history-update', (_, history) => callback(history)),
    requestClipboardHistory: () => electron_1.ipcRenderer.send('request-clipboard-history'),
    clearClipboardHistory: () => electron_1.ipcRenderer.send('clear-clipboard-history'),
    takeScreenshot: () => electron_1.ipcRenderer.send('take-screenshot'),
    onScreenshotCaptured: (callback) => electron_1.ipcRenderer.on('screenshot-captured', (_, dataURL) => callback(dataURL)),
    executeADB: (command) => {
        console.log('executeADB called with command:', command);
        return electron_1.ipcRenderer.invoke('execute-adb', command);
    },
    selectFolder: () => electron_1.ipcRenderer.invoke('select-folder'),
    refreshWorkDiary: () => electron_1.ipcRenderer.invoke('refresh-work-diary'),
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
    },
    onClipboardUpdate: (callback) => electron_1.ipcRenderer.on('clipboard-update', (_, content) => callback(content)),
    onClipboardImageUpdate: (callback) => electron_1.ipcRenderer.on('clipboard-update-image', (_, dataUrl) => callback(dataUrl)),
    deleteDiaryEntry: (date) => electron_1.ipcRenderer.invoke('delete-diary-entry', date)
});
console.log('electronAPI exposed');
