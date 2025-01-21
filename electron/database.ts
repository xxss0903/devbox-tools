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
   * 创建剪切板历史表, 用于存储剪切板历史，
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

  // 添加 key_value 表创建
  await db?.exec(`
    CREATE TABLE IF NOT EXISTS key_value (
      key TEXT PRIMARY KEY,
      value TEXT
    )
  `)

  // 删除旧的项目日志表
  await db?.exec('DROP TABLE IF EXISTS project_logs')

  /*
   * 创建项目日志表
   * id: 主键
   * project_id: 项目ID
   * date: 日期 (YYYY-MM-DD格式)
   * content: 日志内容
   * progress: 项目进度 (0-100)
   * status: 项目状态 (planning-规划中, developing-开发中, testing-测试中, completed-已完成)
   * created_at: 创建时间
   */
  await db?.exec(`
    CREATE TABLE IF NOT EXISTS project_logs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      project_id TEXT NOT NULL,
      date TEXT NOT NULL,
      content TEXT,
      progress INTEGER DEFAULT 0,
      status TEXT DEFAULT 'planning',
      created_at INTEGER,
      UNIQUE(project_id, date)
    )
  `)
}

// 添加 key_value 表的操作函数
async function saveKeyValue(key: string, value: string) {
  const db = await getDatabase()
  await db.run(
    'INSERT OR REPLACE INTO key_value (key, value) VALUES (?, ?)',
    [key, value]
  )
}

async function getKeyValue(key: string) {
  const db = await getDatabase()
  const result = await db.get('SELECT value FROM key_value WHERE key = ?', [key])
  return result ? result.value : ''
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

// 修改项目日志相关的数据库操作函数
async function saveProjectLog(
  projectId: string, 
  date: string, 
  content: string, 
  progress: number = 0,
  status: string = 'planning'
) {
  const db = await getDatabase()
  const createdAt = Date.now()
  await db.run(
    `INSERT OR REPLACE INTO project_logs 
    (project_id, date, content, progress, status, created_at) 
    VALUES (?, ?, ?, ?, ?, ?)`,
    [projectId, date, content, progress, status, createdAt]
  )
}

async function getProjectLogs(projectId: string) {
  const db = await getDatabase()
  return await db.all(
    'SELECT * FROM project_logs WHERE project_id = ? ORDER BY date DESC, created_at DESC',
    [projectId]
  )
}

async function getProjectLogByDate(projectId: string, date: string) {
  const db = await getDatabase()
  return await db.get(
    'SELECT * FROM project_logs WHERE project_id = ? AND date = ?',
    [projectId, date]
  )
}

// 获取项目的最新进度
async function getProjectLatestProgress(projectId: string) {
  const db = await getDatabase()
  const result = await db.get(
    `SELECT progress, status, date 
    FROM project_logs 
    WHERE project_id = ? 
    ORDER BY date DESC, created_at DESC 
    LIMIT 1`,
    [projectId]
  )
  return result || { progress: 0, status: 'planning', date: null }
}

// 获取项目的进度历史
async function getProjectProgressHistory(projectId: string) {
  const db = await getDatabase()
  return await db.all(
    `SELECT date, progress, status 
    FROM project_logs 
    WHERE project_id = ? AND (progress > 0 OR status != 'planning')
    ORDER BY date ASC`,
    [projectId]
  )
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
  saveAlarmLatest,
  saveKeyValue,
  getKeyValue,
  saveProjectLog,
  getProjectLogs,
  getProjectLogByDate,
  getProjectLatestProgress,
  getProjectProgressHistory
}
