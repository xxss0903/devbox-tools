<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import NavigationBar from './NavigationBar.vue'

const router = useRouter()
const selectedFile = ref<File | null>(null)
const originalImage = ref<string | null>(null)
const compressedImage = ref<string | null>(null)
const compressionQuality = ref(0.7)
const originalWidth = ref(0)
const originalHeight = ref(0)
const compressedWidth = ref(0)
const compressedHeight = ref(0)
const originalSize = ref<number | null>(null)
const compressedSize = ref<number | null>(null)

const aspectRatio = computed(() => {
  return originalWidth.value / originalHeight.value
})

const handleFileChange = (event: Event) => {
  const target = event.target as HTMLInputElement
  if (target.files) {
    selectedFile.value = target.files[0]
    originalImage.value = URL.createObjectURL(selectedFile.value)
    originalSize.value = selectedFile.value.size
    
    const img = new Image()
    img.onload = () => {
      originalWidth.value = img.width
      originalHeight.value = img.height
      compressedWidth.value = img.width
      compressedHeight.value = img.height
    }
    img.src = originalImage.value
  }
}

const updateHeight = () => {
  compressedHeight.value = Math.round(compressedWidth.value / aspectRatio.value)
}

const updateWidth = () => {
  compressedWidth.value = Math.round(compressedHeight.value * aspectRatio.value)
}

const compressImage = () => {
  if (!selectedFile.value) return

  const reader = new FileReader()
  reader.onload = (e) => {
    const img = new Image()
    img.onload = () => {
      const canvas = document.createElement('canvas')
      const ctx = canvas.getContext('2d')
      canvas.width = compressedWidth.value
      canvas.height = compressedHeight.value

      // 设置白色背景
      ctx!.fillStyle = '#FFFFFF'
      ctx!.fillRect(0, 0, canvas.width, canvas.height)

      ctx!.imageSmoothingEnabled = true
      ctx!.imageSmoothingQuality = 'high'
      ctx?.drawImage(img, 0, 0, compressedWidth.value, compressedHeight.value)

      canvas.toBlob(
        (blob) => {
          if (blob) {
            compressedImage.value = URL.createObjectURL(blob)
            compressedSize.value = blob.size
          }
        },
        'image/jpeg',
        compressionQuality.value
      )
    }
    img.src = e.target?.result as string
  }
  reader.readAsDataURL(selectedFile.value)
}

const goBack = () => {
  router.push({ name: 'ImageTools' })
}

// 添加一个函数来格式化文件大小
const formatFileSize = (bytes: number | null): string => {
  if (bytes === null) return '未知'
  const kb = bytes / 1024
  return `${kb.toFixed(2)} KB`
}

const downloadCompressedImage = () => {
  if (compressedImage.value) {
    const link = document.createElement('a')
    link.href = compressedImage.value
    link.download = 'compressed_image.jpg'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }
}
</script>

<template>
  <div class="image-compressor">
    <NavigationBar title="图片压缩工具" @goBack="goBack" />
    <div class="compressor-content">
      <div class="control-panel">
        <input type="file" accept="image/*" @change="handleFileChange" />
        <div>
          <label for="quality">压缩质量：</label>
          <input type="range" id="quality" v-model="compressionQuality" min="0.1" max="1" step="0.1" />
          {{ Math.round(compressionQuality * 100) }}%
        </div>
        <button @click="compressImage" :disabled="!selectedFile">压缩图片</button>
      </div>
      <div class="image-comparison">
        <div class="image-container">
          <h3>原图：</h3>
          <div v-if="originalImage" class="image-info">
            <div>
              <label>宽度：</label>
              <span>{{ originalWidth }}px</span>
            </div>
            <div>
              <label>高度：</label>
              <span>{{ originalHeight }}px</span>
            </div>
            <div>
              <label>大小：</label>
              <span>{{ formatFileSize(originalSize) }}</span>
            </div>
          </div>
          <img v-if="originalImage" :src="originalImage" alt="Original Image" />
        </div>
        <div class="image-container">
          <h3>压缩后的图片（点击下载）：</h3>
          <div v-if="originalImage" class="image-info">
            <div>
              <label for="compressedWidth">宽度：</label>
              <input type="number" id="compressedWidth" v-model="compressedWidth" @input="updateHeight" min="1" :max="originalWidth" />px
            </div>
            <div>
              <label for="compressedHeight">高度：</label>
              <input type="number" id="compressedHeight" v-model="compressedHeight" @input="updateWidth" min="1" :max="originalHeight" />px
            </div>
            <div>
              <label>大小：</label>
              <span>{{ formatFileSize(compressedSize) }}</span>
            </div>
          </div>
          <img v-if="compressedImage" :src="compressedImage" alt="Compressed Image" @click="downloadCompressedImage" class="clickable-image" />
        </div>
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
  margin-bottom: 20px;
}

.image-comparison {
  display: flex;
  justify-content: space-between;
}

.image-container {
  width: 48%;
  display: flex;
  flex-direction: column;
}

.image-info {
  margin-bottom: 10px;
  background-color: #f8f9fa;
  padding: 10px;
  border-radius: 4px;
}

.image-info div {
  margin-bottom: 5px;
}

.image-info label {
  display: inline-block;
  width: 50px;
  font-weight: bold;
}

.image-info input[type="number"] {
  width: 60px;
  margin-right: 5px;
}

.clickable-image {
  cursor: pointer;
  transition: opacity 0.3s ease;
}

.clickable-image:hover {
  opacity: 0.8;
}

img {
  max-width: 100%;
  height: auto;
  border: 1px solid #ddd;
  border-radius: 4px;
  margin-top: 10px;
  background-color: #FFFFFF; /* 添加白色背景 */
}

a {
  display: block;
  margin-top: 10px;
  color: #3498db;
  text-decoration: none;
}

a:hover {
  text-decoration: underline;
}
</style>