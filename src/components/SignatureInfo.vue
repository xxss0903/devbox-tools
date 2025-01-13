<script setup lang="ts">
import { ref } from 'vue'
import ToolsContainer from '../widgets/ToolsContainer.vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const signatureInfo = ref('')
const adbResult = ref('')
const connectedDevices = ref('')

const getSignatureInfo = async () => {
  try {
    // 这里添加获取签名信息的逻辑
    signatureInfo.value = '获取到的签名信息...'
  } catch (error) {
    console.error('获取签名信息失败:', error)
    signatureInfo.value = '获取签名信息失败'
  }
}

const executeADB = async () => {
  try {
    // 使用新的 electronAPI
    const result = await window.electronAPI.executeADB('devices')
    adbResult.value = result
    console.log('ADB执行结果:', result)
  } catch (error) {
    console.error('ADB执行错误:', error)
    adbResult.value = '执行ADB命令时发生错误'
  }
}

const getConnectedDevices = async () => {
  try {
    const result = await window.electronAPI.executeADB('adb devices -l')
    connectedDevices.value = result
    console.log('已连接设备:', result)
  } catch (error) {
    console.error('获取设备列表失败:', error)
    connectedDevices.value = '获取设备列表失败'
  }
}

const goBack = () => {
  router.push({ name: 'AndroidTools' })
}
</script>

<template>
  <ToolsContainer title="签名信息" @goBack="goBack">
    <div class="signature-info-container">
      <button @click="getSignatureInfo">获取签名信息</button>
      <button @click="executeADB">执行ADB命令</button>
      <button @click="getConnectedDevices">获取已连接设备</button>

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
  </ToolsContainer>
</template>

<style scoped>
.signature-info-container {
  padding: 20px;
}

button {
  margin-right: 10px;
  margin-bottom: 20px;
  padding: 10px 20px;
  background-color: #4CAF50;
  color: white;
  border: none;
  border-radius: 5px;
  cursor: pointer;
}

button:hover {
  background-color: #45a049;
}

.info-display {
  margin-top: 20px;
  padding: 10px;
  background-color: #f0f0f0;
  border-radius: 5px;
}
</style>
