<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()

const color = ref('#000000')
const opacity = ref(100)
const copyMessage = ref('')

const rgba = computed(() => {
  const r = parseInt(color.value.slice(1, 3), 16)
  const g = parseInt(color.value.slice(3, 5), 16)
  const b = parseInt(color.value.slice(5, 7), 16)
  const a = opacity.value / 100
  return `rgba(${r}, ${g}, ${b}, ${a.toFixed(2)})`
})

const hex = computed(() => {
  const alpha = Math.round(opacity.value * 255 / 100).toString(16).padStart(2, '0')
  return `#${alpha}${color.value.slice(1)}`
})

const copyToClipboard = (text: string) => {
  const textArea = document.createElement('textarea')
  textArea.value = text
  document.body.appendChild(textArea)
  textArea.select()
  
  try {
    document.execCommand('copy')
    copyMessage.value = '已复制到剪贴板'
  } catch (err) {
    copyMessage.value = '复制失败，请手动复制'
    console.error('复制失败:', err)
  }

  document.body.removeChild(textArea)
  
  setTimeout(() => {
    copyMessage.value = ''
  }, 2000)
}

const goBack = () => {
  router.push({ name: 'ColorTools' })
}

// 添加这个函数来更新颜色值
const updateColor = (event: Event) => {
  const input = event.target as HTMLInputElement
  color.value = input.value
}

// 监听颜色变化，更新预览
watch(color, (newColor) => {
  const colorPreview = document.querySelector('.color-preview') as HTMLElement
  if (colorPreview) {
    colorPreview.style.backgroundColor = newColor
  }
})

function updateOpacity() {
  // 确保opacity值在0-100之间
  opacity.value = Math.max(0, Math.min(100, opacity.value));
  // ... 更新颜色逻辑 ...
}
</script>

<template>
  <div class="transparency-converter">
    <div class="navigation-bar">
      <button class="back-button" @click="goBack">返回</button>
      <h2 class="detail-title">透明度颜色转换工具</h2>
    </div>
    <div class="converter-content">
      <div class="control-panel">
        <div>
          <label for="color">颜色：</label>
          <input type="color" id="color" :value="color" @input="updateColor" />
          <input type="text" :value="color" @input="updateColor" />
        </div>
        <div class="opacity-control">
          <input
            type="range"
            min="0"
            max="100"
            v-model="opacity"
            @input="updateOpacity"
          />
          <input
            type="number"
            min="0"
            max="100"
            v-model="opacity"
            @input="updateOpacity"
          />
          %
        </div>
      </div>
      <div class="result">
        <h3>转换结果：</h3>
        <div class="color-preview" :style="{ backgroundColor: rgba }"></div>
        <p>
          RGBA值：{{ rgba }}
          <button @click="copyToClipboard(rgba)">复制</button>
        </p>
        <p>
          HEX值：{{ hex }}
          <button @click="copyToClipboard(hex)">复制</button>
        </p>
        <p v-if="copyMessage" class="copy-message">{{ copyMessage }}</p>
      </div>
    </div>
  </div>
</template>

<style scoped>
.transparency-converter {
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

.control-panel div {
  margin-bottom: 10px;
}

.control-panel label {
  display: inline-block;
  width: 80px;
}

.opacity-control {
  display: flex;
  align-items: center;
  gap: 10px;
}

input[type="number"] {
  width: 60px;
}

.result {
  background-color: #f8f9fa;
  padding: 20px;
  border-radius: 4px;
}

.color-preview {
  width: 100px;
  height: 100px;
  border: 1px solid #ddd;
  margin-bottom: 10px;
}

button {
  margin-left: 10px;
  padding: 5px 10px;
  background-color: #3498db;
  color: #ffffff;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.3s ease;
}

button:hover {
  background-color: #2980b9;
}

.copy-message {
  margin-top: 10px;
  color: #2ecc71;
  font-weight: bold;
}
</style>