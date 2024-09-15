<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import NavigationBar from './NavigationBar.vue'

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

const modalVisible = ref(false)
const modalImage = ref('')

const openModal = (imageSrc: string) => {
  modalImage.value = imageSrc
  modalVisible.value = true
}

const closeModal = () => {
  modalVisible.value = false
}

const downloadModalImage = () => {
  const link = document.createElement('a')
  link.href = modalImage.value
  link.download = 'image.png' // 你可以根据需要修改文件名
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}
</script>

<template>
  <div class="image-base64-converter">
    <NavigationBar title="图片Base64转换" @goBack="goBack" />
    <div class="converter-content">
      <div class="control-panel">
        <div class="file-input-wrapper">
          <input type="file" accept="image/*" @change="handleFileChange" id="file-input" class="file-input" />
          <label for="file-input" class="file-input-label">选择图片</label>
        </div>
        <div class="base64-container">
          <textarea v-model="base64String" placeholder="在此输入Base64字符串" class="base64-textarea"></textarea>
          <div class="button-group">
            <button @click="copyBase64String" class="button copy-button">复制Base64</button>
            <button @click="convertBase64ToImage" class="button convert-button">转换Base64为图片</button>
          </div>
          <span class="copy-status" :class="{ 'show': copyStatus }">{{ copyStatus }}</span>
        </div>
      </div>
      <div class="image-display">
        <div v-if="imageFile && imageUrl" class="image-preview">
          <h3>原始图片：</h3>
          <div class="image-wrapper">
            <img :src="imageUrl" alt="Original Image" class="preview-image" @click="openModal(imageUrl)" />
          </div>
        </div>
        <div v-if="convertedImage" class="image-preview">
          <h3>转换后的图片：</h3>
          <div class="image-wrapper">
            <img :src="convertedImage" alt="Converted Image" class="preview-image clickable-image" @click="openModal(convertedImage)" />
          </div>
          <p class="download-hint">点击图片放大,双击下载</p>
        </div>
      </div>

      <!-- 图片放大模态框 -->
      <div v-if="modalVisible" class="modal" @click="closeModal">
        <div class="modal-content" @click.stop>
          <img :src="modalImage" alt="Enlarged Image" class="modal-image" @dblclick="downloadModalImage" />
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.image-base64-converter {
  display: flex;
  flex-direction: column;
  height: 100vh;
  background-color: #f5f7fa;
}

.converter-content {
  flex: 1;
  display: flex;
  padding: 20px;
  gap: 20px;
  overflow-y: auto;
}

.control-panel {
  flex: 0 0 40%;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.file-input-wrapper {
  position: relative;
  overflow: hidden;
  display: inline-block;
}

.file-input {
  position: absolute;
  font-size: 100px;
  right: 0;
  top: 0;
  opacity: 0;
  cursor: pointer;
}

.file-input-label {
  display: inline-block;
  padding: 10px 20px;
  background-color: #3498db;
  color: white;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.3s;
}

.file-input-label:hover {
  background-color: #2980b9;
}

.base64-container {
  position: relative;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.base64-textarea {
  height: 200px;
  resize: vertical;
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-family: monospace;
}

.button-group {
  display: flex;
  gap: 10px;
}

.button {
  padding: 10px 20px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.3s;
  font-weight: bold;
}

.copy-button {
  background-color: #2ecc71;
  color: white;
}

.copy-button:hover {
  background-color: #27ae60;
}

.convert-button {
  background-color: #e74c3c;
  color: white;
}

.convert-button:hover {
  background-color: #c0392b;
}

.copy-status {
  font-size: 0.9em;
  color: #2ecc71;
  opacity: 0;
  transition: opacity 0.3s;
}

.copy-status.show {
  opacity: 1;
}

.image-display {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 20px;
  overflow-y: auto;
}

.image-preview {
  background-color: white;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

.image-preview h3 {
  margin-top: 0;
  margin-bottom: 15px;
  color: #333;
}

.image-wrapper {
  max-height: 500px;
  overflow-y: auto;
}

.preview-image {
  max-width: 100%;
  height: auto;
  border-radius: 4px;
  cursor: pointer;
}

.clickable-image {
  cursor: pointer;
  transition: opacity 0.3s ease;
}

.clickable-image:hover {
  opacity: 0.8;
}

.download-hint {
  text-align: center;
  color: #7f8c8d;
  margin-top: 10px;
}

.modal {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.8);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.modal-content {
  max-width: 90%;
  max-height: 90%;
  overflow: auto;
  background-color: white;
  border-radius: 8px;
  padding: 20px;
}

.modal-image {
  max-width: 100%;
  height: auto;
  cursor: pointer;
}

.preview-image {
  cursor: pointer;
}

.download-hint {
  text-align: center;
  color: #7f8c8d;
  margin-top: 10px;
}
</style>