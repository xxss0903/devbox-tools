import moment from 'moment'
import { BrowserWindow } from 'electron'
import path from 'path'

export function scheduleDailyAlarm(sender: Electron.WebContents, time: string) {
  const now = moment()
  const nextAlarm = moment(moment().format('YYYY-MM-DD') + ' ' + time)
  if (now.isAfter(nextAlarm)) {
    nextAlarm.add(1, 'day')
  }

  const delay = nextAlarm.diff(now)
  console.log('set alarm 2', time, delay)
  setTimeout(() => {
    triggerAlarm(sender)
    setInterval(() => triggerAlarm(sender), 24 * 60 * 60 * 1000) // 每24小时触发一次
  }, delay)
}

// 触发闹钟事件
export function triggerAlarm(sender: Electron.WebContents) {
  createReminderWindow('您设置的提醒时间到了')
}

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
