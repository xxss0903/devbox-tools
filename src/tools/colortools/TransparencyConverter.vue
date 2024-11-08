<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useRouter } from 'vue-router'
import NavigationBar from '../../components/NavigationBar.vue'

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
    <div class="converter-content">
      <div class="control-panel">
        <h2>颜色设置</h2>
        <div class="color-input">
          <label for="color">选择颜色：</label>
          <input type="color" id="color" :value="color" @input="updateColor" />
          <input type="text" :value="color" @input="updateColor" />
        </div>
        <div class="opacity-control">
          <label for="opacity">透明度：</label>
          <input
            type="range"
            id="opacity"
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
          <span>%</span>
        </div>
      </div>
      <div class="result">
        <h2>转换结果</h2>
        <div class="color-preview" :style="{ backgroundColor: rgba }"></div>
        <div class="result-item">
          <span>RGBA值：</span>
          <code>{{ rgba }}</code>
          <button @click="copyToClipboard(rgba)">复制</button>
        </div>
        <div class="result-item">
          <span>HEX值：</span>
          <code>{{ hex }}</code>
          <button @click="copyToClipboard(hex)">复制</button>
        </div>
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
  background-color: #f0f2f5;
  font-family: 'Helvetica Neue', Arial, sans-serif;
}

.converter-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  padding: 20px;
  overflow-y: auto; /* 添加垂直滚动 */
}

.control-panel, .result {
  background-color: #ffffff;
  border-radius: 12px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.05);
  padding: 20px;
  margin-bottom: 20px;
  max-width: 600px;
  width: 100%;
  align-self: center;
}

h2 {
  font-size: 20px;
  color: #333;
  margin-bottom: 15px;
  border-bottom: 1px solid #eee;
  padding-bottom: 8px;
}

.color-input, .opacity-control {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  margin-bottom: 15px;
}

label {
  font-weight: bold;
  color: #555;
  width: 100px;
  margin-bottom: 5px;
}

input[type="color"] {
  width: 50px;
  height: 35px;
  border: none;
  border-radius: 4px;
  margin-right: 10px;
}

input[type="text"], input[type="number"] {
  padding: 8px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
  max-width: 100px;
}

input[type="range"] {
  flex-grow: 1;
  margin: 0 10px;
  min-width: 100px;
}

.color-preview {
  width: 120px;
  height: 120px;
  border-radius: 50%;
  margin: 0 auto 20px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
}

.result-item {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  margin-bottom: 15px;
}

.result-item span {
  width: 70px;
  font-weight: bold;
  color: #555;
  margin-right: 10px;
}

code {
  flex-grow: 1;
  padding: 8px;
  background-color: #f7f9fc;
  border-radius: 4px;
  font-family: 'Courier New', monospace;
  font-size: 14px;
  margin-bottom: 5px;
  word-break: break-all;
}

button {
  padding: 8px 15px;
  background-color: #4a90e2;
  color: #ffffff;
  border: none;
  border-radius: 6px;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.3s ease;
  margin-left: 20px;
}

button:hover {
  background-color: #357abd;
  transform: translateY(-2px);
}

.copy-message {
  text-align: center;
  margin-top: 15px;
  color: #27ae60;
  font-weight: bold;
}

@media (max-width: 600px) {
  .converter-content {
    padding: 10px;
  }

  .control-panel, .result {
    padding: 15px;
  }

  input[type="text"], input[type="number"], input[type="range"] {
    width: 100%;
    margin-bottom: 10px;
  }

  .result-item {
    flex-direction: column;
    align-items: flex-start;
  }

  .result-item span {
    margin-bottom: 5px;
  }

  button {
    width: 100%;
    margin-left: 0;
  }
}
</style>
