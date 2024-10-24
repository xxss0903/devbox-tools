import { BrowserWindow, ipcMain } from 'electron'
import {
  getDatabase,
  getScreenBlockerStatus, updateNextBlockTime, updateScreenBlockerIsActive
} from './database'
import { closeScreenBlocker, createScreenBlocker } from './screenBlocker'
import moment from 'moment'

// 屏幕阻挡器处理
export function setupScreenBlockerHandle(win: BrowserWindow) {
  // 设置屏幕阻挡器状态
  ipcMain.handle('set-screen-blocker-status', async (event, isActive: boolean) => {
    console.log('set-screen-blocker-status', isActive)
    await updateScreenBlockerIsActive(isActive)
    // 在屏保状态改变的地方发送监听事件
    if (isActive) {
      // 更新下次屏保时间
      const settings = await getScreenBlockerStatus()
      if (settings.next_block_time < moment().valueOf()) {
        await updateNextBlockTime()
      }
    }
    win.webContents.send('screen-blocker-status-change', isActive)
    return { success: true }
  })

  // 获取屏幕阻挡器状态
  ipcMain.handle('get-screen-blocker-status', async () => {
    return await getScreenBlockerStatus()
  })

  // 保存屏幕阻止时间
  ipcMain.handle('save-screen-block-time', async (event, duration) => {
    // 保存屏幕阻止时间逻辑
    try {
      const db = await getDatabase()
      const startTime = Date.now()
      await db.run('INSERT INTO screen_block_times (start_time, duration) VALUES (?, ?)', [
        startTime,
        duration
      ])
      console.log('屏幕关闭时间已保存到数据库')
      return { success: true, message: '屏幕关闭时间已成功保存' }
    } catch (error) {
      console.error('保存屏幕关闭时间时出错:', error)
      return { success: false, message: '保存屏幕关闭时间时出错' }
    }
  })

  // 获取屏幕阻止历史
  ipcMain.handle('get-screen-block-history', async () => {
    // 获取屏幕阻止历史逻辑
    try {
      const db = await getDatabase()
      const history = await db.all('SELECT * FROM screen_block_times ORDER BY start_time DESC')
      return history
    } catch (error) {
      console.error('获取屏幕关闭时间历史时出错:', error)
      return []
    }
  })

  // 创建屏幕关闭时间配置表
  ipcMain.handle('save-screen-block-settings', async (event, settings) => {
    try {
      console.log('save-screen-block-settings', settings)
      // 根据intervalTime计算出下次关闭屏幕的事件
      const nextBlockTime =  moment().add(settings.intervalTime, 'minutes').valueOf()
      const db = await getDatabase()
      const res = await db.run(
        'UPDATE screen_block_settings SET interval_time=?, block_duration=?,screen_type=?,next_block_time=? WHERE id = 1',
        [settings.intervalTime, settings.blockDuration, settings.screenType, nextBlockTime]
      )
      // await db.run('DELETE FROM screen_block_settings')
      // const res = await db.run(
      //   'INSERT INTO screen_block_settings (interval_time, block_duration, screen_type) VALUES (?, ?, ?)',
      //   settings.intervalTime,
      //   settings.blockDuration,
      //   settings.screenType
      // )
      console.log('屏幕关闭时间配置已保存到数据库', res)
      return { success: true, message: '屏幕关闭时间配置已成功保存' }
    } catch (error) {
      console.error('保存屏幕关闭时间配置时出错:', error)
      return { success: false, message: '保存屏幕关闭时间配置时出错' }
    }
  })

  // 关闭屏幕遮挡
  ipcMain.handle('close-screen-blocker', () => {
    closeScreenBlocker()
    return '屏幕遮挡器已关闭'
  })

  // 获取屏幕关闭时间配置
  ipcMain.handle('get-screen-block-settings', async () => {
    try {
      const db = await getDatabase()
      return await db.get('SELECT * FROM screen_block_settings')
    } catch (error) {
      console.error('获取屏幕关闭时间配置时出错:', error)
      return null
    }
  })

  // 修改现有的 createScreenBlocker 函数
  ipcMain.handle('create-screen-blocker', (event, duration, screenType) => {
    createScreenBlocker(screenType, duration)
    setTimeout(() => {
      closeScreenBlocker()
    }, duration)
    // 计算下次屏保时间

    // 更新 screen_block_settings 表，包含下次屏保时间
    updateNextBlockTime()
    return '屏幕遮挡器已创建'
  })
}
