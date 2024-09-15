import { contextBridge, ipcRenderer } from 'electron'

console.log('Preload script is running')

contextBridge.exposeInMainWorld('electronAPI', {
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
    ipcRenderer.on('clipboard-update-image', (_, dataUrl) => callback(dataUrl))
})

console.log('electronAPI exposed')
