import { app } from 'electron'
import path from 'path'
import sqlite3 from 'sqlite3'
import { open, Database } from 'sqlite'
import moment from 'moment'

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

/**
 * 初始化数据库表
 * id为1，
 * 时间存储在time字段
 */
async function initializeTables() {
  // 创建闹钟表, 用于存储闹钟时间，id为1，时间存储在time字段
  await db?.exec(`
    CREATE TABLE IF NOT EXISTS alarms (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      time TEXT,
      latest INTEGER
    )
  `)

  /*
   * 创建日记表, 用于存储日记，
   * id为1，
   * 日期存储在date字段，
   * 内容存储在content字段，
   * todo存储在todos字段
   */
  await db?.exec(`
    CREATE TABLE IF NOT EXISTS diary_entries (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      date TEXT UNIQUE,
      content TEXT,
      todos TEXT
    )
  `)

  /*
   * 创建剪切板历史表, 用于��储剪切板历史，
   * id为1，
   * 类型存储在type字段，
   * 内容存储在content字段，
   * 时间戳存储在timestamp字段
   */
  await db?.exec(`
    CREATE TABLE IF NOT EXISTS clipboard_history (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      type TEXT,
      content TEXT,
      timestamp INTEGER
    )
  `)

  /*
   * 创建屏幕阻止历史表, 用于存储屏幕阻止历史，
   * id为1，
   * 开始时间存储在start_time字段，
   * 持续时间存储在duration字段，
   * 间隔时间存储在interval_time字段
   */
  await db?.exec(`
    CREATE TABLE IF NOT EXISTS screen_block_times_history (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      start_time INTEGER,
      duration INTEGER,
      interval_time INTEGER
    )
  `)

  /*
   * 创建屏幕阻止配置表, 用于存储屏幕阻止配置，
   * id为1，
   * 间隔时间存储在interval_time字段，
   * 持续时间存储在block_duration字段，
   * 是否激活存储在is_active字段，
   * 开始时间存储在start_time字段，
   * 下一次屏蔽时间存储在next_block_time字段
   */
  await db?.exec(`
    CREATE TABLE IF NOT EXISTS screen_block_settings (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      interval_time INTEGER,
      block_duration INTEGER,
      is_active INTEGER NOT NULL,
      start_time INTEGER,
      next_block_time INTEGER,
      screen_type TEXT
    )
  `)

  /**
   * 检查 screen_block_settings 表是否为空
   */
  const count = await db?.get('SELECT COUNT(*) as count FROM screen_block_settings')
  if (count && count.count === 0) {
    const nextBlockTime = moment().add(120 * 60 * 1000).valueOf()
    // 如果表为空,插入默认值
    await db?.run(`
      INSERT INTO screen_block_settings (interval_time, block_duration, is_active, start_time, next_block_time, screen_type)
      VALUES (120, 5, 0, NULL, ${nextBlockTime}, "windows-3d-blocker")
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

/**
 * 更新下次屏保时间
 * @param duration 间隔时间
 */
async function updateNextBlockTime() {
  const db = await getDatabase()
  const settings = await db.get('SELECT *  FROM screen_block_settings  WHERE id = 1')
  const nextBlockTime = moment().add(settings.interval_time + settings.block_duration, 'minutes').valueOf()
  await db.run(
    'UPDATE screen_block_settings SET next_block_time = ? WHERE id = 1',
    [nextBlockTime]
  )
}

/**
 * 开关屏保
 * @param isActive 
 */
async function updateScreenBlockerIsActive(isActive: boolean) {
  const activeValue = isActive ? 1 : 0
  const db = await getDatabase()
  await db.run(
    'UPDATE screen_block_settings SET is_active = ? WHERE id = 1',
    [activeValue]
  )
}

async function getScreenBlockerStatus() {
  const db = await getDatabase()
  const settings = await db.get('SELECT * FROM screen_block_settings WHERE id = 1')
  if(settings && !settings.next_block_time){
    await updateNextBlockTime()
  }
  return await db.get('SELECT * FROM screen_block_settings WHERE id = 1')
}

async function saveAlarm(time: string) {
  const db = await getDatabase()
  await db.run(
    'UPDATE alarms SET time = ? WHERE id = 1',
    [time]
  )
}

async function saveAlarmLatest(latest: number) {
  const db = await getDatabase()
  await db.run(
    'UPDATE alarms SET latest = ? WHERE id = 1',
    [latest]
  )
}

async function getAlarm() {
  const db = await getDatabase()
  let alarm = await db.get('SELECT * FROM alarms WHERE id = 1')
  if (!alarm) {
    await db?.run(`
      INSERT INTO alarms (time, latest)
      VALUES ("18:00", ${moment().valueOf()})
    `)
    alarm = await db.get('SELECT * FROM alarms WHERE id = 1')
  }
  return alarm
}

async function setNextBlockTime(nextBlockTime: number) {
  const db = await getDatabase()
  await db.run(
    'UPDATE screen_block_settings SET next_block_time = ? WHERE id = 1',
    [nextBlockTime]
  )
}

async function getNextBlockTime() {
  const db = await getDatabase()
  const result = await db.get('SELECT next_block_time FROM screen_block_settings WHERE id = 1')
  return result ? result.next_block_time : null
}

// 导出所有数据库操作函数
export {
  getDatabase,
  saveDiaryEntry,
  getDiaryEntries,
  getDiaryEntryByDate,
  deleteDiaryEntry,
  clearDatabase,
  getScreenBlockerStatus,
  setNextBlockTime,
  getNextBlockTime,
  saveAlarm,
  getAlarm,
  updateNextBlockTime,
  updateScreenBlockerIsActive,
  saveAlarmLatest
}
