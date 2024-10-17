import { clipboard, nativeImage, BrowserWindow } from 'electron'
import { getDatabase } from './database'

let lastClipboardContent: string = ''

export async function checkAndUpdateClipboard(win: BrowserWindow) {
  const db = await getDatabase()
  const latestItem = await db.get('SELECT * FROM clipboard_history ORDER BY timestamp DESC LIMIT 1')

  console.log('get latestcontent 1:', latestItem)

  if (latestItem) {
    if (latestItem.type === 'text' || latestItem.type === 'image') {
      lastClipboardContent = latestItem.content
    }
  }
}

export function watchClipboard(win: BrowserWindow) {
  setInterval(async () => {
    const currentContent = clipboard.readText()
    if (currentContent && currentContent !== lastClipboardContent) {
      lastClipboardContent = currentContent
      await updateClipboardHistory(win, 'text', currentContent)
    }

    const image = clipboard.readImage()
    if (!image.isEmpty()) {
      const dataURL = image.toDataURL()
      if (dataURL !== lastClipboardContent) {
        lastClipboardContent = dataURL
        await updateClipboardHistory(win, 'image', dataURL)
        console.log('watchClipboard interval 1000 image update')
      }
    }
  }, 1000)
}

async function updateClipboardHistory(win: BrowserWindow, type: string, content: string) {
  try {
    const db = await getDatabase()

    const existingItem = await db.get('SELECT * FROM clipboard_history WHERE content = ?', content)
    if (existingItem) {
      await db.run(
        'UPDATE clipboard_history SET timestamp = ? WHERE id = ?',
        Date.now(),
        existingItem.id
      )
      console.log('剪贴板内容已更新到最近的时间内')
    } else {
      await db.run(
        'INSERT INTO clipboard_history (type, content, timestamp) VALUES (?, ?, ?)',
        type,
        content,
        Date.now()
      )
      console.log('剪贴板内容已添加到历史记录')
    }

    const history = await db.all('SELECT * FROM clipboard_history ORDER BY timestamp DESC LIMIT 50')
    win?.webContents.send('clipboard-history-update', history)
    console.log('最新的剪贴板历史记录已发送到渲染进程')
  } catch (error) {
    console.error('更新剪贴板历史记录时出错:', error)
  }
}

export async function getClipboardHistory(limit: number) {
  const db = await getDatabase()
  return await db.all('SELECT * FROM clipboard_history ORDER BY timestamp DESC LIMIT ?', limit)
}

export async function clearClipboardHistory() {
  const db = await getDatabase()
  await db.run('DELETE FROM clipboard_history')
}

export async function deleteClipboardItem(id: number) {
  const db = await getDatabase()
  await db.run('DELETE FROM clipboard_history WHERE id = ?', id)
  return await getClipboardHistory(50)
}

export function writeTextToClipboard(text: string) {
  clipboard.writeText(text)
}

export function writeImageToClipboard(dataURL: string) {
  const img = nativeImage.createFromDataURL(dataURL)
  clipboard.writeImage(img)
}
