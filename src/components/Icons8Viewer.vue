<script setup lang="ts">
import { useRouter } from 'vue-router'
import { ref } from 'vue'

const router = useRouter()

const goBack = () => {
  router.push({ name: 'ImageTools' })
}

const webviewUrl = ref('https://icons8.com')
</script>

<template>
  <div class="icons8-viewer">
    <div class="navigation-bar">
      <button class="back-button" @click="goBack">返回</button>
      <h2 class="detail-title">Icons8</h2>
    </div>
    <div class="webview-container">
      <webview :src="webviewUrl" style="width:100%; height:100%;"></webview>
    </div>
  </div>
</template>

<style scoped>
.icons8-viewer {
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

.webview-container {
  flex: 1;
  overflow: hidden;
}
</style>