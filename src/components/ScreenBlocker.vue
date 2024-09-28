<script setup lang="ts">
import { ref, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import NavigationBar from './NavigationBar.vue'

const router = useRouter()
const isBlocking = ref(false)
let timer: NodeJS.Timeout | null = null

const startBlocker = (duration: number) => {
  isBlocking.value = true
  // 使用 Electron 的 IPC 来启动遮挡窗口并禁用按键
  window.electronAPI.createScreenBlocker(duration)
}

const goBack = () => {
  router.back()
}

onUnmounted(() => {
  if (timer) {
    clearInterval(timer)
  }
})
</script>

<template>
  <div class="screen-blocker">
    <NavigationBar title="息屏休息" @goBack="goBack" />
    <h2>休息提醒</h2>
    <div v-if="!isBlocking">
      <button @click="startBlocker(5)">开始5分钟休息</button>
      <button @click="startBlocker(10)">开始10分钟休息</button>
    </div>
  </div>
</template>

<style scoped>
.screen-blocker {
  padding: 20px;
}

.blocker {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background-color: rgba(0, 0, 0, 0.9);
  color: white;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  z-index: 9999;
}
</style>
