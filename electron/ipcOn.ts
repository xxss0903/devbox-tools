import { ipcMain, dialog, BrowserWindow, clipboard, nativeImage, shell, app } from 'electron'
import {
  getDatabase
} from './database'
import { closeReminderWindow, createReminderWindow } from './reminderHandler'
import Screenshots from 'electron-screenshots'


let screenshots: Screenshots | null = null // 截图工具

export function setupIPCOn(win: BrowserWindow) {
  initScreenShot(win)
  console.log('setupIPCHandle:', screenshots)
  // 处理从渲染进程发来的截图请求
  ipcMain.on('take-screenshot', () => {
    screenshots?.startCapture()
  })

  ipcMain.on('request-clipboard-history', async (event: any) => {
    console.log('request-clipboard-history')
    const db = await getDatabase()
    const history = await db.all('SELECT * FROM clipboard_history ORDER BY timestamp DESC LIMIT 50')
    event.reply('clipboard-history-update', history)
    return history
  })

  ipcMain.on('clear-clipboard-history', async () => {
    try {
      console.log('clear-clipboard-history')
      const db = await getDatabase()
      await db.run('DELETE FROM clipboard_history')
      console.log('剪贴板历史记录已清空')
    } catch (error) {
      console.error('清空剪贴板历史记录时出错:', error)
    }
  })

// 添加 clipboard-history-update 事件处理
  ipcMain.on('clipboard-history-update', async (event) => {
    try {
      console.log('clipboard-history-update')
      const db = await getDatabase()
      const history = await db.all('SELECT * FROM clipboard_history ORDER BY timestamp DESC LIMIT 50')
      event.reply('clipboard-history-update', history)
      console.log('剪贴板历史记录已更新并发送')
    } catch (error) {
      console.error('获取剪贴板历史记录时出错:', error)
    }
  })

  ipcMain.on('set-reminder', (event, time) => {
    const delay = new Date(time).getTime() - Date.now()
    console.log('set-reminder', delay)
    setTimeout(() => {
      createReminderWindow('您置的提醒时到了')
    }, delay)
  })

}

export function initScreenShot(win: Electron.CrossProcessExports.BrowserWindow) {
  // 初始化截图工具
  screenshots = new Screenshots({
    singleWindow: true, // 使用单窗口模式
    lang: {
      operation_ok_title: '确定',
      operation_cancel_title: '取消',
      operation_save_title: '保存'
      // ... 其他语言设置
    }
  })
  // 监听截图完成事件
  screenshots.on('ok', (e, buffer, data: any) => {
    console.log('data', data)
    const image = nativeImage.createFromBuffer(buffer)
    const base64 = image.toDataURL()
    console.log('截图已捕获')

    // 将截图保存到系统粘贴板
    clipboard.writeImage(image)
    console.log('截图已保存到系统粘贴板')

    win?.webContents.send('screenshot-captured', base64)
  })

  // 监听截图取消事件
  screenshots.on('cancel', () => {
    console.log('Screenshot cancelled')
  })

}

export function startCapture() {
  console.log('startCapture:', screenshots)
  screenshots?.startCapture()
}
