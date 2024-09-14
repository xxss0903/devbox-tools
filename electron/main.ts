import { app, BrowserWindow, ipcMain, dialog } from 'electron'
import path from 'path'
import { execFile } from 'child_process'
import { Sequelize } from 'sequelize'
import sqlite3 from 'sqlite3'
import { open, Database } from 'sqlite'
const fs = require('fs').promises;
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
  });
  if (result.canceled) {
    return null;
  }
  const files = await fs.readdir(result.filePaths[0]);
  const imageFiles = await Promise.all(files
    .filter((file: string) => /\.(jpg|jpeg|png)$/i.test(file))
    .map(async (file: string) => {
      const filePath = path.join(result.filePaths[0], file);
      const stats = await fs.stat(filePath);
      const fileContent = await fs.readFile(filePath, { encoding: 'base64' });
      return {
        name: file,
        size: stats.size,
        data: `data:image/${path.extname(file).slice(1)};base64,${fileContent}`
      };
    }));
  return imageFiles;
});

// 添加这个新的IPC处理程序
ipcMain.handle('process-dropped-files', async (event, filePaths) => {
  const imageFiles = await Promise.all(filePaths
    .filter((filePath: string) => /\.(jpg|jpeg|png)$/i.test(filePath))
    .map(async (filePath: string) => {
      const stats = await fs.stat(filePath);
      const fileContent = await fs.readFile(filePath, { encoding: 'base64' });
      return {
        name: path.basename(filePath),
        size: stats.size,
        data: `data:image/${path.extname(filePath).slice(1)};base64,${fileContent}`
      };
    }));
  return imageFiles;
});

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
      contextIsolation: true, // 启用 contextIsolation
      nodeIntegration: false, // 禁用 nodeIntegration
      webviewTag: true, // 启用webview标签
      webSecurity: true
    },
    resizable: true,
    maximizable: false
  });

  // 更新 Content-Security-Policy
  const devCSP = "default-src 'self' 'unsafe-inline' 'unsafe-eval'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://icons8.com; connect-src 'self' ws: wss: https://icons8.com; img-src 'self' data: https: https://icons8.com; style-src 'self' 'unsafe-inline' https://icons8.com; frame-src 'self' https://icons8.com;";
  const prodCSP = "default-src 'self'; script-src 'self' https://icons8.com; style-src 'self' 'unsafe-inline' https://icons8.com; img-src 'self' data: https: https://icons8.com; connect-src 'self' https: https://icons8.com; frame-src 'self' https://icons8.com;";

  win.webContents.session.webRequest.onHeadersReceived((details, callback) => {
    callback({
      responseHeaders: {
        ...details.responseHeaders,
        'Content-Security-Policy': [process.env.NODE_ENV !== 'production' ? devCSP : prodCSP]
      }
    })
  });

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
  
  // 默认打开开发者工具
  win.webContents.openDevTools()
}

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
