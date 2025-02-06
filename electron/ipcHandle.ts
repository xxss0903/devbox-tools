import { BrowserWindow } from 'electron'
import { setupScreenBlockerHandle } from './screenBlockerHandle'
import { setupWorkDiaryHandle } from './workDiaryHandle'
import { setupClipboardManagerHandle } from './clipboardManagerHandle'
import { setupOpenExeHandle } from './openExeHandle'
import { setupOllamaChatHandle } from './chatWithOllama'

export function setupIPCHandle(win: BrowserWindow) {
  // 打开exe的接口工具
  setupOpenExeHandle(win)
  // 屏幕遮挡
  setupScreenBlockerHandle(win)    
  // 工作日记
  setupWorkDiaryHandle(win)
  // 剪切板管理
  setupClipboardManagerHandle(win)
  // AI 分析
  setupOllamaChatHandle(win)
}
