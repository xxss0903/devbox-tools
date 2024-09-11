/// <reference types="vite-electron-plugin" />
/// <reference types="vite-plugin-electron/electron-env" />

declare namespace NodeJS {
  interface ProcessEnv {
    VITE_DEV_SERVER_URL: string;
    ELECTRON: string;
  }
}
