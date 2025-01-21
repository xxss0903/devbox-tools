import { BrowserWindow, ipcMain } from 'electron'
import { 
  getProjectLogs, 
  saveProjectLog, 
  getProjectLogByDate,
  getProjectLatestProgress,
  getProjectProgressHistory
} from './database'

export function setupProjectHandle(win: BrowserWindow) {
  // ... existing code ...

  // 添加项目日志
  ipcMain.handle(
    'save-project-log', 
    async (event, projectId: string, date: string, content: string, progress: number, status: string) => {
      await saveProjectLog(projectId, date, content, progress, status)
      return { success: true }
    }
  )

  // 获取项目最新进度
  ipcMain.handle('get-project-latest-progress', async (event, projectId: string) => {
    return await getProjectLatestProgress(projectId)
  })

  // 获取项目进度历史
  ipcMain.handle('get-project-progress-history', async (event, projectId: string) => {
    return await getProjectProgressHistory(projectId)
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