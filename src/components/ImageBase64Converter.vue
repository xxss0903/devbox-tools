<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const imageFile = ref<File | null>(null)
const base64String = ref('')
const convertedImage = ref<string | null>(null)
const imageUrl = ref<string | null>(null)
const copyStatus = ref('')

const handleFileChange = (event: Event) => {
  const target = event.target as HTMLInputElement
  if (target.files && target.files.length > 0) {
    imageFile.value = target.files[0]
    imageUrl.value = URL.createObjectURL(imageFile.value)
    const reader = new FileReader()
    reader.onload = (e) => {
      base64String.value = e.target?.result as string
    }
    reader.readAsDataURL(imageFile.value)
  }
}

const convertBase64ToImage = () => {
  if (base64String.value) {
    convertedImage.value = base64String.value
  }
}

const downloadConvertedImage = () => {
  if (convertedImage.value) {
    const link = document.createElement('a')
    link.href = convertedImage.value
    link.download = 'converted_image.png'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }
}

const copyBase64String = async () => {
  try {
    await navigator.clipboard.writeText(base64String.value)
    copyStatus.value = '复制成功!'
    setTimeout(() => {
      copyStatus.value = ''
    }, 2000)
  } catch (err) {
    copyStatus.value = '复制失败,请重试'
    setTimeout(() => {
      copyStatus.value = ''
    }, 2000)
  }
}

const goBack = () => {
  router.push({ name: 'ImageTools' })
}
</script>

<template>
  <div class="image-base64-converter">
    <div class="navigation-bar">
      <button class="back-button" @click="goBack">返回</button>
      <h2 class="detail-title">图片Base64转换工具</h2>
    </div>
    <div class="converter-content">
      <div class="control-panel">
        <input type="file" accept="image/*" @change="handleFileChange" />
        <div class="base64-container">
          <textarea v-model="base64String" placeholder="在此输入Base64字符串"></textarea>
          <button @click="copyBase64String" class="copy-button">复制Base64</button>
          <span class="copy-status">{{ copyStatus }}</span>
        </div>
        <button @click="convertBase64ToImage">转换Base64为图片</button>
      </div>
      <div class="image-display">
        <div v-if="imageFile && imageUrl">
          <h3>原始图片：</h3>
          <img :src="imageUrl" alt="Original Image" />
        </div>
        <div v-if="convertedImage">
          <h3>转换后的图片（点击图片下载）：</h3>
          <img :src="convertedImage" alt="Converted Image" @click="downloadConvertedImage" class="clickable-image" />
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.image-base64-converter {
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

.converter-content {
  flex: 1;
  overflow-y: auto;
  padding: 20px;
  display: flex;
  gap: 20px;
}

.control-panel {
  display: flex;
  flex-direction: column;
  gap: 10px;
  width: 300px;
}

.control-panel textarea {
  height: 200px;
  resize: vertical;
}

.image-display {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.image-display img {
  max-width: 100%;
  height: auto;
}

.clickable-image {
  cursor: pointer;
  transition: opacity 0.3s ease;
}

.clickable-image:hover {
  opacity: 0.8;
}

.base64-container {
  position: relative;
  display: flex;
  flex-direction: column;
}

.copy-button {
  position: absolute;
  top: 5px;
  right: 5px;
  padding: 5px 10px;
  background-color: #3498db;
  color: #ffffff;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.3s ease;
}

.copy-button:hover {
  background-color: #2980b9;
}

.copy-status {
  margin-top: 5px;
  font-size: 0.9em;
  color: #2ecc71;
}
</style>