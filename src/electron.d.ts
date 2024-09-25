export interface IElectronAPI {
  executeADB(command: string): Promise<string>,
  getFilePath: () => Promise<string | null>
}

declare global {
  interface Window {
    electronAPI: IElectronAPI
  }
}