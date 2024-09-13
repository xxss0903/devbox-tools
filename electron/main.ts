import { app, BrowserWindow, ipcMain, IpcMainInvokeEvent } from 'electron'
import path from 'path'
import { execFile } from 'child_process'
import { Sequelize } from 'sequelize'
import sqlite3 from 'sqlite3'
import { open, Database } from 'sqlite'

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
ipcMain.handle('execute-adb', async (event: IpcMainInvokeEvent, command: string) => {
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
      content TEXT
    )
  `)

  return db
}

function createWindow() {
  const win = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false
    },
    resizable: false,
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
    async (event: IpcMainInvokeEvent, { date, content }: { date: string; content: string }) => {
      const db = await getDatabase()
      await db.run('INSERT OR REPLACE INTO diary_entries (date, content) VALUES (?, ?)', [
        date,
        content
      ])
    }
  )

  ipcMain.handle('get-diary-entries', async () => {
    const db = await getDatabase()
    return await db.all('SELECT date FROM diary_entries ORDER BY date DESC')
  })

  ipcMain.handle('get-diary-entry-by-date', async (event: IpcMainInvokeEvent, date: string) => {
    const db = await getDatabase()
    return await db.get('SELECT * FROM diary_entries WHERE date = ?', [date])
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
