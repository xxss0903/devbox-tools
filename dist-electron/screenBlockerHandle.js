"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.setupScreenBlockerHandle = void 0;
const electron_1 = require("electron");
const database_1 = require("./database");
const screenBlocker_1 = require("./screenBlocker");
function setupScreenBlockerHandle(win) {
    // 设置屏幕阻挡器状态
    electron_1.ipcMain.handle('set-screen-blocker-status', async (event, isActive, duration) => {
        const startTime = isActive ? Date.now() : null;
        await (0, database_1.saveScreenBlockerStatus)(isActive, startTime, duration ? duration : null, null);
        return { success: true };
    });
    // 获取屏幕阻挡器状态
    electron_1.ipcMain.handle('get-screen-blocker-status', async () => {
        return await (0, database_1.getScreenBlockerStatus)();
    });
    // 保存屏幕阻止时间
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
    // 获取屏幕阻止历史
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
            return await db.get('SELECT * FROM screen_block_settings');
        }
        catch (error) {
            console.error('获取屏幕关闭时间配置时出错:', error);
            return null;
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
}
exports.setupScreenBlockerHandle = setupScreenBlockerHandle;
