<template>
  <div class="image-resizer-container">
    <div class="navigation-bar">
      <button class="back-button" @click="goBack">返回</button>
      <h2 class="detail-title">图像大小调整工具</h2>
    </div>
    
    <div 
      class="image-resizer-content"
      :class="{ dragging: isDragging }"
      @dragenter="handleDragEnter"
      @dragover="handleDragEnter"
      @dragleave="handleDragLeave"
      @drop="handleDrop"
    >
      <!-- 添加拖拽提示遮罩 -->
      <div v-if="isDragging" class="drag-overlay">
        <p>释放鼠标以添加图片</p>
      </div>

      <div class="controls">
        <label for="file-input" class="button">选择图片</label>
        <input
          id="file-input"
          type="file"
          @change="onFileChange"
          accept="image/*"
          style="display: none"
        />
        
        <div class="size-controls">
          <div class="preset-sizes">
            <label v-for="size in presetSizes" :key="size" class="size-checkbox">
              <input
                type="checkbox"
                v-model="selectedSizes"
                :value="size"
              >
              {{ size }} x {{ size }}
            </label>
          </div>
          
          <div class="custom-size-container">
            <label class="size-checkbox">
              <input
                type="checkbox"
                v-model="useCustomSize"
              >
              自定义尺寸
            </label>
            
            <div v-if="useCustomSize" class="custom-size">
              <input 
                type="number" 
                v-model="customWidth" 
                placeholder="宽度"
                class="size-input"
              >
              <span>x</span>
              <input 
                type="number" 
                v-model="customHeight" 
                placeholder="高度"
                class="size-input"
              >
            </div>
          </div>
        </div>
        
        <button 
          @click="resizeImage" 
          :disabled="!imageUrl || !hasSelectedSizes" 
          class="button"
        >调整大小</button>
      </div>

      <div class="preview-area">
        <div v-if="imageUrl" class="original-image">
          <h3>原始图片</h3>
          <img :src="imageUrl" alt="原始图片" />
        </div>
        
        <div v-if="resizedImages.length > 0" class="resized-images">
          <div class="resized-header">
            <h3>调整后的图片（点击单张下载）</h3>
            <button 
              @click="downloadAllImages" 
              class="download-all-button"
            >
              下载所有图片
            </button>
          </div>
          <div class="resized-grid">
            <div v-for="(img, index) in resizedImages" :key="index" class="resized-item">
              <p>{{ img.size.width }} x {{ img.size.height }}</p>
              <img 
                :src="img.url" 
                alt="调整后的图片"
                @click="downloadImage(img)"
                class="result-image"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import JSZip from 'jszip'

interface ResizedImage {
  url: string
  size: {
    width: number
    height: number
  }
}

const router = useRouter()
const imageUrl = ref('')
const resizedImages = ref<ResizedImage[]>([])
const presetSizes = [32, 64, 128, 256, 512]
const selectedSizes = ref<number[]>([])
const useCustomSize = ref(false)
const customWidth = ref(0)
const customHeight = ref(0)

// 添加拖拽相关的状态
const isDragging = ref(false)
const dragCounter = ref(0)

// 添加一个状态来保存原始文件名
const originalFileName = ref('')

const hasSelectedSizes = computed(() => {
  return selectedSizes.value.length > 0 || (useCustomSize.value && customWidth.value && customHeight.value)
})

const onFileChange = (event: Event) => {
  const file = (event.target as HTMLInputElement).files?.[0]
  if (file) {
    // 保存原始文件名（去掉扩展名）
    originalFileName.value = file.name.replace(/\.[^/.]+$/, '')
    const reader = new FileReader()
    reader.onload = (e) => {
      imageUrl.value = e.target?.result as string
      resizedImages.value = [] // 清除之前的结果
    }
    reader.readAsDataURL(file)
  }
}

const resizeToSize = (img: HTMLImageElement, width: number, height: number): string => {
  const canvas = document.createElement('canvas')
  const ctx = canvas.getContext('2d')
  
  canvas.width = width
  canvas.height = height
  
  if (ctx) {
    ctx.imageSmoothingEnabled = true
    ctx.imageSmoothingQuality = 'high'
    ctx.drawImage(img, 0, 0, width, height)
  }
  
  return canvas.toDataURL('image/png')
}

const resizeImage = () => {
  const img = new Image()
  img.onload = () => {
    resizedImages.value = []
    
    // 处理预设尺寸
    for (const size of selectedSizes.value) {
      const resizedUrl = resizeToSize(img, size, size)
      resizedImages.value.push({
        url: resizedUrl,
        size: { width: size, height: size }
      })
    }
    
    // 处理自定义尺寸
    if (useCustomSize.value && customWidth.value && customHeight.value) {
      const resizedUrl = resizeToSize(img, customWidth.value, customHeight.value)
      resizedImages.value.push({
        url: resizedUrl,
        size: { width: customWidth.value, height: customHeight.value }
      })
    }
    
    // 复制最后一个调整后的图片到剪贴板
    if (resizedImages.value.length > 0) {
      const lastImage = resizedImages.value[resizedImages.value.length - 1]
      window.electronAPI?.writeImageToClipboard?.(lastImage.url)
        .then(() => {
          console.log('最后一张调整后的图片已复制到剪切板')
        })
        .catch((error: Error) => {
          console.error('复制到剪切板失败:', error)
        })
    }
  }
  img.src = imageUrl.value
}

const downloadImage = (img: ResizedImage) => {
  const link = document.createElement('a')
  link.href = img.url
  // 使用原始文件名
  link.download = `${originalFileName.value}-${img.size.width}x${img.size.height}.png`
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}

const downloadAllImages = () => {
  const timestamp = new Date().getTime()
  // 使用原始文件名创建文件夹
  const folderName = originalFileName.value || `resized-images-${timestamp}`
  
  const zip = new JSZip()
  
  resizedImages.value.forEach((img) => {
    const imageData = img.url.split(',')[1]
    // 使用原始文件名创建压缩包中的文件名
    const fileName = `${folderName}/${originalFileName.value}-${img.size.width}x${img.size.height}.png`
    zip.file(fileName, imageData, { base64: true })
  })
  
  zip.generateAsync({ type: 'blob' })
    .then((content) => {
      const link = document.createElement('a')
      link.href = URL.createObjectURL(content)
      // 使用原始文件名命名zip文件
      link.download = `${folderName}.zip`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(link.href)
    })
    .catch((error: Error) => {
      console.error('创建 zip 文件失败:', error)
    })
}

const goBack = () => {
  router.push({ name: 'ImageTools' })
}

// 添加拖拽处理函数
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

  const file = event.dataTransfer?.files[0]
  if (file && file.type.startsWith('image/')) {
    // 保存原始文件名（去掉扩展名）
    originalFileName.value = file.name.replace(/\.[^/.]+$/, '')
    const reader = new FileReader()
    reader.onload = (e) => {
      imageUrl.value = e.target?.result as string
      resizedImages.value = [] // 清除之前的结果
    }
    reader.readAsDataURL(file)
  }
}
</script>

<style scoped>
.image-resizer-container {
  display: flex;
  flex-direction: column;
  height: 100vh;
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
}

.detail-title {
  margin-left: 20px;
  font-size: 1.2em;
  color: #2c3e50;
}

.image-resizer-content {
  flex: 1;
  padding: 20px;
  overflow-y: auto;
  position: relative;
}

.controls {
  display: flex;
  gap: 20px;
  align-items: center;
  margin-bottom: 20px;
}

.size-controls {
  display: flex;
  gap: 10px;
  align-items: center;
}

.size-select {
  padding: 8px;
  border-radius: 4px;
  border: 1px solid #ddd;
}

.custom-size {
  display: flex;
  align-items: center;
  gap: 5px;
}

.size-input {
  width: 80px;
  padding: 8px;
  border-radius: 4px;
  border: 1px solid #ddd;
}

.button {
  padding: 10px 20px;
  background-color: #4caf50;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.button:disabled {
  background-color: #cccccc;
  cursor: not-allowed;
}

.preview-area {
  display: flex;
  gap: 20px;
  margin-top: 20px;
}

.original-image,
.resized-image {
  flex: 1;
  text-align: center;
}

.original-image img,
.result-image {
  max-width: 100%;
  max-height: 500px;
  object-fit: contain;
}

.result-image {
  cursor: pointer;
}

h3 {
  margin-bottom: 10px;
  color: #2c3e50;
}

.preset-sizes {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-bottom: 10px;
}

.size-checkbox {
  display: flex;
  align-items: center;
  gap: 5px;
  cursor: pointer;
}

.custom-size-container {
  margin-top: 10px;
}

.resized-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 20px;
  margin-top: 20px;
}

.resized-item {
  text-align: center;
}

.resized-item p {
  margin-bottom: 5px;
  color: #666;
}

.result-image {
  max-width: 100%;
  max-height: 200px;
  object-fit: contain;
  cursor: pointer;
  border: 1px solid #ddd;
  border-radius: 4px;
  padding: 5px;
  transition: transform 0.2s;
}

.result-image:hover {
  transform: scale(1.05);
}

.resized-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.download-all-button {
  padding: 8px 16px;
  background-color: #3498db;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.3s;
}

.download-all-button:hover {
  background-color: #2980b9;
}

/* 添加拖拽相关样式 */
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