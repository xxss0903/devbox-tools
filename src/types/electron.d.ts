import { DiaryEntry } from '../services/database'

export interface IElectronAPI {
  saveDiaryEntry: (date: string, content: string, todos: string) => Promise<void>
  getDiaryEntries: () => Promise<DiaryEntry[]>
  getDiaryEntryByDate: (date: string) => Promise<DiaryEntry | null>
}

declare global {
  interface Window {
    electronAPI: IElectronAPI
  }
}
