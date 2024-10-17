import {
  app,
  BrowserWindow,
  globalShortcut,
  session,
  clipboard,
  Menu,
  Tray
} from 'electron'
import path from 'path'
import { Sequelize } from 'sequelize'
import {
  getDatabase,
  getAlarm
} from './database'
import { scheduleDailyAlarm } from './reminderHandler'
import { setupIPCHandle } from './ipcHandle'
import { setupIPCOn, startCapture } from './ipcOn'

const fs = require('fs').promises
console.log('__dirname:', __dirname)
console.log('Preload path:', path.join(__dirname, 'preload.js'))

let sequelize: Sequelize
let lastClipboardContent: string = '' // 最新的剪切板内容


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
      nodeIntegration: true,
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
    title: '铁牛工具箱',
    skipTaskbar: true
  })

  // 关闭窗口的mennu
  Menu.setApplicationMenu(null)
  // 添加这个事件监听器来处理窗口关闭
  win.on('close', (event) => {
    event.preventDefault() // 阻止窗口关闭
    win?.minimize() // 最小化窗口
  })

  // 添加托盘图标
  const tray = new Tray(path.join(__dirname, '../public/icon.png'))
  const contextMenu = Menu.buildFromTemplate([
    { label: '显示', click: () => win?.show() },
    { label: '退出', click: () => app.exit() }
  ])
  tray.setToolTip('铁牛工具箱')
  tray.setContextMenu(contextMenu)

  // 添加双击事件处理
  tray.on('double-click', () => {
    if (win) {
      if (win.isVisible()) {
        win.focus()
      } else {
        win.show()
      }
    }
  })

  // 更新 Content-Security-Policy
  const devCSP =
    'default-src \'self\' \'unsafe-inline\' \'unsafe-eval\' blob:; script-src \'self\' \'unsafe-inline\' \'unsafe-eval\' https://icons8.com blob:; connect-src \'self\' ws: wss: https://icons8.com blob:; img-src \'self\' data: https: http: blob: https://icons8.com; style-src \'self\' \'unsafe-inline\' https://icons8.com; frame-src \'self\' https://icons8.com blob:;'
  const prodCSP =
    'default-src \'self\' blob:; script-src \'self\' https://icons8.com blob:; style-src \'self\' \'unsafe-inline\' https://icons8.com; img-src \'self\' data: https: http: blob: https://icons8.com; connect-src \'self\' https: https://icons8.com blob:; frame-src \'self\' https://icons8.com blob:;'

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
          'default-src \'self\' \'unsafe-inline\' \'unsafe-eval\' data: https: http: blob:; script-src \'self\' \'unsafe-inline\' \'unsafe-eval\' https: http: blob:; connect-src \'self\' https: http: ws: wss: blob:; img-src \'self\' data: https: http: blob:; style-src \'self\' \'unsafe-inline\' https: http:; frame-src \'self\' https: http: blob:;'
        ]
      }
    })
  })
  if (process.env.NODE_ENV !== 'development') {
    console.log('process.env.NODE_ENV:', process.env.NODE_ENV, 'development')
    win.loadURL('http://localhost:5173')
    // win.webContents.executeJavaScript(`alert('当前环境: 开发环境');`)
  } else {
    win.loadFile(path.join(__dirname, '/index.html'))
    // win.webContents.executeJavaScript(
    // `alert('当前环境: 生产环境: ${path.join(__dirname, '/index.html')} | ${__dirname}');`
    // )
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
  setupIPCHandle(win)
  setupIPCOn(win)

  // 注册全局快捷键
  globalShortcut.register(process.platform === 'darwin' ? 'Command+Option+C' : 'Ctrl+Alt+C', () => {
    console.log('快速截图')
    startCapture()
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


  // 初始化检查并设置闹钟
  const alarm = await getAlarm()
  if (alarm && alarm.time) {
    console.log('set alarm', alarm)
    scheduleDailyAlarm(win?.webContents, alarm.time)
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

    // 获取最新的剪贴板历史记录
    const history = await db.all('SELECT * FROM clipboard_history ORDER BY timestamp DESC LIMIT 50')

    // 通知渲染进程更新剪贴板历史，并发送最新的历史记录
    win?.webContents.send('clipboard-history-update', history)
    console.log('最新的剪贴板历史记录已发送到渲染进程')
  } catch (error) {
    console.error('更新剪贴板历史记录时出错:', error)
  }
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
  } else {
    win?.show()
  }
})

app.on('will-quit', () => {
  // 注销所有快捷键
  globalShortcut.unregisterAll()
})
