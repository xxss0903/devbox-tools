"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const electron_1 = require("electron");
console.log('Preload script is running');
electron_1.contextBridge.exposeInMainWorld('electronAPI', {
    // 设置屏幕保护时间
    setScreenBlockerStatus: (isActive, duration) => electron_1.ipcRenderer.invoke('set-screen-blocker-status', isActive, duration),
    // 获取屏幕保护时间
    getScreenBlockerStatus: () => electron_1.ipcRenderer.invoke('get-screen-blocker-status'),
    // 关闭屏幕遮挡器
    closeScreenBlocker: () => electron_1.ipcRenderer.invoke('close-screen-blocker'),
    // 保存屏幕关闭时间配置
    saveScreenBlockSettings: (settings) => electron_1.ipcRenderer.invoke('save-screen-block-settings', settings),
    // 获取屏幕关闭时间配置
    getScreenBlockSettings: () => electron_1.ipcRenderer.invoke('get-screen-block-settings'),
    // 保存屏幕关闭时间
    saveScreenBlockTime: (duration) => electron_1.ipcRenderer.invoke('save-screen-block-time', duration),
    // 获取屏幕关闭时间历史
    getScreenBlockHistory: () => electron_1.ipcRenderer.invoke('get-screen-block-history'),
    // 创建屏幕关闭计时器
    createScreenBlocker: (duration, screenType) => electron_1.ipcRenderer.invoke('create-screen-blocker', duration, screenType),
    // 开启/关闭屏幕的保护时间，开启就会根据时间倒计时开启屏幕保护
    toggleScreenBlock: () => electron_1.ipcRenderer.send('toggle-screen-block'),
    // 获取日志提醒时间
    getSavedReminderTime: () => electron_1.ipcRenderer.invoke('get-saved-reminder-time'),
    // 设置日志提醒时间
    setDailyWorkDiaryAlarm: (time) => electron_1.ipcRenderer.send('set-daily-work-diary-alarm', time),
    // 开启/关闭日志提醒
    toggleDailyWorkDiaryAlarm: () => electron_1.ipcRenderer.send('toggle-daily-work-diary-alarm'),
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
    deleteDiaryEntry: (date) => electron_1.ipcRenderer.invoke('delete-diary-entry', date),
    executeCommand: (command) => electron_1.ipcRenderer.invoke('execute-command', command),
    openPDFBoxApp: (filePath) => electron_1.ipcRenderer.invoke('open-pdfbox-app', filePath),
    getFilePath: () => electron_1.ipcRenderer.invoke('get-file-path')
});
console.log('electronAPI exposed');
