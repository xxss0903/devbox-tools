interface IElectronAPI {
  saveDiaryEntry: (date: string, content: string) => Promise<void>
  getDiaryEntries: () => Promise<DiaryEntry[]>
  getDiaryEntryByDate: (date: string) => Promise<DiaryEntry | null>
}

declare global {
  interface Window {
    electronAPI: IElectronAPI
  }
}
