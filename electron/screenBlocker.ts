import { BrowserWindow, screen } from 'electron'
import path from 'path'
import { saveScreenBlockerStatus, updateNextBlockTime } from './database'
import moment from 'moment'

let blockerWindowList: BrowserWindow[] = []

export function createScreenBlocker(screenType: string, duration: number) {
  console.log('createScreenBlocker', screenType, duration)
  const displays = screen.getAllDisplays()
  console.log('displays', displays)
  blockerWindowList = displays.map(function (display) {
    const tempWindow = new BrowserWindow({
      skipTaskbar: true,
      fullscreen: true,
      frame: false,
      alwaysOnTop: true,
      focusable: false,
      x: display.bounds.x,
      y: display.bounds.y,
      width: display.bounds.width,
      height: display.bounds.height,
      webPreferences: {
        preload: path.join(__dirname, 'preload.js'),
        contextIsolation: true,
        nodeIntegration: false
      }
    })

    // 根据screenType加载不同的HTML文件
    if (screenType === 'windows-origin-blocker') {
      tempWindow.loadFile(
        path.join(__dirname, '../public/blockerscreens/windows-origin-blocker.html')
      )
    } else if (screenType === 'windows-3d-blocker') {
      tempWindow.loadFile(path.join(__dirname, '../public/blockerscreens/windows-3d-blocker.html'))
    } else if (screenType === 'windows-matrix-blocker') {
      tempWindow.loadFile(path.join(__dirname, '../public/blockerscreens/windows-matrix-blocker.html'))
    } else if (screenType === 'windows-error-blocker') {
      tempWindow.loadFile(path.join(__dirname, '../public/blockerscreens/windows-error-blocker.html'))
    } else {
      tempWindow.loadFile(
        path.join(__dirname, '../public/blockerscreens/windows-origin-blocker.html')
      )
    }

    return tempWindow
  })
  console.log('blockerWindowList', blockerWindowList)
}

export function closeScreenBlocker() {
  console.log('Closing screen blocker')
  if (blockerWindowList && blockerWindowList.length > 0) {
    blockerWindowList.forEach((window) => {
      if (!window.isDestroyed()) {
        window.close()
      }
    })
  }
  blockerWindowList = [] // 清空列表
}
