<script setup lang="ts">
import { ref, computed, onMounted, nextTick } from 'vue'
import { useRouter } from 'vue-router'
import NavigationBar from './NavigationBar.vue'
import JSZip from 'jszip'

const router = useRouter()
const selectedFiles = ref<{ name: string; size: number; data: string }[]>([])
const compressedFiles = ref<
  { name: string; originalSize: number; compressedSize: number; data: string }[]
>([])
const compressionQuality = ref(0.7)
const isCompressing = ref(false)
const isDragging = ref(false)
const dragCounter = ref(0)

const handleFileChange = async (event: Event) => {
  const target = event.target as HTMLInputElement
  if (target.files) {
    const files = Array.from(target.files)
    await addFiles(files)
    // 重置 input，以便能够选择相同的文件
    target.value = ''
  }
}

const addFiles = async (files: File[]) => {
  const newFiles = await Promise.all(
    files.map(async (file) => {
      // 使用 FileReader 来读取文件，避免可能的堆栈溢出
      return new Promise<{ name: string; size: number; data: string }>((resolve) => {
        const reader = new FileReader()
        reader.onload = (e) => {
          resolve({
            name: file.name,
            size: file.size,
            data: e.target?.result as string
          })
        }
        reader.readAsDataURL(file)
      })
    })
  )
  selectedFiles.value = [...selectedFiles.value, ...newFiles]
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

const handleDragEnter = (event: DragEvent) => {
  event.preventDefault()
  event.stopPropagation()
  console.log('handleDragEnter', event.dataTransfer?.files)
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
  console.log('handleDrop', event.dataTransfer?.files)
  requestAnimationFrame(() => {
    isDragging.value = false
  })

  if (event.dataTransfer?.files) {
    let filesList = []
    for (const file of event.dataTransfer.files) {
      console.log('Dropped file:', file)
      filesList.push(file)
    }
    await addFiles(filesList)
  }
}

onMounted(() => {})

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

const downloadCompressedImages = async () => {
  if (compressedFiles.value.length === 1) {
    // 如果只有一个文件,直接下载
    const file = compressedFiles.value[0]
    const link = document.createElement('a')
    link.href = file.data
    link.download = file.name // 使用原始文件名
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  } else {
    // 如果有多个文件,创建zip文件
    const zip = new JSZip()

    for (const file of compressedFiles.value) {
      const base64Data = file.data.split(',')[1]
      zip.file(file.name, base64Data, { base64: true }) // 使用原始文件名
    }

    const content = await zip.generateAsync({ type: 'blob' })
    const link = document.createElement('a')
    link.href = URL.createObjectURL(content)
    link.download = 'compressed_images.zip'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(link.href)
  }
}

const downloadSingleFile = (file: { name: string; data: string }) => {
  const link = document.createElement('a')
  link.href = file.data
  link.download = file.name
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
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

const clearAll = () => {
  selectedFiles.value = []
  compressedFiles.value = []
  compressionQuality.value = 0.7
  isCompressing.value = false
}
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
          <button @click="clearAll" class="button clear">清空</button>
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
            v-if="compressedFiles.length > 1"
            @click="downloadCompressedImages"
            class="button"
          >
            下载所有压缩后的图片(ZIP)
          </button>
        </div>
      </div>

      <div v-if="isDragging" class="drag-overlay">
        <p>释放鼠标以添加图片</p>
      </div>

      <div v-if="selectedFiles.length > 0" class="file-list">
        <h3>选中的文件：</h3>
        <ul>
          <li v-for="file in selectedFiles" :key="file.name" class="file-item">
            <span class="file-name">{{ file.name }}</span>
            <span class="file-size">{{ formatFileSize(file.size) }}</span>
          </li>
        </ul>
      </div>
      <div v-if="compressedFiles.length > 0" class="compression-results">
        <h3>压缩结果：</h3>
        <p class="total-compression">
          总压缩率: <span>{{ totalCompressionRate }}%</span>
        </p>
        <ul>
          <li v-for="file in compressedFiles" :key="file.name" class="file-item">
            <div class="file-info">
              <span class="file-name">{{ file.name }}</span>
              <div class="compression-info">
                <span class="original-size">{{ formatFileSize(file.originalSize) }}</span>
                <span class="arrow">→</span>
                <span class="compressed-size">{{ formatFileSize(file.compressedSize) }}</span>
                <span class="compression-rate"
                  >(压缩率:
                  {{ ((1 - file.compressedSize / file.originalSize) * 100).toFixed(2) }}%)</span
                >
              </div>
            </div>
            <button @click="downloadSingleFile(file)" class="button download-single">下载</button>
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
  background-color: #f9f9f9;
  border-radius: 8px;
  padding: 15px;
}

.file-list h3,
.compression-results h3 {
  margin-top: 0;
  margin-bottom: 15px;
  color: #333;
}

ul {
  list-style-type: none;
  padding: 0;
}

.file-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px;
  background-color: #fff;
  border-radius: 4px;
  margin-bottom: 8px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.file-info {
  flex-grow: 1;
}

.file-name {
  font-weight: bold;
  color: #2c3e50;
}

.file-size,
.original-size,
.compressed-size {
  color: #7f8c8d;
  font-size: 0.9em;
}

.compression-info {
  display: flex;
  align-items: center;
  gap: 8px;
}

.arrow {
  color: #3498db;
  font-weight: bold;
}

.compression-rate {
  color: #27ae60;
  font-weight: bold;
}

.total-compression {
  font-size: 1.1em;
  margin-bottom: 15px;
}

.total-compression span {
  font-weight: bold;
  color: #27ae60;
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

.button.clear {
  background-color: #e74c3c;
}

.button.clear:hover {
  background-color: #c0392b;
}

.button.download-single {
  background-color: #3498db;
  color: white;
  padding: 5px 10px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.9em;
  transition: background-color 0.3s ease;
}

.button.download-single:hover {
  background-color: #2980b9;
}
</style>
