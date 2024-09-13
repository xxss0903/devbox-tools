import sqlite3 from 'sqlite3'
import { open } from 'sqlite'
import { ipcRenderer } from 'electron'

let db: any = null

async function getDatabase() {
  if (db) return db

  db = await open({
    filename: 'workdiary.sqlite',
    driver: sqlite3.Database
  })

  await db.exec(`
    CREATE TABLE IF NOT EXISTS diary_entries (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      date TEXT UNIQUE,
      content TEXT,
      todos TEXT
    )
  `)

  return db
}

interface DiaryEntry {
  id?: number
  date: string // 这里保持为字符串，但实际上存储的是时间戳
  content: string
  todos: TodoItem[]
}

interface TodoItem {
  text: string
  done: boolean
}

export async function saveDiaryEntry(
  date: string,
  content: string,
  serializedTodos: string
): Promise<void> {
  return await ipcRenderer.invoke('save-diary-entry', {
    date,
    content,
    todos: serializedTodos
  })
}

export async function getDiaryEntries(): Promise<DiaryEntry[]> {
  const entries = await ipcRenderer.invoke('get-diary-entries')
  return entries.map((entry: any) => ({
    ...entry,
    todos: JSON.parse(entry.todos || '[]')
  }))
}

export async function getDiaryEntryByDate(date: string): Promise<DiaryEntry | null> {
  const entry = await ipcRenderer.invoke('get-diary-entry-by-date', date)
  console.log('Entry received in database.ts:', entry)
  if (entry) {
    return {
      ...entry,
      todos: JSON.parse(entry.todos || '[]')
    }
  }
  return null
}
