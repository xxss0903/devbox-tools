<template>
  <div class="screenshot-tool">
    <NavigationBar title="屏幕截图" @goBack="goBack" />
    <div class="content">
      <button @click="takeScreenshot">截取屏幕</button>
      <div class="screenshot-preview">
        <canvas
          ref="canvasRef"
          @mousedown="currentTool === 'crop' ? startCropping : startDrawing"
          @mousemove="currentTool === 'crop' ? updateCrop : draw"
          @mouseup="currentTool === 'crop' ? finishCropping : stopDrawing"
          @mouseout="currentTool === 'crop' ? finishCropping : stopDrawing"
          @click="handleCanvasClick"
        ></canvas>
      </div>
      <div v-if="screenshotTaken" class="tools">
        <button @click="setTool('pen')">画笔</button>
        <button @click="setTool('arrow')">箭头</button>
        <button @click="setTool('line')">横线</button>
        <button @click="setTool('crop')">裁剪</button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, nextTick, watch, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import NavigationBar from './NavigationBar.vue'

// 定义 electronAPI 的接口
interface IElectronAPI {
  takeScreenshot: () => Promise<string>
  registerScreenshotShortcut: (callback: () => void) => void
  unregisterScreenshotShortcut: () => void
}

// 扩展全局 Window 接口
declare global {
  interface Window {
    electronAPI: IElectronAPI
  }
}

const router = useRouter()

const goBack = () => {
  router.push({ name: 'ImageTools' })
}

const screenshotPath = ref('')
const canvasRef = ref<HTMLCanvasElement | null>(null)
const ctx = ref<CanvasRenderingContext2D | null>(null)
const currentTool = ref('pen')
const isDrawing = ref(false)
let startX = 0
let startY = 0
let endX = 0
let endY = 0
const screenshotTaken = ref(false)
const clickCount = ref(0)

const cropStart = ref({ x: 0, y: 0 })
const cropEnd = ref({ x: 0, y: 0 })
const isCropping = ref(false)

const takeScreenshot = async () => {
  try {
    console.log('takeScreenshot called in renderer process')
    const dataUrl = await window.electronAPI.takeScreenshot()
    console.log('Screenshot taken:', dataUrl.substring(0, 50) + '...')
    screenshotPath.value = dataUrl
    screenshotTaken.value = true
    await nextTick()
    initCanvas()
    drawImageOnCanvas(dataUrl)
  } catch (error) {
    console.error('截图失败:', error)
  }
}

const initCanvas = () => {
  if (canvasRef.value) {
    ctx.value = canvasRef.value.getContext('2d')
  }
}

const drawImageOnCanvas = (dataUrl: string) => {
  if (canvasRef.value && ctx.value) {
    const img = new Image()
    img.onload = () => {
      const canvas = canvasRef.value!
      const maxWidth = 800
      const maxHeight = 500
      let width = img.width
      let height = img.height

      if (width > maxWidth || height > maxHeight) {
        const ratio = Math.min(maxWidth / width, maxHeight / height)
        width *= ratio
        height *= ratio
      }

      canvas.width = width
      canvas.height = height
      ctx.value!.drawImage(img, 0, 0, width, height)
    }
    img.src = dataUrl
  }
}

const startDrawing = (e: MouseEvent) => {
  if (!ctx.value) return
  isDrawing.value = true
  ;[startX, startY] = [e.offsetX, e.offsetY]
  if (currentTool.value === 'pen') {
    ctx.value.beginPath()
    ctx.value.moveTo(startX, startY)
  }
}

const draw = (e: MouseEvent) => {
  if (!isDrawing.value || !ctx.value) return
  ;[endX, endY] = [e.offsetX, e.offsetY]

  if (currentTool.value === 'pen') {
    ctx.value.lineTo(endX, endY)
    ctx.value.stroke()
  }
}

const stopDrawing = () => {
  if (!isDrawing.value || !ctx.value) return
  isDrawing.value = false

  if (currentTool.value === 'arrow') {
    drawArrow(ctx.value, startX, startY, endX, endY)
  } else if (currentTool.value === 'line') {
    ctx.value.beginPath()
    ctx.value.moveTo(startX, startY)
    ctx.value.lineTo(endX, endY)
    ctx.value.stroke()
  }
}

const drawArrow = (
  ctx: CanvasRenderingContext2D,
  fromX: number,
  fromY: number,
  toX: number,
  toY: number
) => {
  const headLength = 10
  const angle = Math.atan2(toY - fromY, toX - fromX)

  ctx.beginPath()
  ctx.moveTo(fromX, fromY)
  ctx.lineTo(toX, toY)
  ctx.lineTo(
    toX - headLength * Math.cos(angle - Math.PI / 6),
    toY - headLength * Math.sin(angle - Math.PI / 6)
  )
  ctx.moveTo(toX, toY)
  ctx.lineTo(
    toX - headLength * Math.cos(angle + Math.PI / 6),
    toY - headLength * Math.sin(angle + Math.PI / 6)
  )
  ctx.stroke()
}

const handleCanvasClick = (e: MouseEvent) => {
  if (!ctx.value) return
  clickCount.value++

  if (clickCount.value === 1) {
    ;[startX, startY] = [e.offsetX, e.offsetY]
  } else if (clickCount.value === 2) {
    ;[endX, endY] = [e.offsetX, e.offsetY]

    if (currentTool.value === 'arrow') {
      drawArrow(ctx.value, startX, startY, endX, endY)
    } else if (currentTool.value === 'line') {
      ctx.value.beginPath()
      ctx.value.moveTo(startX, startY)
      ctx.value.lineTo(endX, endY)
      ctx.value.stroke()
    }

    clickCount.value = 0
  }
}

const startCropping = (e: MouseEvent) => {
  if (currentTool.value === 'crop') {
    isCropping.value = true
    cropStart.value = { x: e.offsetX, y: e.offsetY }
    cropEnd.value = { x: e.offsetX, y: e.offsetY }
  }
}

const updateCrop = (e: MouseEvent) => {
  if (isCropping.value) {
    cropEnd.value = { x: e.offsetX, y: e.offsetY }
    drawCropOverlay()
  }
}

const finishCropping = () => {
  if (isCropping.value) {
    isCropping.value = false
    applyCrop()
  }
}

const drawCropOverlay = () => {
  if (!ctx.value || !canvasRef.value) return

  const canvas = canvasRef.value
  ctx.value.clearRect(0, 0, canvas.width, canvas.height)
  drawImageOnCanvas(screenshotPath.value)

  ctx.value.fillStyle = 'rgba(0, 0, 0, 0.5)'
  ctx.value.fillRect(0, 0, canvas.width, canvas.height)

  const x = Math.min(cropStart.value.x, cropEnd.value.x)
  const y = Math.min(cropStart.value.y, cropEnd.value.y)
  const width = Math.abs(cropEnd.value.x - cropStart.value.x)
  const height = Math.abs(cropEnd.value.y - cropStart.value.y)

  ctx.value.clearRect(x, y, width, height)
  ctx.value.strokeStyle = 'white'
  ctx.value.strokeRect(x, y, width, height)
}

const applyCrop = () => {
  if (!ctx.value || !canvasRef.value) return

  const x = Math.min(cropStart.value.x, cropEnd.value.x)
  const y = Math.min(cropStart.value.y, cropEnd.value.y)
  const width = Math.abs(cropEnd.value.x - cropStart.value.x)
  const height = Math.abs(cropEnd.value.y - cropStart.value.y)

  const imageData = ctx.value.getImageData(x, y, width, height)

  canvasRef.value.width = width
  canvasRef.value.height = height
  ctx.value.putImageData(imageData, 0, 0)

  screenshotPath.value = canvasRef.value.toDataURL()
}

const setTool = (tool: string) => {
  currentTool.value = tool
  clickCount.value = 0
  if (ctx.value) {
    ctx.value.strokeStyle = 'red' // 所有工具都使用红色
    switch (tool) {
      case 'pen':
        ctx.value.lineWidth = 2
        break
      case 'arrow':
      case 'line':
        ctx.value.lineWidth = 3
        break
      case 'crop':
        isCropping.value = false
        break
    }
  }
}

watch(screenshotTaken, (newValue) => {
  if (newValue) {
    nextTick(() => {
      initCanvas()
    })
  }
})

onMounted(() => {
  initCanvas()
  window.electronAPI.registerScreenshotShortcut(takeScreenshot)
})

onUnmounted(() => {
  window.electronAPI.unregisterScreenshotShortcut()
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
  justify-content: flex-start;
  padding: 20px;
  overflow-y: auto;
}

button {
  padding: 10px 20px;
  font-size: 16px;
  cursor: pointer;
}

.screenshot-preview {
  margin-top: 20px;
  max-width: 800px;
  max-height: 500px;
  overflow: auto;
}

.tools {
  margin-top: 20px;
  display: flex;
  gap: 10px;
}

canvas {
  border: 1px solid #ccc;
  max-width: 100%;
  height: auto;
}
</style>
