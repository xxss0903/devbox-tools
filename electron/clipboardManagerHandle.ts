import { BrowserWindow, clipboard, ipcMain, nativeImage, shell } from "electron"
import { getDatabase, getScreenBlockerStatus, saveScreenBlockerStatus } from "./database"

// 剪切板管理
export function setupClipboardManagerHandle(win: BrowserWindow) {

  // 删除剪切板历史记录
  ipcMain.handle('delete-clipboard-item', async (event, id) => {
    const db = await getDatabase()
    await db.run('DELETE FROM clipboard_history WHERE id = ?', id)
    const updatedHistory = await db.all('SELECT * FROM clipboard_history ORDER BY timestamp DESC')
    return updatedHistory
  })

  // 写入文本到剪切板
  ipcMain.handle('write-text-to-clipboard', async (event, text) => {
    clipboard.writeText(text)
  })

  // 预览剪切板图片
  ipcMain.handle('preview-clipboard-image', async (event, text) => {
    // 打开图片
    shell.openPath(text)
  })

  // 写入图片到剪切板
  ipcMain.handle('write-image-to-clipboard', async (event, dataURL) => {
    const img = nativeImage.createFromDataURL(dataURL)
    clipboard.writeImage(img)
  })

  // 添加剪切板历史记录
  ipcMain.handle('add-clipboard-item', async (event, item) => {
    const db = await getDatabase()
    await db.run(
      'INSERT INTO clipboard_history (type, content, timestamp) VALUES (?, ?, ?)',
      item.type,
      item.content,
      item.timestamp
    )
  })

  // 获取剪切板历史记录
  ipcMain.handle('get-clipboard-history', async (event, limit) => {
    const db = await getDatabase()
    return await db.all('SELECT * FROM clipboard_history ORDER BY timestamp DESC LIMIT ?', limit)
  })

  // 清空剪切板历史记录
  ipcMain.handle('clear-clipboard-history', async () => {
    const db = await getDatabase()
    await db.run('DELETE FROM clipboard_history')
  })

}