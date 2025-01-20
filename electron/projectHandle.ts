import { BrowserWindow, ipcMain } from 'electron'
import { getProjectLogs, saveProjectLog, getProjectLogByDate } from './database'

export function setupProjectHandle(win: BrowserWindow) {
  // ... existing code ...

  // 添加项目日志
  ipcMain.handle('save-project-log', async (event, projectId: string, date: string, content: string) => {
    await saveProjectLog(projectId, date, content)
    return { success: true }
  })

  // 获取项目日志
  ipcMain.handle('get-project-logs', async (event, projectId: string) => {
    return await getProjectLogs(projectId)
  })

  // 获取指定日期的项目日志
  ipcMain.handle('get-project-log-by-date', async (event, projectId: string, date: string) => {
    return await getProjectLogByDate(projectId, date)
  })
} 