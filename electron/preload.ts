import { contextBridge, ipcRenderer } from 'electron';

console.log('Preload script is running');

contextBridge.exposeInMainWorld('electronAPI', {
  executeADB: (command: string) => {
    console.log('executeADB called with command:', command);
    return ipcRenderer.invoke('execute-adb', command);
  },
  processDroppedFiles: (filePaths: string[]) => ipcRenderer.invoke('process-dropped-files', filePaths),
  selectFolder: () => ipcRenderer.invoke('select-folder'),
  saveDiaryEntry: (date: string, content: string, todos: string) =>
    ipcRenderer.invoke('save-diary-entry', { date, content, todos }),
  getDiaryEntries: () => ipcRenderer.invoke('get-diary-entries'),
  getDiaryEntryByDate: (date: string) => ipcRenderer.invoke('get-diary-entry-by-date', date),
  clearDatabase: () => ipcRenderer.invoke('clear-database'),
  generateWeeklySummary: (startDate: string, endDate: string) => 
    ipcRenderer.invoke('generate-weekly-summary', startDate, endDate),
});

console.log('electronAPI exposed');
