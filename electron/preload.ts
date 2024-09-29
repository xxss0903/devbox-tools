import { contextBridge, ipcRenderer } from 'electron'

console.log('Preload script is running')

contextBridge.exposeInMainWorld('electronAPI', {
  // 关闭屏幕遮挡器
  closeScreenBlocker: () => ipcRenderer.invoke('close-screen-blocker'),
  // 保存屏幕关闭时间配置
  saveScreenBlockSettings: (settings: any) =>
    ipcRenderer.invoke('save-screen-block-settings', settings),
  // 获取屏幕关闭时间配置
  getScreenBlockSettings: () => ipcRenderer.invoke('get-screen-block-settings'),
  // 保存屏幕关闭时间
  saveScreenBlockTime: (duration: number) => ipcRenderer.invoke('save-screen-block-time', duration),
  // 获取屏幕关闭时间历史
  getScreenBlockHistory: () => ipcRenderer.invoke('get-screen-block-history'),
  // 创建屏幕关闭计时器
  createScreenBlocker: (duration: number, screenType: string) =>
    ipcRenderer.invoke('create-screen-blocker', duration, screenType),
  setDailyWorkDiaryAlarm: () => ipcRenderer.send('set-daily-work-diary-alarm'),
  // 工作提醒
  setReminder: (time: string) => ipcRenderer.send('set-reminder', time),
  closeReminder: () => ipcRenderer.send('close-reminder'),
  // 预览粘贴板的图片
  previewClipboardImage: (text: string) => ipcRenderer.invoke('preview-clipboard-image', text),
  openClipboardUrl: (text: string) => ipcRenderer.invoke('open-url', text),
  writeTextToClipboard: (text: string) => ipcRenderer.invoke('write-text-to-clipboard', text),
  writeImageToClipboard: (dataURL: string) =>
    ipcRenderer.invoke('write-image-to-clipboard', dataURL),
  // 删除粘贴板单个内容
  deleteClipboardItem: (id: number) => ipcRenderer.invoke('delete-clipboard-item', id),
  onClipboardHistoryUpdate: (callback: (history: any[]) => void) =>
    ipcRenderer.on('clipboard-history-update', (_, history) => callback(history)),
  requestClipboardHistory: () => ipcRenderer.send('request-clipboard-history'),
  clearClipboardHistory: () => ipcRenderer.send('clear-clipboard-history'),

  takeScreenshot: () => ipcRenderer.send('take-screenshot'),
  onScreenshotCaptured: (callback: (dataURL: string) => void) =>
    ipcRenderer.on('screenshot-captured', (_, dataURL) => callback(dataURL)),
  executeADB: (command: string) => {
    console.log('executeADB called with command:', command)
    return ipcRenderer.invoke('execute-adb', command)
  },
  selectFolder: () => ipcRenderer.invoke('select-folder'),
  refreshWorkDiary: () => ipcRenderer.invoke('refresh-work-diary'),
  saveDiaryEntry: (date: string, content: string, todos: string) =>
    ipcRenderer.invoke('save-diary-entry', { date, content, todos }),
  getDiaryEntries: () => ipcRenderer.invoke('get-diary-entries'),
  getDiaryEntryByDate: (date: string) => ipcRenderer.invoke('get-diary-entry-by-date', date),
  clearDatabase: () => ipcRenderer.invoke('clear-database'),
  generateWeeklySummary: (startDate: string, endDate: string) =>
    ipcRenderer.invoke('generate-weekly-summary', startDate, endDate),
  registerScreenshotShortcut: (callback: () => void) =>
    ipcRenderer.on('SCREENSHOT_SHORTCUT', callback),
  unregisterScreenshotShortcut: () => ipcRenderer.removeAllListeners('SCREENSHOT_SHORTCUT'),
  // ... 其他 API ...
  handleFileDrop: (callback: any) => {
    document.addEventListener('drop', (event: any) => {
      event.preventDefault()
      event.stopPropagation()

      const files = Array.from(event.dataTransfer.files)
        .filter((file: any) => file.path) // 确保文件有路径
        .map((file: any) => file.path)

      console.log('Dragged files:', files)

      if (files.length > 0) {
        ipcRenderer.invoke('handle-file-drop', files).then(callback)
      } else {
        console.log('No valid files dropped')
      }
    })

    document.addEventListener('dragover', (event) => {
      event.preventDefault()
      event.stopPropagation()
    })
  },
  processDroppedFiles: (filePaths: any) => {
    console.log('Processing dropped files:', filePaths)
    return ipcRenderer.invoke('handle-file-drop', filePaths)
  },
  onClipboardUpdate: (callback: (content: string) => void) =>
    ipcRenderer.on('clipboard-update', (_, content) => callback(content)),
  onClipboardImageUpdate: (callback: (dataUrl: string) => void) =>
    ipcRenderer.on('clipboard-update-image', (_, dataUrl) => callback(dataUrl)),
  deleteDiaryEntry: (date: string) => ipcRenderer.invoke('delete-diary-entry', date),
  executeCommand: (command: string) => ipcRenderer.invoke('execute-command', command),
  openPDFBoxApp: (filePath: string) => ipcRenderer.invoke('open-pdfbox-app', filePath),
  getFilePath: () => ipcRenderer.invoke('get-file-path')
})

console.log('electronAPI exposed')
