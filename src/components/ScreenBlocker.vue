<script setup lang="ts">
import { ref, onMounted, onUnmounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import NavigationBar from './NavigationBar.vue'

const router = useRouter()
let timer: NodeJS.Timeout | null = null
let countdownTimer: NodeJS.Timeout | null = null
const isPeriodicBlockerActive = ref(false)
const nextBlockTime = ref(0)
const isBlocking = ref(false)

const intervalTime = ref(2) // 默认2分钟
const blockDuration = ref(10) // 默认10分钟
const screenType = ref('windows-3d-blocker') // 默认屏保类型

const screenTypes = [
  { value: 'windows-3d-blocker', label: '3D屏保' },
  { value: 'windows-origin-blocker', label: '原始屏保' }
]

const currentTime = ref(Date.now())

const formattedRemainingTime = computed(() => {
  const remaining = Math.max(0, nextBlockTime.value - currentTime.value)
  const minutes = Math.floor(remaining / 60000)
  const seconds = Math.floor((remaining % 60000) / 1000)
  return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
})

const updateCurrentTime = () => {
  currentTime.value = Date.now()
}

const startBlocker = (duration: number) => {
  window.electronAPI.createScreenBlocker(duration, screenType.value)
  isBlocking.value = true
  setTimeout(() => {
    isBlocking.value = false
    nextBlockTime.value = Date.now() + intervalTime.value * 60000
  }, duration)
}

const startCountdown = () => {
  if (countdownTimer) {
    clearInterval(countdownTimer)
  }
  countdownTimer = setInterval(() => {
    updateCurrentTime()
    if (currentTime.value >= nextBlockTime.value && !isBlocking.value) {
      if (isPeriodicBlockerActive.value) {
        startBlocker(blockDuration.value * 60 * 1000)
      } else {
        clearInterval(countdownTimer!)
        countdownTimer = null
        nextBlockTime.value = 0
      }
    }
  }, 1000)
}

const goBack = () => {
  router.back()
}

const togglePeriodicBlocker = () => {
  if (isPeriodicBlockerActive.value) {
    if (timer) {
      clearInterval(timer)
      timer = null
    }
    if (countdownTimer) {
      clearInterval(countdownTimer)
      countdownTimer = null
    }
    isPeriodicBlockerActive.value = false
    nextBlockTime.value = 0
    isBlocking.value = false
  } else {
    startPeriodicBlocker()
    isPeriodicBlockerActive.value = true
    nextBlockTime.value = Date.now() + intervalTime.value * 60000
    startCountdown()
  }
  console.log('togglePeriodicBlocker', isPeriodicBlockerActive.value)
}

const startPeriodicBlocker = () => {
  timer = setInterval(
    () => {
      if (!isBlocking.value) {
        startBlocker(blockDuration.value * 60 * 1000)
      }
    },
    intervalTime.value * 60 * 1000
  )
}

const saveSettings = async () => {
  try {
    await window.electronAPI.saveScreenBlockSettings({
      intervalTime: intervalTime.value,
      blockDuration: blockDuration.value,
      screenType: screenType.value
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
      screenType.value = settings.screen_type || 'windows-3d-blocker'
    }
  } catch (error) {
    console.error('获取设置失败:', error)
  }
}

onMounted(async () => {
  try {
    await getSettings()
    updateCurrentTime() // 初始化当前时间
    setInterval(updateCurrentTime, 1000) // 每秒更新当前时间
  } catch (error) {
    console.error('获取设置失败:', error)
  }
})

onUnmounted(() => {
  if (timer) {
    clearInterval(timer)
    timer = null
  }
  if (countdownTimer) {
    clearInterval(countdownTimer)
    countdownTimer = null
  }
  isPeriodicBlockerActive.value = false
})
</script>

<template>
  <div class="screen-blocker">
    <NavigationBar title="定时休息" @goBack="goBack" />
    <div class="content-wrapper">
      <div class="content">
        <h2>定时休息设置</h2>
        <div class="form-group">
          <label for="intervalTime">间隔时间（分钟）：</label>
          <input id="intervalTime" v-model.number="intervalTime" type="number" min="0" />
        </div>
        <div class="form-group">
          <label for="blockDuration">休息时间（分钟）：</label>
          <input
            id="blockDuration"
            v-model.number="blockDuration"
            type="number"
            min="0"
            step="0.1"
          />
        </div>
        <div class="form-group">
          <label for="screenType">屏保类型：</label>
          <select id="screenType" v-model="screenType">
            <option v-for="type in screenTypes" :key="type.value" :value="type.value">
              {{ type.label }}
            </option>
          </select>
        </div>
        <div class="countdown-display">
          <h3>下次锁屏倒计时:</h3>
          <div class="countdown-timer">{{ formattedRemainingTime }}</div>
        </div>
        <div class="button-group">
          <button @click="saveSettings" class="primary">保存设置</button>
          <button @click="getSettings">获取设置</button>
        </div>
        <div class="button-group">
          <button @click="togglePeriodicBlocker" :class="{ active: isPeriodicBlockerActive }">
            {{ isPeriodicBlockerActive ? '停止定时休息' : '开始定时休息' }}
          </button>
        </div>
        <div class="button-group">
          <button @click="startBlocker(1 * 60 * 1000)">立即开始1分钟休息</button>
          <button @click="startBlocker(10 * 60 * 1000)">立即开始10分钟休息</button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.screen-blocker {
  width: 100%;
  height: 100%;
}
.content-wrapper {
  width: 100%;
  height: 100%;
  display: flex;
  padding: 20px;
  justify-content: center;
}

.content {
  padding: 20px;
  min-width: 600px;
  height: 600px;
  background-color: #f5f5f5;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

h2 {
  margin-bottom: 20px;
  color: #333;
}

.form-group {
  margin-bottom: 15px;
}

label {
  display: block;
  margin-bottom: 5px;
  color: #666;
}

input,
select {
  width: 100%;
  padding: 8px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
}

.button-group {
  display: flex;
  justify-content: space-between;
  margin-top: 20px;
}

button {
  padding: 10px 15px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.3s;
  font-size: 14px;
}

button.primary {
  background-color: #4caf50;
  color: white;
}

button.primary:hover {
  background-color: #45a049;
}

button:not(.primary) {
  background-color: #f0f0f0;
  color: #333;
}

button:not(.primary):hover {
  background-color: #e0e0e0;
}

button.active {
  background-color: #f44336;
  color: white;
}

button.active:hover {
  background-color: #d32f2f;
}

.countdown-display {
  margin-top: 20px;
  text-align: center;
}

.countdown-timer {
  font-size: 24px;
  font-weight: bold;
  color: #4caf50;
  margin-top: 10px;
}
</style>
