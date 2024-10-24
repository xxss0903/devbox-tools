import moment from 'moment'
import { BrowserWindow } from 'electron'
import path from 'path'

// 工作提醒
let reminderWindow: BrowserWindow | null = null

export function createReminderWindow(message: string) {
  console.log('createReminderWindow', message)
  reminderWindow = new BrowserWindow({
    width: 340,
    height: 380,
    show: false,
    frame: false,
    alwaysOnTop: true,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js')
    },
    icon: path.join(__dirname, '../public/icon.png')
  })

  // 加载 workdiary.html 文件
  reminderWindow.loadFile(path.join(__dirname, '../public/workdiary_reminder.html'))

  // 传递提醒消息到渲染进程
  reminderWindow.webContents.once('did-finish-load', () => {
    reminderWindow?.webContents.send('set-reminder-message', message)
  })

  reminderWindow.once('ready-to-show', () => {
    reminderWindow?.show()
  })
}

export function closeReminderWindow(){
  reminderWindow?.close()
  reminderWindow = null
}
