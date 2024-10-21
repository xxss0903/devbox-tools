import { BrowserWindow, ipcMain } from "electron"
import { clearDatabase, deleteDiaryEntry, getAlarm, getDatabase, getDiaryEntries, getDiaryEntryByDate, saveDiaryEntry } from "./database"


export function setupWorkDiaryHandle(win: BrowserWindow) {

    ipcMain.handle('clear-database', async () => {
        await clearDatabase()
      })
    

    ipcMain.handle('refresh-work-diary', async () => {
        console.log('refresh-work-diary')
      })
  
  // 添加生成周报的方法
  ipcMain.handle('generate-weekly-summary', async (event, startDate, endDate) => {
    const db = await getDatabase()
    const entries = await db.all(
      'SELECT * FROM diary_entries WHERE date BETWEEN ? AND ? ORDER BY date ASC',
      [startDate, endDate]
    )

    let summary = `周报 (${startDate} 至 ${endDate}):\n\n`

    for (const entry of entries) {
      summary += `日期: ${entry.date}\n`
      summary += `内容: ${entry.content}\n`

      const todos = JSON.parse(entry.todos || '[]')
      if (todos.length > 0) {
        summary += '待办事项:\n'
        for (const todo of todos) {
          summary += `- [${todo.done ? 'x' : ' '}] ${todo.text}\n`
        }
      }

      summary += '\n---\n\n'
    }

    // 这里可以添加更复杂的摘要生成逻辑,例如使用 AI 生成摘要

    return summary
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


  ipcMain.handle('get-saved-reminder-time', async () => {
    const alarm = await getAlarm()
    return alarm && alarm.time ? alarm.time : null
  })

}