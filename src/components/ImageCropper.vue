<template>
  <div class="image-cropper-container">
    <div class="navigation-bar">
      <button class="back-button" @click="goBack">返回</button>
      <h2 class="detail-title">图像裁剪工具（点击图片下载）</h2>
    </div>
    <div class="image-cropper-content">
      <div class="controls">
        <label for="file-input" class="button">选择图片</label>
        <input
          id="file-input"
          type="file"
          @change="onFileChange"
          accept="image/*"
          style="display: none"
        />
        <button @click="crop" :disabled="!imageUrl" class="button">裁剪</button>
      </div>
      <Cropper
        v-if="imageUrl"
        class="cropper"
        :src="imageUrl"
        @change="onChange"
        ref="cropperRef"
      />
      <div v-if="croppedImageUrl" class="preview-container">
        <img
          :src="croppedImageUrl"
          alt="裁剪后的图片"
          class="cropped-preview"
          @click="downloadImage"
        />
        <!-- 下载按钮已被移除 -->
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { Cropper } from 'vue-advanced-cropper'
import 'vue-advanced-cropper/dist/style.css'

const router = useRouter()
const imageUrl = ref('')
const croppedImageUrl = ref('')
const cropperRef = ref<InstanceType<typeof Cropper> | null>(null)

const onChange = (data: any) => {
  // 这里可以处理裁剪区域变化的逻辑,如果需要的话
}

const onFileChange = (event: Event) => {
  const file = (event.target as HTMLInputElement).files?.[0]
  if (file) {
    const reader = new FileReader()
    reader.onload = (e) => {
      imageUrl.value = e.target?.result as string
      croppedImageUrl.value = '' // 清除之前的裁剪结果
    }
    reader.readAsDataURL(file)
  }
}

const crop = () => {
  if (cropperRef.value) {
    const { canvas } = cropperRef.value.getResult()
    if (canvas) {
      croppedImageUrl.value = canvas.toDataURL()
      // 将裁剪后的图片放入系统剪切板
      window.electronAPI
        .writeImageToClipboard(croppedImageUrl.value)
        .then(() => {
          console.log('裁剪后的图片已复制到剪切板')
        })
        .catch((error) => {
          console.error('复制到剪切板失败:', error)
        })
      const img = new Image()
      img.src = croppedImageUrl.value
      img.onload = () => {
        const container = document.createElement('div')
        container.style.position = 'fixed'
        container.style.top = '0'
        container.style.left = '0'
        container.style.width = '100%'
        container.style.height = '100%'
        container.style.backgroundColor = 'rgba(0, 0, 0, 0.8)'
        container.style.display = 'flex'
        container.style.justifyContent = 'center'
        container.style.alignItems = 'center'
        container.style.zIndex = '9999'

        const croppedImage = document.createElement('img')
        croppedImage.src = croppedImageUrl.value
        croppedImage.style.maxWidth = '90%'
        croppedImage.style.maxHeight = '90%'
        croppedImage.style.objectFit = 'contain'

        container.appendChild(croppedImage)
        document.body.appendChild(container)

        container.onclick = () => {
          document.body.removeChild(container)
        }
      }
      console.log('裁剪后的图片:', croppedImageUrl.value)
    }
  }
}

const downloadImage = () => {
  const link = document.createElement('a')
  link.href = croppedImageUrl.value
  link.download = 'cropped-image.png'
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}

const goBack = () => {
  router.push({ name: 'ImageTools' })
}

// 暴露方法供父组件使用
defineExpose({ crop })
</script>

<style scoped>
.image-cropper-container {
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

.title {
  font-size: 18px;
  font-weight: bold;
  margin: 0;
}

.image-cropper-content {
  flex: 1;
  overflow-y: auto;
  padding: 20px;
}

.controls {
  display: flex;
  justify-content: space-between;
  margin-bottom: 20px;
}

.button {
  padding: 10px 20px;
  background-color: #4caf50;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  text-decoration: none;
  display: inline-block;
  font-size: 16px;
  transition: background-color 0.3s;
}

.button:hover {
  background-color: #45a049;
}

.button:disabled {
  background-color: #cccccc;
  cursor: not-allowed;
}

.cropper {
  height: 500px;
  background: #f0f0f0;
  margin-bottom: 20px;
}

.preview-container {
  text-align: center;
}

.cropped-preview {
  max-width: 100%;
  margin-bottom: 10px;
  cursor: pointer; /* 添加指针样式,表明可点击 */
}

/* 移除 .download-button 相关样式 */
</style>
