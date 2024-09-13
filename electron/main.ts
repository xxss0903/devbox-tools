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

function createWindow() {
  const win = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: false,
      nodeIntegration: true,
      webviewTag: true // 启用webview标签
    },
    resizable: true,
    maximizable: false
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
      console.log('save diary ', todos, content)
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
