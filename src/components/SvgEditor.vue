<template>
  <div class="svg-editor">
    <NavigationBar title="SVG 预览与编辑" @goBack="goBack" />
    <div class="editor-content">
      <div class="input-section">
        <label for="svg-input" class="file-input-label">
          <input id="svg-input" type="file" @change="loadSvg" accept=".svg" class="file-input" />
          <span>选择 SVG 文件</span>
        </label>
        <label for="image-input" class="file-input-label">
          <input
            id="image-input"
            type="file"
            @change="embedImage"
            accept="image/png,image/jpeg"
            class="file-input"
          />
          <span>嵌入图片到 SVG</span>
        </label>
        <button @click="saveSvg" class="action-button" :disabled="!svgContent">保存 SVG</button>
        <button @click="savePng" class="action-button" :disabled="!svgContent">保存为 PNG</button>
        <button @click="beautifySvg" class="action-button" :disabled="!svgContent">美化 SVG</button>
      </div>
      <div class="preview-section">
        <div class="svg-code">
          <textarea
            v-model="svgContent"
            @input="updatePreview"
            placeholder="在此编辑 SVG 代码"
          ></textarea>
        </div>
        <div class="svg-preview-container">
          <div class="svg-preview-controls">
            <button @click="zoomIn" class="zoom-button">放大</button>
            <button @click="zoomOut" class="zoom-button">缩小</button>
            <button @click="resetZoom" class="zoom-button">重置缩放</button>
            <span>缩放: {{ (zoomFactor * 100).toFixed(0) }}%</span>
          </div>
          <div class="svg-preview" ref="previewContainer">
            <div
              v-html="svgContent"
              :style="{ transform: `scale(${zoomFactor}) translate(${panX}px, ${panY}px)` }"
              @mousedown="startPan"
              @mousemove="pan"
              @mouseup="endPan"
              @mouseleave="endPan"
            ></div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch, nextTick } from 'vue'
import { useRouter } from 'vue-router'
import NavigationBar from './NavigationBar.vue'

const router = useRouter()
const svgContent = ref('')
const previewContainer = ref<HTMLElement | null>(null)
const zoomFactor = ref(1)
const panX = ref(0)
const panY = ref(0)
const isPanning = ref(false)
const lastPanPoint = ref({ x: 0, y: 0 })

const goBack = () => {
  router.back()
}

const loadSvg = (event: Event) => {
  const file = (event.target as HTMLInputElement).files?.[0]
  if (file) {
    const reader = new FileReader()
    reader.onload = (e) => {
      svgContent.value = e.target?.result as string
      nextTick(() => {
        centerSvg()
      })
    }
    reader.readAsText(file)
  }
}

const updatePreview = () => {
  nextTick(() => {
    centerSvg()
  })
}

const centerSvg = () => {
  if (previewContainer.value) {
    const svgElement = previewContainer.value.querySelector('svg')
    if (svgElement) {
      const containerRect = previewContainer.value.getBoundingClientRect()
      const svgRect = svgElement.getBoundingClientRect()

      const scaleX = containerRect.width / svgRect.width
      const scaleY = containerRect.height / svgRect.height
      const scale = Math.min(scaleX, scaleY, 1) // 不要放大，只缩小

      zoomFactor.value = scale
      panX.value = (containerRect.width / scale - svgRect.width) / 2
      panY.value = (containerRect.height / scale - svgRect.height) / 2

      svgElement.style.width = '100%'
      svgElement.style.height = '100%'
    }
  }
}

const saveSvg = () => {
  const blob = new Blob([svgContent.value], { type: 'image/svg+xml' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = 'edited-svg.svg'
  link.click()
  URL.revokeObjectURL(url)
}

const savePng = () => {
  const svgElement = previewContainer.value?.querySelector('svg')
  if (svgElement) {
    const svgData = new XMLSerializer().serializeToString(svgElement)
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')
    const img = new Image()
    img.onload = () => {
      canvas.width = img.width
      canvas.height = img.height
      ctx?.drawImage(img, 0, 0)
      const pngUrl = canvas.toDataURL('image/png')
      const link = document.createElement('a')
      link.href = pngUrl
      link.download = 'svg-as-png.png'
      link.click()
    }
    img.src = 'data:image/svg+xml;base64,' + btoa(svgData)
  }
}

const startPan = (e: MouseEvent) => {
  isPanning.value = true
  lastPanPoint.value = { x: e.clientX, y: e.clientY }
}

const pan = (e: MouseEvent) => {
  if (isPanning.value) {
    const dx = e.clientX - lastPanPoint.value.x
    const dy = e.clientY - lastPanPoint.value.y
    panX.value += dx / zoomFactor.value
    panY.value += dy / zoomFactor.value
    lastPanPoint.value = { x: e.clientX, y: e.clientY }
  }
}

const endPan = () => {
  isPanning.value = false
}

const zoomIn = () => {
  zoomFactor.value = Math.min(zoomFactor.value + 0.1, 10)
}

const zoomOut = () => {
  zoomFactor.value = Math.max(zoomFactor.value - 0.1, 0.1)
}

const resetZoom = () => {
  zoomFactor.value = 1
  panX.value = 0
  panY.value = 0
  nextTick(() => {
    centerSvg()
  })
}

const embedImage = (event: Event) => {
  const file = (event.target as HTMLInputElement).files?.[0]
  if (file) {
    const reader = new FileReader()
    reader.onload = (e) => {
      const imageData = e.target?.result as string
      const svgTemplate = `
<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="100%" height="100%" viewBox="0 0 100 100">
  <image width="100" height="100" xlink:href="${imageData}"/>
</svg>
        `.trim()
      svgContent.value = svgTemplate
    }
    reader.readAsDataURL(file)
  }
}

const beautifySvg = () => {
  if (svgContent.value) {
    const parser = new DOMParser()
    const xmlDoc = parser.parseFromString(svgContent.value, 'text/xml')
    const serializer = new XMLSerializer()
    const beautifiedSvg = serializer.serializeToString(xmlDoc)
    svgContent.value = beautifiedSvg.replace(/></g, '>\n<').replace(/\s+$/gm, '')
  }
}

onMounted(() => {
  centerSvg()
})

watch(svgContent, () => {
  nextTick(() => {
    centerSvg()
  })
})
</script>

<style scoped>
.svg-editor {
  display: flex;
  flex-direction: column;
  height: 100vh;
  background-color: #f5f5f5;
}

.editor-content {
  display: flex;
  flex-direction: column;
  padding: 20px;
  flex-grow: 1;
  overflow: hidden;
}

.editor-content {
  display: flex;
  flex-direction: column;
  padding: 20px;
  flex-grow: 1;
  overflow: hidden;
}

.input-section {
  display: flex;
  justify-content: flex-start;
  gap: 10px;
  margin-bottom: 20px;
}

.file-input-label,
.action-button,
.zoom-button {
  background-color: #4a90e2;
  color: white;
  padding: 10px 15px;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.3s;
  border: none;
  font-size: 14px;
}

.file-input-label:hover,
.action-button:hover,
.zoom-button:hover {
  background-color: #357abd;
}

.file-input {
  display: none;
}

.action-button:disabled {
  background-color: #cccccc;
  cursor: not-allowed;
}

.preview-section {
  display: flex;
  flex-grow: 1;
  gap: 20px;
  overflow: hidden;
}

.svg-code,
.svg-preview-container {
  flex: 1;
  background-color: white;
  border: 1px solid #ddd;
  border-radius: 4px;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.svg-code textarea {
  flex-grow: 1;
  border: none;
  resize: none;
  font-family: monospace;
  padding: 15px;
}

.svg-preview-controls {
  display: flex;
  justify-content: flex-start;
  align-items: center;
  padding: 10px;
  gap: 10px;
  background-color: #f0f0f0;
}

.svg-preview {
  flex-grow: 1;
  overflow: hidden;
  position: relative;
  cursor: move;
}

.svg-preview > div {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}
</style>
