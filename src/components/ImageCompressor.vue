<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const selectedFile = ref<File | null>(null)
const originalImage = ref<string | null>(null)
const compressedImage = ref<string | null>(null)
const compressionQuality = ref(0.7)
const originalWidth = ref(0)
const originalHeight = ref(0)
const compressedWidth = ref(0)
const compressedHeight = ref(0)

const aspectRatio = computed(() => {
  return originalWidth.value / originalHeight.value
})

const handleFileChange = (event: Event) => {
  const target = event.target as HTMLInputElement
  if (target.files) {
    selectedFile.value = target.files[0]
    originalImage.value = URL.createObjectURL(selectedFile.value)
    
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

      ctx!.imageSmoothingEnabled = true
      ctx!.imageSmoothingQuality = 'high'
      ctx?.drawImage(img, 0, 0, compressedWidth.value, compressedHeight.value)

      canvas.toBlob(
        (blob) => {
          if (blob) {
            compressedImage.value = URL.createObjectURL(blob)
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
</script>

<template>
  <div class="image-compressor">
    <div class="navigation-bar">
      <button class="back-button" @click="goBack">返回</button>
      <h2 class="detail-title">图片压缩工具</h2>
    </div>
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
          <img v-if="originalImage" :src="originalImage" alt="Original Image" />
          <div v-if="originalImage" class="image-info">
            <span>宽度：{{ originalWidth }}px</span>
            <span>高度：{{ originalHeight }}px</span>
          </div>
        </div>
        <div class="image-container">
          <h3>压缩后的图片：</h3>
          <img v-if="compressedImage" :src="compressedImage" alt="Compressed Image" />
          <div v-if="originalImage" class="image-info">
            <div>
              <label for="compressedWidth">宽度：</label>
              <input type="number" id="compressedWidth" v-model="compressedWidth" @input="updateHeight" min="1" :max="originalWidth" />px
            </div>
            <div>
              <label for="compressedHeight">高度：</label>
              <input type="number" id="compressedHeight" v-model="compressedHeight" @input="updateWidth" min="1" :max="originalHeight" />px
            </div>
          </div>
          <a v-if="compressedImage" :href="compressedImage" download="compressed_image.jpg">下载压缩后的图片</a>
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

.navigation-bar {
  display: flex;
  align-items: center;
  padding: 10px 20px;
  background-color: #f8f9fa;
  border-bottom: 1px solid #e9ecef;
}

.back-button {
  padding: 8px 16px;
  background-color: #3498db;
  color: #ffffff;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.3s ease;
}

.back-button:hover {
  background-color: #2980b9;
}

.detail-title {
  margin-left: 20px;
  font-size: 1.2em;
  color: #2c3e50;
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
}

.image-info {
  margin-top: 10px;
}

.image-info span, .image-info div {
  display: block;
  margin-bottom: 5px;
}

input, button {
  margin: 10px 0;
}

img {
  max-width: 100%;
  height: auto;
  border: 1px solid #ddd;
  border-radius: 4px;
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