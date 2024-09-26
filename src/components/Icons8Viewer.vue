<script setup lang="ts">
import { useRouter } from 'vue-router'
import { ref, onMounted } from 'vue'
import NavigationBar from './NavigationBar.vue'

const router = useRouter()

const goBack = () => {
  router.push({ name: 'ImageTools' })
}

const webviewUrl = ref('https://icons8.com')
const webviewRef = ref<Electron.WebviewTag | null>(null)

const handleDomReady = () => {
  if (webviewRef.value) {
    webviewRef.value.setZoomFactor(1)
    webviewRef.value.insertCSS(`
      * {
        user-select: none;
        -webkit-user-select: none;
      }
    `)
    webviewRef.value.executeJavaScript(`
      document.addEventListener('click', (event) => {
        if (event.target.tagName === 'INPUT' || event.target.tagName === 'TEXTAREA') {
          event.target.focus()
        }
      }, true)
    `)
  }
}

// 修改现有的handleBackNavigation和handleForwardNavigation函数
const handleBackNavigation = () => {
  if (webviewRef.value && webviewRef.value.canGoBack()) {
    webviewRef.value.goBack()
  }
}

const handleForwardNavigation = () => {
  if (webviewRef.value && webviewRef.value.canGoForward()) {
    webviewRef.value.goForward()
  }
}

// 添加新的函数来更新按钮状态
const canGoBack = ref(false)
const canGoForward = ref(false)

const updateNavigationState = () => {
  if (webviewRef.value) {
    canGoBack.value = webviewRef.value.canGoBack()
    canGoForward.value = webviewRef.value.canGoForward()
  }
}

const loadingProgress = ref(0)
const isLoading = ref(false)

const updateLoadingProgress = (progress: number) => {
  loadingProgress.value = progress
  isLoading.value = progress < 100
}

onMounted(() => {
  if (webviewRef.value) {
    webviewRef.value.addEventListener('new-window', (e: Electron.NewWindowEvent) => {
      const protocol = new URL(e.url).protocol
      if (protocol === 'http:' || protocol === 'https:') {
        webviewRef.value!.loadURL(e.url)
      }
    })

    // 添加导航事件监听器
    webviewRef.value.addEventListener('did-navigate', updateNavigationState)
    webviewRef.value.addEventListener('did-navigate-in-page', updateNavigationState)

    // 添加加载进度事件监听器
    webviewRef.value.addEventListener('did-start-loading', () => {
      updateLoadingProgress(0)
    })
    webviewRef.value.addEventListener('did-stop-loading', () => {
      updateLoadingProgress(100)
    })
    webviewRef.value.addEventListener('did-fail-load', () => {
      updateLoadingProgress(100)
    })
    webviewRef.value.addEventListener('load-commit', () => {
      updateLoadingProgress(50)
    })
  }
})
</script>

<template>
  <div class="icons8-viewer">
    <NavigationBar title="Icons8" @goBack="goBack" />
    <div class="webview-container">
      <div class="navigation-buttons">
        <button @click="handleBackNavigation()" :disabled="!canGoBack" class="nav-button">
          &#8592;
        </button>
        <button @click="handleForwardNavigation()" :disabled="!canGoForward" class="nav-button">
          &#8594;
        </button>
      </div>
      <div class="progress-bar-container" v-show="isLoading">
        <div class="progress-bar" :style="{ width: `${loadingProgress}%` }"></div>
      </div>
      <webview
        ref="webviewRef"
        :src="webviewUrl"
        style="width: 100%; height: calc(100% - 40px)"
        allowpopups
        webpreferences="contextIsolation=no, nodeIntegration=yes, enableRemoteModule=yes"
        @dom-ready="handleDomReady"
      ></webview>
    </div>
  </div>
</template>

<style scoped>
.icons8-viewer {
  display: flex;
  flex-direction: column;
  height: 100vh;
}

.webview-container {
  flex: 1;
  overflow: hidden;
}

.navigation-buttons {
  display: flex;
  justify-content: flex-start;
  padding: 10px;
  background-color: #f8f9fa;
  border-bottom: 1px solid #e9ecef;
}

.nav-button {
  background-color: transparent;
  border: none;
  color: #495057;
  font-size: 20px;
  padding: 5px 10px;
  margin-right: 5px;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.3s ease;
  line-height: 1;
}

.nav-button:hover:not(:disabled) {
  background-color: #e9ecef;
}

.nav-button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.nav-button i {
  pointer-events: none;
}

.progress-bar-container {
  width: 100%;
  height: 3px;
  background-color: #f0f0f0;
  position: relative;
  overflow: hidden;
}

.progress-bar {
  height: 100%;
  background-color: #4CAF50;
  position: absolute;
  left: 0;
  top: 0;
  transition: width 0.3s ease;
}
</style>
