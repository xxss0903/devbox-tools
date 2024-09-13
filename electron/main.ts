const { app, BrowserWindow, ipcMain } = require('electron')
const path = require('path')
const { execFile } = require('child_process')
import { Sequelize } from 'sequelize'

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
ipcMain.handle('execute-adb', async (event: any, command: any) => {
  return new Promise((resolve: any, reject: any) => {
    execFile(adbPath, command.split(' '), (error: any, stdout: any, stderr: any) => {
      if (error) {
        reject(error.message)
      } else {
        resolve(stdout)
      }
    })
  })
})

let sequelize: Sequelize

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
