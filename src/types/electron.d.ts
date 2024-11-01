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
  chatWithAI: (prompt: string, model?: string, image?: string) => Promise<boolean>
  getOllamaModels: () => Promise<any[]>
  pullOllamaModel: (modelName: string) => Promise<void>
  deleteOllamaModel: (modelName: string) => Promise<void>
  setDefaultModel: (modelName: string) => Promise<void>
  getDefaultModel: () => Promise<string>
  onModelPullProgress: (callback: (progress: number) => void) => void
  onOllamaStream: (callback: (content: string) => void) => void
  onOllamaDone: (callback: () => void) => void
}

declare global {
  interface Window {
    electronAPI: IElectronAPI
  }
}
