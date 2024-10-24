<template>
  <div class="widget">
    <h3>屏幕锁定</h3>
    <div class="screen-blocker-content">
      <button @click="toggleScreenBlocker" :class="{ active: isActive }">
        {{ isActive ? '关闭锁屏' : '开启锁屏' }}
      </button>
      <div v-if="isActive" class="countdown">
        {{ formattedCountdown }}
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import moment from 'moment';
import { ref, onMounted, onUnmounted } from 'vue'

const isActive = ref(false)
const formattedCountdown = ref("00:00")

let countdownInterval: number | null = null

const toggleScreenBlocker = async () => {
  if (isActive.value) {
    await window.electronAPI.setScreenBlockerStatus(false)
    isActive.value = false
  } else {
    // 开启屏幕锁定
    await window.electronAPI.setScreenBlockerStatus(true)
    isActive.value = true
  }
}

const handleScreenBlockerStatusChange = async (event: any, status: boolean) => {
  isActive.value = status
  if(status){
    getScreenBlockerNextTime()
  }
}

const getScreenBlockerNextTime = async () => {
  const settings = await window.electronAPI.getScreenBlockerStatus()
  const nextBlockTime = moment(settings.next_block_time).format('HH:mm:ss')
  formattedCountdown.value = nextBlockTime
}

onMounted(async () => {
  const status = await window.electronAPI.getScreenBlockerStatus()
  if (status.is_active === 1) {
    isActive.value = true
    getScreenBlockerNextTime()
  } else {
    isActive.value = false
  }
  // 使用新的方法名添加全局事件监听器
  window.electronAPI.onScreenBlockerStatusChange(handleScreenBlockerStatusChange)
})

onUnmounted(() => {
  if (countdownInterval) {
    clearInterval(countdownInterval)
  }
})
</script>

<style scoped>
.widget {
  background-color: #f8f9fa;
  border-radius: 8px;
  padding: 10px;
  margin: 0 5px;
  min-width: 150px;
  text-align: center;
}

.widget h3 {
  margin: 0 0 5px 0;
  font-size: 14px;
  color: #34495e;
}

.screen-blocker-content {
  display: flex;
  flex-direction: column;
  align-items: center;
}

button {
  padding: 5px 10px;
  background-color: #3498db;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.3s ease;
}

button:hover {
  background-color: #2980b9;
}

button.active {
  background-color: #e74c3c;
}

button.active:hover {
  background-color: #c0392b;
}

.countdown {
  margin-top: 5px;
  font-size: 16px;
  font-weight: bold;
  color: #3498db;
}
</style>
