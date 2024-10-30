<template>
  <div class="image-resizer-container">
    <div class="navigation-bar">
      <button class="back-button" @click="goBack">返回</button>
      <h2 class="detail-title">图像大小调整工具</h2>
    </div>
    
    <div class="image-resizer-content">
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
          <select v-model="selectedSize" class="size-select">
            <option value="32">32 x 32</option>
            <option value="64">64 x 64</option>
            <option value="128">128 x 128</option>
            <option value="256">256 x 256</option>
            <option value="512">512 x 512</option>
            <option value="custom">自定义</option>
          </select>
          
          <div v-if="selectedSize === 'custom'" class="custom-size">
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
        
        <button 
          @click="resizeImage" 
          :disabled="!imageUrl" 
          class="button"
        >调整大小</button>
      </div>

      <div class="preview-area">
        <div v-if="imageUrl" class="original-image">
          <h3>原始图片</h3>
          <img :src="imageUrl" alt="原始图片" />
        </div>
        
        <div v-if="resizedImageUrl" class="resized-image">
          <h3>调整后的图片（点击下载）</h3>
          <img 
            :src="resizedImageUrl" 
            alt="调整后的图片"
            @click="downloadImage"
            class="result-image"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const imageUrl = ref('')
const resizedImageUrl = ref('')
const selectedSize = ref('128')
const customWidth = ref(0)
const customHeight = ref(0)

const targetSize = computed(() => {
  if (selectedSize.value === 'custom') {
    return {
      width: Number(customWidth.value),
      height: Number(customHeight.value)
    }
  }
  const size = Number(selectedSize.value)
  return {
    width: size,
    height: size
  }
})

const onFileChange = (event: Event) => {
  const file = (event.target as HTMLInputElement).files?.[0]
  if (file) {
    const reader = new FileReader()
    reader.onload = (e) => {
      imageUrl.value = e.target?.result as string
      resizedImageUrl.value = '' // 清除之前的结果
    }
    reader.readAsDataURL(file)
  }
}

const resizeImage = () => {
  const img = new Image()
  img.onload = () => {
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')
    
    canvas.width = targetSize.value.width
    canvas.height = targetSize.value.height
    
    if (ctx) {
      // 使用双线性插值算法进行缩放
      ctx.imageSmoothingEnabled = true
      ctx.imageSmoothingQuality = 'high'
      
      ctx.drawImage(img, 0, 0, targetSize.value.width, targetSize.value.height)
      
      resizedImageUrl.value = canvas.toDataURL('image/png')
      
      // 复制到剪贴板
      window.electronAPI?.writeImageToClipboard?.(resizedImageUrl.value)
        .then(() => {
          console.log('调整后的图片已复制到剪切板')
        })
        .catch((error: Error) => {
          console.error('复制到剪切板失败:', error)
        })
    }
  }
  img.src = imageUrl.value
}

const downloadImage = () => {
  const link = document.createElement('a')
  link.href = resizedImageUrl.value
  link.download = `resized-image-${targetSize.value.width}x${targetSize.value.height}.png`
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}

const goBack = () => {
  router.push({ name: 'ImageTools' })
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
</style> 