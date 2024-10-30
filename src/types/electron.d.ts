import { DiaryEntry } from '../services/database'

export interface IElectronAPI {
  executeADB: (command: string) => Promise<string>
  selectFolder: () => Promise<{ name: string; size: number; data: string }[]>
  saveDiaryEntry: (date: string, content: string, todos: string) => Promise<void>
  getDiaryEntries: () => Promise<DiaryEntry[]>
  getDiaryEntryByDate: (date: string) => Promise<DiaryEntry | null>
  processDroppedFiles: (
    filePaths: string[]
  ) => Promise<{ name: string; size: number; data: string }[]>
  writeImageToClipboard: (imageData: string) => Promise<void>
}

declare global {
  interface Window {
    electronAPI: IElectronAPI
  }
}
