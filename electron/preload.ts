import { contextBridge, ipcRenderer } from 'electron'

console.log('Preload script is running')

contextBridge.exposeInMainWorld('electronAPI', {
  executeADB: (command: string) => {
    console.log('executeADB called with command:', command);
    return ipcRenderer.invoke('execute-adb', command);
  },
  saveDiaryEntry: (date: string, content: string, todos: string) =>
    ipcRenderer.invoke('save-diary-entry', { date, content, todos }),
  getDiaryEntries: () => ipcRenderer.invoke('get-diary-entries'),
  getDiaryEntryByDate: (date: string) => ipcRenderer.invoke('get-diary-entry-by-date', date)
})

console.log('electronAPI exposed')
