import { app, BrowserWindow, ipcMain, globalShortcut, dialog, session } from 'electron'
import path from 'path'
import { execFile } from 'child_process'
import { Sequelize } from 'sequelize'
import sqlite3 from 'sqlite3'
import { open, Database } from 'sqlite'
import { desktopCapturer } from 'electron/main'
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

async function getDatabase(): Promise<Database> {
  if (db) return db

  db = await open({
    filename: path.join(app.getPath('userData'), 'workdiary.sqlite'),
    driver: sqlite3.Database
  })

  await db.exec(`
    CREATE TABLE IF NOT EXISTS diary_entries (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      date TEXT UNIQUE,
      content TEXT,
      todos TEXT
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

function createWindow() {
  const win = new BrowserWindow({
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
    maximizable: false
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
      console.log('Retrieved entry:', entry)
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
  globalShortcut.register('Ctrl+Alt+C', () => {
    console.log('quick screen shot')
    win.webContents.send('SCREENSHOT_SHORTCUT')
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
