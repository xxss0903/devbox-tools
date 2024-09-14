<script setup lang="ts">
import { ref, computed, onMounted, nextTick } from 'vue'
import { useRouter } from 'vue-router'
import NavigationBar from './NavigationBar.vue'

const router = useRouter()
const selectedFiles = ref<{ name: string; size: number; data: string }[]>([])
const compressedFiles = ref<
  { name: string; originalSize: number; compressedSize: number; data: string }[]
>([])
const compressionQuality = ref(0.7)
const isCompressing = ref(false)
const isDragging = ref(false)
const dragCounter = ref(0)

const handleFileChange = (event: Event) => {
  const target = event.target as HTMLInputElement
  if (target.files) {
    addFiles(Array.from(target.files))
  }
}

const handleFolderSelect = async () => {
  try {
    const result = await window.electronAPI.selectFolder()
    if (result) {
      selectedFiles.value = result
    }
  } catch (err) {
    console.error('Error selecting folder:', err)
  }
}

const addFiles = async (files: File[]) => {
  const newFiles = await Promise.all(
    files.map(async (file) => {
      const arrayBuffer = await file.arrayBuffer()
      const base64 = btoa(String.fromCharCode(...new Uint8Array(arrayBuffer)))
      return {
        name: file.name,
        size: file.size,
        data: `data:${file.type};base64,${base64}`
      }
    })
  )
  selectedFiles.value = [...selectedFiles.value, ...newFiles]
}

const handleDragEnter = (event: DragEvent) => {
  event.preventDefault()
  event.stopPropagation()
  dragCounter.value++
  if (dragCounter.value === 1) {
    requestAnimationFrame(() => {
      isDragging.value = true
    })
  }
}

const handleDragLeave = (event: DragEvent) => {
  event.preventDefault()
  event.stopPropagation()
  dragCounter.value--
  if (dragCounter.value === 0) {
    requestAnimationFrame(() => {
      isDragging.value = false
    })
  }
}

const handleDrop = async (event: DragEvent) => {
  event.preventDefault()
  event.stopPropagation()
  dragCounter.value = 0
  requestAnimationFrame(() => {
    isDragging.value = false
  })

  if (event.dataTransfer?.files) {
    const files = Array.from(event.dataTransfer.files)
      .filter((file) => file.path) // 确保文件有路径
      .map((file) => file.path)

    console.log('Dropped files:', files)

    if (files.length > 0) {
      try {
        const processedFiles = await window.electronAPI.processDroppedFiles(files)
        console.log('Processed files:', processedFiles)
        nextTick(() => {
          selectedFiles.value = [...selectedFiles.value, ...processedFiles]
        })
      } catch (error) {
        console.error('Error processing dropped files:', error)
      }
    } else {
      console.log('No valid files dropped')
    }
  }
}

onMounted(() => {
  window.electronAPI.handleFileDrop(async (processedFiles: any) => {
    console.log('Received processed files:', processedFiles)
    nextTick(() => {
      selectedFiles.value = [...selectedFiles.value, ...processedFiles]
    })
  })
})

const compressImages = async () => {
  isCompressing.value = true
  compressedFiles.value = []

  for (const file of selectedFiles.value) {
    const compressedImage = await compressImage(file)
    compressedFiles.value.push({
      name: file.name,
      originalSize: file.size,
      compressedSize: compressedImage.size,
      data: compressedImage.data
    })
  }

  isCompressing.value = false
}

const compressImage = (file: {
  name: string
  size: number
  data: string
}): Promise<{ size: number; data: string }> => {
  return new Promise((resolve) => {
    const img = new Image()
    img.onload = () => {
      const canvas = document.createElement('canvas')
      const ctx = canvas.getContext('2d')
      canvas.width = img.width
      canvas.height = img.height

      ctx!.fillStyle = '#FFFFFF'
      ctx!.fillRect(0, 0, canvas.width, canvas.height)

      ctx!.drawImage(img, 0, 0, img.width, img.height)

      canvas.toBlob(
        (blob) => {
          if (blob) {
            const reader = new FileReader()
            reader.onloadend = () => {
              resolve({
                size: blob.size,
                data: reader.result as string
              })
            }
            reader.readAsDataURL(blob)
          }
        },
        'image/jpeg',
        compressionQuality.value
      )
    }
    img.src = file.data
  })
}

const downloadCompressedImages = () => {
  compressedFiles.value.forEach((file, index) => {
    const link = document.createElement('a')
    link.href = file.data
    link.download = `compressed_${file.name}`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  })
}

const goBack = () => {
  router.push({ name: 'ImageTools' })
}

const formatFileSize = (bytes: number): string => {
  const kb = bytes / 1024
  return `${kb.toFixed(2)} KB`
}

const totalCompressionRate = computed(() => {
  if (compressedFiles.value.length === 0) return 0
  const totalOriginal = compressedFiles.value.reduce((sum, file) => sum + file.originalSize, 0)
  const totalCompressed = compressedFiles.value.reduce((sum, file) => sum + file.compressedSize, 0)
  return ((1 - totalCompressed / totalOriginal) * 100).toFixed(2)
})
</script>

<template>
  <div class="image-compressor">
    <NavigationBar title="图片压缩工具" @goBack="goBack" />
    <div
      class="compressor-content"
      :class="{ dragging: isDragging }"
      @dragenter="handleDragEnter"
      @dragover="handleDragEnter"
      @dragleave="handleDragLeave"
      @drop="handleDrop"
    >
      <div class="control-panel">
        <div class="file-selection">
          <input
            type="file"
            id="file-input"
            accept="image/*"
            @change="handleFileChange"
            multiple
            class="hidden-input"
          />
          <label for="file-input" class="button">选择图片</label>
          <button @click="handleFolderSelect" class="button">选择文件夹</button>
        </div>
        <div class="compression-controls">
          <div class="quality-control">
            <label for="quality">压缩质量：</label>
            <input
              type="range"
              id="quality"
              v-model="compressionQuality"
              min="0.1"
              max="1"
              step="0.1"
            />
            <span>{{ Math.round(compressionQuality * 100) }}%</span>
          </div>
          <button
            @click="compressImages"
            :disabled="selectedFiles.length === 0 || isCompressing"
            class="button primary"
          >
            {{ isCompressing ? '压缩中...' : '压缩图片' }}
          </button>
          <button
            @click="downloadCompressedImages"
            :disabled="compressedFiles.length === 0"
            class="button"
          >
            下载压缩后的图片
          </button>
        </div>
      </div>

      <div v-if="isDragging" class="drag-overlay">
        <p>释放鼠标以添加图片</p>
      </div>

      <div v-if="selectedFiles.length > 0" class="file-list">
        <h3>选中的文件：</h3>
        <ul>
          <li v-for="file in selectedFiles" :key="file.name">
            {{ file.name }} ({{ formatFileSize(file.size) }})
          </li>
        </ul>
      </div>
      <div v-if="compressedFiles.length > 0" class="compression-results">
        <h3>压缩结果：</h3>
        <p>总压缩率: {{ totalCompressionRate }}%</p>
        <ul>
          <li v-for="file in compressedFiles" :key="file.name">
            {{ file.name }}: 原始大小 {{ formatFileSize(file.originalSize) }} -> 压缩后
            {{ formatFileSize(file.compressedSize) }} (压缩率:
            {{ ((1 - file.compressedSize / file.originalSize) * 100).toFixed(2) }}%)
          </li>
        </ul>
      </div>
    </div>
  </div>
</template>

<style scoped>
.image-compressor {
  display: flex;
  flex-direction: column;
  height: 100%;
  overflow: hidden;
}

.compressor-content {
  flex: 1;
  overflow-y: auto;
  padding: 20px;
  position: relative;
  transition: all 0.3s ease;
}

.control-panel {
  background-color: #f0f0f0;
  padding: 15px;
  border-radius: 8px;
  margin-bottom: 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.file-selection {
  display: flex;
  gap: 10px;
}

.compression-controls {
  display: flex;
  align-items: center;
  gap: 15px;
}

.quality-control {
  display: flex;
  align-items: center;
  gap: 10px;
}

.hidden-input {
  display: none;
}

.button {
  padding: 8px 16px;
  background-color: #3498db;
  color: #ffffff;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.3s ease;
  font-size: 14px;
}

.button:hover {
  background-color: #2980b9;
}

.button:disabled {
  background-color: #cccccc;
  cursor: not-allowed;
}

.button.primary {
  background-color: #2ecc71;
}

.button.primary:hover {
  background-color: #27ae60;
}

input[type='range'] {
  width: 150px;
}

.file-list,
.compression-results {
  margin-top: 20px;
}

ul {
  list-style-type: none;
  padding: 0;
}

li {
  margin-bottom: 5px;
}

.drag-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(52, 152, 219, 0.7);
  display: flex;
  justify-content: center;
  align-items: center;
  color: white;
  font-size: 24px;
  z-index: 10;
  opacity: 0;
  transition: opacity 0.3s ease;
}

.dragging .drag-overlay {
  opacity: 1;
}

.dragging {
  border: 2px dashed #3498db;
  background-color: rgba(52, 152, 219, 0.1);
}
</style>
