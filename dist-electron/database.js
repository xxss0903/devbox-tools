"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.clearClipboardHistory = exports.getClipboardHistory = exports.addClipboardItem = exports.getDiaryEntryByDate = exports.getDiaryEntries = exports.saveDiaryEntry = exports.getLocalDatabase = void 0;
const sqlite3_1 = __importDefault(require("sqlite3"));
const sqlite_1 = require("sqlite");
const electron_1 = require("electron");
let db = null;
async function getLocalDatabase() {
    if (db)
        return db;
    db = await (0, sqlite_1.open)({
        filename: 'workdiary.sqlite',
        driver: sqlite3_1.default.Database
    });
    await db.exec(`
    CREATE TABLE IF NOT EXISTS diary_entries (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      date TEXT UNIQUE,
      content TEXT,
      todos TEXT
    )
  `);
    // 添加剪贴板历史表
    await db.exec(`
    CREATE TABLE IF NOT EXISTS clipboard_history (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      type TEXT NOT NULL,
      content TEXT NOT NULL,
      timestamp INTEGER NOT NULL
    )
  `);
    return db;
}
exports.getLocalDatabase = getLocalDatabase;
async function saveDiaryEntry(date, content, serializedTodos) {
    return await electron_1.ipcRenderer.invoke('save-diary-entry', {
        date,
        content,
        todos: serializedTodos
    });
}
exports.saveDiaryEntry = saveDiaryEntry;
async function getDiaryEntries() {
    const entries = await electron_1.ipcRenderer.invoke('get-diary-entries');
    return entries.map((entry) => ({
        ...entry,
        todos: JSON.parse(entry.todos || '[]')
    }));
}
exports.getDiaryEntries = getDiaryEntries;
async function getDiaryEntryByDate(date) {
    const entry = await electron_1.ipcRenderer.invoke('get-diary-entry-by-date', date);
    console.log('Entry received in database.ts:', entry);
    if (entry) {
        return {
            ...entry,
            todos: JSON.parse(entry.todos || '[]')
        };
    }
    return null;
}
exports.getDiaryEntryByDate = getDiaryEntryByDate;
// 添加剪贴板项目
async function addClipboardItem(type, content) {
    return await electron_1.ipcRenderer.invoke('add-clipboard-item', { type, content, timestamp: Date.now() });
}
exports.addClipboardItem = addClipboardItem;
// 获取剪贴板历史
async function getClipboardHistory(limit = 50) {
    const items = await electron_1.ipcRenderer.invoke('get-clipboard-history', limit);
    return items.map((item) => ({
        ...item,
        timestamp: new Date(item.timestamp)
    }));
}
exports.getClipboardHistory = getClipboardHistory;
// 清空剪贴板历史
async function clearClipboardHistory() {
    return await electron_1.ipcRenderer.invoke('clear-clipboard-history');
}
exports.clearClipboardHistory = clearClipboardHistory;
