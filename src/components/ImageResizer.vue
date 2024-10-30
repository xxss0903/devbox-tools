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
      <div v-if="isDragging" class="drag-overlay">
        <p>释放鼠标以添加图片</p>
      </div>

      <div class="main-content">
        <!-- 左侧原始图片区域 -->
        <div class="original-image-section">
          <div class="upload-section">
            <label for="file-input" class="upload-button">
              <span class="upload-icon">📁</span>
              选择图片
              <input
                id="file-input"
                type="file"
                @change="onFileChange"
                accept="image/*"
                style="display: none"
              />
            </label>
          </div>
          
          <div v-if="imageUrl" class="image-preview">
            <h3>原始图片</h3>
            <img :src="imageUrl" alt="原始图片" class="preview-img" />
          </div>
          <div v-else class="empty-preview">
            <p>请选择或拖放图片到此处</p>
          </div>
        </div>

        <!-- 右侧尺寸选择区域 -->
        <div class="size-selection-section">
          <div class="control-panel">
            <h3 class="section-title">预设尺寸</h3>
            <div class="preset-sizes">
              <!-- 预设尺寸卡片 -->
              <div 
                v-for="size in presetSizes" 
                :key="size"
                class="size-card"
                :class="{ active: selectedSizes.includes(size) }"
                @click="toggleSize(size)"
              >
                <div class="size-preview" :style="getSizePreviewStyle(size)"></div>
                <div class="size-info">
                  <span class="size-value">{{ size }} x {{ size }}</span>
                  <span class="size-unit">px</span>
                </div>
                <div class="check-mark" v-if="selectedSizes.includes(size)">✓</div>
              </div>
            </div>

            <div class="custom-size-section">
              <div class="custom-size-header">
                <h3 class="section-title">自定义尺寸</h3>
                <label class="toggle-switch">
                  <input type="checkbox" v-model="useCustomSize">
                  <span class="toggle-slider"></span>
                </label>
              </div>
              
              <div v-if="useCustomSize" class="custom-size-inputs">
                <div class="dimension-input">
                  <label>宽度</label>
                  <div class="input-with-unit">
                    <input 
                      type="number" 
                      v-model="customWidth" 
                      placeholder="宽度"
                      class="size-input"
                    >
                    <span class="unit">px</span>
                  </div>
                </div>
                <div class="dimension-separator">×</div>
                <div class="dimension-input">
                  <label>高度</label>
                  <div class="input-with-unit">
                    <input 
                      type="number" 
                      v-model="customHeight" 
                      placeholder="高度"
                      class="size-input"
                    >
                    <span class="unit">px</span>
                  </div>
                </div>
              </div>
            </div>

            <div class="action-buttons">
              <button 
                @click="resizeImage" 
                :disabled="!imageUrl || !hasSelectedSizes" 
                class="resize-button"
              >
                调整大小
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- 调整后的图片展示区域 -->
      <div v-if="resizedImages.length > 0" class="results-section">
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

const toggleSize = (size: number) => {
  const index = selectedSizes.value.indexOf(size)
  if (index === -1) {
    selectedSizes.value.push(size)
  } else {
    selectedSizes.value.splice(index, 1)
  }
}

const getSizePreviewStyle = (size: number) => {
  const scale = size / Math.max(...presetSizes)
  return {
    width: `${scale * 40}px`,
    height: `${scale * 40}px`
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
  padding-bottom: 100px;
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
  width: 100%;
}

.resized-item {
  text-align: center;
  margin-bottom: 20px;
}

.resized-item p {
  margin-bottom: 5px;
  color: #666;
}

.result-image {
  max-width: 100%;
  height: auto;
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

.control-panel {
  background: white;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
  margin-bottom: 24px;
}

.panel-header {
  margin-bottom: 24px;
}

.upload-button {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 12px 24px;
  background: #4a90e2;
  color: white;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
  font-weight: 500;
}

.upload-button:hover {
  background: #357abd;
  transform: translateY(-2px);
}

.upload-icon {
  font-size: 20px;
}

.section-title {
  font-size: 16px;
  color: #2c3e50;
  margin-bottom: 16px;
  font-weight: 600;
}

.preset-sizes {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
  gap: 16px;
  margin-bottom: 24px;
}

.size-card {
  background: #f8f9fa;
  border: 2px solid #e9ecef;
  border-radius: 10px;
  padding: 16px;
  cursor: pointer;
  transition: all 0.3s ease;
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
}

.size-card:hover {
  border-color: #4a90e2;
  transform: translateY(-2px);
}

.size-card.active {
  background: #ebf5ff;
  border-color: #4a90e2;
}

.size-preview {
  background: #4a90e2;
  border-radius: 4px;
  transition: all 0.3s ease;
}

.size-info {
  text-align: center;
}

.size-value {
  font-weight: 600;
  color: #2c3e50;
}

.size-unit {
  color: #6c757d;
  font-size: 0.9em;
}

.check-mark {
  position: absolute;
  top: 8px;
  right: 8px;
  color: #4a90e2;
  font-weight: bold;
}

.custom-size-section {
  background: #f8f9fa;
  border-radius: 10px;
  padding: 20px;
}

.custom-size-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.toggle-switch {
  position: relative;
  display: inline-block;
  width: 50px;
  height: 24px;
}

.toggle-switch input {
  opacity: 0;
  width: 0;
  height: 0;
}

.toggle-slider {
  position: absolute;
  cursor: pointer;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: #ccc;
  transition: .4s;
  border-radius: 24px;
}

.toggle-slider:before {
  position: absolute;
  content: "";
  height: 16px;
  width: 16px;
  left: 4px;
  bottom: 4px;
  background-color: white;
  transition: .4s;
  border-radius: 50%;
}

input:checked + .toggle-slider {
  background-color: #4a90e2;
}

input:checked + .toggle-slider:before {
  transform: translateX(26px);
}

.custom-size-inputs {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-top: 16px;
}

.dimension-input {
  flex: 1;
}

.dimension-input label {
  display: block;
  margin-bottom: 8px;
  color: #6c757d;
  font-size: 14px;
}

.input-with-unit {
  position: relative;
  display: flex;
  align-items: center;
}

.size-input {
  width: 100%;
  padding: 10px 40px 10px 12px;
  border: 2px solid #e9ecef;
  border-radius: 8px;
  font-size: 16px;
  transition: all 0.3s ease;
}

.size-input:focus {
  border-color: #4a90e2;
  outline: none;
}

.unit {
  position: absolute;
  right: 12px;
  color: #6c757d;
}

.dimension-separator {
  font-size: 20px;
  color: #6c757d;
  margin: 0 8px;
  padding-top: 24px;
}

.action-buttons {
  margin-top: 24px;
  text-align: center;
}

.resize-button {
  padding: 12px 32px;
  background: #4a90e2;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
}

.resize-button:hover:not(:disabled) {
  background: #357abd;
  transform: translateY(-2px);
}

.resize-button:disabled {
  background: #cccccc;
  cursor: not-allowed;
}

@media (max-width: 768px) {
  .preset-sizes {
    grid-template-columns: repeat(auto-fill, minmax(100px, 1fr));
  }

  .custom-size-inputs {
    flex-direction: column;
  }

  .dimension-separator {
    padding: 8px 0;
  }
}

.main-content {
  display: flex;
  gap: 24px;
  margin-bottom: 24px;
}

.original-image-section {
  flex: 1;
  min-width: 0; /* 防止flex子项溢出 */
}

.size-selection-section {
  flex: 1;
  min-width: 0;
}

.image-preview {
  background: white;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
  margin-top: 20px;
}

.preview-img {
  width: 100%;
  height: auto;
  max-height: 600px;
  object-fit: contain;
  border-radius: 8px;
}

.empty-preview {
  background: white;
  border-radius: 12px;
  padding: 40px;
  text-align: center;
  color: #666;
  border: 2px dashed #ddd;
  margin-top: 20px;
}

.upload-section {
  margin-bottom: 20px;
}

.results-section {
  margin-top: 24px;
  background: white;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
  margin-bottom: 100px;
}

/* 响应式设计 */
@media (max-width: 1024px) {
  .main-content {
    flex-direction: column;
  }

  .original-image-section,
  .size-selection-section {
    width: 100%;
  }
  
  .image-resizer-content {
    padding-bottom: 120px;
  }
}
</style> 