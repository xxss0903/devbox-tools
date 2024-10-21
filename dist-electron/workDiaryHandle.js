"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.setupWorkDiaryHandle = void 0;
const electron_1 = require("electron");
const database_1 = require("./database");
function setupWorkDiaryHandle(win) {
    electron_1.ipcMain.handle('clear-database', async () => {
        await (0, database_1.clearDatabase)();
    });
    electron_1.ipcMain.handle('refresh-work-diary', async () => {
        console.log('refresh-work-diary');
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
    electron_1.ipcMain.handle('get-saved-reminder-time', async () => {
        const alarm = await (0, database_1.getAlarm)();
        return alarm && alarm.time ? alarm.time : null;
    });
}
exports.setupWorkDiaryHandle = setupWorkDiaryHandle;
