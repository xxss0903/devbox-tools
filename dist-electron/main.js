"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const electron_1 = require("electron");
const path_1 = __importDefault(require("path"));
const child_process_1 = require("child_process");
const sequelize_1 = require("sequelize");
const sqlite3_1 = __importDefault(require("sqlite3"));
const sqlite_1 = require("sqlite");
const main_1 = require("electron/main");
const electron_screenshots_1 = __importDefault(require("electron-screenshots"));
const common_1 = require("electron/common");
const fs = require('fs').promises;
console.log('__dirname:', __dirname);
console.log('Preload path:', path_1.default.join(__dirname, 'preload.js'));
// ADB 可执行文件的路径
const adbPath = path_1.default.join(electron_1.app.getAppPath(), 'resources', 'adb', process.platform === 'win32' ? 'adb.exe' : 'adb');
// 添加执行 ADB 命令的方法
electron_1.ipcMain.handle('execute-adb', async (event, command) => {
    return new Promise((resolve, reject) => {
        (0, child_process_1.execFile)(adbPath, command.split(' '), (error, stdout, stderr) => {
            if (error) {
                reject(error.message);
            }
            else {
                resolve(stdout);
            }
        });
    });
});
let sequelize;
let db = null;
let lastClipboardContent = ''; // 最新的剪切板内容
async function getDatabase() {
    if (db)
        return db;
    db = await (0, sqlite_1.open)({
        filename: path_1.default.join(electron_1.app.getPath('userData'), 'workdiary.sqlite'),
        driver: sqlite3_1.default.Database
    });
    // 创建现有的diary_entries表
    await db.exec(`
    CREATE TABLE IF NOT EXISTS diary_entries (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      date TEXT UNIQUE,
      content TEXT,
      todos TEXT
    )
  `);
    // 创建clipboard_history表
    await db.exec(`
    CREATE TABLE IF NOT EXISTS clipboard_history (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      type TEXT,
      content TEXT,
      timestamp INTEGER
    )
  `);
    return db;
}
// 添加选择文件夹的方法
electron_1.ipcMain.handle('select-folder', async () => {
    const result = await electron_1.dialog.showOpenDialog({
        properties: ['openDirectory']
    });
    if (result.canceled) {
        return null;
    }
    const files = await fs.readdir(result.filePaths[0]);
    const imageFiles = await Promise.all(files
        .filter((file) => /\.(jpg|jpeg|png)$/i.test(file))
        .map(async (file) => {
        const filePath = path_1.default.join(result.filePaths[0], file);
        const stats = await fs.stat(filePath);
        const fileContent = await fs.readFile(filePath, { encoding: 'base64' });
        return {
            name: file,
            size: stats.size,
            data: `data:image/${path_1.default.extname(file).slice(1)};base64,${fileContent}`
        };
    }));
    return imageFiles;
});
// 添加这个新的IPC处理程序
electron_1.ipcMain.handle('process-dropped-files', async (event, filePaths) => {
    const imageFiles = await Promise.all(filePaths
        .filter((filePath) => /\.(jpg|jpeg|png)$/i.test(filePath))
        .map(async (filePath) => {
        const stats = await fs.stat(filePath);
        const fileContent = await fs.readFile(filePath, { encoding: 'base64' });
        return {
            name: path_1.default.basename(filePath),
            size: stats.size,
            data: `data:image/${path_1.default.extname(filePath).slice(1)};base64,${fileContent}`
        };
    }));
    return imageFiles;
});
// 添加清空数据库的方法
electron_1.ipcMain.handle('clear-database', async () => {
    const db = await getDatabase();
    await db.run('DELETE FROM diary_entries');
    console.log('数据库已清空');
});
let screenshots = null; // 截图工具
let win = null; // 主窗口
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
async function createWindow() {
    win = new electron_1.BrowserWindow({
        width: 1600,
        height: 800,
        webPreferences: {
            preload: path_1.default.join(__dirname, 'preload.js'),
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
        icon: path_1.default.join(__dirname, '../public/icon.png'),
        titleBarOverlay: {
            color: '#2f3237',
            symbolColor: '#74b1be',
            height: 22
        },
        title: '铁牛工具箱'
    });
    // 更新 Content-Security-Policy
    const devCSP = "default-src 'self' 'unsafe-inline' 'unsafe-eval' blob:; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://icons8.com blob:; connect-src 'self' ws: wss: https://icons8.com blob:; img-src 'self' data: https: http: blob: https://icons8.com; style-src 'self' 'unsafe-inline' https://icons8.com; frame-src 'self' https://icons8.com blob:;";
    const prodCSP = "default-src 'self' blob:; script-src 'self' https://icons8.com blob:; style-src 'self' 'unsafe-inline' https://icons8.com; img-src 'self' data: https: http: blob: https://icons8.com; connect-src 'self' https: https://icons8.com blob:; frame-src 'self' https://icons8.com blob:;";
    win.webContents.session.webRequest.onHeadersReceived((details, callback) => {
        callback({
            responseHeaders: {
                ...details.responseHeaders,
                'Content-Security-Policy': [process.env.NODE_ENV !== 'production' ? devCSP : prodCSP]
            }
        });
    });
    // 设置 webview 权限
    electron_1.session.defaultSession.webRequest.onHeadersReceived((details, callback) => {
        callback({
            responseHeaders: {
                ...details.responseHeaders,
                'Content-Security-Policy': [
                    "default-src 'self' 'unsafe-inline' 'unsafe-eval' data: https: http: blob:; script-src 'self' 'unsafe-inline' 'unsafe-eval' https: http: blob:; connect-src 'self' https: http: ws: wss: blob:; img-src 'self' data: https: http: blob:; style-src 'self' 'unsafe-inline' https: http:; frame-src 'self' https: http: blob:;"
                ]
            }
        });
    });
    if (process.env.NODE_ENV !== 'production') {
        win.loadURL('http://localhost:5173');
    }
    else {
        win.loadFile(path_1.default.join(__dirname, '../dist/index.html'));
    }
    // 设置数据库连接
    const dbPath = path_1.default.join(electron_1.app.getPath('userData'), 'database.sqlite');
    sequelize = new sequelize_1.Sequelize({
        dialect: 'sqlite',
        storage: dbPath
    });
    // 测试数据库连接
    sequelize
        .authenticate()
        .then(() => console.log('数据库连接成功'))
        .catch((err) => console.error('无法连接到数据库:', err));
    // 设置SQLite数据库文件路径
    process.env.SQLITE_DB_PATH = path_1.default.join(electron_1.app.getPath('userData'), 'workdiary.sqlite');
    // 设置IPC处理程序
    electron_1.ipcMain.handle('save-diary-entry', async (event, { date, content, todos }) => {
        console.log('save diary ', date, todos, content);
        const db = await getDatabase();
        const res = await db.run('INSERT OR REPLACE INTO diary_entries (date, content, todos) VALUES (?, ?, ?)', [date, content, todos]);
        console.log('insert db res', res);
    });
    electron_1.ipcMain.handle('get-diary-entries', async () => {
        const db = await getDatabase();
        return await db.all('SELECT * FROM diary_entries ORDER BY date DESC');
    });
    electron_1.ipcMain.handle('get-diary-entry-by-date', async (event, date) => {
        const db = await getDatabase();
        const entry = await db.get('SELECT * FROM diary_entries WHERE date = ?', [date]);
        if (entry) {
            return {
                ...entry,
                todos: entry.todos || '[]'
            };
        }
        return null;
    });
    // 添加IPC监听器
    electron_1.ipcMain.handle('TAKE_SCREENSHOT', async () => {
        const sources = await main_1.desktopCapturer.getSources({
            types: ['screen'],
            thumbnailSize: { width: 1920, height: 1080 }
        });
        return sources[0].thumbnail.toDataURL();
    });
    // 注册全局快捷键
    electron_1.globalShortcut.register(process.platform === 'darwin' ? 'Command+Option+C' : 'Ctrl+Alt+C', () => {
        console.log('快速截图');
        screenshots?.startCapture();
    });
    win?.webContents.on('did-finish-load', async () => {
        await checkAndUpdateClipboard();
        console.log('get latestcontent 2:', lastClipboardContent);
        watchClipboard(win);
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
    // 添加文件拖放处理
    win.webContents.on('will-navigate', (event, url) => {
        if (url.startsWith('file://')) {
            event.preventDefault();
        }
    });
    // 默认打开开发者工具
    win.webContents.openDevTools();
    // 初始化截图工具
    screenshots = new electron_screenshots_1.default({
        singleWindow: true, // 使用单窗口模式
        lang: {
            operation_ok_title: '确定',
            operation_cancel_title: '取消',
            operation_save_title: '保存'
            // ... 其他语言设置
        }
    });
    // 监听截图完成事件
    screenshots.on('ok', (e, buffer, data) => {
        console.log('data', data);
        const image = common_1.nativeImage.createFromBuffer(buffer);
        const base64 = image.toDataURL();
        console.log('截图已捕获');
        // 将截图保存到系统粘贴板
        electron_1.clipboard.writeImage(image);
        console.log('截图已保存到系统粘贴板');
        win?.webContents.send('screenshot-captured', base64);
    });
    // 监听截图取消事件
    screenshots.on('cancel', () => {
        console.log('Screenshot cancelled');
    });
}
async function checkAndUpdateClipboard() {
    if (!win)
        return;
    const db = await getDatabase();
    const latestItem = await db.get('SELECT * FROM clipboard_history ORDER BY timestamp DESC LIMIT 1');
    console.log('get latestcontent 1:', latestItem);
    if (latestItem) {
        if (latestItem.type === 'text') {
            lastClipboardContent = latestItem.content;
        }
        else if (latestItem.type === 'image') {
            lastClipboardContent = latestItem.content;
        }
    }
}
async function watchClipboard(win) {
    const db = await getDatabase();
    setInterval(async () => {
        const currentContent = electron_1.clipboard.readText();
        if (currentContent && currentContent !== lastClipboardContent) {
            lastClipboardContent = currentContent;
            await updateClipboardHistory(win, 'text', currentContent);
        }
        const image = electron_1.clipboard.readImage();
        if (!image.isEmpty()) {
            const dataURL = image.toDataURL();
            if (dataURL !== lastClipboardContent) {
                lastClipboardContent = dataURL;
                await updateClipboardHistory(win, 'image', dataURL);
                console.log('watchClipboard interval 1000 image update');
            }
        }
    }, 1000);
}
async function updateClipboardHistory(win, type, content) {
    try {
        const db = await getDatabase();
        const existingItem = await db.get('SELECT * FROM clipboard_history WHERE content = ?', content);
        if (existingItem) {
            await db.run('UPDATE clipboard_history SET timestamp = ? WHERE id = ?', Date.now(), existingItem.id);
            console.log('剪贴板内容已更新到最近的时间内');
        }
        else {
            await db.run('INSERT INTO clipboard_history (type, content, timestamp) VALUES (?, ?, ?)', type, content, Date.now());
            console.log('剪贴板内容已添加到历史记录');
        }
        // await db.run(
        //   'INSERT INTO clipboard_history (type, content, timestamp) VALUES (?, ?, ?)',
        //   type,
        //   content,
        //   Date.now()
        // )
        // console.log('剪贴板内容已添加到历史记录')
        // 获取最新的剪贴板历史记录
        const history = await db.all('SELECT * FROM clipboard_history ORDER BY timestamp DESC LIMIT 50');
        // 通知渲染进程更新剪贴板历史，并发送最新的历史记录
        win?.webContents.send('clipboard-history-update', history);
        console.log('最新的剪贴板历史记录已发送到渲染进程');
    }
    catch (error) {
        console.error('更新剪贴板历史记录时出错:', error);
    }
}
electron_1.ipcMain.handle('handle-file-drop', async (event, filePaths) => {
    console.log('Received file paths:', filePaths);
    const processedFiles = [];
    for (const filePath of filePaths) {
        if (!filePath) {
            console.error('Received undefined or empty file path');
            continue;
        }
        try {
            console.log('Processing file:', filePath);
            const stats = await fs.promises.stat(filePath);
            if (stats.isFile()) {
                const fileBuffer = await fs.promises.readFile(filePath);
                const base64 = fileBuffer.toString('base64');
                const extname = path_1.default.extname(filePath).slice(1);
                processedFiles.push({
                    name: path_1.default.basename(filePath),
                    size: stats.size,
                    data: `data:image/${extname};base64,${base64}`
                });
            }
            else {
                console.log('Not a file:', filePath);
            }
        }
        catch (error) {
            console.error('Error processing file:', filePath, error);
        }
    }
    console.log('Processed files:', processedFiles.length);
    return processedFiles;
});
electron_1.app.whenReady().then(createWindow);
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
});
// 添加生成周报的方法
electron_1.ipcMain.handle('generate-weekly-summary', async (event, startDate, endDate) => {
    const db = await getDatabase();
    const entries = await db.all('SELECT * FROM diary_entries WHERE date BETWEEN ? AND ? ORDER BY date ASC', [startDate, endDate]);
    let summary = `周报 (${startDate} 至 ${endDate}):\n\n`;
    for (const entry of entries) {
        summary += `日期: ${entry.date}\n`;
        summary += `内容: ${entry.content}\n`;
        const todos = JSON.parse(entry.todos || '[]');
        if (todos.length > 0) {
            summary += '待办事项:\n';
            for (const todo of todos) {
                summary += `- [${todo.done ? 'x' : ' '}] ${todo.text}\n`;
            }
        }
        summary += '\n---\n\n';
    }
    // 这里可以添加更复杂的摘要生成逻辑,例如使用 AI 生成摘要
    return summary;
});
electron_1.app.on('will-quit', () => {
    // 注销所有快捷键
    electron_1.globalShortcut.unregisterAll();
});
// 处理从渲染进程发来的截图请求
electron_1.ipcMain.on('take-screenshot', () => {
    screenshots?.startCapture();
});
// IPC 处理器
electron_1.ipcMain.handle('add-clipboard-item', async (event, item) => {
    const db = await getDatabase();
    await db.run('INSERT INTO clipboard_history (type, content, timestamp) VALUES (?, ?, ?)', item.type, item.content, item.timestamp);
});
electron_1.ipcMain.handle('get-clipboard-history', async (event, limit) => {
    const db = await getDatabase();
    return await db.all('SELECT * FROM clipboard_history ORDER BY timestamp DESC LIMIT ?', limit);
});
electron_1.ipcMain.handle('clear-clipboard-history', async () => {
    const db = await getDatabase();
    await db.run('DELETE FROM clipboard_history');
});
// IPC 处理器
electron_1.ipcMain.on('request-clipboard-history', async (event) => {
    console.log('request-clipboard-history');
    const db = await getDatabase();
    const history = await db.all('SELECT * FROM clipboard_history ORDER BY timestamp DESC LIMIT 50');
    event.reply('clipboard-history-update', history);
    return history;
});
electron_1.ipcMain.on('clear-clipboard-history', async () => {
    try {
        console.log('clear-clipboard-history');
        const db = await getDatabase();
        await db.run('DELETE FROM clipboard_history');
        console.log('剪贴板历史记录已清空');
    }
    catch (error) {
        console.error('清空剪贴板历史记录时出错:', error);
    }
});
// 添加 clipboard-history-update 事件处理
electron_1.ipcMain.on('clipboard-history-update', async (event) => {
    try {
        console.log('clipboard-history-update');
        const db = await getDatabase();
        const history = await db.all('SELECT * FROM clipboard_history ORDER BY timestamp DESC LIMIT 50');
        event.reply('clipboard-history-update', history);
        console.log('剪贴板历史记录已更新并发送');
    }
    catch (error) {
        console.error('获取剪贴板历史记录时出错:', error);
    }
});
electron_1.ipcMain.handle('delete-clipboard-item', async (event, id) => {
    const db = await getDatabase();
    await db.run('DELETE FROM clipboard_history WHERE id = ?', id);
    const updatedHistory = await db.all('SELECT * FROM clipboard_history ORDER BY timestamp DESC');
    return updatedHistory;
});
electron_1.ipcMain.handle('write-text-to-clipboard', async (event, text) => {
    electron_1.clipboard.writeText(text);
});
electron_1.ipcMain.handle('open-url', async (event, text) => {
    // 打开url
    electron_1.shell.openExternal(text);
});
electron_1.ipcMain.handle('preview-clipboard-image', async (event, text) => {
    // 打开图片
    electron_1.shell.openPath(text);
});
electron_1.ipcMain.handle('write-image-to-clipboard', async (event, dataURL) => {
    const img = common_1.nativeImage.createFromDataURL(dataURL);
    electron_1.clipboard.writeImage(img);
});
// 添加删除日记条目的方法
electron_1.ipcMain.handle('delete-diary-entry', async (event, date) => {
    try {
        const db = await getDatabase();
        await db.run('DELETE FROM diary_entries WHERE date = ?', [date]);
        console.log(`日记条目已删除: ${date}`);
        return { success: true, message: '日记条目已成功删除' };
    }
    catch (error) {
        console.error('删除日记条目时出错:', error);
        return { success: false, message: '删除日记条目时出错' };
    }
});
