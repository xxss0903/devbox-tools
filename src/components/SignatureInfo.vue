<script setup lang="ts">
import { ref } from 'vue'
import ToolsContainer from '../widgets/ToolsContainer.vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const signatureInfo = ref('')
const adbResult = ref('')
const connectedDevices = ref('')

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

const getJksFingerprint = async () => {
  resetDisplays()
  try {
    // 打开文件选择对话框
    const result = await window.electronAPI.openFileDialog({
      title: '选择 JKS 文件',
      filters: [
        { name: 'JKS Files', extensions: ['jks', 'keystore'] },
        { name: 'All Files', extensions: ['*'] }
      ]
    })

    if (!result.canceled && result.filePaths.length > 0) {
      const jksPath = result.filePaths[0]
      signatureInfo.value = '正在获取指纹信息...'

      // 使用 executeADB 来执行 keytool 命令
      const command = `keytool -list -v -keystore "${jksPath}"`
      const fingerprint = await window.electronAPI.executeADB(command)
      
      signatureInfo.value = `JKS文件路径：${jksPath}\n\n${fingerprint}`
    } else {
      signatureInfo.value = '未选择文件'
    }
  } catch (error) {
    console.error('获取JKS指纹信息失败:', error)
    signatureInfo.value = '获取JKS指纹信息失败：' + error
  }
}

const goBack = () => {
  router.push({ name: 'AndroidTools' })
}
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
  </ToolsContainer>
</template>

<style scoped>
.signature-info-container {
  display: flex;
  flex-direction: column;
  height: 100%;
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
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  align-items: center;
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
  width: 80%;
  max-width: 90%;
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
</style>
