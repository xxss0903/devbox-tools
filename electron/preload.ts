import { contextBridge, ipcRenderer } from 'electron'

console.log('Preload script is running')

contextBridge.exposeInMainWorld('electronAPI', {
  // 设置屏幕保护时间
  setScreenBlockerStatus: (isActive: boolean) =>
    ipcRenderer.invoke('set-screen-blocker-status', isActive),
  // 获取屏幕保护时间
  getScreenBlockerStatus: () => ipcRenderer.invoke('get-screen-blocker-status'),
  // 关闭屏幕遮挡器
  closeScreenBlocker: () => ipcRenderer.invoke('close-screen-blocker'),
  closeReminder: () => ipcRenderer.invoke('close-reminder'),
  // 保存屏幕关闭时间配置
  saveScreenBlockSettings: (settings: any) =>
    ipcRenderer.invoke('save-screen-block-settings', settings),
  // 获取屏幕关闭时间配置
  getScreenBlockSettings: () => ipcRenderer.invoke('get-screen-block-settings'),
  // 保存屏幕关闭时间
  saveScreenBlockTime: (duration: number) => ipcRenderer.invoke('save-screen-block-time', duration),
  // 获取屏幕关闭时间历史
  getScreenBlockHistory: () => ipcRenderer.invoke('get-screen-block-history'),
  // 创建屏幕关闭计时器
  createScreenBlocker: (duration: number, screenType: string) =>
    ipcRenderer.invoke('create-screen-blocker', duration, screenType),
  // 开启/关闭屏幕的保护时间，开启就会根据时间倒计时开启屏幕保护
  toggleScreenBlock: () => ipcRenderer.send('toggle-screen-block'),
  // 获取日志提醒时间
  getSavedReminderTime: () => ipcRenderer.invoke('get-saved-reminder-time'),
  // 设置日志提醒时间
  setDailyWorkDiaryAlarm: (time: string) => ipcRenderer.invoke('set-daily-work-diary-alarm', time),
  // 开启/关闭日志提醒
  toggleDailyWorkDiaryAlarm: () => ipcRenderer.send('toggle-daily-work-diary-alarm'),
  // 预览粘贴板的图片
  previewClipboardImage: (text: string) => ipcRenderer.invoke('preview-clipboard-image', text),
  openClipboardUrl: (text: string) => ipcRenderer.invoke('open-url', text),
  writeTextToClipboard: (text: string) => ipcRenderer.invoke('write-text-to-clipboard', text),
  writeImageToClipboard: (dataURL: string) =>
    ipcRenderer.invoke('write-image-to-clipboard', dataURL),
  // 删除粘贴板单个内容
  deleteClipboardItem: (id: number) => ipcRenderer.invoke('delete-clipboard-item', id),
  onClipboardHistoryUpdate: (callback: (history: any[]) => void) =>
    ipcRenderer.on('clipboard-history-update', (_, history) => callback(history)),
  requestClipboardHistory: () => ipcRenderer.send('request-clipboard-history'),
  clearClipboardHistory: () => ipcRenderer.send('clear-clipboard-history'),

  takeScreenshot: () => ipcRenderer.send('take-screenshot'),
  onScreenshotCaptured: (callback: (dataURL: string) => void) =>
    ipcRenderer.on('screenshot-captured', (_, dataURL) => callback(dataURL)),
  executeADB: (command: string) => {
    console.log('executeADB called with command:', command)
    return ipcRenderer.invoke('execute-adb', command)
  },
  selectFolder: () => ipcRenderer.invoke('select-folder'),
  selectProjectFolder: () => ipcRenderer.invoke('select-project-folder'),
  refreshWorkDiary: () => ipcRenderer.invoke('refresh-work-diary'),
  saveDiaryEntry: (date: string, content: string, todos: string) =>
    ipcRenderer.invoke('save-diary-entry', { date, content, todos }),
  getDiaryEntries: () => ipcRenderer.invoke('get-diary-entries'),
  getDiaryEntryByDate: (date: string) => ipcRenderer.invoke('get-diary-entry-by-date', date),
  clearDatabase: () => ipcRenderer.invoke('clear-database'),
  generateWeeklySummary: (startDate: string, endDate: string) =>
    ipcRenderer.invoke('generate-weekly-summary', startDate, endDate),
  registerScreenshotShortcut: (callback: () => void) =>
    ipcRenderer.on('SCREENSHOT_SHORTCUT', callback),
  unregisterScreenshotShortcut: () => ipcRenderer.removeAllListeners('SCREENSHOT_SHORTCUT'),
  // ... 其他 API ...
  handleFileDrop: (callback: any) => {
    document.addEventListener('drop', (event: any) => {
      event.preventDefault()
      event.stopPropagation()

      const files = Array.from(event.dataTransfer.files)
        .filter((file: any) => file.path) // 确保文件有路径
        .map((file: any) => file.path)

      console.log('Dragged files:', files)

      if (files.length > 0) {
        ipcRenderer.invoke('handle-file-drop', files).then(callback)
      } else {
        console.log('No valid files dropped')
      }
    })

    document.addEventListener('dragover', (event) => {
      event.preventDefault()
      event.stopPropagation()
    })
  },
  processDroppedFiles: (filePaths: any) => {
    console.log('Processing dropped files:', filePaths)
    return ipcRenderer.invoke('handle-file-drop', filePaths)
  },
  onClipboardUpdate: (callback: (content: string) => void) =>
    ipcRenderer.on('clipboard-update', (_, content) => callback(content)),
  onClipboardImageUpdate: (callback: (dataUrl: string) => void) =>
    ipcRenderer.on('clipboard-update-image', (_, dataUrl) => callback(dataUrl)),
  deleteDiaryEntry: (date: string) => ipcRenderer.invoke('delete-diary-entry', date),
  openPDFBoxApp: (filePath: string) => ipcRenderer.invoke('open-pdfbox-app', filePath),
  getFilePath: async (file: File) => {
    return file.path
  },
  onScreenBlockerStatusChange: (callback: (event: any, status: boolean) => void) =>
    ipcRenderer.on('screen-blocker-status-change', callback),
  getAutoLaunch: () => ipcRenderer.invoke('get-auto-launch'),
  setAutoLaunch: (enable: boolean) => ipcRenderer.invoke('set-auto-launch', enable),
  chatWithAI: (prompt: string, model?: string, image?: string) =>
    ipcRenderer.invoke('chat-with-ai', prompt, model, image),
  getOllamaModels: () => ipcRenderer.invoke('get-ollama-models'),
  pullOllamaModel: (modelName: string) => ipcRenderer.invoke('pull-ollama-model', modelName),
  deleteOllamaModel: (modelName: string) => ipcRenderer.invoke('delete-ollama-model', modelName),
  setDefaultModel: (modelName: string) => ipcRenderer.invoke('set-default-model', modelName),
  getDefaultModel: () => ipcRenderer.invoke('get-default-model'),
  onModelPullProgress: (callback: (progress: number) => void) =>
    ipcRenderer.on('model-pull-progress', (_, progress) => callback(progress)),
  onOllamaStream: (callback: (content: string) => void) =>
    ipcRenderer.on('ollama-stream', (_, content) => callback(content)),
  onOllamaDone: (callback: () => void) => ipcRenderer.on('ollama-done', () => callback()),
  // 添加获取拖放文件夹路径的方法
  getDroppedFolderPath: (file: File) => ipcRenderer.invoke('get-dropped-folder-path', file.path),
  getProjectStats: (path: string) => ipcRenderer.invoke('project:getStats', path),
  getProjectFileTree: (path: string) => ipcRenderer.invoke('project:getFileTree', path),
  openInEditor: (path: string) => ipcRenderer.invoke('project:openInEditor', path),
  openInFinder: (path: string) => ipcRenderer.invoke('project:openInFinder', path),
  npmRegistryGet: () => ipcRenderer.invoke('npm-registry-get'),
  npmRegistrySet: (registry: string) => ipcRenderer.invoke('npm-registry-set', registry),
  openFileDialog: (options: any) => ipcRenderer.invoke('dialog:openFile', options),
  saveJksPassword: (password: string) => ipcRenderer.invoke('save-jks-password', password),
  getJksPassword: () => ipcRenderer.invoke('get-jks-password'),
})

contextBridge.exposeInMainWorld('projectAPI', {
  createProject: (projectData: any) => ipcRenderer.invoke('project:create', projectData),
  getProjects: () => ipcRenderer.invoke('get-projects'),
  getProject: (id: any) => ipcRenderer.invoke('project:get', id),
  updateProject: (id: any, updates: any) => ipcRenderer.invoke('project:update', id, updates),
  deleteProject: (id: any) => ipcRenderer.invoke('project:delete', id)
})

console.log('electronAPI exposed')
