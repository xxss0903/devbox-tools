import { app } from 'electron'
import path from 'path'
import sqlite3 from 'sqlite3'
import { open, Database } from 'sqlite'

let db: Database | null = null

async function getDatabase(): Promise<Database> {
  if (db) return db

  db = await open({
    filename: path.join(app.getPath('userData'), 'workdiary.sqlite'),
    driver: sqlite3.Database
  })

  await initializeTables()

  return db
}

async function initializeTables() {
  await db?.exec(`
    CREATE TABLE IF NOT EXISTS alarms (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      time TEXT
    )
  `)

  await db?.exec(`
    CREATE TABLE IF NOT EXISTS diary_entries (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      date TEXT UNIQUE,
      content TEXT,
      todos TEXT
    )
  `)

  await db?.exec(`
    CREATE TABLE IF NOT EXISTS clipboard_history (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      type TEXT,
      content TEXT,
      timestamp INTEGER
    )
  `)

  await db?.exec(`
    CREATE TABLE IF NOT EXISTS screen_block_times_history (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      start_time INTEGER,
      duration INTEGER,
      interval_time INTEGER
    )
  `)

  await db?.exec(`
    CREATE TABLE IF NOT EXISTS screen_block_settings (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      interval_time INTEGER,
      block_duration INTEGER,
      is_active INTEGER NOT NULL,
      start_time INTEGER
    )
  `)

  // 检查 screen_block_settings 表是否为空
  const count = await db?.get('SELECT COUNT(*) as count FROM screen_block_settings')
  if (count && count.count === 0) {
    // 如果表为空,插入默认值
    await db?.run(`
      INSERT INTO screen_block_settings (interval_time, block_duration, is_active, start_time)
      VALUES (3600000, 300000, 0, NULL)
    `)
    console.log('Inserted default values into screen_block_settings')
  }
}

// 添加数据库操作函数
async function saveDiaryEntry(date: string, content: string, todos: string) {
  const db = await getDatabase()
  await db.run(
    'INSERT OR REPLACE INTO diary_entries (date, content, todos) VALUES (?, ?, ?)',
    [date, content, todos]
  )
}

async function getDiaryEntries() {
  const db = await getDatabase()
  return await db.all('SELECT * FROM diary_entries ORDER BY date DESC')
}

async function getDiaryEntryByDate(date: string) {
  const db = await getDatabase()
  return await db.get('SELECT * FROM diary_entries WHERE date = ?', [date])
}

async function deleteDiaryEntry(date: string) {
  const db = await getDatabase()
  await db.run('DELETE FROM diary_entries WHERE date = ?', [date])
}

async function clearDatabase() {
  const db = await getDatabase()
  await db.run('DELETE FROM diary_entries')
}

async function saveScreenBlockerStatus(isActive: boolean, startTime: number | null, duration: number | null) {
  const db = await getDatabase()
  await db.run(
    'INSERT OR REPLACE INTO screen_block_settings (id, is_active, start_time, block_duration) VALUES (1, ?, ?, ?)',
    [isActive ? 1 : 0, startTime, duration]
  )
}

async function getScreenBlockerStatus() {
  const db = await getDatabase()
  return await db.get('SELECT * FROM screen_block_settings WHERE id = 1')
}

async function saveAlarm(time: string) {
  const db = await getDatabase()
  await db.run('INSERT OR REPLACE INTO alarms (id, time) VALUES (1, ?)', time)
}

async function getAlarm() {
  const db = await getDatabase()
  return await db.get('SELECT * FROM alarms WHERE id = 1')
}

// 导出所有数据库操作函数
export {
  getDatabase,
  saveDiaryEntry,
  getDiaryEntries,
  getDiaryEntryByDate,
  deleteDiaryEntry,
  clearDatabase,
  saveScreenBlockerStatus,
  getScreenBlockerStatus,
  saveAlarm,
  getAlarm
}
