<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import NavigationBar from './NavigationBar.vue'

const router = useRouter()

const goBack = () => {
  router.push({ name: 'ImageTools' })
}

const screenshotPath = ref('')

const takeScreenshot = async () => {
  try {
    const dataUrl = await window.electronAPI.takeScreenshot()
    screenshotPath.value = dataUrl
  } catch (error) {
    console.error('截图失败:', error)
  }
}
</script>

<template>
  <div class="screenshot-tool">
    <NavigationBar title="屏幕截图" @goBack="goBack" />
    <div class="content">
      <button @click="takeScreenshot">截取屏幕</button>
      <div v-if="screenshotPath" class="screenshot-preview">
        <img :src="screenshotPath" alt="Screenshot preview" />
      </div>
    </div>
  </div>
</template>

<style scoped>
.screenshot-tool {
  display: flex;
  flex-direction: column;
  height: 100vh;
}

.content {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 20px;
}

button {
  padding: 10px 20px;
  font-size: 16px;
  cursor: pointer;
}

.screenshot-preview {
  margin-top: 20px;
  max-width: 100%;
  max-height: 70vh;
  overflow: auto;
}

.screenshot-preview img {
  max-width: 100%;
  height: auto;
}
</style>