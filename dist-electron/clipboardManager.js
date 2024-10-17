"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.writeImageToClipboard = exports.writeTextToClipboard = exports.deleteClipboardItem = exports.clearClipboardHistory = exports.getClipboardHistory = exports.watchClipboard = exports.checkAndUpdateClipboard = void 0;
const electron_1 = require("electron");
const database_1 = require("./database");
let lastClipboardContent = '';
// 检查并更新剪贴板
async function checkAndUpdateClipboard(win) {
    const db = await (0, database_1.getDatabase)();
    const latestItem = await db.get('SELECT * FROM clipboard_history ORDER BY timestamp DESC LIMIT 1');
    console.log('get latestcontent 1:', latestItem);
    if (latestItem) {
        if (latestItem.type === 'text' || latestItem.type === 'image') {
            lastClipboardContent = latestItem.content;
        }
    }
}
exports.checkAndUpdateClipboard = checkAndUpdateClipboard;
// 监听剪贴板
function watchClipboard(win) {
    setInterval(async () => {
        const currentContent = electron_1.clipboard.readText();
        if (currentContent && currentContent !== lastClipboardContent && currentContent.trim().length > 0) {
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
exports.watchClipboard = watchClipboard;
// 更新剪贴板历史记录
async function updateClipboardHistory(win, type, content) {
    try {
        const db = await (0, database_1.getDatabase)();
        const existingItem = await db.get('SELECT * FROM clipboard_history WHERE content = ?', content);
        if (existingItem) {
            await db.run('UPDATE clipboard_history SET timestamp = ? WHERE id = ?', Date.now(), existingItem.id);
            console.log('剪贴板内容已更新到最近的时间内');
        }
        else {
            await db.run('INSERT INTO clipboard_history (type, content, timestamp) VALUES (?, ?, ?)', type, content, Date.now());
            console.log('剪贴板内容已添加到历史记录');
        }
        const history = await db.all('SELECT * FROM clipboard_history ORDER BY timestamp DESC LIMIT 50');
        win?.webContents.send('clipboard-history-update', history);
        console.log('最新的剪贴板历史记录已发送到渲染进程');
    }
    catch (error) {
        console.error('更新剪贴板历史记录时出错:', error);
    }
}
async function getClipboardHistory(limit) {
    const db = await (0, database_1.getDatabase)();
    return await db.all('SELECT * FROM clipboard_history ORDER BY timestamp DESC LIMIT ?', limit);
}
exports.getClipboardHistory = getClipboardHistory;
async function clearClipboardHistory() {
    const db = await (0, database_1.getDatabase)();
    await db.run('DELETE FROM clipboard_history');
}
exports.clearClipboardHistory = clearClipboardHistory;
async function deleteClipboardItem(id) {
    const db = await (0, database_1.getDatabase)();
    await db.run('DELETE FROM clipboard_history WHERE id = ?', id);
    return await getClipboardHistory(50);
}
exports.deleteClipboardItem = deleteClipboardItem;
function writeTextToClipboard(text) {
    electron_1.clipboard.writeText(text);
}
exports.writeTextToClipboard = writeTextToClipboard;
function writeImageToClipboard(dataURL) {
    const img = electron_1.nativeImage.createFromDataURL(dataURL);
    electron_1.clipboard.writeImage(img);
}
exports.writeImageToClipboard = writeImageToClipboard;
