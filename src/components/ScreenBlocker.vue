<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import NavigationBar from './NavigationBar.vue'

const router = useRouter()
let timer: NodeJS.Timeout | null = null

const intervalTime = ref(2) // 默认2分钟
const blockDuration = ref(10) // 默认10分钟

const startBlocker = (duration: number) => {
  window.electronAPI.createScreenBlocker(duration)
}

const goBack = () => {
  router.back()
}

const togglePeriodicBlocker = () => {
  if (timer) {
    clearInterval(timer)
  } else {
    startBlocker(blockDuration.value * 60 * 1000)
  }
}

const startPeriodicBlocker = () => {
  if (timer) {
    clearInterval(timer)
  }
  timer = setInterval(() => {
    startBlocker(blockDuration.value * 60 * 1000)
  }, intervalTime.value * 60 * 1000)
}

const saveSettings = async () => {
  try {
    await window.electronAPI.saveScreenBlockSettings({
      intervalTime: intervalTime.value,
      blockDuration: blockDuration.value
    })
  } catch (error) {
    console.error('保存设置失败:', error)
  }
}

const getSettings = async () => {
  try {
    const settings = await window.electronAPI.getScreenBlockSettings()
    console.log('settings', settings)
    if (settings) {
      intervalTime.value = settings.interval_time
      blockDuration.value = settings.block_duration
    }
  } catch (error) {
    console.error('获取设置失败:', error)
  }
}

onMounted(async () => {
  try {
    await getSettings()
  } catch (error) {
    console.error('获取设置失败:', error)
  }
})

onUnmounted(() => {
  if (timer) {
    clearInterval(timer)
  }
})
</script>

<template>
  <div class="screen-blocker">
    <NavigationBar title="定时休息" @goBack="goBack" />
    <h2>定时休息设置</h2>
    <div>
      <label>
        间隔时间（分钟）：
        <input v-model.number="intervalTime" type="number" min="0" />
      </label>
    </div>
    <div>
      <label>
        休息时间（分钟）：
        <input v-model.number="blockDuration" type="number" min="0" step="0.1"/>
      </label>
    </div>
    <button @click="saveSettings">保存设置</button>
    <button @click="getSettings">获取设置</button>
    <button @click="togglePeriodicBlocker">开始定时休息</button>
    <div>
      <button @click="startBlocker(5)">立即开始5分钟休息</button>
      <button @click="startBlocker(10)">立即开始10分钟休息</button>
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
