<template>
  <div class="clipboard-manager">
    <div class="navigation-bar">
      <div class="navigation-bar-title">
        <button class="back-button" @click="goBack">返回</button>
        <h2 class="detail-title">剪切板历史</h2>
      </div>
      <button class="refresh-button" @click="refreshHistory">刷新</button>
    </div>
    <div class="clipboard-content">
      <div v-if="loading" class="loading-state">
        <p>加载中...</p>
      </div>
      <div v-else-if="!clipboardHistory || clipboardHistory.length === 0" class="empty-state">
        <p>剪贴板历史为空</p>
        <p>复制或截图内容后将显示在这里</p>
      </div>
      <ul v-else class="clipboard-list">
        <li v-for="item in clipboardHistory" :key="item.id" class="clipboard-item">
          <span v-if="item.type === 'text'" class="text-content">{{ item.content }}</span>
          <img
            v-else-if="item.type === 'image'"
            :src="item.content"
            alt="剪贴板图片"
            class="image-content"
          />
        </li>
      </ul>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import ToolsContainer from './ToolsContainer.vue'

interface ClipboardItem {
  id: number
  type: 'text' | 'image'
  content: string
  timestamp: number
}

const router = useRouter()
const clipboardHistory = ref<ClipboardItem[]>([])
const loading = ref(true)

const goBack = () => {
  router.push({ name: 'Home' })
}

const updateClipboardHistory = (history: ClipboardItem[]) => {
  console.log('updateClipboardHistory', history)
  clipboardHistory.value = history
  loading.value = false
}

const clearHistory = () => {
  loading.value = true
  window.electronAPI.clearClipboardHistory()
}

const refreshHistory = async () => {
  loading.value = true
  try {
    const history = await window.electronAPI.requestClipboardHistory()
    updateClipboardHistory(history)
  } catch (error) {
    console.error('刷新剪贴板历史失败:', error)
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  console.log('组件已挂载，请求剪贴板历史')
  window.electronAPI.onClipboardHistoryUpdate(updateClipboardHistory)
  refreshHistory() // 初始加载使用相同的刷新函数
})
</script>

<style scoped>
.clipboard-content {
  overflow-y: auto;
  padding: 0 20px;
  width: 100%;
  padding: 20px;
}

.clipboard-list {
  list-style-type: none;
  padding: 0;
  margin: 0;
  width: 100%;
}

.clipboard-item {
  margin-bottom: 10px;
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 4px;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
  width: 90%;
  box-sizing: border-box;
}

.text-content {
  display: block;
  overflow: hidden;
  text-overflow: ellipsis;
  width: 100%;
}

.image-content {
  max-width: 100%;
  max-height: 100px;
  object-fit: cover;
  display: block;
}

.loading-state,
.empty-state {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  height: 100%;
  color: #888;
  text-align: center;
  width: 100%;
}

.refresh-button,
.clear-button {
  padding: 8px 16px;
  background-color: #4caf50;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.3s ease;
}

.refresh-button:hover,
.clear-button:hover {
  background-color: #45a049;
}

.navigation-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px 20px;
  background-color: #f8f9fa;
  border-bottom: 1px solid #e9ecef;
}

.navigation-bar-title {
  display: flex;
  align-items: center;
}

.back-button {
  padding: 8px 16px;
  background-color: #3498db;
  color: #ffffff;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.3s ease;
  margin-right: 20px;
}

.back-button:hover {
  background-color: #2980b9;
}
</style>
