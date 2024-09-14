<template>
  <div class="screenshot-tool">
    <NavigationBar title="屏幕截图" @goBack="goBack" />
    <div class="content">
      <button @click="takeScreenshot">截取屏幕</button>
      <div class="screenshot-preview">
        <canvas
          ref="canvasRef"
          @mousedown="startDrawing"
          @mousemove="draw"
          @mouseup="stopDrawing"
          @mouseout="stopDrawing"
        ></canvas>
      </div>
      <div v-if="screenshotTaken" class="tools">
        <button @click="setTool('pen')">画笔</button>
        <button @click="setTool('arrow')">箭头</button>
        <button @click="setTool('line')">横线</button>
        <button>裁剪</button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, nextTick, watch } from 'vue'
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
    console.log('Screenshot taken:', dataUrl.substring(0, 50) + '...') // 添加日志，只显示 dataUrl 的开头部分
    screenshotPath.value = dataUrl
    screenshotTaken.value = true
    await nextTick() // 等待 DOM 更新
    initCanvas()
    drawImageOnCanvas(dataUrl)
  } catch (error) {
    console.error('截图失败:', error)
  }
}

const canvasRef = ref()
const ctx = ref()
const currentTool = ref('pen')
const isDrawing = ref(false)
let lastX = 0
let lastY = 0
const screenshotTaken = ref(false)

const initCanvas = () => {
  console.log('Initializing canvas')
  if (canvasRef.value) {
    console.log('Canvas element found')
    ctx.value = canvasRef.value.getContext('2d')
    if (ctx.value) {
      console.log('Canvas context set')
    } else {
      console.error('Unable to get canvas context')
    }
  } else {
    console.error('Canvas element not found')
  }
}

// 修改 drawImageOnCanvas 函数
const drawImageOnCanvas = (dataUrl: string) => {
  console.log('Drawing image on canvas:', dataUrl.substring(0, 50) + '...') // 添加日志
  if (canvasRef.value && ctx.value) {
    const img = new Image()
    img.onload = () => {
      console.log('Image loaded, dimensions:', img.width, 'x', img.height) // 添加日志
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
      console.log('Image drawn on canvas') // 添加日志
    }
    img.src = dataUrl
  } else {
    console.error('Canvas or context is null') // 添加错误日志
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
  console.log('Component mounted') // 添加日志
  if (canvasRef.value) {
    console.log('Canvas 元素已加载')
    ctx.value = canvasRef.value.getContext('2d')
    if (ctx.value) {
      console.log('Canvas 上下文已设置')
    } else {
      console.error('无法获取 Canvas 上下文')
    }
  } else {
    console.error('Canvas 元素未找到')
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
