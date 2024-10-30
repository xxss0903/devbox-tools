<template>
  <div class="custom-module-viewer">
    <div class="navigation-bar">
      <div class="nav-controls">
        <button @click="goBack" :disabled="!canGoBack" class="nav-button">
          <span class="nav-icon">←</span>
        </button>
        <button @click="goForward" :disabled="!canGoForward" class="nav-button">
          <span class="nav-icon">→</span>
        </button>
        <button @click="refresh" class="nav-button">
          <span class="nav-icon">🔄</span>
        </button>
      </div>
      <h2 class="module-title">{{ title }}</h2>
    </div>
    <webview
      ref="webviewRef"
      :src="url"
      class="module-content"
      @dom-ready="handleDomReady"
    ></webview>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()
const webviewRef = ref<any>(null)
const canGoBack = ref(false)
const canGoForward = ref(false)
const title = ref(route.query.title as string || '自定义模块')
const url = route.query.url as string

const handleDomReady = () => {
  if (webviewRef.value) {
    updateNavigationState()
    webviewRef.value.addEventListener('did-navigate', updateNavigationState)
    webviewRef.value.addEventListener('did-navigate-in-page', updateNavigationState)
  }
}

const updateNavigationState = () => {
  if (webviewRef.value) {
    canGoBack.value = webviewRef.value.canGoBack()
    canGoForward.value = webviewRef.value.canGoForward()
  }
}

const goBack = () => {
  if (webviewRef.value && canGoBack.value) {
    webviewRef.value.goBack()
  }
}

const goForward = () => {
  if (webviewRef.value && canGoForward.value) {
    webviewRef.value.goForward()
  }
}

const refresh = () => {
  if (webviewRef.value) {
    webviewRef.value.reload()
  }
}

onUnmounted(() => {
  if (webviewRef.value) {
    webviewRef.value.removeEventListener('did-navigate', updateNavigationState)
    webviewRef.value.removeEventListener('did-navigate-in-page', updateNavigationState)
  }
})
</script>

<style scoped>
.custom-module-viewer {
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
  gap: 20px;
}

.nav-controls {
  display: flex;
  gap: 8px;
}

.nav-button {
  padding: 8px;
  background: none;
  border: 1px solid #ddd;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
}

.nav-button:not(:disabled):hover {
  background-color: #f0f0f0;
  border-color: #bbb;
}

.nav-button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.nav-icon {
  font-size: 16px;
  color: #666;
}

.module-title {
  margin: 0;
  font-size: 1.2em;
  color: #2c3e50;
}

.module-content {
  flex: 1;
  width: 100%;
  border: none;
}
</style> 