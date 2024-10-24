import { BrowserWindow, screen } from 'electron'
import path from 'path'
import { getAlarm, getScreenBlockerStatus, saveAlarm, saveAlarmLatest, updateNextBlockTime } from './database'
import moment from 'moment'
import { createReminderWindow } from './reminderHandler'

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

// 添加一个一分钟更新的计时器，用来获取是否需要进行屏保
export function startScreenBlockerLoopByMinute() {
  setInterval(async () => {
    // 获取锁屏状态
    const screenBlockerStatus = await getScreenBlockerStatus()
    if (screenBlockerStatus && screenBlockerStatus.is_active) {
      const nextBlockTime = screenBlockerStatus.next_block_time
        if (nextBlockTime && moment().valueOf() >= nextBlockTime) {
          setTimeout(() => {
            closeScreenBlocker()
          }, screenBlockerStatus.block_duration * 60 * 1000)
          createScreenBlocker(screenBlockerStatus.screen_type, screenBlockerStatus.block_duration)
          // 更新下次屏保时间
          updateNextBlockTime()
        }
      }
    // 更新弹出日志
    const nowValue = moment().valueOf()
    const nowDate = moment().format("YYYY-MM-DD")
    const alarm = await getAlarm()
    if (alarm) {
      const alarmDate =  nowDate + " " + alarm.time + ":00"
      const alarmDateValue = moment(alarmDate).valueOf()
      if(nowValue >= alarmDateValue) {
        // 判断latest是否也大于
        if (alarm.latest > alarmDateValue) {
          // 已经提示过了不做处理
        } else {
          // 没有提示过，需要弹窗
          createReminderWindow('您设置的提醒时间到了')
          // 保存最近时间
          saveAlarmLatest(nowValue)
        }
      }
    }
    }, 60000)
}

