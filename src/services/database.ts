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
      content TEXT
    )
  `)

  return db
}

interface DiaryEntry {
  id?: number
  date: string
  content: string
}

export async function saveDiaryEntry(date: string, content: string): Promise<void> {
  return await ipcRenderer.invoke('save-diary-entry', { date, content })
}

export async function getDiaryEntries(): Promise<DiaryEntry[]> {
  return await ipcRenderer.invoke('get-diary-entries')
}

export async function getDiaryEntryByDate(date: string): Promise<DiaryEntry | null> {
  return await ipcRenderer.invoke('get-diary-entry-by-date', date)
}
