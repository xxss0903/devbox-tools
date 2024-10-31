<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { MD5 } from 'crypto-js'
import NavigationBar from './NavigationBar.vue'

const router = useRouter()

const input = ref('')
const output = ref('')
const codeType = ref('base64')

const codeTypes = [
  { value: 'base64', label: 'Base64' },
  { value: 'url', label: 'URL' },
  { value: 'html', label: 'HTML实体' },
  { value: 'md5', label: 'MD5' },
  { value: 'unicode', label: 'Unicode' } // 添加 Unicode 选项
]

const isDecodeDisabled = computed(() => codeType.value === 'md5')

const encode = () => {
  try {
    switch (codeType.value) {
      case 'base64':
        output.value = btoa(input.value)
        break
      case 'url':
        output.value = encodeURIComponent(input.value)
        break
      case 'html':
        output.value = input.value.split('').map(char => `&#${char.charCodeAt(0)};`).join('')
        break
      case 'md5':
        output.value = MD5(input.value).toString()
        break
      case 'unicode':
        output.value = input.value.split('').map(char => `\\u${char.charCodeAt(0).toString(16).padStart(4, '0')}`).join('')
        break
      default:
        output.value = 'Unsupported encode type'
    }
  } catch (error) {
    output.value = 'Error: Invalid input for selected encode type'
  }
}

const decode = () => {
  try {
    switch (codeType.value) {
      case 'base64':
        output.value = atob(input.value)
        break
      case 'url':
        output.value = decodeURIComponent(input.value)
        break
      case 'html':
        output.value = input.value.replace(/&#(\d+);/g, (match, dec) => String.fromCharCode(dec))
        break
      case 'md5':
        output.value = 'MD5 is a one-way hash function and cannot be decoded.'
        break
      case 'unicode':
        output.value = input.value.replace(/\\u([0-9a-fA-F]{4})/g, (match, hex) => String.fromCharCode(parseInt(hex, 16)))
        break
      default:
        output.value = 'Unsupported decode type'
    }
  } catch (error) {
    output.value = 'Error: Invalid input for selected decode type'
  }
}

const goBack = () => {
  router.back()
}
</script>

<template>
  <div class="code-converter">
    <NavigationBar title="代码转换器" @goBack="goBack" />
    <div class="converter-content">
      <div class="control-panel">
        <div class="radio-group">
          <label>编码类型：</label>
          <div v-for="type in codeTypes" :key="type.value" class="radio-item">
            <input type="radio" :id="type.value" :value="type.value" v-model="codeType">
            <label :for="type.value">{{ type.label }}</label>
          </div>
        </div>
        <div>
          <label for="input">输入：</label>
          <textarea id="input" v-model="input" rows="5"></textarea>
        </div>
        <div class="button-group">
          <button @click="decode" :disabled="isDecodeDisabled">解码</button>
          <button @click="encode">编码</button>
        </div>
      </div>
      <div class="result">
        <h3>结果：</h3>
        <textarea v-model="output" rows="5" readonly></textarea>
      </div>
    </div>
  </div>
</template>

<style scoped>
.code-converter {
  display: flex;
  flex-direction: column;
  height: 100%;
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

.control-panel > div {
  margin-bottom: 10px;
}

.control-panel label {
  display: inline-block;
  width: 80px;
  margin-right: 10px;
}

.radio-group {
  display: flex;
  align-items: center;
}

.radio-item {
  margin-right: 15px;
}

textarea {
  width: 100%;
  padding: 5px;
}

.button-group {
  display: flex;
  gap: 10px;
}

button {
  padding: 8px 16px;
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

.result {
  background-color: #f8f9fa;
  padding: 20px;
  border-radius: 4px;
}

.button-group button:disabled {
  background-color: #cccccc;
  cursor: not-allowed;
}
</style>