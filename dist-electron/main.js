"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const electron_1 = require("electron");
const path_1 = __importDefault(require("path"));
const sequelize_1 = require("sequelize");
const database_1 = require("./database");
const reminderHandler_1 = require("./reminderHandler");
const ipcHandle_1 = require("./ipcHandle");
const ipcOn_1 = require("./ipcOn");
const clipboardManager_1 = require("./clipboardManager");
console.log('__dirname:', __dirname);
console.log('Preload path:', path_1.default.join(__dirname, 'preload.js'));
// 设置mac应用图标
if (process.platform === 'darwin') {
    const iconPath = path_1.default.join(__dirname, '../public/icon.png');
    electron_1.app.dock.setIcon(iconPath);
}
// 设置 Dock 菜单
const dockMenu = electron_1.Menu.buildFromTemplate([
    {
        label: '铁牛工具箱',
        submenu: [
            {
                label: '退出',
                click: () => {
                    electron_1.app.quit();
                }
            }
        ]
    }
]);
// 根据macOS进行条件判断
if (process.platform === 'darwin') {
    electron_1.app.dock.setMenu(dockMenu);
    electron_1.app.setName('铁牛工具箱');
}
electron_1.app.setName('铁牛工具箱');
// 数据库连接
let sequelize;
// 主窗口
let win = null;
async function createWindow() {
    // 关闭窗口的mennu
    // Menu.setApplicationMenu(null)
    // 创建主窗口
    win = new electron_1.BrowserWindow({
        width: 1600,
        height: 800,
        webPreferences: {
            preload: path_1.default.join(__dirname, 'preload.js'),
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
        icon: path_1.default.join(__dirname, '../public/icon.png'),
        titleBarOverlay: {
            color: '#2f3237',
            symbolColor: '#74b1be',
            height: 22
        },
        title: '铁牛工具箱',
        skipTaskbar: true
    });
    // 初始化主窗口监听器
    initMainWinListener(win);
    // 设置IPC处理程序
    (0, ipcHandle_1.setupIPCHandle)(win);
    // 设置IPC监听程序
    (0, ipcOn_1.setupIPCOn)(win);
    // 初始化全局快捷键
    initGlobalShortcut(win);
    // 更新 Content-Security-Policy
    setupContentSecurityPolicy(win);
    setupWebviewPermissions();
    // 初始化数据库
    await initDatabase();
    // 初始化数据库之后开始设置闹钟
    await initSetDiaryReminder(win);
    if (process.env.NODE_ENV !== 'development') {
        console.log('process.env.NODE_ENV:', process.env.NODE_ENV, 'development');
        win.loadURL('http://localhost:5173');
        // win.webContents.executeJavaScript(`alert('当前环境: 开发环境');`)
    }
    else {
        win.loadFile(path_1.default.join(__dirname, '/index.html'));
    }
}
function setupContentSecurityPolicy(win) {
    const devCSP = 'default-src \'self\' \'unsafe-inline\' \'unsafe-eval\' blob:; script-src \'self\' \'unsafe-inline\' \'unsafe-eval\' https://icons8.com blob:; connect-src \'self\' ws: wss: https://icons8.com blob:; img-src \'self\' data: https: http: blob: https://icons8.com; style-src \'self\' \'unsafe-inline\' https://icons8.com; frame-src \'self\' https://icons8.com blob:;';
    const prodCSP = 'default-src \'self\' blob:; script-src \'self\' https://icons8.com blob:; style-src \'self\' \'unsafe-inline\' https://icons8.com; img-src \'self\' data: https: http: blob: https://icons8.com; connect-src \'self\' https: https://icons8.com blob:; frame-src \'self\' https://icons8.com blob:;';
    win.webContents.session.webRequest.onHeadersReceived((details, callback) => {
        callback({
            responseHeaders: {
                ...details.responseHeaders,
                'Content-Security-Policy': [process.env.NODE_ENV !== 'production' ? devCSP : prodCSP]
            }
        });
    });
}
function setupWebviewPermissions() {
    // 设置 webview 权限
    electron_1.session.defaultSession.webRequest.onHeadersReceived((details, callback) => {
        callback({
            responseHeaders: {
                ...details.responseHeaders,
                'Content-Security-Policy': [
                    'default-src \'self\' \'unsafe-inline\' \'unsafe-eval\' data: https: http: blob:; script-src \'self\' \'unsafe-inline\' \'unsafe-eval\' https: http: blob:; connect-src \'self\' https: http: ws: wss: blob:; img-src \'self\' data: https: http: blob:; style-src \'self\' \'unsafe-inline\' https: http:; frame-src \'self\' https: http: blob:;'
                ]
            }
        });
    });
}
// 注册全局快捷键
function initGlobalShortcut(win) {
    electron_1.globalShortcut.register(process.platform === 'darwin' ? 'Command+Option+C' : 'Ctrl+Alt+C', () => {
        console.log('快速截图');
        (0, ipcOn_1.startCapture)();
    });
}
async function initSetDiaryReminder(win) {
    // 初始化检查并设置闹钟
    const alarm = await (0, database_1.getAlarm)();
    if (alarm && alarm.time) {
        console.log('set alarm', alarm);
        (0, reminderHandler_1.scheduleDailyAlarm)(win?.webContents, alarm.time);
    }
}
async function initDatabase() {
    // 设置数据库连接
    const dbPath = path_1.default.join(electron_1.app.getPath('userData'), 'database.sqlite');
    sequelize = new sequelize_1.Sequelize({
        dialect: 'sqlite',
        storage: dbPath
    });
    // 测试数据库连接
    try {
        await sequelize.authenticate();
        console.log('数据库连接成功');
    }
    catch (err) {
        console.error('无法连接到数据库:', err);
    }
    // 设置SQLite数据库文件路径
    process.env.SQLITE_DB_PATH = path_1.default.join(electron_1.app.getPath('userData'), 'workdiary.sqlite');
}
// 初始化主窗口监听器
function initMainWinListener(win) {
    win.webContents.on('did-finish-load', async () => {
        await (0, clipboardManager_1.checkAndUpdateClipboard)(win);
        (0, clipboardManager_1.watchClipboard)(win);
    });
    // 添加文件拖放处理
    win.webContents.on('will-navigate', (event, url) => {
        if (url.startsWith('file://')) {
            event.preventDefault();
        }
    });
    // 添加这个事件监听器来处理窗口关闭
    win.on('close', (event) => {
        event.preventDefault(); // 阻止窗口关闭
        win?.minimize(); // 最小化窗口
    });
    // 默认打开开发者工具
    win.webContents.openDevTools();
}
electron_1.app.whenReady().then(() => {
    createWindow();
    initTray();
});
electron_1.app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        electron_1.app.quit();
    }
    // 关闭数据库连接
    if (sequelize) {
        sequelize.close();
    }
});
electron_1.app.on('activate', () => {
    if (electron_1.BrowserWindow.getAllWindows().length === 0) {
        createWindow();
    }
    else {
        win?.show();
    }
});
electron_1.app.on('will-quit', () => {
    // 注销所有快捷键
    electron_1.globalShortcut.unregisterAll();
});
// 允许加载本地文件
electron_1.app.on('web-contents-created', (event, contents) => {
    contents.on('will-navigate', (event, navigationUrl) => {
        const parsedUrl = new URL(navigationUrl);
        if (parsedUrl.protocol === 'file:') {
            event.preventDefault();
        }
    });
});
function initTray() {
    // 添加托盘图标
    const tray = new electron_1.Tray(path_1.default.join(__dirname, '../public/icon.png'));
    const contextMenu = electron_1.Menu.buildFromTemplate([
        { label: '显示', click: () => win?.show() },
        { label: '退出', click: () => electron_1.app.exit() }
    ]);
    tray.setToolTip('铁牛工具箱');
    tray.setContextMenu(contextMenu);
    // 添加双击事件处理
    tray.on('double-click', () => {
        if (win) {
            if (win.isVisible()) {
                win.focus();
            }
            else {
                win.show();
            }
        }
    });
}
