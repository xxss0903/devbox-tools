import { app, BrowserWindow, clipboard, desktopCapturer, dialog, ipcMain, nativeImage, shell } from "electron"
import { exec } from "child_process"
import path from "path"
import fs from 'fs/promises'

// 打开exe的接口工具，比如打开PDF工具
export function setupOpenExeHandle(win: BrowserWindow) {

// 打开pdf的接口工具
ipcMain.handle('open-pdfbox-app', async (_, filePath) => {
    const javaPath = path.join(app.getAppPath(), 'public', 'jdk-17.0.12', 'bin', 'java')
    const pdfBoxPath = path.join(app.getAppPath(), 'public', 'pdfbox-app.jar')
    const command = `${javaPath} -jar "${pdfBoxPath}" debug "${filePath}"`
    // const pdfBoxPath = path.join(app.getAppPath(), 'public', 'pdfbox-app.jar')

    return new Promise((resolve, reject) => {
      exec(command, (error, stdout, stderr) => {
        if (error) {
          reject(error)
        } else {
          resolve(stdout)
        }
      })
    })
  })

  // 打开url
  ipcMain.handle('open-url', async (event, text) => {
    shell.openExternal(text)
  })

  // 执行命令
  ipcMain.handle('execute-command', async (_, command) => {
    return new Promise((resolve, reject) => {
      exec(command, (error, stdout, stderr) => {
        if (error) {
          reject(error)
        } else {
          resolve(stdout)
        }
      })
    })
  })

  // adb 执行命令
  ipcMain.handle('execute-adb', async (event, command: string) => {
    // ADB 执行逻辑
  })

  // 选择文件夹
  ipcMain.handle('select-folder', async () => {
    const result = await dialog.showOpenDialog({
      properties: ['openDirectory']
    })
    if (result.canceled) {
      return null
    }
    const files = await fs.readdir(result.filePaths[0])
    const imageFiles = await Promise.all(
      files
        .filter((file: string) => /\.(jpg|jpeg|png)$/i.test(file))
        .map(async (file: string) => {
          const filePath = path.join(result.filePaths[0], file)
          const stats = await fs.stat(filePath)
          const fileContent = await fs.readFile(filePath, { encoding: 'base64' })
          return {
            name: file,
            size: stats.size,
            data: `data:image/${path.extname(file).slice(1)};base64,${fileContent}`
          }
        })
    )
    return imageFiles
  })

  // 处理拖拽的文件
  ipcMain.handle('process-dropped-files', async (event, filePaths) => {
    const imageFiles = await Promise.all(
      filePaths
        .filter((filePath: string) => /\.(jpg|jpeg|png)$/i.test(filePath))
        .map(async (filePath: string) => {
          const stats = await fs.stat(filePath)
          const fileContent = await fs.readFile(filePath, { encoding: 'base64' })
          return {
            name: path.basename(filePath),
            size: stats.size,
            data: `data:image/${path.extname(filePath).slice(1)};base64,${fileContent}`
          }
        })
    )
    return imageFiles
  })

// 选择文件
  ipcMain.handle('get-file-path', async (event, options) => {
    const result = await dialog.showOpenDialog({
      properties: ['openFile'],
      filters: [{ name: 'PDF Files', extensions: ['pdf'] }]
    })
    if (result.canceled) {
      return null
    } else {
      return result.filePaths[0]
    }
  })


  // 截图
  ipcMain.handle('TAKE_SCREENSHOT', async () => {
    const sources = await desktopCapturer.getSources({
      types: ['screen'],
      thumbnailSize: { width: 1920, height: 1080 }
    })
    return sources[0].thumbnail.toDataURL()
  })
}