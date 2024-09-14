import { contextBridge, ipcRenderer } from 'electron'

console.log('Preload script is running')

contextBridge.exposeInMainWorld('electronAPI', {
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
  takeScreenshot: () => ipcRenderer.invoke('TAKE_SCREENSHOT'),
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
  }
})

console.log('electronAPI exposed')
