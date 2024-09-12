"use strict";
const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const { execFile } = require('child_process');
console.log('__dirname:', __dirname);
console.log('Preload path:', path.join(__dirname, 'preload.js'));
// ADB 可执行文件的路径
const adbPath = path.join(app.getAppPath(), 'resources', 'adb', process.platform === 'win32' ? 'adb.exe' : 'adb');
// 添加执行 ADB 命令的方法
ipcMain.handle('execute-adb', async (event, command) => {
    return new Promise((resolve, reject) => {
        execFile(adbPath, command.split(' '), (error, stdout, stderr) => {
            if (error) {
                reject(error.message);
            }
            else {
                resolve(stdout);
            }
        });
    });
});
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
    });
    if (process.env.NODE_ENV !== 'production') {
        win.loadURL('http://localhost:5173');
    }
    else {
        win.loadFile(path.join(__dirname, '../dist/index.html'));
    }
}
app.whenReady().then(createWindow);
app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});
app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
        createWindow();
    }
});
