"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.setupIPCHandle = void 0;
const electron_1 = require("electron");
const child_process_1 = require("child_process");
const path_1 = __importDefault(require("path"));
const promises_1 = __importDefault(require("fs/promises"));
const database_1 = require("./database");
const screenBlocker_1 = require("./screenBlocker");
const main_1 = require("electron/main");
function setupIPCHandle(win) {
    electron_1.ipcMain.handle('execute-adb', async (event, command) => {
        // ADB 执行逻辑
    });
    electron_1.ipcMain.handle('select-folder', async () => {
        const result = await electron_1.dialog.showOpenDialog({
            properties: ['openDirectory']
        });
        if (result.canceled) {
            return null;
        }
        const files = await promises_1.default.readdir(result.filePaths[0]);
        const imageFiles = await Promise.all(files
            .filter((file) => /\.(jpg|jpeg|png)$/i.test(file))
            .map(async (file) => {
            const filePath = path_1.default.join(result.filePaths[0], file);
            const stats = await promises_1.default.stat(filePath);
            const fileContent = await promises_1.default.readFile(filePath, { encoding: 'base64' });
            return {
                name: file,
                size: stats.size,
                data: `data:image/${path_1.default.extname(file).slice(1)};base64,${fileContent}`
            };
        }));
        return imageFiles;
    });
    electron_1.ipcMain.handle('process-dropped-files', async (event, filePaths) => {
        const imageFiles = await Promise.all(filePaths
            .filter((filePath) => /\.(jpg|jpeg|png)$/i.test(filePath))
            .map(async (filePath) => {
            const stats = await promises_1.default.stat(filePath);
            const fileContent = await promises_1.default.readFile(filePath, { encoding: 'base64' });
            return {
                name: path_1.default.basename(filePath),
                size: stats.size,
                data: `data:image/${path_1.default.extname(filePath).slice(1)};base64,${fileContent}`
            };
        }));
        return imageFiles;
    });
    electron_1.ipcMain.handle('save-diary-entry', async (event, { date, content, todos }) => {
        await (0, database_1.saveDiaryEntry)(date, content, todos);
    });
    electron_1.ipcMain.handle('get-diary-entries', async () => {
        return await (0, database_1.getDiaryEntries)();
    });
    electron_1.ipcMain.handle('get-diary-entry-by-date', async (event, date) => {
        return await (0, database_1.getDiaryEntryByDate)(date);
    });
    electron_1.ipcMain.handle('delete-diary-entry', async (event, date) => {
        await (0, database_1.deleteDiaryEntry)(date);
        return { success: true, message: '日记条目已成功删除' };
    });
    electron_1.ipcMain.handle('clear-database', async () => {
        await (0, database_1.clearDatabase)();
    });
    electron_1.ipcMain.handle('set-screen-blocker-status', async (event, isActive, duration) => {
        const startTime = isActive ? Date.now() : null;
        await (0, database_1.saveScreenBlockerStatus)(isActive, startTime, duration ? duration : null);
        return { success: true };
    });
    electron_1.ipcMain.handle('get-screen-blocker-status', async () => {
        return await (0, database_1.getScreenBlockerStatus)();
    });
    electron_1.ipcMain.handle('get-saved-reminder-time', async () => {
        const alarm = await (0, database_1.getAlarm)();
        return alarm && alarm.time ? alarm.time : null;
    });
    electron_1.ipcMain.handle('save-screen-block-time', async (event, duration) => {
        // 保存屏幕阻止时间逻辑
        try {
            const db = await (0, database_1.getDatabase)();
            const startTime = Date.now();
            await db.run('INSERT INTO screen_block_times (start_time, duration) VALUES (?, ?)', [
                startTime,
                duration
            ]);
            console.log('屏幕关闭时间已保存到数据库');
            return { success: true, message: '屏幕关闭时间已成功保存' };
        }
        catch (error) {
            console.error('保存屏幕关闭时间时出错:', error);
            return { success: false, message: '保存屏幕关闭时间时出错' };
        }
    });
    electron_1.ipcMain.handle('get-screen-block-history', async () => {
        // 获取屏幕阻止历史逻辑
        try {
            const db = await (0, database_1.getDatabase)();
            const history = await db.all('SELECT * FROM screen_block_times ORDER BY start_time DESC');
            return history;
        }
        catch (error) {
            console.error('获取屏幕关闭时间历史时出错:', error);
            return [];
        }
    });
    // 创建屏幕关闭时间配置表
    electron_1.ipcMain.handle('save-screen-block-settings', async (event, settings) => {
        try {
            console.log('save-screen-block-settings', settings);
            const db = await (0, database_1.getDatabase)();
            await db.run('DELETE FROM screen_block_settings');
            const res = await db.run('INSERT INTO screen_block_settings (interval_time, block_duration) VALUES (?, ?)', settings.intervalTime, settings.blockDuration);
            console.log('屏幕关闭时间配置已保存到数据库', res);
            return { success: true, message: '屏幕关闭时间配置已成功保存' };
        }
        catch (error) {
            console.error('保存屏幕关闭时间配置时出错:', error);
            return { success: false, message: '保存屏幕关闭时间配置时出错' };
        }
    });
    electron_1.ipcMain.handle('close-screen-blocker', () => {
        (0, screenBlocker_1.closeScreenBlocker)();
        return '屏幕遮挡器已关闭';
    });
    // 获取屏幕关闭时间配置
    electron_1.ipcMain.handle('get-screen-block-settings', async () => {
        try {
            const db = await (0, database_1.getDatabase)();
            const settings = await db.get('SELECT * FROM screen_block_settings');
            return settings;
        }
        catch (error) {
            console.error('获取屏幕关闭时间配置时出错:', error);
            return null;
        }
    });
    electron_1.ipcMain.handle('execute-command', async (_, command) => {
        return new Promise((resolve, reject) => {
            (0, child_process_1.exec)(command, (error, stdout, stderr) => {
                if (error) {
                    reject(error);
                }
                else {
                    resolve(stdout);
                }
            });
        });
    });
    // 打开pdf的接口工具
    electron_1.ipcMain.handle('open-pdfbox-app', async (_, filePath) => {
        const javaPath = path_1.default.join(electron_1.app.getAppPath(), 'public', 'jdk-17.0.12', 'bin', 'java');
        const pdfBoxPath = path_1.default.join(electron_1.app.getAppPath(), 'public', 'pdfbox-app.jar');
        const command = `${javaPath} -jar "${pdfBoxPath}" debug "${filePath}"`;
        // const pdfBoxPath = path.join(app.getAppPath(), 'public', 'pdfbox-app.jar')
        return new Promise((resolve, reject) => {
            (0, child_process_1.exec)(command, (error, stdout, stderr) => {
                if (error) {
                    reject(error);
                }
                else {
                    resolve(stdout);
                }
            });
        });
    });
    // 选择文件
    electron_1.ipcMain.handle('get-file-path', async (event, options) => {
        const result = await electron_1.dialog.showOpenDialog({
            properties: ['openFile'],
            filters: [{ name: 'PDF Files', extensions: ['pdf'] }]
        });
        if (result.canceled) {
            return null;
        }
        else {
            return result.filePaths[0];
        }
    });
    // 修改现有的 createScreenBlocker 函数
    electron_1.ipcMain.handle('create-screen-blocker', (event, duration, screenType) => {
        (0, screenBlocker_1.createScreenBlocker)(screenType, duration);
        setTimeout(() => {
            (0, screenBlocker_1.closeScreenBlocker)();
        }, duration);
        return '屏幕遮挡器已创建';
    });
    electron_1.ipcMain.handle('delete-clipboard-item', async (event, id) => {
        const db = await (0, database_1.getDatabase)();
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
        const img = electron_1.nativeImage.createFromDataURL(dataURL);
        electron_1.clipboard.writeImage(img);
    });
    electron_1.ipcMain.handle('refresh-work-diary', async () => {
        console.log('refresh-work-diary');
    });
    electron_1.ipcMain.handle('add-clipboard-item', async (event, item) => {
        const db = await (0, database_1.getDatabase)();
        await db.run('INSERT INTO clipboard_history (type, content, timestamp) VALUES (?, ?, ?)', item.type, item.content, item.timestamp);
    });
    electron_1.ipcMain.handle('get-clipboard-history', async (event, limit) => {
        const db = await (0, database_1.getDatabase)();
        return await db.all('SELECT * FROM clipboard_history ORDER BY timestamp DESC LIMIT ?', limit);
    });
    electron_1.ipcMain.handle('clear-clipboard-history', async () => {
        const db = await (0, database_1.getDatabase)();
        await db.run('DELETE FROM clipboard_history');
    });
    // 添加IPC监听器
    electron_1.ipcMain.handle('TAKE_SCREENSHOT', async () => {
        const sources = await main_1.desktopCapturer.getSources({
            types: ['screen'],
            thumbnailSize: { width: 1920, height: 1080 }
        });
        return sources[0].thumbnail.toDataURL();
    });
    // 添加生成周报的方法
    electron_1.ipcMain.handle('generate-weekly-summary', async (event, startDate, endDate) => {
        const db = await (0, database_1.getDatabase)();
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
}
exports.setupIPCHandle = setupIPCHandle;
