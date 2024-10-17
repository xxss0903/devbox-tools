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
import { ref, computed, onMounted, onUnmounted } from 'vue'

const isActive = ref(false)
const countdown = ref(0)
const blockDuration = 5 * 60 // 5分钟,可以根据需要调整

const formattedCountdown = computed(() => {
  const minutes = Math.floor(countdown.value / 60)
  const seconds = countdown.value % 60
  return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
})

let countdownInterval: number | null = null

const toggleScreenBlocker = async () => {
  if (isActive.value) {
    // 关闭屏幕锁定
    await window.electronAPI.closeScreenBlocker()
    await window.electronAPI.setScreenBlockerStatus(false)
    isActive.value = false
    if (countdownInterval) {
      clearInterval(countdownInterval)
      countdownInterval = null
    }
  } else {
    // 开启屏幕锁定
    await window.electronAPI.createScreenBlocker(blockDuration * 1000, 'windows-origin-blocker')
    await window.electronAPI.setScreenBlockerStatus(true, blockDuration)
    isActive.value = true
    countdown.value = blockDuration
    countdownInterval = setInterval(() => {
      countdown.value--
      if (countdown.value <= 0) {
        isActive.value = false
        window.electronAPI.setScreenBlockerStatus(false)
        if (countdownInterval) {
          clearInterval(countdownInterval)
          countdownInterval = null
        }
      }
    }, 1000)
  }
}

onMounted(async () => {
  const status = await window.electronAPI.getScreenBlockerStatus()
  if (status.is_active) {
    isActive.value = true
    const remainingTime = Math.max(0, status.block_duration - (Date.now() - status.start_time) / 1000)
    countdown.value = Math.floor(remainingTime)
    if (countdown.value > 0) {
      countdownInterval = setInterval(() => {
        countdown.value--
        if (countdown.value <= 0) {
          isActive.value = false
          window.electronAPI.setScreenBlockerStatus(false)
          if (countdownInterval) {
            clearInterval(countdownInterval)
            countdownInterval = null
          }
        }
      }, 1000)
    } else {
      isActive.value = false
      window.electronAPI.setScreenBlockerStatus(false)
    }
  }
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
