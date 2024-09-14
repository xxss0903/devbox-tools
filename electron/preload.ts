import { contextBridge, ipcRenderer } from 'electron'

console.log('Preload script is running')

contextBridge.exposeInMainWorld('electronAPI', {
  executeADB: (command: string) => {
    console.log('executeADB called with command:', command)
    return ipcRenderer.invoke('execute-adb', command)
  },
  processDroppedFiles: (filePaths: string[]) =>
    ipcRenderer.invoke('process-dropped-files', filePaths),
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

      const files = []
      for (const f of event.dataTransfer.files) {
        files.push({ path: f.path, name: f.name, type: f.type })
      }
      callback(files)
    })

    document.addEventListener('dragover', (event) => {
      event.preventDefault()
      event.stopPropagation()
    })
  }
})

console.log('electronAPI exposed')
