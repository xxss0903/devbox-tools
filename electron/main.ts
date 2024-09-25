import {
  app,
  BrowserWindow,
  ipcMain,
  globalShortcut,
  dialog,
  session,
  clipboard,
  Menu,
  shell
} from 'electron'
import path from 'path'
import { execFile, exec } from 'child_process'
import { Sequelize } from 'sequelize'
import sqlite3 from 'sqlite3'
import { open, Database } from 'sqlite'
import { desktopCapturer } from 'electron/main'
import Screenshots from 'electron-screenshots'
import { nativeImage } from 'electron/common'
const fs = require('fs').promises
console.log('__dirname:', __dirname)
console.log('Preload path:', path.join(__dirname, 'preload.js'))

// ADB 可执行文件的路径
const adbPath = path.join(
  app.getAppPath(),
  'resources',
  'adb',
  process.platform === 'win32' ? 'adb.exe' : 'adb'
)

// 添加执行 ADB 命令的方法
ipcMain.handle('execute-adb', async (event: any, command: string) => {
  return new Promise<string>((resolve, reject) => {
    execFile(adbPath, command.split(' '), (error: Error | null, stdout: string, stderr: string) => {
      if (error) {
        reject(error.message)
      } else {
        resolve(stdout)
      }
    })
  })
})

let sequelize: Sequelize
let db: Database | null = null
let lastClipboardContent: string = '' // 最新的剪切板内容

async function getDatabase(): Promise<Database> {
  if (db) return db

  db = await open({
    filename: path.join(app.getPath('userData'), 'workdiary.sqlite'),
    driver: sqlite3.Database
  })

  // 创建 alarms 表
  await db.exec(`
    CREATE TABLE IF NOT EXISTS alarms (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      time TEXT
    )
  `)

  // 创建现有的diary_entries表
  await db.exec(`
    CREATE TABLE IF NOT EXISTS diary_entries (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      date TEXT UNIQUE,
      content TEXT,
      todos TEXT
    )
  `)

  // 创建clipboard_history表
  await db.exec(`
    CREATE TABLE IF NOT EXISTS clipboard_history (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      type TEXT,
      content TEXT,
      timestamp INTEGER
    )
  `)

  return db
}

// 添加选择文件夹的方法
ipcMain.handle('select-folder', async () => {
  const result = await dialog.showOpenDialog({
    properties: ['openDirectory']
  })
  if (result.canceled) {
    return null
  }
  const files = await fs.readdir(result.filePaths[0])
  const imageFiles = await Promise.all(
    files
      .filter((file: string) => /\.(jpg|jpeg|png)$/i.test(file))
      .map(async (file: string) => {
        const filePath = path.join(result.filePaths[0], file)
        const stats = await fs.stat(filePath)
        const fileContent = await fs.readFile(filePath, { encoding: 'base64' })
        return {
          name: file,
          size: stats.size,
          data: `data:image/${path.extname(file).slice(1)};base64,${fileContent}`
        }
      })
  )
  return imageFiles
})

// 添加这个新的IPC处理程序
ipcMain.handle('process-dropped-files', async (event, filePaths) => {
  const imageFiles = await Promise.all(
    filePaths
      .filter((filePath: string) => /\.(jpg|jpeg|png)$/i.test(filePath))
      .map(async (filePath: string) => {
        const stats = await fs.stat(filePath)
        const fileContent = await fs.readFile(filePath, { encoding: 'base64' })
        return {
          name: path.basename(filePath),
          size: stats.size,
          data: `data:image/${path.extname(filePath).slice(1)};base64,${fileContent}`
        }
      })
  )
  return imageFiles
})

// 添加清空数据库的方法
ipcMain.handle('clear-database', async () => {
  const db = await getDatabase()
  await db.run('DELETE FROM diary_entries')
  console.log('数据库已清空')
})

let screenshots: Screenshots | null = null // 截图工具
let win: BrowserWindow | null = null // 主窗口

// 设置mac应用图标
if (process.platform === 'darwin') {
  const iconPath = path.join(__dirname, '../public/icon.png')
  app.dock.setIcon(iconPath)
}

// 设置 Dock 菜单
const dockMenu = Menu.buildFromTemplate([
  {
    label: '铁牛工具箱',
    submenu: [
      {
        label: '退出',
        click: () => {
          app.quit()
        }
      }
    ]
  }
])
// 根据macOS进行条件判断
if (process.platform === 'darwin') {
  app.dock.setMenu(dockMenu)
  app.setName('铁牛工具箱')
}

app.setName('铁牛工具箱')

async function createWindow() {
  win = new BrowserWindow({
    width: 1600,
    height: 800,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
      webviewTag: true,
      webSecurity: false, // 注意：这可能会带来安全风险，仅在开发环境使用
      sandbox: false,
      allowRunningInsecureContent: true,
      experimentalFeatures: true
    },
    resizable: true,
    maximizable: false,
    icon: path.join(__dirname, '../public/icon.png'),
    titleBarOverlay: {
      color: '#2f3237',
      symbolColor: '#74b1be',
      height: 22
    },
    title: '铁牛工具箱'
  })

  // 更新 Content-Security-Policy
  const devCSP =
    "default-src 'self' 'unsafe-inline' 'unsafe-eval' blob:; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://icons8.com blob:; connect-src 'self' ws: wss: https://icons8.com blob:; img-src 'self' data: https: http: blob: https://icons8.com; style-src 'self' 'unsafe-inline' https://icons8.com; frame-src 'self' https://icons8.com blob:;"
  const prodCSP =
    "default-src 'self' blob:; script-src 'self' https://icons8.com blob:; style-src 'self' 'unsafe-inline' https://icons8.com; img-src 'self' data: https: http: blob: https://icons8.com; connect-src 'self' https: https://icons8.com blob:; frame-src 'self' https://icons8.com blob:;"

  win.webContents.session.webRequest.onHeadersReceived((details, callback) => {
    callback({
      responseHeaders: {
        ...details.responseHeaders,
        'Content-Security-Policy': [process.env.NODE_ENV !== 'production' ? devCSP : prodCSP]
      }
    })
  })

  // 设置 webview 权限
  session.defaultSession.webRequest.onHeadersReceived((details, callback) => {
    callback({
      responseHeaders: {
        ...details.responseHeaders,
        'Content-Security-Policy': [
          "default-src 'self' 'unsafe-inline' 'unsafe-eval' data: https: http: blob:; script-src 'self' 'unsafe-inline' 'unsafe-eval' https: http: blob:; connect-src 'self' https: http: ws: wss: blob:; img-src 'self' data: https: http: blob:; style-src 'self' 'unsafe-inline' https: http:; frame-src 'self' https: http: blob:;"
        ]
      }
    })
  })

  if (process.env.NODE_ENV !== 'production') {
    win.loadURL('http://localhost:5173')
  } else {
    win.loadFile(path.join(__dirname, '../dist/index.html'))
  }

  // 设置数据库连接
  const dbPath = path.join(app.getPath('userData'), 'database.sqlite')
  sequelize = new Sequelize({
    dialect: 'sqlite',
    storage: dbPath
  })

  // 测试数据库连接
  sequelize
    .authenticate()
    .then(() => console.log('数据库连接成功'))
    .catch((err) => console.error('无法连接到数据库:', err))

  // 设置SQLite数据库文件路径
  process.env.SQLITE_DB_PATH = path.join(app.getPath('userData'), 'workdiary.sqlite')

  // 设置IPC处理程序
  ipcMain.handle(
    'save-diary-entry',
    async (
      event: any,
      { date, content, todos }: { date: string; content: string; todos: string }
    ) => {
      console.log('save diary ', date, todos, content)
      const db = await getDatabase()
      const res = await db.run(
        'INSERT OR REPLACE INTO diary_entries (date, content, todos) VALUES (?, ?, ?)',
        [date, content, todos]
      )
      console.log('insert db res', res)
    }
  )

  ipcMain.handle('get-diary-entries', async () => {
    const db = await getDatabase()
    return await db.all('SELECT * FROM diary_entries ORDER BY date DESC')
  })

  ipcMain.handle('get-diary-entry-by-date', async (event: any, date: string) => {
    const db = await getDatabase()
    const entry = await db.get('SELECT * FROM diary_entries WHERE date = ?', [date])
    if (entry) {
      return {
        ...entry,
        todos: entry.todos || '[]'
      }
    }
    return null
  })

  // 添加IPC监听器
  ipcMain.handle('TAKE_SCREENSHOT', async () => {
    const sources = await desktopCapturer.getSources({
      types: ['screen'],
      thumbnailSize: { width: 1920, height: 1080 }
    })
    return sources[0].thumbnail.toDataURL()
  })

  // 注册全局快捷键
  globalShortcut.register(process.platform === 'darwin' ? 'Command+Option+C' : 'Ctrl+Alt+C', () => {
    console.log('快速截图')
    screenshots?.startCapture()
  })

  win?.webContents.on('did-finish-load', async () => {
    await checkAndUpdateClipboard()
    console.log('get latestcontent 2:', lastClipboardContent)
    watchClipboard(win!!)
  })

  // 允许加载本地文件
  app.on('web-contents-created', (event, contents) => {
    contents.on('will-navigate', (event, navigationUrl) => {
      const parsedUrl = new URL(navigationUrl)
      if (parsedUrl.protocol === 'file:') {
        event.preventDefault()
      }
    })
  })

  // 添加文件拖放处理
  win.webContents.on('will-navigate', (event, url) => {
    if (url.startsWith('file://')) {
      event.preventDefault()
    }
  })

  // 默认打开开发者工具
  win.webContents.openDevTools()

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

  // 检查并设置闹钟
  const db = await getDatabase()
  const alarm = await db.get('SELECT * FROM alarms WHERE id = 1')
  if (alarm) {
    scheduleDailyAlarm(win?.webContents)
  }
}

async function checkAndUpdateClipboard() {
  if (!win) return

  const db = await getDatabase()
  const latestItem = await db.get('SELECT * FROM clipboard_history ORDER BY timestamp DESC LIMIT 1')

  console.log('get latestcontent 1:', latestItem)

  if (latestItem) {
    if (latestItem.type === 'text') {
      lastClipboardContent = latestItem.content
    } else if (latestItem.type === 'image') {
      lastClipboardContent = latestItem.content
    }
  }
}

async function watchClipboard(win: BrowserWindow) {
  const db = await getDatabase()
  setInterval(async () => {
    const currentContent = clipboard.readText()
    if (currentContent && currentContent !== lastClipboardContent) {
      lastClipboardContent = currentContent
      await updateClipboardHistory(win, 'text', currentContent)
    }

    const image = clipboard.readImage()
    if (!image.isEmpty()) {
      const dataURL = image.toDataURL()
      if (dataURL !== lastClipboardContent) {
        lastClipboardContent = dataURL
        await updateClipboardHistory(win, 'image', dataURL)
        console.log('watchClipboard interval 1000 image update')
      }
    }
  }, 1000)
}

async function updateClipboardHistory(win: BrowserWindow, type: string, content: string) {
  try {
    const db = await getDatabase()

    const existingItem = await db.get('SELECT * FROM clipboard_history WHERE content = ?', content)
    if (existingItem) {
      await db.run(
        'UPDATE clipboard_history SET timestamp = ? WHERE id = ?',
        Date.now(),
        existingItem.id
      )
      console.log('剪贴板内容已更新到最近的时间内')
    } else {
      await db.run(
        'INSERT INTO clipboard_history (type, content, timestamp) VALUES (?, ?, ?)',
        type,
        content,
        Date.now()
      )
      console.log('剪贴板内容已添加到历史记录')
    }

    // await db.run(
    //   'INSERT INTO clipboard_history (type, content, timestamp) VALUES (?, ?, ?)',
    //   type,
    //   content,
    //   Date.now()
    // )
    // console.log('剪贴板内容已添加到历史记录')

    // 获取最新的剪贴板历史记录
    const history = await db.all('SELECT * FROM clipboard_history ORDER BY timestamp DESC LIMIT 50')

    // 通知渲染进程更新剪贴板历史，并发送最新的历史记录
    win?.webContents.send('clipboard-history-update', history)
    console.log('最新的剪贴板历史记录已发送到渲染进程')
  } catch (error) {
    console.error('更新剪贴板历史记录时出错:', error)
  }
}

ipcMain.handle('handle-file-drop', async (event, filePaths) => {
  console.log('Received file paths:', filePaths)
  const processedFiles = []
  for (const filePath of filePaths) {
    if (!filePath) {
      console.error('Received undefined or empty file path')
      continue
    }
    try {
      console.log('Processing file:', filePath)
      const stats = await fs.promises.stat(filePath)
      if (stats.isFile()) {
        const fileBuffer = await fs.promises.readFile(filePath)
        const base64 = fileBuffer.toString('base64')
        const extname = path.extname(filePath).slice(1)
        processedFiles.push({
          name: path.basename(filePath),
          size: stats.size,
          data: `data:image/${extname};base64,${base64}`
        })
      } else {
        console.log('Not a file:', filePath)
      }
    } catch (error) {
      console.error('Error processing file:', filePath, error)
    }
  }
  console.log('Processed files:', processedFiles.length)
  return processedFiles
})

app.whenReady().then(createWindow)

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
  // 关闭数据库连接
  if (sequelize) {
    sequelize.close()
  }
})

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow()
  }
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

app.on('will-quit', () => {
  // 注销所有快捷键
  globalShortcut.unregisterAll()
})

// 处理从渲染进程发来的截图请求
ipcMain.on('take-screenshot', () => {
  screenshots?.startCapture()
})

// IPC 处理器
ipcMain.handle('add-clipboard-item', async (event, item) => {
  const db = await getDatabase()
  await db.run(
    'INSERT INTO clipboard_history (type, content, timestamp) VALUES (?, ?, ?)',
    item.type,
    item.content,
    item.timestamp
  )
})

ipcMain.handle('get-clipboard-history', async (event, limit) => {
  const db = await getDatabase()
  return await db.all('SELECT * FROM clipboard_history ORDER BY timestamp DESC LIMIT ?', limit)
})

ipcMain.handle('clear-clipboard-history', async () => {
  const db = await getDatabase()
  await db.run('DELETE FROM clipboard_history')
})

// IPC 处理器
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

ipcMain.handle('delete-clipboard-item', async (event, id) => {
  const db = await getDatabase()
  await db.run('DELETE FROM clipboard_history WHERE id = ?', id)
  const updatedHistory = await db.all('SELECT * FROM clipboard_history ORDER BY timestamp DESC')
  return updatedHistory
})

ipcMain.handle('write-text-to-clipboard', async (event, text) => {
  clipboard.writeText(text)
})

ipcMain.handle('open-url', async (event, text) => {
  // 打开url
  shell.openExternal(text)
})

ipcMain.handle('preview-clipboard-image', async (event, text) => {
  // 打开图片
  shell.openPath(text)
})

ipcMain.handle('write-image-to-clipboard', async (event, dataURL) => {
  const img = nativeImage.createFromDataURL(dataURL)
  clipboard.writeImage(img)
})

// 添加删除日记条目的方法
ipcMain.handle('delete-diary-entry', async (event, date) => {
  try {
    const db = await getDatabase()
    await db.run('DELETE FROM diary_entries WHERE date = ?', [date])
    console.log(`日记条目已删除: ${date}`)
    return { success: true, message: '日记条目已成功删除' }
  } catch (error) {
    console.error('删除日记条目时出错:', error)
    return { success: false, message: '删除日记条目时出错' }
  }
})

ipcMain.handle('refresh-work-diary', async () => {
  console.log('refresh-work-diary')
})

// 工作提醒
let reminderWindow: BrowserWindow | null = null

function createReminderWindow(message: string) {
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

ipcMain.on('set-reminder', (event, time) => {
  const delay = new Date(time).getTime() - Date.now()
  console.log('set-reminder', delay)
  setTimeout(() => {
    createReminderWindow('您设置的提醒时间到了')
  }, delay)
})

// 设置每天6点钟的闹钟
ipcMain.on('set-daily-work-diary-alarm', async (event) => {
  console.log('set-daily-work-diary-alarm to 21:55')
  const db = await getDatabase()
  await db.run('INSERT OR REPLACE INTO alarms (id, time) VALUES (1, ?)', '23:00')
  scheduleDailyAlarm(event.sender)
})

ipcMain.on('close-reminder', () => {
  reminderWindow?.close()
  reminderWindow = null
  console.log('close-reminder')
})

// 调度每天21:50的闹钟
import moment from 'moment'

function scheduleDailyAlarm(sender: Electron.WebContents) {
  const now = moment()

  const nextAlarm = moment(moment().format('YYYY-MM-DD') + ' 23:06')

  if (now.isAfter(nextAlarm)) {
    nextAlarm.add(1, 'day')
  }

  const delay = nextAlarm.diff(now)
  console.log('scheduleDailyAlarm', delay)
  setTimeout(() => {
    triggerAlarm(sender)
    setInterval(() => triggerAlarm(sender), 24 * 60 * 60 * 1000) // 每24小时触发一次
  }, delay)
}

// 触发闹钟事件
function triggerAlarm(sender: Electron.WebContents) {
  createReminderWindow('您设置的提醒时间到了')
}

ipcMain.handle('execute-command', async (_, command) => {
  return new Promise((resolve, reject) => {
    exec(command, (error, stdout, stderr) => {
      if (error) {
        reject(error);
      } else {
        resolve(stdout);
      }
    });
  });
});

// 打开pdf的接口工具
ipcMain.handle('open-pdfbox-app', async (_, filePath) => {
  return new Promise((resolve, reject) => {
    const pdfBoxPath = path.join(app.getAppPath(), 'public', 'pdfbox-app.jar');
    exec(`java -jar "${pdfBoxPath}" debug "${filePath}"`, (error, stdout, stderr) => {
      if (error) {
        reject(error);
      } else {
        resolve(stdout);
      }
    });
  });
});

// 选择文件
ipcMain.handle('get-file-path', async (event, options) => {
  const result = await dialog.showOpenDialog({
    properties: ['openFile'],
    filters: [
      { name: 'PDF Files', extensions: ['pdf'] }
    ]
  })
  if (result.canceled) {
    return null
  } else {
    return result.filePaths[0]
  }
})