<script setup lang="ts">
import { ref, onUnmounted, onMounted } from 'vue'
import ToolsContainer from '../widgets/ToolsContainer.vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const signatureInfo = ref('')
const adbResult = ref('')
const connectedDevices = ref('')
const isDragging = ref(false)
const showJksDialog = ref(false)
const aliasName = ref('')
const storePass = ref('')
const selectedJksPath = ref('')
const showCopyTip = ref(false)
const copyTipTimer = ref<number | null>(null)

const resetDisplays = () => {
  signatureInfo.value = ''
  adbResult.value = ''
  connectedDevices.value = ''
}

const getSignatureInfo = async () => {
  resetDisplays()
  try {
    // 这里添加获取签名信息的逻辑
    signatureInfo.value = '获取到的签名信息...'
  } catch (error) {
    console.error('获取签名信息失败:', error)
    signatureInfo.value = '获取签名信息失败'
  }
}

const executeADB = async () => {
  resetDisplays()
  try {
    const result = await window.electronAPI.executeADB('devices')
    adbResult.value = result
    console.log('ADB执行结果:', result)
  } catch (error) {
    console.error('ADB执行错误:', error)
    adbResult.value = '执行ADB命令时发生错误'
  }
}

const getConnectedDevices = async () => {
  resetDisplays()
  try {
    const result = await window.electronAPI.executeADB('adb devices -l')
    connectedDevices.value = result
    console.log('已连接设备:', result)
  } catch (error) {
    console.error('获取设备列表失败:', error)
    connectedDevices.value = '获取设备列表失败'
  }
}

const restartADBServer = async () => {
  resetDisplays()
  try {
    // 先终止 ADB 服务
    adbResult.value = '正在终止 ADB 服务...'
    await window.electronAPI.executeADB('adb kill-server')
    adbResult.value = 'ADB 服务已终止\n正在重启服务...'
    
    // 等待短暂时间确保服务完全终止
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    // 重新启动 ADB 服务
    await window.electronAPI.executeADB('adb start-server')
    adbResult.value = 'ADB 服务已重启\n正在检查设备连接状态...'
    
    // 获取设备列表以验证服务是否正常
    const result = await window.electronAPI.executeADB('adb devices -l')
    adbResult.value = '重启 ADB 服务完成！\n\n设备连接状态：\n' + result
  } catch (error) {
    console.error('重启 ADB 服务失败:', error)
    adbResult.value = '重启 ADB 服务失败：' + error
  }
}

const handleDragEnter = (e: DragEvent) => {
  e.preventDefault()
  e.stopPropagation()
  isDragging.value = true
}

const handleDragLeave = (e: DragEvent) => {
  e.preventDefault()
  e.stopPropagation()
  isDragging.value = false
}

const handleDrop = async (e: DragEvent) => {
  e.preventDefault()
  e.stopPropagation()
  isDragging.value = false
  
  if (e.dataTransfer?.files.length) {
    const file = e.dataTransfer.files[0]
    console.log('拖放的文件:', file)
    
    // 使用 electronAPI 获取文件路径
    const filePath = await window.electronAPI.getDroppedFolderPath(file)
    console.log('文件路径:', filePath)
    
    if (file.name.endsWith('.jks') || file.name.endsWith('.keystore')) {
      await processJksFile(filePath)
    } else {
      signatureInfo.value = '请选择有效的 JKS 文件'
    }
  }
}

const processJksFile = async (jksPath: string) => {
  selectedJksPath.value = jksPath
}

// 添加用于解析的接口
interface ParsedFingerprint {
  alias: string
  sha1: string
  sha256: string
  md5: string
}

const parsedFingerprints = ref<ParsedFingerprint[]>([])

// 解析指纹信息
const parseFingerprint = (text: string) => {
  const fingerprints: ParsedFingerprint[] = []
  let currentFingerprint: Partial<ParsedFingerprint> = {}
  
  const lines = text.split('\n')
  for (const line of lines) {
    const trimmedLine = line.trim()
    console.log('command line:', trimmedLine)
    
    if (line.includes('别名:') || line.includes('Alias:')) {
      if (Object.keys(currentFingerprint).length > 0) {
        fingerprints.push(currentFingerprint as ParsedFingerprint)
      }
      currentFingerprint = {
        alias: line.split(':')[1].trim()
      }
    } else if (trimmedLine.startsWith('SHA1:')) {
      // 找到最后一个冒号后的所有内容
      const colonIndex = trimmedLine.indexOf(':')
      if (colonIndex !== -1) {
        currentFingerprint.sha1 = trimmedLine.substring(colonIndex+1).trim()
      }
    } else if (trimmedLine.startsWith('SHA256:')) {
      const colonIndex = trimmedLine.indexOf(':')
      if (colonIndex !== -1) {
        currentFingerprint.sha256 = trimmedLine.substring(colonIndex + 1).trim()
      }
    } else if (trimmedLine.startsWith('MD5:')) {
      const colonIndex = trimmedLine.indexOf(':')
      if (colonIndex !== -1) {
        currentFingerprint.md5 = trimmedLine.substring(colonIndex + 1).trim()
      }
    }
  }
  
  if (Object.keys(currentFingerprint).length > 0) {
    fingerprints.push(currentFingerprint as ParsedFingerprint)
  }
  
  console.log('解析的指纹信息:', fingerprints)
  return fingerprints
}

// 复制文本到剪贴板
const copyToClipboard = async (text: string) => {
  try {
    await window.electronAPI.writeTextToClipboard(text)
    // 显示提示
    showCopyTip.value = true
    
    // 清除之前的定时器（如果存在）
    if (copyTipTimer.value) {
      clearTimeout(copyTipTimer.value)
    }
    
    // 设置新的定时器，2秒后隐藏提示
    copyTipTimer.value = window.setTimeout(() => {
      showCopyTip.value = false
    }, 2000)
  } catch (error) {
    console.error('复制失败:', error)
  }
}

const getJksInfo = async () => {
  signatureInfo.value = '正在获取指纹信息...'
  try {
    let command = `keytool -J-Dfile.encoding=UTF-8 -list -v -keystore "${selectedJksPath.value}"`
    
    if (aliasName.value) {
      command += ` -alias ${aliasName.value}`
    }
    if (storePass.value) {
      command += ` -storepass ${storePass.value}`
      await savePassword()
    }
    
    await window.electronAPI.executeADB('chcp 65001')
    const fingerprint = await window.electronAPI.executeADB(command)
    parsedFingerprints.value = parseFingerprint(fingerprint)
    signatureInfo.value = fingerprint
  } catch (error) {
    console.error('获取JKS指纹信息失败:', error)
    signatureInfo.value = '获取JKS指纹信息失败：' + error
    parsedFingerprints.value = []
  }
}

const getJksFingerprint = () => {
  resetDisplays()
  showJksDialog.value = true
}

const selectFile = async () => {
  try {
    const result = await window.electronAPI.openFileDialog({
      title: '选择 JKS 文件',
      properties: ['openFile'],
      filters: [
        { name: 'JKS Files', extensions: ['jks', 'keystore'] },
        { name: 'All Files', extensions: ['*'] }
      ]
    })

    if (!result.canceled && result.filePaths.length > 0) {
      const jksPath = result.filePaths[0]
      await processJksFile(jksPath)
    }
  } catch (error) {
    console.error('选择文件失败:', error)
    signatureInfo.value = '选择文件失败：' + error
  }
}

const goBack = () => {
  router.push({ name: 'AndroidTools' })
}

// 加载保存的密码
const loadSavedPassword = async () => {
  try {
    const savedPassword = await window.electronAPI.getJksPassword()
    if (savedPassword) {
      storePass.value = savedPassword
    }
  } catch (error) {
    console.error('加载保存的密码失败:', error)
  }
}

// 保存密码
const savePassword = async () => {
  try {
    if (storePass.value) {
      await window.electronAPI.saveJksPassword(storePass.value)
    }
  } catch (error) {
    console.error('保存密码失败:', error)
  }
}

// 组件挂载时加载保存的密码
onMounted(() => {
  loadSavedPassword()
})

// 组件卸载时清理定时器
onUnmounted(() => {
  if (copyTipTimer.value) {
    clearTimeout(copyTipTimer.value)
  }
})
</script>

<template>
  <ToolsContainer title="签名信息" @goBack="goBack">
    <div class="signature-info-container">
      <div class="button-container">
        <button @click="getSignatureInfo">获取签名信息</button>
        <button @click="getJksFingerprint" class="jks-btn">获取JKS指纹</button>
        <button @click="executeADB">执行ADB命令</button>
        <button @click="getConnectedDevices">获取已连接设备</button>
        <button @click="restartADBServer" class="restart-btn">重启ADB服务</button>
      </div>

      <div class="content-container">
        <div class="content-layout">
          <!-- 左侧：JKS文件选择区域 -->
          <div v-if="showJksDialog" class="jks-section"
            @dragenter="handleDragEnter"
            @dragover.prevent
            @dragleave="handleDragLeave"
            @drop="handleDrop"
            :class="{ 'dragging': isDragging }">
            <div class="dialog-content">
              <h3>选择 JKS 文件</h3>
              
              <!-- 添加输入框 -->
              <div class="input-group">
                <div class="input-field">
                  <label for="aliasName">别名 (Alias):</label>
                  <input 
                    id="aliasName"
                    v-model="aliasName"
                    type="text"
                    placeholder="输入别名"
                  >
                </div>
                <div class="input-field">
                  <label for="storePass">密码 (Password):</label>
                  <input 
                    id="storePass"
                    v-model="storePass"
                    type="password"
                    placeholder="输入密码"
                    autocomplete="off"
                  >
                  <p class="password-hint" v-if="storePass">密码将在成功使用后自动保存</p>
                </div>
              </div>
              
              <div class="drop-zone">
                <i class="file-icon">📄</i>
                <div class="selected-file" v-if="selectedJksPath">
                  <p class="file-path">已选择: {{ selectedJksPath }}</p>
                </div>
                <div class="file-hint" v-else>
                  <p>请选择或拖放 JKS 文件到这里</p>
                </div>
                <button @click="selectFile" class="select-btn">选择文件</button>
              </div>

              <!-- 添加获取按钮 -->
              <div class="action-buttons">
                <button 
                  @click="getJksInfo" 
                  class="get-info-btn"
                  :disabled="!selectedJksPath"
                  :class="{ 'disabled': !selectedJksPath }"
                >
                  获取信息
                </button>
              </div>
            </div>
          </div>

          <!-- 右侧：显示结果区域 -->
          <div class="results-section">
            <div v-if="signatureInfo" class="info-display">
              <h3>签名信息：</h3>
              <div v-if="parsedFingerprints.length > 0" class="fingerprints-container">
                <div v-for="(fp, index) in parsedFingerprints" :key="index" class="fingerprint-item">
                  <h4>别名: {{ fp.alias }}</h4>
                  <div class="hash-item">
                    <span class="hash-label">SHA1:</span>
                    <div class="hash-value">
                      <span>{{ fp.sha1 }}</span>
                      <button class="copy-btn" @click="copyToClipboard(fp.sha1)">复制</button>
                    </div>
                  </div>
                  <div class="hash-item">
                    <span class="hash-label">SHA256:</span>
                    <div class="hash-value">
                      <span>{{ fp.sha256 }}</span>
                      <button class="copy-btn" @click="copyToClipboard(fp.sha256)">复制</button>
                    </div>
                  </div>
                  <div class="hash-item">
                    <span class="hash-label">MD5:</span>
                    <div class="hash-value">
                      <span>{{ fp.md5 }}</span>
                      <button class="copy-btn" @click="copyToClipboard(fp.md5)">复制</button>
                    </div>
                  </div>
                </div>
              </div>
              <pre>{{ signatureInfo }}</pre>
            </div>

            <div v-if="adbResult" class="info-display">
              <h3>ADB 命令执行结果：</h3>
              <pre>{{ adbResult }}</pre>
            </div>

            <div v-if="connectedDevices" class="info-display">
              <h3>已连接设备列表：</h3>
              <pre>{{ connectedDevices }}</pre>
            </div>
          </div>
        </div>
      </div>
    </div>
  <!-- 添加复制成功提示 -->
  <div v-if="showCopyTip" class="copy-tip">
    复制成功
  </div>
  </ToolsContainer>
</template>

<style scoped>
.signature-info-container {
  display: flex;
  flex-direction: column;
  height: 80%;
  width: 100%;
  max-width: 100%;
  padding: 0 20px;
}

.button-container {
  position: sticky;
  top: 0;
  background-color: white;
  padding: 20px;
  z-index: 1;
  border-bottom: 1px solid #e0e0e0;
  display: flex;
  justify-content: space-between;
  gap: 10px;
  width: 100%;
}

.content-container {
  flex: 1;
  padding: 20px;
  width: 100%;
  .content-layout {
    display: flex;
    gap: 20px;
    align-items: flex-start;
    width: 100%;
  }
}

button {
  flex: 1;
  margin-right: 0;
  padding: 10px 20px;
  background-color: #4CAF50;
  color: white;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  white-space: nowrap;
  min-width: 120px;
}

button:hover {
  background-color: #45a049;
}

.info-display {
  margin-top: 20px;
  padding: 20px;
  background-color: #f0f0f0;
  border-radius: 5px;
  width: 100%;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.info-display pre {
  white-space: pre-wrap;
  word-break: break-all;
  margin: 10px 0;
  font-family: monospace;
  font-size: 14px;
  line-height: 1.5;
}

.info-display h3 {
  margin: 0 0 10px 0;
  color: #333;
  font-size: 16px;
}

.restart-btn {
  background-color: #ff9800;
}

.restart-btn:hover {
  background-color: #f57c00;
}

.jks-btn {
  background-color: #2196F3;
}

.jks-btn:hover {
  background-color: #1976D2;
}

.jks-section {
  margin: 20px 0;
  width: 400px;
  flex-shrink: 0;
  background: white;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  margin-left: 0;
}

.jks-section.dragging {
  background-color: #e3f2fd;
}

.dialog-content {
  text-align: center;
}

.drop-zone {
  border: 2px dashed #2196F3;
  border-radius: 8px;
  padding: 30px;
  margin-top: 10px;
  transition: all 0.3s ease;
  margin-bottom: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.dragging .drop-zone {
  background-color: #bbdefb;
  border-color: #1976D2;
}

.file-icon {
  font-size: 48px;
  margin-bottom: 10px;
}

.select-btn {
  margin-top: 15px;
  background-color: #2196F3;
  color: white;
  padding: 8px 20px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
}

.select-btn:hover {
  background-color: #1976D2;
}

.drop-zone p {
  margin: 8px 0;
  color: #666;
}

.input-group {
  margin: 20px 0;
  width: 100%;
}

.input-field {
  margin-bottom: 15px;
  text-align: left;
}

.input-field label {
  display: block;
  margin-bottom: 5px;
  color: #333;
  font-size: 14px;
}

.input-field input {
  width: 100%;
  padding: 8px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
  transition: border-color 0.3s;
}

.input-field input:focus {
  outline: none;
  border-color: #2196F3;
}

.input-field input::placeholder {
  color: #999;
}

.action-buttons {
  margin-top: 20px;
}

.get-info-btn {
  background-color: #4CAF50;
  color: white;
  padding: 10px 30px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  transition: all 0.3s ease;
}

.get-info-btn:hover:not(.disabled) {
  background-color: #45a049;
}

.get-info-btn.disabled {
  background-color: #cccccc;
  cursor: not-allowed;
  opacity: 0.7;
}

.results-section {
  flex: 1;
  min-width: 0;
  width: 100%;
}

.results-section .info-display:first-child {
  margin-top: 0;
}

.selected-file {
  margin: 10px 0;
  width: 100%;
}

.file-path {
  color: #2196F3;
  font-size: 14px;
  word-break: break-all;
  background-color: #e3f2fd;
  padding: 8px;
  border-radius: 4px;
  margin: 0;
}

.file-hint {
  margin: 10px 0;
}

.file-hint p {
  color: #666;
  margin: 0;
}

.fingerprints-container {
  margin-bottom: 20px;
  border: 1px solid #e0e0e0;
  border-radius: 4px;
  padding: 15px;
  background-color: white;
}

.fingerprint-item {
  margin-bottom: 20px;
}

.fingerprint-item:last-child {
  margin-bottom: 0;
}

.fingerprint-item h4 {
  margin: 0 0 10px 0;
  color: #2196F3;
  font-size: 16px;
}

.hash-item {
  display: flex;
  align-items: flex-start;
  margin-bottom: 8px;
  padding: 8px;
  background-color: #f5f5f5;
  border-radius: 4px;
}

.hash-label {
  flex-shrink: 0;
  width: 70px;
  font-weight: bold;
  color: #666;
}

.hash-value {
  flex: 1;
  display: flex;
  align-items: center;
  gap: 10px;
  word-break: break-all;
  font-family: monospace;
}

.copy-btn {
  flex-shrink: 0;
  padding: 4px 12px;
  font-size: 12px;
  min-width: auto;
  background-color: #2196F3;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.3s;
}

.copy-btn:hover {
  background-color: #1976D2;
}

.copy-tip {
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background-color: rgba(0, 0, 0, 0.8);
  color: white;
  padding: 10px 20px;
  border-radius: 4px;
  font-size: 14px;
  z-index: 1000;
  animation: fadeInOut 2s ease-in-out;
}

@keyframes fadeInOut {
  0% {
    opacity: 0;
    transform: translate(-50%, -50%) scale(0.8);
  }
  20% {
    opacity: 1;
    transform: translate(-50%, -50%) scale(1);
  }
  80% {
    opacity: 1;
    transform: translate(-50%, -50%) scale(1);
  }
  100% {
    opacity: 0;
    transform: translate(-50%, -50%) scale(0.8);
  }
}

.password-hint {
  font-size: 12px;
  color: #666;
  margin-top: 4px;
  font-style: italic;
}
</style>
