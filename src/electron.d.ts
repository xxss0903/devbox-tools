export interface IElectronAPI {
  executeADB(command: string): Promise<string>
}

declare global {
  interface Window {
    electronAPI: IElectronAPI
  }
}