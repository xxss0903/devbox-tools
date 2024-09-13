<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import NavigationBar from './NavigationBar.vue'

const router = useRouter()
const selectedFiles = ref<{ name: string, size: number, data: string }[]>([])
const compressedFiles = ref<{ name: string, originalSize: number, compressedSize: number, data: string }[]>([])
const compressionQuality = ref(0.7)
const isCompressing = ref(false)

const handleFileChange = (event: Event) => {
  const target = event.target as HTMLInputElement
  if (target.files) {
    selectedFiles.value = Array.from(target.files).map(file => ({
      name: file.name,
      size: file.size,
      data: URL.createObjectURL(file)
    }))
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

const compressImage = (file: { name: string, size: number, data: string }): Promise<{ size: number, data: string }> => {
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
    <div class="compressor-content">
      <div class="control-panel">
        <div class="file-selection">
          <input type="file" id="file-input" accept="image/*" @change="handleFileChange" multiple class="hidden-input" />
          <label for="file-input" class="button">选择图片</label>
          <button @click="handleFolderSelect" class="button">选择文件夹</button>
        </div>
        <div class="compression-controls">
          <div class="quality-control">
            <label for="quality">压缩质量：</label>
            <input type="range" id="quality" v-model="compressionQuality" min="0.1" max="1" step="0.1" />
            <span>{{ Math.round(compressionQuality * 100) }}%</span>
          </div>
          <button @click="compressImages" :disabled="selectedFiles.length === 0 || isCompressing" class="button primary">
            {{ isCompressing ? '压缩中...' : '压缩图片' }}
          </button>
          <button @click="downloadCompressedImages" :disabled="compressedFiles.length === 0" class="button">
            下载压缩后的图片
          </button>
        </div>
      </div>
      
      <!-- 文件列表和压缩结果部分保持不变 -->
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
            {{ file.name }}:
            原始大小 {{ formatFileSize(file.originalSize) }} ->
            压缩后 {{ formatFileSize(file.compressedSize) }}
            (压缩率: {{ ((1 - file.compressedSize / file.originalSize) * 100).toFixed(2) }}%)
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
}

.control-panel {
  background-color: #f0f0f0;
  padding: 15px;
  border-radius: 8px;
  margin-bottom: 20px;
}

.file-selection {
  display: flex;
  gap: 10px;
  margin-bottom: 15px;
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

input[type="range"] {
  width: 150px;
}

.file-list, .compression-results {
  margin-top: 20px;
}

ul {
  list-style-type: none;
  padding: 0;
}

li {
  margin-bottom: 5px;
}
</style>