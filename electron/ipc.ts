import { ipcMain, dialog, BrowserWindow, clipboard, nativeImage } from 'electron'
import { execFile, exec } from 'child_process'
import path from 'path'
import fs from 'fs/promises'
import {
  saveDiaryEntry,
  getDiaryEntries,
  getDiaryEntryByDate,
  deleteDiaryEntry,
  clearDatabase,
  saveScreenBlockerStatus,
  getScreenBlockerStatus,
  saveAlarm,
  getAlarm
} from './database'
import { createScreenBlocker, closeScreenBlocker } from './screenBlocker'

export function setupIPC(win: BrowserWindow) {
  ipcMain.handle('execute-adb', async (event, command: string) => {
    // ADB 执行逻辑
  })

  ipcMain.handle('select-folder', async () => {
    // 选择文件夹逻辑
  })

  ipcMain.handle('process-dropped-files', async (event, filePaths) => {
    // 处理拖放文件逻辑
  })

  ipcMain.handle('save-diary-entry', async (event, { date, content, todos }) => {
    await saveDiaryEntry(date, content, todos)
  })

  ipcMain.handle('get-diary-entries', async () => {
    return await getDiaryEntries()
  })

  ipcMain.handle('get-diary-entry-by-date', async (event, date) => {
    return await getDiaryEntryByDate(date)
  })

  ipcMain.handle('delete-diary-entry', async (event, date) => {
    await deleteDiaryEntry(date)
    return { success: true, message: '日记条目已成功删除' }
  })

  ipcMain.handle('clear-database', async () => {
    await clearDatabase()
  })

  ipcMain.handle('set-screen-blocker-status', async (event, isActive: boolean, duration?: number) => {
    const startTime = isActive ? Date.now() : null
    if (startTime && duration) {
      await saveScreenBlockerStatus(isActive, startTime, duration)
    } else {
      await saveScreenBlockerStatus(isActive, 0, 0)
    }
    return { success: true }
  })

  ipcMain.handle('get-screen-blocker-status', async () => {
    return await getScreenBlockerStatus()
  })

  ipcMain.on('set-daily-work-diary-alarm', async (event, time) => {
    await saveAlarm(time)
    // 这里需要调用 scheduleDailyAlarm 函数,可能需要将其移动到这个文件中
  })

  ipcMain.handle('get-saved-reminder-time', async () => {
    const alarm = await getAlarm()
    return alarm && alarm.time ? alarm.time : null
  })

  ipcMain.handle('create-screen-blocker', (event, duration, screenType) => {
    createScreenBlocker(screenType, duration)
    setTimeout(() => {
      closeScreenBlocker()
    }, duration)
    return '屏幕遮挡器已创建'
  })

  ipcMain.handle('close-screen-blocker', () => {
    closeScreenBlocker()
    return '屏幕遮挡器已关闭'
  })

  // 其他 IPC 处理程序...
}
