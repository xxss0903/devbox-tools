"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.startCapture = exports.initScreenShot = exports.setupIPCOn = void 0;
const electron_1 = require("electron");
const database_1 = require("./database");
const reminderHandler_1 = require("./reminderHandler");
const electron_screenshots_1 = __importDefault(require("electron-screenshots"));
let screenshots = null; // 截图工具
function setupIPCOn(win) {
    initScreenShot(win);
    console.log('setupIPCHandle:', screenshots);
    // 处理从渲染进程发来的截图请求
    electron_1.ipcMain.on('take-screenshot', () => {
        screenshots?.startCapture();
    });
    electron_1.ipcMain.on('request-clipboard-history', async (event) => {
        console.log('request-clipboard-history');
        const db = await (0, database_1.getDatabase)();
        const history = await db.all('SELECT * FROM clipboard_history ORDER BY timestamp DESC LIMIT 50');
        event.reply('clipboard-history-update', history);
        return history;
    });
    electron_1.ipcMain.on('clear-clipboard-history', async () => {
        try {
            console.log('clear-clipboard-history');
            const db = await (0, database_1.getDatabase)();
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
            const db = await (0, database_1.getDatabase)();
            const history = await db.all('SELECT * FROM clipboard_history ORDER BY timestamp DESC LIMIT 50');
            event.reply('clipboard-history-update', history);
            console.log('剪贴板历史记录已更新并发送');
        }
        catch (error) {
            console.error('获取剪贴板历史记录时出错:', error);
        }
    });
    electron_1.ipcMain.on('set-reminder', (event, time) => {
        const delay = new Date(time).getTime() - Date.now();
        console.log('set-reminder', delay);
        setTimeout(() => {
            (0, reminderHandler_1.createReminderWindow)('您置的提醒时到了');
        }, delay);
    });
    electron_1.ipcMain.on('close-reminder', () => {
        (0, reminderHandler_1.closeReminderWindow)();
        console.log('close-reminder');
    });
}
exports.setupIPCOn = setupIPCOn;
function initScreenShot(win) {
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
        const image = electron_1.nativeImage.createFromBuffer(buffer);
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
exports.initScreenShot = initScreenShot;
function startCapture() {
    console.log('startCapture:', screenshots);
    screenshots?.startCapture();
}
exports.startCapture = startCapture;
