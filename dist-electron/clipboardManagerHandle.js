"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.setupClipboardManagerHandle = void 0;
const electron_1 = require("electron");
const database_1 = require("./database");
// 剪切板管理
function setupClipboardManagerHandle(win) {
    // 删除剪切板历史记录
    electron_1.ipcMain.handle('delete-clipboard-item', async (event, id) => {
        const db = await (0, database_1.getDatabase)();
        await db.run('DELETE FROM clipboard_history WHERE id = ?', id);
        const updatedHistory = await db.all('SELECT * FROM clipboard_history ORDER BY timestamp DESC');
        return updatedHistory;
    });
    // 写入文本到剪切板
    electron_1.ipcMain.handle('write-text-to-clipboard', async (event, text) => {
        electron_1.clipboard.writeText(text);
    });
    // 预览剪切板图片
    electron_1.ipcMain.handle('preview-clipboard-image', async (event, text) => {
        // 打开图片
        electron_1.shell.openPath(text);
    });
    // 写入图片到剪切板
    electron_1.ipcMain.handle('write-image-to-clipboard', async (event, dataURL) => {
        const img = electron_1.nativeImage.createFromDataURL(dataURL);
        electron_1.clipboard.writeImage(img);
    });
    // 添加剪切板历史记录
    electron_1.ipcMain.handle('add-clipboard-item', async (event, item) => {
        const db = await (0, database_1.getDatabase)();
        await db.run('INSERT INTO clipboard_history (type, content, timestamp) VALUES (?, ?, ?)', item.type, item.content, item.timestamp);
    });
    // 获取剪切板历史记录
    electron_1.ipcMain.handle('get-clipboard-history', async (event, limit) => {
        const db = await (0, database_1.getDatabase)();
        return await db.all('SELECT * FROM clipboard_history ORDER BY timestamp DESC LIMIT ?', limit);
    });
    // 清空剪切板历史记录
    electron_1.ipcMain.handle('clear-clipboard-history', async () => {
        const db = await (0, database_1.getDatabase)();
        await db.run('DELETE FROM clipboard_history');
    });
}
exports.setupClipboardManagerHandle = setupClipboardManagerHandle;
