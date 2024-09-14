<template>
  <div class="screenshot-tool">
    <NavigationBar title="屏幕截图" @goBack="goBack" />
    <div class="content">
      <button @click="takeScreenshot">截取屏幕</button>
      <div class="screenshot-preview">
        <canvas
          ref="canvasRef"
          @mousedown.prevent="handleMouseDown"
          @mousemove.prevent="handleMouseMove"
          @mouseup.prevent="handleMouseUp"
          @mouseout.prevent="handleMouseOut"
        ></canvas>
        <canvas ref="tempCanvasRef" class="temp-canvas"></canvas>
        <canvas ref="cropCanvasRef" class="crop-canvas"></canvas>
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
const tempCanvasRef = ref<HTMLCanvasElement | null>(null)
const tempCtx = ref<CanvasRenderingContext2D | null>(null)
const cropCanvasRef = ref<HTMLCanvasElement | null>(null)
const cropCtx = ref<CanvasRenderingContext2D | null>(null)
const currentTool = ref('pen')
const isDrawing = ref(false)
let startX = 0
let startY = 0
let endX = 0
let endY = 0
const screenshotTaken = ref(false)

const cropStart = ref({ x: 0, y: 0 })
const cropEnd = ref({ x: 0, y: 0 })
const isCropping = ref(false)

const isDrawingArrow = ref(false)

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
    if (ctx.value) {
      ctx.value.strokeStyle = 'red'
      ctx.value.lineWidth = 3
    }
  }
  if (tempCanvasRef.value) {
    tempCtx.value = tempCanvasRef.value.getContext('2d')
    if (tempCtx.value) {
      tempCtx.value.strokeStyle = 'red'
      tempCtx.value.lineWidth = 3
    }
  }
  if (cropCanvasRef.value) {
    cropCtx.value = cropCanvasRef.value.getContext('2d')
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

      // 设置临时 canvas 和裁剪 canvas 的大小
      if (tempCanvasRef.value) {
        tempCanvasRef.value.width = width
        tempCanvasRef.value.height = height
      }
      if (cropCanvasRef.value) {
        cropCanvasRef.value.width = width
        cropCanvasRef.value.height = height
      }
    }
    img.src = dataUrl
  }
}

const handleMouseDown = (e: MouseEvent) => {
  console.log('Mouse down', e.offsetX, e.offsetY)
  if (currentTool.value === 'crop') {
    startCropping(e)
  } else {
    startDrawing(e)
  }
}

const handleMouseMove = (e: MouseEvent) => {
  console.log('Mouse move', e.offsetX, e.offsetY)
  if (currentTool.value === 'crop') {
    updateCrop(e)
  } else {
    draw(e)
  }
}

const handleMouseUp = (e: MouseEvent) => {
  console.log('Mouse up', e.offsetX, e.offsetY)
  if (currentTool.value === 'crop') {
    finishCropping()
  } else {
    stopDrawing()
  }
}

const handleMouseOut = (e: MouseEvent) => {
  console.log('Mouse out', e.offsetX, e.offsetY)
  if (currentTool.value === 'crop') {
    finishCropping()
  } else {
    stopDrawing()
  }
}

const startDrawing = (e: MouseEvent) => {
  console.log('Start drawing')
  if (!ctx.value) return
  isDrawing.value = true
  ;[startX, startY] = [e.offsetX, e.offsetY]
  if (currentTool.value === 'pen') {
    ctx.value.beginPath()
    ctx.value.moveTo(startX, startY)
  } else if (currentTool.value === 'arrow' || currentTool.value === 'line') {
    isDrawingArrow.value = true
  }
}

const draw = (e: MouseEvent) => {
  console.log('Drawing')
  if (!isDrawing.value || !tempCtx.value || !tempCanvasRef.value) return
  ;[endX, endY] = [e.offsetX, e.offsetY]

  if (currentTool.value === 'pen') {
    tempCtx.value.lineTo(endX, endY)
    tempCtx.value.stroke()
  } else if (
    isDrawingArrow.value &&
    (currentTool.value === 'arrow' || currentTool.value === 'line')
  ) {
    // 清除临时 canvas
    tempCtx.value.clearRect(0, 0, tempCanvasRef.value.width, tempCanvasRef.value.height)

    if (currentTool.value === 'arrow') {
      drawArrow(tempCtx.value, startX, startY, endX, endY)
    } else {
      tempCtx.value.beginPath()
      tempCtx.value.moveTo(startX, startY)
      tempCtx.value.lineTo(endX, endY)
      tempCtx.value.stroke()
    }
  }
}

const stopDrawing = () => {
  if (!isDrawing.value || !ctx.value || !tempCtx.value || !canvasRef.value || !tempCanvasRef.value)
    return
  isDrawing.value = false
  isDrawingArrow.value = false

  // 将临时 canvas 的内容绘制到主 canvas 上
  ctx.value.drawImage(tempCanvasRef.value, 0, 0)

  // 清除临时 canvas
  tempCtx.value.clearRect(0, 0, tempCanvasRef.value.width, tempCanvasRef.value.height)
}

const drawArrow = (
  ctx: CanvasRenderingContext2D,
  fromX: number,
  fromY: number,
  toX: number,
  toY: number
) => {
  const headLength = 15 // 增加箭头头部长度
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

const startCropping = (e: MouseEvent) => {
  if (currentTool.value === 'crop' && cropCtx.value && cropCanvasRef.value) {
    isCropping.value = true
    cropStart.value = { x: e.offsetX, y: e.offsetY }
    cropEnd.value = { x: e.offsetX, y: e.offsetY }

    // 清除裁剪 canvas 并绘制原始图像
    cropCtx.value.clearRect(0, 0, cropCanvasRef.value.width, cropCanvasRef.value.height)
    cropCtx.value.drawImage(canvasRef.value!, 0, 0)
  }
}

const updateCrop = (e: MouseEvent) => {
  if (isCropping.value && cropCtx.value && cropCanvasRef.value) {
    cropEnd.value = { x: e.offsetX, y: e.offsetY }
    drawCropOverlay()
  }
}

const drawCropOverlay = () => {
  if (!cropCtx.value || !cropCanvasRef.value) return

  const canvas = cropCanvasRef.value
  cropCtx.value.clearRect(0, 0, canvas.width, canvas.height)
  cropCtx.value.drawImage(canvasRef.value!, 0, 0)

  cropCtx.value.fillStyle = 'rgba(0, 0, 0, 0.5)'
  cropCtx.value.fillRect(0, 0, canvas.width, canvas.height)

  const x = Math.min(cropStart.value.x, cropEnd.value.x)
  const y = Math.min(cropStart.value.y, cropEnd.value.y)
  const width = Math.abs(cropEnd.value.x - cropStart.value.x)
  const height = Math.abs(cropEnd.value.y - cropStart.value.y)

  cropCtx.value.clearRect(x, y, width, height)
  cropCtx.value.strokeStyle = 'white'
  cropCtx.value.strokeRect(x, y, width, height)
}

const finishCropping = () => {
  if (isCropping.value) {
    isCropping.value = false
    applyCrop()
  }
}

const applyCrop = () => {
  if (!ctx.value || !canvasRef.value || !cropCanvasRef.value) return

  const x = Math.min(cropStart.value.x, cropEnd.value.x)
  const y = Math.min(cropStart.value.y, cropEnd.value.y)
  const width = Math.abs(cropEnd.value.x - cropStart.value.x)
  const height = Math.abs(cropEnd.value.y - cropStart.value.y)

  const imageData = ctx.value.getImageData(x, y, width, height)

  canvasRef.value.width = width
  canvasRef.value.height = height
  ctx.value.putImageData(imageData, 0, 0)

  // 更新临时 canvas 和裁剪 canvas 的大小
  if (tempCanvasRef.value) {
    tempCanvasRef.value.width = width
    tempCanvasRef.value.height = height
  }
  if (cropCanvasRef.value) {
    cropCanvasRef.value.width = width
    cropCanvasRef.value.height = height
  }

  screenshotPath.value = canvasRef.value.toDataURL()
}

const setTool = (tool: string) => {
  console.log('set tool', tool)
  currentTool.value = tool
  if (ctx.value && tempCtx.value) {
    ctx.value.strokeStyle = 'red' // 所有工具都使用红色
    tempCtx.value.strokeStyle = 'red' // 临时 canvas 也使用红色
    switch (tool) {
      case 'pen':
        ctx.value.lineWidth = 3 // 将画笔宽度增加到 3
        tempCtx.value.lineWidth = 3
        break
      case 'arrow':
      case 'line':
        ctx.value.lineWidth = 4 // 将箭头和线条宽度增加到 4
        tempCtx.value.lineWidth = 4
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
  position: relative;
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

.temp-canvas {
  position: absolute;
  top: 0;
  left: 0;
  pointer-events: none;
}

.crop-canvas {
  position: absolute;
  top: 0;
  left: 0;
  pointer-events: none;
}
</style>
