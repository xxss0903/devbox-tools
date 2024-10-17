"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAlarm = exports.saveAlarm = exports.getScreenBlockerStatus = exports.saveScreenBlockerStatus = exports.clearDatabase = exports.deleteDiaryEntry = exports.getDiaryEntryByDate = exports.getDiaryEntries = exports.saveDiaryEntry = exports.getDatabase = void 0;
const electron_1 = require("electron");
const path_1 = __importDefault(require("path"));
const sqlite3_1 = __importDefault(require("sqlite3"));
const sqlite_1 = require("sqlite");
let db = null;
async function getDatabase() {
    if (db)
        return db;
    db = await (0, sqlite_1.open)({
        filename: path_1.default.join(electron_1.app.getPath('userData'), 'workdiary.sqlite'),
        driver: sqlite3_1.default.Database
    });
    await initializeTables();
    return db;
}
exports.getDatabase = getDatabase;
async function initializeTables() {
    await db?.exec(`
    CREATE TABLE IF NOT EXISTS alarms (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      time TEXT
    )
  `);
    await db?.exec(`
    CREATE TABLE IF NOT EXISTS diary_entries (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      date TEXT UNIQUE,
      content TEXT,
      todos TEXT
    )
  `);
    await db?.exec(`
    CREATE TABLE IF NOT EXISTS clipboard_history (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      type TEXT,
      content TEXT,
      timestamp INTEGER
    )
  `);
    await db?.exec(`
    CREATE TABLE IF NOT EXISTS screen_block_times_history (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      start_time INTEGER,
      duration INTEGER,
      interval_time INTEGER
    )
  `);
    await db?.exec(`
    CREATE TABLE IF NOT EXISTS screen_block_settings (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      interval_time INTEGER,
      block_duration INTEGER,
      is_active BOOLEAN NOT NULL,
      start_time INTEGER
    )
  `);
}
// 添加数据库操作函数
async function saveDiaryEntry(date, content, todos) {
    const db = await getDatabase();
    await db.run('INSERT OR REPLACE INTO diary_entries (date, content, todos) VALUES (?, ?, ?)', [date, content, todos]);
}
exports.saveDiaryEntry = saveDiaryEntry;
async function getDiaryEntries() {
    const db = await getDatabase();
    return await db.all('SELECT * FROM diary_entries ORDER BY date DESC');
}
exports.getDiaryEntries = getDiaryEntries;
async function getDiaryEntryByDate(date) {
    const db = await getDatabase();
    return await db.get('SELECT * FROM diary_entries WHERE date = ?', [date]);
}
exports.getDiaryEntryByDate = getDiaryEntryByDate;
async function deleteDiaryEntry(date) {
    const db = await getDatabase();
    await db.run('DELETE FROM diary_entries WHERE date = ?', [date]);
}
exports.deleteDiaryEntry = deleteDiaryEntry;
async function clearDatabase() {
    const db = await getDatabase();
    await db.run('DELETE FROM diary_entries');
}
exports.clearDatabase = clearDatabase;
async function saveScreenBlockerStatus(isActive, startTime, duration) {
    const db = await getDatabase();
    await db.run('INSERT OR REPLACE INTO screen_block_settings (id, is_active, start_time, block_duration) VALUES (1, ?, ?, ?)', [isActive ? 1 : 0, startTime, duration]);
}
exports.saveScreenBlockerStatus = saveScreenBlockerStatus;
async function getScreenBlockerStatus() {
    const db = await getDatabase();
    return await db.get('SELECT * FROM screen_block_settings WHERE id = 1');
}
exports.getScreenBlockerStatus = getScreenBlockerStatus;
async function saveAlarm(time) {
    const db = await getDatabase();
    await db.run('INSERT OR REPLACE INTO alarms (id, time) VALUES (1, ?)', time);
}
exports.saveAlarm = saveAlarm;
async function getAlarm() {
    const db = await getDatabase();
    return await db.get('SELECT * FROM alarms WHERE id = 1');
}
exports.getAlarm = getAlarm;
