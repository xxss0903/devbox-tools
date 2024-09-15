<template>
  <div class="clipboard-manager">
    <NavigationBar title="剪贴板历史" @goBack="goBack" />
    <div class="clipboard-content">
      <div v-if="loading" class="loading-state">
        <p>加载中...</p>
      </div>
      <div v-else-if="clipboardHistory.length === 0" class="empty-state">
        <p>剪贴板历史为空</p>
        <p>复制或截图内容后将显示在这里</p>
      </div>
      <div v-else class="clipboard-list">
        <ul>
          <li v-for="item in clipboardHistory" :key="item.id">
            <template v-if="item.type === 'text'">
              <p>{{ item.content }}</p>
            </template>
            <template v-else-if="item.type === 'image'">
              <img
                :src="item.content"
                alt="剪贴板图片"
                style="max-width: 200px; max-height: 200px"
              />
            </template>
          </li>
        </ul>
      </div>
    </div>
    <button @click="clearHistory" class="clear-button">清空历史</button>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import NavigationBar from './NavigationBar.vue'

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

onMounted(() => {
  console.log('组件已挂载，请求剪贴板历史')
  window.electronAPI.onClipboardHistoryUpdate(updateClipboardHistory)
  window.electronAPI.requestClipboardHistory()
})
</script>
<style scoped>
.clipboard-manager {
  height: 100vh;
  display: flex;
  flex-direction: column;
}

.clipboard-content {
  flex-grow: 1;
  overflow-y: auto;
  padding: 20px;
}

.clipboard-list {
  height: 100%;
}

ul {
  list-style-type: none;
  padding: 0;
  margin: 0;
}

li {
  margin-bottom: 10px;
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 4px;
}

p {
  margin: 0;
  word-break: break-all;
}

.empty-state {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  height: 100%;
  color: #888;
  text-align: center;
}

.empty-state p {
  margin: 5px 0;
}

.empty-state p:first-child {
  font-size: 1.2em;
  margin-bottom: 10px;
}
</style>
