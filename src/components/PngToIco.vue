<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const selectedFile = ref<File | null>(null)
const originalImage = ref<string | null>(null)
const convertedImages = ref<{ size: number; url: string }[]>([])
const icoSizes = ref([
  { size: 16, checked: true },
  { size: 32, checked: true },
  { size: 48, checked: true },
  { size: 64, checked: false },
  { size: 128, checked: false },
  { size: 256, checked: false }
])

const handleFileChange = (event: Event) => {
  const target = event.target as HTMLInputElement
  if (target.files) {
    selectedFile.value = target.files[0]
    originalImage.value = URL.createObjectURL(selectedFile.value)
  }
}

const convertToIco = async () => {
  if (!selectedFile.value) return

  const img = new Image()
  img.onload = () => {
    convertedImages.value = []
    icoSizes.value.forEach(sizeObj => {
      if (sizeObj.checked) {
        const canvas = document.createElement('canvas')
        const ctx = canvas.getContext('2d')
        canvas.width = sizeObj.size
        canvas.height = sizeObj.size

        ctx!.drawImage(img, 0, 0, sizeObj.size, sizeObj.size)

        canvas.toBlob((blob) => {
          if (blob) {
            convertedImages.value.push({
              size: sizeObj.size,
              url: URL.createObjectURL(blob)
            })
          }
        }, 'image/png')
      }
    })
  }

  img.src = originalImage.value!
}

const goBack = () => {
  router.push({ name: 'ImageTools' })
}
</script>

<template>
  <div class="image-to-ico">
    <div class="navigation-bar">
      <button class="back-button" @click="goBack">返回</button>
      <h2 class="detail-title">图片转ICO工具</h2>
    </div>
    <div class="converter-content">
      <div class="control-panel">
        <input type="file" accept="image/png, image/jpeg" @change="handleFileChange" />
        <div class="size-selection">
          <h3>选择图标尺寸：</h3>
          <div v-for="sizeObj in icoSizes" :key="sizeObj.size" class="size-option">
            <input type="checkbox" :id="'size-' + sizeObj.size" v-model="sizeObj.checked" />
            <label :for="'size-' + sizeObj.size">{{ sizeObj.size }}x{{ sizeObj.size }}</label>
          </div>
        </div>
        <button @click="convertToIco" :disabled="!selectedFile">转换为ICO</button>
      </div>
      <div class="image-comparison">
        <div class="image-container">
          <h3>原图：</h3>
          <img v-if="originalImage" :src="originalImage" alt="Original Image" />
        </div>
        <div class="image-container">
          <h3>转换后的ICO图片预览：</h3>
          <div v-if="convertedImages.length > 0" class="converted-images-container">
            <div v-for="image in convertedImages" :key="image.size" class="preview-item">
              <img :src="image.url" :alt="`Converted ICO ${image.size}x${image.size}`" :width="image.size" :height="image.size" />
              <p>{{ image.size }}x{{ image.size }}</p>
              <a :href="image.url" :download="`icon_${image.size}x${image.size}.png`">下载</a>
            </div>
          </div>
          <p v-if="convertedImages.length > 0">注意：这些是PNG格式的预览图。实际使用时，您需要将它们合并为一个ICO文件。</p>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.image-to-ico {
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
}

.control-panel {
  margin-bottom: 20px;
}

.size-selection {
  margin: 20px 0;
}

.size-option {
  margin: 10px 0;
}

.image-comparison {
  display: flex;
  justify-content: space-between;
}

.image-container {
  width: 48%;
}

input, button {
  margin: 10px 0;
}

.converted-images-container {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.preview-item {
  text-align: center;
}

img {
  max-width: 100%;
  height: auto;
  border: 1px solid #ddd;
  border-radius: 4px;
}

a {
  display: block;
  margin-top: 5px;
  color: #3498db;
  text-decoration: none;
}

a:hover {
  text-decoration: underline;
}
</style>