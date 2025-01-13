<script setup lang="ts">
import { ref } from 'vue'
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

const getJksInfo = async () => {
  signatureInfo.value = '正在获取指纹信息...'
  try {
    let command = `keytool -list -v -keystore "${selectedJksPath.value}"`
    
    if (aliasName.value) {
      command += ` -alias ${aliasName.value}`
    }
    if (storePass.value) {
      command += ` -storepass ${storePass.value}`
    }
    
    const fingerprint = await window.electronAPI.executeADB(command)
    signatureInfo.value = `JKS文件路径：${selectedJksPath.value}\n\n${fingerprint}`
  } catch (error) {
    console.error('获取JKS指纹信息失败:', error)
    signatureInfo.value = '获取JKS指纹信息失败：' + error
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
</script>

<template>
  <div title="签名信息" @goBack="goBack">
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
                  >
                </div>
              </div>
              
              <div class="drop-zone">
                <i class="file-icon">📄</i>
                <p>拖放 JKS 文件到这里</p>
                <p>或者</p>
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
  </div>
</template>

<style scoped>
.signature-info-container {
  display: flex;
  flex-direction: column;
  height: 80%;
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
}

.content-container {
  flex: 1;
  padding: 20px;
  .content-layout {
    display: flex;
    gap: 20px;
    align-items: flex-start;
    width: 90%;
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
  min-width: 0; /* 防止flex子项溢出 */
}

.results-section .info-display:first-child {
  margin-top: 0;
}
</style>
