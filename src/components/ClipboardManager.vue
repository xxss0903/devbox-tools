<template>
  <div class="clipboard-manager">
    <NavigationBar title="剪贴板历史" @goBack="goBack" />
    <div class="clipboard-content">
      <div v-if="clipboardHistory.length === 0" class="empty-state">
        <p>剪贴板历史为空</p>
        <p>复制或截图内容后将显示在这里</p>
      </div>
      <div v-else class="clipboard-list">
        <ul>
          <li v-for="(item, index) in clipboardHistory" :key="index">
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
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import NavigationBar from './NavigationBar.vue'

interface ClipboardItem {
  type: 'text' | 'image'
  content: string
}

const router = useRouter()
const clipboardHistory = ref<ClipboardItem[]>([])
const lastAddedContent = ref('')

const goBack = () => {
  router.push({ name: 'Home' }) // 或者您希望返回的路由
}

onMounted(() => {
  window.electronAPI.onClipboardUpdate((content: string) => {
    if (content !== lastAddedContent.value) {
      clipboardHistory.value.unshift({ type: 'text', content })
      lastAddedContent.value = content
    }
  })

  window.electronAPI.onClipboardImageUpdate((dataUrl: string) => {
    if (dataUrl !== lastAddedContent.value) {
      clipboardHistory.value.unshift({ type: 'image', content: dataUrl })
      lastAddedContent.value = dataUrl
    }
  })
})

// 监听剪贴板历史变化，限制最大数量
watch(
  clipboardHistory,
  (newHistory) => {
    if (newHistory.length > 50) {
      // 假设我们想保留最近的50条记录
      clipboardHistory.value = newHistory.slice(0, 50)
    }
  },
  { deep: true }
)
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
