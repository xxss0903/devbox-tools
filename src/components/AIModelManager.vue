<template>
  <div class="model-manager-container">
    <div class="header">
      <h2>AI 模型管理</h2>
      <div class="header-actions">
        <button @click="refreshModels" class="refresh-button">
          刷新模型列表
        </button>
        <button @click="showPullModal = true" class="pull-button">
          拉取新模型
        </button>
      </div>
    </div>

    <div class="models-grid">
      <div v-for="model in models" :key="model.name" class="model-card">
        <div class="model-info">
          <h3>{{ model.name }}</h3>
          <p class="model-size">大小: {{ formatSize(model.size) }}</p>
          <p class="model-modified">修改时间: {{ formatDate(model.modified_at) }}</p>
        </div>
        <div class="model-actions">
          <button 
            @click="setDefaultModel(model.name)"
            :class="['default-button', { active: model.name === defaultModel }]"
          >
            {{ model.name === defaultModel ? '默认模型' : '设为默认' }}
          </button>
          <button 
            @click="deleteModel(model.name)"
            class="delete-button"
          >
            删除模型
          </button>
        </div>
      </div>
    </div>

    <!-- 拉取模型的模态框 -->
    <div v-if="showPullModal" class="modal-overlay">
      <div class="modal">
        <h3>拉取新模型</h3>
        <div class="input-group">
          <input 
            v-model="modelNameToPull"
            placeholder="输入模型名称 (例如: llama2)"
            class="model-input"
          />
          <button 
            @click="pullModel"
            :disabled="isPulling"
            class="pull-confirm-button"
          >
            {{ isPulling ? '拉取中...' : '开始拉取' }}
          </button>
        </div>
        <div v-if="isPulling" class="pull-status">
          <div class="pull-progress">
            <div class="progress-bar">
              <div 
                class="progress-fill"
                :style="{ width: `${pullProgress}%` }"
              ></div>
            </div>
            <span class="progress-text">{{ pullProgress }}%</span>
          </div>
          <div class="status-details">
            <p>{{ pullStatus }}</p>
            <p v-if="downloadSpeed" class="speed">下载速度: {{ downloadSpeed }}</p>
            <p v-if="downloadedSize" class="size">
              已下载: {{ downloadedSize }} / {{ totalSize }}
            </p>
          </div>
        </div>
        <button @click="showPullModal = false" class="close-button">
          关闭
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'

interface OllamaModel {
  name: string
  size: number
  modified: string
  digest: string
}

const models = ref<OllamaModel[]>([])
const showPullModal = ref(false)
const modelNameToPull = ref('')
const isPulling = ref(false)
const pullProgress = ref(0)
const pullStatus = ref('')
const downloadSpeed = ref('')
const downloadedSize = ref('')
const totalSize = ref('')
const defaultModel = ref('')

// 格式化文件大小
const formatSize = (bytes: number) => {
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB']
  if (bytes === 0) return '0 B'
  const i = Math.floor(Math.log(bytes) / Math.log(1024))
  return `${(bytes / Math.pow(1024, i)).toFixed(2)} ${sizes[i]}`
}

// 格式化日期
const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleString()
}

// 刷新模型列表
const refreshModels = async () => {
  try {
    const modelList = await window.electronAPI.getOllamaModels()
    models.value = modelList
    // 获取默认模型
    defaultModel.value = await window.electronAPI.getDefaultModel()
  } catch (error) {
    console.error('刷新模型列表失败:', error)
  }
}

// 格式化大小
const formatBytes = (bytes: number, decimals = 2) => {
  if (bytes === 0) return '0 B'
  const k = 1024
  const dm = decimals < 0 ? 0 : decimals
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`
}

// 计算下载速度
const calculateSpeed = (bytes: number, elapsed: number) => {
  const speed = bytes / (elapsed / 1000) // bytes per second
  return formatBytes(speed) + '/s'
}

// 拉取新模型
const pullModel = async () => {
  if (!modelNameToPull.value || isPulling.value) return

  try {
    isPulling.value = true
    pullProgress.value = 0
    pullStatus.value = '准备下载...'
    let startTime = Date.now()
    let lastUpdate = startTime

    // 监听进度更新
    window.electronAPI.onModelPullProgress((data: {
      status: string,
      completed: number,
      total: number,
      digest?: string
    }) => {
      const now = Date.now()
      
      if (data.status.indexOf("pulling") >= 0) {
        pullStatus.value = '正在下载模型文件...'
        pullProgress.value = Math.round((data.completed / data.total) * 100) || 0
        downloadedSize.value = formatBytes(data.completed)
        totalSize.value = formatBytes(data.total)
        
        // 每秒更新一次速度
        if (now - lastUpdate > 1000) {
          downloadSpeed.value = calculateSpeed(data.completed, now - startTime)
          lastUpdate = now
        }
      } else if (data.status.indexOf('verifying') >= 0) {
        pullStatus.value = '正在验证模型完整性...'
      } else if (data.status.indexOf('extracting') >= 0) {
        pullStatus.value = '正在解压模型文件...'
      } else if (data.status.indexOf('success') >= 0) {
        pullStatus.value = '模型拉取成功'
      }
    })

    await window.electronAPI.pullOllamaModel(modelNameToPull.value)
    await refreshModels()
    showPullModal.value = false
    modelNameToPull.value = ''
  } catch (error) {
    console.error('拉取模型失败:', error)
    pullStatus.value = '拉取失败，请重试'
  } finally {
    isPulling.value = false
    pullProgress.value = 0
    downloadSpeed.value = ''
    downloadedSize.value = ''
    totalSize.value = ''
  }
}

// 删除模型
const deleteModel = async (modelName: string) => {
  if (!confirm(`确定要删除模型 ${modelName} 吗？`)) return

  try {
    await window.electronAPI.deleteOllamaModel(modelName)
    await refreshModels()
  } catch (error) {
    console.error('删除模型失败:', error)
  }
}

// 设置默认模型
const setDefaultModel = async (modelName: string) => {
  try {
    await window.electronAPI.setDefaultModel(modelName)
    defaultModel.value = modelName
  } catch (error) {
    console.error('设置默认模型失败:', error)
  }
}

onMounted(async () => {
  await refreshModels()
})
</script>

<style scoped>
.model-manager-container {
  padding: 20px;
  max-width: 1200px;
  margin: 0 auto;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30px;
}

.header-actions {
  display: flex;
  gap: 10px;
}

.models-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 20px;
}

.model-card {
  background: white;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.model-info h3 {
  margin: 0 0 10px 0;
  color: #2c3e50;
}

.model-size,
.model-modified {
  margin: 5px 0;
  color: #666;
  font-size: 14px;
}

.model-actions {
  display: flex;
  gap: 10px;
  margin-top: auto;
}

.refresh-button,
.pull-button,
.default-button,
.delete-button {
  padding: 8px 16px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.3s ease;
  font-weight: 500;
}

.refresh-button {
  background-color: #4CAF50;
  color: white;
}

.pull-button {
  background-color: #2196F3;
  color: white;
}

.default-button {
  background-color: #9E9E9E;
  color: white;
  flex: 1;
}

.default-button.active {
  background-color: #4CAF50;
}

.delete-button {
  background-color: #f44336;
  color: white;
  flex: 1;
}

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.modal {
  background: white;
  padding: 30px;
  border-radius: 8px;
  width: 400px;
}

.input-group {
  display: flex;
  gap: 10px;
  margin: 20px 0;
}

.model-input {
  flex: 1;
  padding: 8px;
  border: 1px solid #ddd;
  border-radius: 4px;
}

.pull-status {
  margin: 20px 0;
  padding: 15px;
  background: #f5f5f5;
  border-radius: 8px;
}

.status-details {
  margin-top: 10px;
  font-size: 14px;
  color: #666;
}

.status-details p {
  margin: 5px 0;
}

.speed {
  color: #2196F3;
  font-family: monospace;
}

.size {
  color: #4CAF50;
  font-family: monospace;
}

.progress-text {
  margin-left: 10px;
  font-weight: 500;
  color: #2196F3;
}

.pull-progress {
  display: flex;
  align-items: center;
  gap: 10px;
}

.progress-bar {
  flex: 1;
  height: 8px;
  background: #eee;
  border-radius: 4px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: #2196F3;
  transition: width 0.3s ease;
}

button:hover {
  opacity: 0.9;
  transform: translateY(-1px);
}

button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none;
}
</style> 