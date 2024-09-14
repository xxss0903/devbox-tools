<script setup lang="ts">
import { useRouter } from 'vue-router'
import { ref, onMounted } from 'vue'
import NavigationBar from './NavigationBar.vue'

const router = useRouter()

const goBack = () => {
  router.push({ name: 'ImageTools' })
}

const webviewUrl = ref('https://icons8.com')
const webviewRef = ref()

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

onMounted(() => {
  if (webviewRef.value) {
    webviewRef.value.addEventListener('new-window', (e) => {
      const protocol = new URL(e.url).protocol
      if (protocol === 'http:' || protocol === 'https:') {
        webviewRef.value!.loadURL(e.url)
      }
    })
  }
})
</script>

<template>
  <div class="icons8-viewer">
    <NavigationBar title="Icons8" @goBack="goBack" />
    <div class="webview-container">
      <webview
        ref="webviewRef"
        :src="webviewUrl"
        style="width: 100%; height: 100%"
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
</style>
