<script setup lang="ts">
import { useRouter } from 'vue-router'
import { ref } from 'vue'
import NavigationBar from './NavigationBar.vue'

const router = useRouter()

const goBack = () => {
  router.push({ name: 'ImageTools' })
}

const webviewUrl = ref('https://icons8.com')
</script>

<template>
  <div class="icons8-viewer">
    <NavigationBar title="Icons8" @goBack="goBack" />
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

.webview-container {
  flex: 1;
  overflow: hidden;
}
</style>