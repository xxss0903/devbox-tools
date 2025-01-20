import { BrowserWindow, ipcMain } from "electron"
import {
  clearDatabase,
  deleteDiaryEntry,
  getAlarm,
  getDatabase,
  getDiaryEntries,
  getDiaryEntryByDate,
  saveAlarm,
  saveDiaryEntry
} from './database'
import { closeReminderWindow } from './reminderHandler'

interface TodoItem {
  text: string
  done: boolean
}

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

    let summary = `周报 (${startDate} 至 ${endDate}):\n`

    for (const entry of entries) {
      summary += `日期: ${entry.date}\n`
      summary += `内容: ${entry.content}`

      const todos = JSON.parse(entry.todos || '[]')
      if (todos.length > 0) {
        summary += '待办事项:\n'
        for (const todo of todos) {
          summary += `- [${todo.done ? 'x' : ' '}] ${todo.text}\n`
        }
      }

      summary += '------------------\n'
    }

    // 这里可以添加更复杂的摘要生成逻辑,例如使用 AI 生成摘要

    return summary
  })

  // 添加年终总结的处理函数
  ipcMain.handle('generate-year-summary', async (event, startDate, endDate) => {
    const db = await getDatabase()
    const entries = await db.all(
      'SELECT * FROM diary_entries WHERE date BETWEEN ? AND ? ORDER BY date ASC',
      [startDate, endDate]
    )

    let summary = `年终总结 (${startDate} 至 ${endDate}):\n\n`
    
    // 按月份分组
    const monthlyEntries = new Map()
    for (const entry of entries) {
      const month = entry.date.substring(0, 7) // 获取 YYYY-MM 格式
      if (!monthlyEntries.has(month)) {
        monthlyEntries.set(month, [])
      }
      monthlyEntries.get(month).push(entry)
    }

    // 按月份生成总结
    for (const [month, monthEntries] of monthlyEntries) {
      summary += `## ${month} 月度总结\n\n`
      
      // 合并当月所有工作内容
      let monthContent = ''
      let monthTodos: TodoItem[] = []
      
      for (const entry of monthEntries) {
        monthContent += entry.content + '\n'
        const todos = JSON.parse(entry.todos || '[]') as TodoItem[]
        monthTodos = monthTodos.concat(todos)
      }

      // 添加工作内容
      summary += `### 主要工作内容：\n${monthContent}\n`

      // 添加完成的待办事项
      const completedTodos = monthTodos.filter(todo => todo.done)
      if (completedTodos.length > 0) {
        summary += '### 完成的重要事项：\n'
        for (const todo of completedTodos) {
          summary += `- ${todo.text}\n`
        }
      }

      summary += '\n------------------\n\n'
    }

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

  ipcMain.handle('close-reminder', async () => {
    closeReminderWindow()
  })

  // 保存那你提醒日志时间
  ipcMain.handle('set-daily-work-diary-alarm', async (event, time) => {
    console.log("save reminder time", time)
    await saveAlarm(time)
  })

}