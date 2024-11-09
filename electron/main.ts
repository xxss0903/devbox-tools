import { app, BrowserWindow, globalShortcut, session, Menu, Tray, ipcMain, dialog } from 'electron'
import path from 'path'
import { Sequelize } from 'sequelize'
import { setupIPCHandle } from './ipcHandle'
import { setupIPCOn, startCapture } from './ipcOn'
import { checkAndUpdateClipboard, watchClipboard } from './clipboardManager'
import { startScreenBlockerLoopByMinute } from './screenBlocker'
import { autoLaunch } from './autoLaunch'
import { Project } from './models/Project'

console.log('__dirname:', __dirname)
console.log('Preload path:', path.join(__dirname, 'preload.js'))

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

// 数据库连接
export let sequelize: Sequelize
// 主窗口
let win: BrowserWindow | null = null

async function createWindow() {
  // 关闭窗口的mennu
  // Menu.setApplicationMenu(null)
  // 创建主窗口
  win = new BrowserWindow({
    width: 1600,
    height: 1000,
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
    title: '铁牛工具箱'
  })
  // 初始化主窗口监听器
  initMainWinListener(win)
  // 设置IPC处理程序
  setupIPCHandle(win)
  // 设置IPC监听程序
  setupIPCOn(win)
  // 初始化全局快捷键
  initGlobalShortcut(win)
  // 更新 Content-Security-Policy
  setupContentSecurityPolicy(win)
  setupWebviewPermissions()
  // 初始化数据库
  await initDatabase()
  const isDebug = true
  if (isDebug) {
    console.log('process.env.NODE_ENV:', process.env.NODE_ENV, 'development')
    win.loadURL('http://localhost:5173')
    // win.webContents.executeJavaScript(`alert('当前环境: 开发环境');`)
    // 默认打开开发者工具
    win.webContents.openDevTools()
  } else {
    win.loadFile(path.join(__dirname, '/index.html'))
  }

  // 添加IPC监器
  ipcMain.handle('get-auto-launch', async () => {
    return await autoLaunch.isEnabled()
  })

  ipcMain.handle('set-auto-launch', async (_, enable: boolean) => {
    if (enable) {
      await autoLaunch.enable()
    } else {
      await autoLaunch.disable()
    }
    return await autoLaunch.isEnabled()
  })

  // 项目相关的IPC处理器
  ipcMain.handle('create-project', async (_, projectData) => {
    try {
      console.log('create roject', _, projectData)
      const project = await Project.create(projectData)
      return project
    } catch (error) {
      console.error('创建项目失败:', error)
      throw error
    }
  })

  ipcMain.handle('get-projects', async () => {
    try {
      const projects = await Project.findAll({
        where: {
          isArchived: false
        }
      })
      return projects
    } catch (error) {
      console.error('获取项目列表失败:', error)
      throw error
    }
  })

  ipcMain.handle('update-project', async (_, id, updates) => {
    try {
      const project = await Project.findByPk(id)
      if (!project) {
        throw new Error('项目不存在')
      }
      await project.update(updates)
      return project
    } catch (error) {
      console.error('更新项目失败:', error)
      throw error
    }
  })

  ipcMain.handle('delete-project', async (_, id) => {
    try {
      const project = await Project.findByPk(id)
      if (!project) {
        throw new Error('项目不存在')
      }
      await project.update({ isArchived: true })
      return true
    } catch (error) {
      console.error('删除项目失败:', error)
      throw error
    }
  })
}

function setupContentSecurityPolicy(win: BrowserWindow) {
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
}

function setupWebviewPermissions() {
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
}

// 注册全局快捷键
function initGlobalShortcut(win: BrowserWindow) {
  globalShortcut.register(process.platform === 'darwin' ? 'Command+Option+C' : 'Ctrl+Alt+C', () => {
    console.log('快速截图')
    startCapture()
  })
}

async function initDatabase() {
  // 设置数据库连接
  const dbPath = path.join(app.getPath('userData'), 'database.sqlite')
  sequelize = new Sequelize({
    dialect: 'sqlite',
    storage: dbPath,
    logging: false // 关闭 SQL 日志输出
  })

  // 测试数据库连接
  try {
    await sequelize.authenticate()
    console.log('数据库连接成功')

    // 初始化 Project 模型
    Project.initModel(sequelize)

    // 同步项目表
    await Project.sync()

    console.log('项目表同步成功')
  } catch (err) {
    console.error('数据库初始化失败:', err)
  }

  // 设置SQLite数据库文件路径
  process.env.SQLITE_DB_PATH = path.join(app.getPath('userData'), 'workdiary.sqlite')
}

// 初始化主窗口监听器
function initMainWinListener(win: BrowserWindow) {
  win.webContents.on('did-finish-load', async () => {
    await checkAndUpdateClipboard(win!!)
    watchClipboard(win!!)
  })

  // 添加文件拖放处理
  win.webContents.on('will-navigate', (event, url) => {
    if (url.startsWith('file://')) {
      event.preventDefault()
    }
  })

  // 添加这个事件监听器来处理窗口关闭
  win.on('close', (event) => {
    event.preventDefault() // 阻止窗口关闭
    win?.minimize() // 最小化窗口
  })
}

// 只使用中文
app.commandLine.appendSwitch('lang', 'zh-CN')

// 初始化应用
app.whenReady().then(() => {
  // 创建窗口
  createWindow()
  // 初始化托盘
  initTray()
  // 开启屏保轮询
  startScreenBlockerLoopByMinute(win!!)
})

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

// 允许加载本地文件
app.on('web-contents-created', (event, contents) => {
  contents.on('will-navigate', (event, navigationUrl) => {
    const parsedUrl = new URL(navigationUrl)
    if (parsedUrl.protocol === 'file:') {
      event.preventDefault()
    }
  })
})

function initTray() {
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
}

// 添加 IPC 处理器
ipcMain.handle('get-dropped-folder-path', async (_, filePath) => {
  console.log('get-dropped-folder-path:', _, filePath)
  return filePath
})

ipcMain.handle('select-project-folder', async () => {
  const result = await dialog.showOpenDialog({
    properties: ['openDirectory'],
    title: '选择项目文件夹'
  })

  if (result.canceled || result.filePaths.length === 0) {
    return []
  }

  const folderPath = result.filePaths[0]
  const folderName = path.basename(folderPath)

  return [
    {
      name: folderName,
      size: 0,
      data: folderPath
    }
  ]
})
