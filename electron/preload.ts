const { contextBridge, ipcRenderer } = require('electron')

console.log('Preload script is running')

contextBridge.exposeInMainWorld('electronAPI', {
  saveDiaryEntry: (date: string, content: string) =>
    ipcRenderer.invoke('save-diary-entry', { date, content }),
  getDiaryEntries: () => ipcRenderer.invoke('get-diary-entries'),
  getDiaryEntryByDate: (date: string) => ipcRenderer.invoke('get-diary-entry-by-date', date)
})

console.log('electronAPI exposed')
