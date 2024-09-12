<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()

const input = ref('')
const output = ref('')
const decodeType = ref('base64')

const decodeText = () => {
  try {
    switch (decodeType.value) {
      case 'base64':
        output.value = atob(input.value)
        break
      case 'url':
        output.value = decodeURIComponent(input.value)
        break
      case 'html':
        output.value = input.value.replace(/&#(\d+);/g, (match, dec) => String.fromCharCode(dec))
        break
      default:
        output.value = 'Unsupported decode type'
    }
  } catch (error) {
    output.value = 'Error: Invalid input for selected decode type'
  }
}

const goBack = () => {
  router.push({ name: 'Home' })
}
</script>

<template>
  <div class="decode-converter">
    <div class="navigation-bar">
      <button class="back-button" @click="goBack">返回</button>
      <h2 class="detail-title">解码转字符工具</h2>
    </div>
    <div class="converter-content">
      <div class="control-panel">
        <div>
          <label for="decode-type">解码类型：</label>
          <select id="decode-type" v-model="decodeType">
            <option value="base64">Base64</option>
            <option value="url">URL</option>
            <option value="html">HTML实体</option>
          </select>
        </div>
        <div>
          <label for="input">输入：</label>
          <textarea id="input" v-model="input" rows="5"></textarea>
        </div>
        <button @click="decodeText">解码</button>
      </div>
      <div class="result">
        <h3>解码结果：</h3>
        <textarea v-model="output" rows="5" readonly></textarea>
      </div>
    </div>
  </div>
</template>

<style scoped>
.decode-converter {
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

.control-panel div {
  margin-bottom: 10px;
}

.control-panel label {
  display: inline-block;
  width: 80px;
  margin-right: 10px;
}

textarea {
  width: 100%;
  padding: 5px;
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
</style>