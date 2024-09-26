<template>
  <div class="clipboard-manager">
    <div class="navigation-bar">
      <div class="navigation-bar-title">
        <button class="back-button" @click="goBack">返回</button>
        <h2 class="detail-title">剪切板历史</h2>
      </div>
      <button class="refresh-button" @click="refreshHistory">刷新</button>
    </div>
    <!-- 添加搜索输入框 -->
    <div class="search-bar">
      <div class="search-input-container">
        <input
          v-model="searchText"
          @input="filterClipboardHistory"
          type="text"
          placeholder="搜索剪切板内容..."
          class="search-input"
        />
        <button v-if="searchText" @click="clearSearch" class="clear-search-button">×</button>
      </div>
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
        <li v-for="item in filteredClipboardHistory" :key="item.id" class="clipboard-item">
          <div class="item-content"  @click="clickItem(item)">
            <span v-if="item.type === 'text'" class="text-content">
              <a v-if="isUrl(item.content)" :href="item.content" target="_blank">{{ item.content }}</a>
              <span v-else>{{ item.content }}</span>
            </span>
            <img
              v-else-if="item.type === 'image'"
              :src="item.content"
              alt="剪贴板图片"
              class="image-content"
            />
          </div>
          <div class="item-actions">
            <button @click="copyToClipboard(item)" class="action-button copy-button">复制</button>
            <button @click="deleteItem(item.id)" class="action-button delete-button">删除</button>
          </div>
        </li>
      </ul>
    </div>
    <div v-if="showCopySuccess" class="copy-success-toast">复制成功！</div>
  </div>
  <div v-if="imagePreviewModal" class="modal">
       <div class="modal-content">
         <span class="close" @click="imagePreviewModal = false">&times;</span>
         <img :src="imagePreviewSrc" alt="Image Preview" />
       </div>
     </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'

interface ClipboardItem {
  id: number
  type: 'text' | 'image'
  content: string
  timestamp: number
}

const router = useRouter()
const clipboardHistory = ref<ClipboardItem[]>([])
const loading = ref(true)
const showCopySuccess = ref(false)
const searchText = ref('')

const goBack = () => {
  router.back()
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

// 修改过滤后的剪切板历史计算属性
const filteredClipboardHistory = computed(() => {
  if (!searchText.value) {
    return clipboardHistory.value
  }
  return clipboardHistory.value.filter((item) => {
    if (item.type === 'text') {
      return item.content.toLowerCase().includes(searchText.value.toLowerCase())
    }
  })
})

// 添加过滤函数（可选，用于性能优化）
const filterClipboardHistory = () => {
  // 这里可以添加防抖逻辑，如果需要的话
  console.log('Filtering clipboard history with:', searchText.value)
}

const copyToClipboard = async (item: ClipboardItem) => {
  try {
    if (item.type === 'text') {
      await window.electronAPI.writeTextToClipboard(item.content)
    } else if (item.type === 'image') {
      await window.electronAPI.writeImageToClipboard(item.content)
    }
    showCopySuccess.value = true
    setTimeout(() => {
      showCopySuccess.value = false
    }, 2000) // 2秒后隐藏提示
    console.log('内容已复制到剪贴板')
  } catch (error) {
    console.error('复制到剪贴板失败:', error)
  }
}

const deleteItem = async (id: number) => {
  try {
    await window.electronAPI.deleteClipboardItem(id)
    clipboardHistory.value = clipboardHistory.value.filter((item) => item.id !== id)
    console.log('剪贴板项目已删除')
  } catch (error) {
    console.error('删除剪贴板项目失败:', error)
  }
}

// 添加清除搜索的函数
const clearSearch = () => {
  searchText.value = ''
  filterClipboardHistory()
}


const openUrl = async (url: string) => {
  try {
    await window.electronAPI.openClipboardUrl(url)
  } catch (error) {
    console.error('打开URL失败:', error)
  }
}
const imagePreviewModal = ref(false)
const imagePreviewSrc = ref('')
const showImagePreview = (imagePath: string) => {
  imagePreviewSrc.value = imagePath
  imagePreviewModal.value = true
}
const previewImage = async (imagePath: string) => {
  try {
    console.log('预览图片:', imagePath)
    showImagePreview(imagePath)
  } catch (error) {
    console.error('预览图片失败:', error)
  }
}


const isUrl = (str: string) => {
  // 去除首尾空格
  const trimmedStr = str.trim();
  
  // 检查去除空格后的字符串是否为空
  if (!trimmedStr) {
    return false;
  }

  try {
    const url = new URL(trimmedStr);
    return url.protocol === 'http:' || url.protocol === 'https:';
  } catch (_) {
    return false;
  }
}

const clickItem = (item: ClipboardItem) => {
  if (item.type === 'text') {
    if (isUrl(item.content)) {
      openUrl(item.content)
    } else {
      copyToClipboard(item)
    }
  } else if (item.type === 'image') {
    previewImage(item.content)
  }
}
</script>

<style scoped>
.navigation-bar-title {
  display: flex;
  align-items: center;
}
.navigation-bar {
  justify-content: space-between;
  display: flex;
  align-items: center;
  padding: 10px 20px;
  background-color: #f8f9fa;
  border-bottom: 1px solid #e9ecef;
}

.back-button {
  padding: 8px 16px;
  background-color: #3498db;
  color: #ffffff;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.3s ease;
}

.back-button:hover {
  background-color: #2980b9;
}

.detail-title {
  margin-left: 20px;
  font-size: 1.2em;
  color: #2c3e50;
}

.clipboard-manager {
  display: flex;
  flex-direction: column;
  height: 100vh;
}

.clipboard-content {
  flex-grow: 1;
  overflow-y: auto;
  padding: 20px;
}

.clipboard-list {
  list-style-type: none;
  padding: 0;
  margin: 0;
}

.clipboard-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 4px;
  cursor: pointer;
}

.item-content {
  flex: 1;
  overflow: hidden;
  margin-right: 10px;
}

.text-content {
  display: block;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
}

.text-content a {
  color: blue;
  text-decoration: underline;
}

.image-content {
  max-width: 100%;
  max-height: 100px;
  object-fit: cover;
  display: block;
}

.item-actions {
  width: 120px;
  display: flex;
  gap: 5px;
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
}

.footer {
  padding: 10px 20px;
  background-color: #f0f0f0;
  border-top: 1px solid #ddd;
  text-align: center;
}

.refresh-button,
.clear-button,
.action-button {
  padding: 8px 16px;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.3s ease;
}

.refresh-button,
.clear-button {
  background-color: #4caf50;
}

.refresh-button:hover,
.clear-button:hover {
  background-color: #45a049;
}

.action-button {
  padding: 4px 8px;
  font-size: 0.9em;
}

.copy-button {
  background-color: #3498db;
}

.copy-button:hover {
  background-color: #2980b9;
}

.delete-button {
  background-color: #e74c3c;
}

.delete-button:hover {
  background-color: #c0392b;
}

.copy-success-toast {
  position: fixed;
  bottom: 20px;
  left: 50%;
  transform: translateX(-50%);
  background-color: rgba(0, 0, 0, 0.7);
  color: white;
  padding: 10px 20px;
  border-radius: 4px;
  z-index: 1000;
}

/* 添加搜索栏样式 */
.search-bar {
  padding: 10px 20px;
  background-color: #f8f9fa;
  border-bottom: 1px solid #e9ecef;
}

.search-input-container {
  position: relative;
  display: flex;
  align-items: center;
}

.search-input {
  width: 100%;
  padding: 8px 30px 8px 8px;
  border: 1px solid #ced4da;
  border-radius: 4px;
  font-size: 1em;
}

.clear-search-button {
  position: absolute;
  right: 8px;
  background: none;
  border: none;
  font-size: 1.2em;
  color: #6c757d;
  cursor: pointer;
}

.clear-search-button:hover {
  color: #495057;
}


/* 添加图片预览弹窗样式 */
.modal {
  display: flex;
  justify-content: center;
  align-items: center;
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.7);
  z-index: 1000;
}

.modal-content {
  position: relative;
  background-color: #fff;
  padding: 20px;
  border-radius: 4px;
  max-width: 90%;
  max-height: 90%;
  overflow: auto;
}

.modal-content img {
  max-width: 100%;
  max-height: 100%;
}

.close {
  position: absolute;
  top: 10px;
  right: 10px;
  font-size: 1.5em;
  cursor: pointer;
}
</style>
