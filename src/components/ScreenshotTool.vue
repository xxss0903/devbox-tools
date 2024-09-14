<script setup lang="ts">
import { ref, onMounted } from 'vue'
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

const canvasRef = ref<HTMLCanvasElement | null>(null)
const ctx = ref<CanvasRenderingContext2D | null>(null)
const currentTool = ref('pen')
const isDrawing = ref(false)
let lastX = 0
let lastY = 0

onMounted(() => {
  if (canvasRef.value) {
    ctx.value = canvasRef.value.getContext('2d')
  }
})

const startDrawing = (e: MouseEvent) => {
  isDrawing.value = true
  ;[lastX, lastY] = [e.offsetX, e.offsetY]
}

const draw = (e: MouseEvent) => {
  if (!isDrawing.value || !ctx.value) return
  ctx.value.beginPath()
  ctx.value.moveTo(lastX, lastY)
  ctx.value.lineTo(e.offsetX, e.offsetY)
  ctx.value.stroke()
  ;[lastX, lastY] = [e.offsetX, e.offsetY]
}

const stopDrawing = () => {
  isDrawing.value = false
}

const setTool = (tool: string) => {
  currentTool.value = tool
  if (ctx.value) {
    switch (tool) {
      case 'pen':
        ctx.value.strokeStyle = 'black'
        ctx.value.lineWidth = 2
        break
      case 'arrow':
      case 'line':
        ctx.value.strokeStyle = 'red'
        ctx.value.lineWidth = 3
        break
    }
  }
}
</script>

<template>
  <div class="screenshot-tool">
    <NavigationBar title="屏幕截图" @goBack="goBack" />
    <div class="content">
      <button @click="takeScreenshot">截取屏幕</button>
      <div v-if="screenshotPath" class="screenshot-preview">
        <canvas
          ref="canvasRef"
          :width="800"
          :height="600"
          @mousedown="startDrawing"
          @mousemove="draw"
          @mouseup="stopDrawing"
          @mouseout="stopDrawing"
        ></canvas>
        <div class="tools">
          <button @click="setTool('pen')">画笔</button>
          <button @click="setTool('arrow')">箭头</button>
          <button @click="setTool('line')">横线</button>
          <button>裁剪</button>
        </div>
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

.tools {
  margin-top: 10px;
  display: flex;
  gap: 10px;
}

canvas {
  border: 1px solid #ccc;
}
</style>
