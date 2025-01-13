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
    const command = `java -jar "${pdfBoxPath}" debug "${filePath}"`
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
    console.log('execute-adb called with command:', command)
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

  // 添加 npm registry 相关的处理方法
  ipcMain.handle('npm-registry-get', async () => {
    return handleNpmRegistry('get')
  })

  ipcMain.handle('npm-registry-set', async (_, registry: string) => {
    return handleNpmRegistry('set', registry)
  })

  // 添加 npm registry 相关的处理方法
  const handleNpmRegistry = async (action: 'get' | 'set', registry?: string) => {
    try {
      // 获取全局 npm 路径
      const npmPath = process.platform === 'win32' 
        ? 'C:\\Program Files\\nodejs\\npm.cmd'  // Windows
        : '/usr/local/bin/npm'  // macOS/Linux

      if (action === 'get') {
        return new Promise((resolve, reject) => {
          exec(`"${npmPath}" config get registry`, {
          }, (error: any, stdout: any, stderr: any) => {
            if (error) {
              resolve({ 
                success: false, 
                message: '获取镜像源失败',
                error 
              })
            } else {
              resolve({ 
                success: true, 
                data: stdout.trim() 
              })
            }
          })
        })
      } else if (action === 'set' && registry) {
        return new Promise((resolve, reject) => {
          exec(`"${npmPath}" config set registry ${registry}`, {
          }, (error: any, stdout: any, stderr: any) => {
            if (error) {
              resolve({ 
                success: false, 
                message: '切换镜像源失败',
                error 
              })
            } else {
              resolve({ 
                success: true, 
                message: '切换镜像源成功' 
              })
            }
          })
        })
      }
      return { success: false, message: '无效的操作' }
    } catch (error) {
      console.error('npm registry operation error', error)
      return { 
        success: false, 
        message: action === 'get' ? '获取镜像源失败' : '切换镜像源失败',
        error
      }
    }
  } 
}
