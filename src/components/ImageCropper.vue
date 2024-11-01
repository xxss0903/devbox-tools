<template>
  <div class="image-cropper-container">
    <div
      class="image-cropper-content"
      :class="{ dragging: isDragging }"
      @dragenter="handleDragEnter"
      @dragover="handleDragEnter"
      @dragleave="handleDragLeave"
      @drop="handleDrop"
    >
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
const isDragging = ref(false)
const dragCounter = ref(0)

const onChange = (data: any) => {
  // 这里可以处理裁剪区域变化的逻辑,如果需要的话
}

const onFileChange = (event: Event) => {
  const file = (event.target as HTMLInputElement).files?.[0]
  if (file) {
    loadImageFile(file)
  }
}

const loadImageFile = (file: File) => {
  if (file.type.startsWith('image/')) {
    const reader = new FileReader()
    reader.onload = (e) => {
      imageUrl.value = e.target?.result as string
      croppedImageUrl.value = '' // 清除之前的裁剪结果
    }
    reader.readAsDataURL(file)
  }
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
    const file = event.dataTransfer.files[0]
    if (file) {
      loadImageFile(file)
    }
  }
}

const crop = () => {
  if (cropperRef.value) {
    const { canvas } = cropperRef.value.getResult()
    if (canvas) {
      croppedImageUrl.value = canvas.toDataURL()
      // 将裁剪后的图片放入系统剪切板
      window.electronAPI?.writeImageToClipboard(croppedImageUrl.value)
        .then(() => {
          console.log('裁剪后的图片已复制到剪切板')
        })
        .catch((error: Error) => {
          console.error('复制到剪切板失败:', error)
        })
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

.image-cropper-content {
  flex: 1;
  overflow-y: auto;
  padding: 20px;
  height: 80%;
  position: relative;
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
  cursor: pointer;
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
