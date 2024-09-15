<template>
  <div class="screenshot-tool">
    <NavigationBar title="截图工具" @goBack="goBack" />
    <div class="content">
      <button @click="takeScreenshot">开始截图</button>
      <div v-if="screenshotDataURL" class="screenshot-preview">
        <img :src="screenshotDataURL" alt="Screenshot" />
      </div>
      <canvas ref="canvasRef" style="display: none"></canvas>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import NavigationBar from './NavigationBar.vue'

const router = useRouter()
const screenshotDataURL = ref('')
const canvasRef = ref<HTMLCanvasElement | null>(null)

const goBack = () => {
  router.push({ name: 'ImageTools' })
}

const takeScreenshot = () => {
  window.electronAPI.takeScreenshot()
}

const applyScreenshot = (base64Data: string) => {
  const canvas = canvasRef.value
  if (!canvas) return

  const ctx = canvas.getContext('2d')
  if (!ctx) return

  const img = new Image()
  img.onload = () => {
    canvas.width = img.width
    canvas.height = img.height
    ctx.drawImage(img, 0, 0)
    screenshotDataURL.value = canvas.toDataURL('image/png')
  }
  img.src = base64Data
}

onMounted(() => {
  window.electronAPI.onScreenshotCaptured((dataURL: string) => {
    applyScreenshot(dataURL)
  })
})
</script>

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
  overflow: auto;
}

.screenshot-preview img {
  max-width: 100%;
  height: auto;
}
</style>
