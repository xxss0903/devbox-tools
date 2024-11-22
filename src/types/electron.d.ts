import { DiaryEntry } from '../services/database'

export interface FileTreeNode {
  name: string
  path: string
  isDirectory: boolean
}

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
  getFilePath: (file: File) => Promise<string>
  getDroppedFolderPath: (file: File) => Promise<string>
  selectProjectFolder: () => Promise<Array<{ name: string; data: string }>>
  openInEditor: (path: string) => Promise<void>
  openInFinder: (path: string) => Promise<void>
  getProjectStats: (path: string) => Promise<{
    fileCount: number
    folderCount: number
    totalSize: number
  }>
  getProjectFileTree: (path: string) => Promise<FileTreeNode[]>
}

declare global {
  interface Window {
    electronAPI: IElectronAPI
    projectAPI: import('./project').IProjectAPI
  }
}
