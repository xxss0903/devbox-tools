<script setup lang="ts">
import { ref, onMounted, onUnmounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import NavigationBar from './NavigationBar.vue'
import moment from 'moment'

const router = useRouter() // 路由
const isPeriodicBlockerActive = ref(false) // 是否开启定时屏保
const nextBlockTime = ref(0) // 下次屏保时间
const isBlocking = ref(false) // 是否正在屏保

const intervalTime = ref(2) // 默认2分钟
const blockDuration = ref(10) // 默认10分钟
const screenType = ref('windows-3d-blocker') // 默认屏保类型

const screenTypes = [
  { value: 'windows-3d-blocker', label: '3D屏保' },
  { value: 'windows-origin-blocker', label: '原始屏保' },
  { value: 'windows-matrix-blocker', label: '矩阵屏保' },
  { value: 'windows-error-blocker', label: '错误屏保' }
]

const formattedRemainingTime = computed(() => {
  return moment(nextBlockTime.value).format('HH:mm:ss')
})

const startBlocker = (duration: number) => {
  window.electronAPI.createScreenBlocker(duration, screenType.value)
}

const goBack = () => {
  router.back()
}

const togglePeriodicBlocker = async () => {
  await window.electronAPI.setScreenBlockerStatus({
    isActive: isPeriodicBlockerActive.value,
  })
  if (isPeriodicBlockerActive.value) {
    isPeriodicBlockerActive.value = false
  } else {
    isPeriodicBlockerActive.value = true
  }
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
    if (settings) {
      intervalTime.value = settings.interval_time
      blockDuration.value = settings.block_duration
      screenType.value = settings.screen_type || 'windows-3d-blocker'
      isPeriodicBlockerActive.value = settings.is_active === 1
      nextBlockTime.value = settings.next_block_time
      console.log('settings', settings, isPeriodicBlockerActive.value)
    }
  } catch (error) {
    console.error('获取设置失败:', error)
  }
}

const previewScreenBlocker = () => {
  console.log('previewScreenBlocker', screenType.value)
  window.electronAPI.createScreenBlocker(3000, screenType.value) // 预览10秒
}

onMounted(async () => {
  try {
    await getSettings()
  } catch (error) {
    console.error('获取设置失败:', error)
  }
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
        <div class="form-group screen-type-group">
          <label for="screenType">屏保类型：</label>
          <div class="screen-type-controls">
            <select id="screenType" v-model="screenType">
              <option v-for="type in screenTypes" :key="type.value" :value="type.value">
                {{ type.label }}
              </option>
            </select>
            <button @click="previewScreenBlocker" class="preview-button">预览</button>
          </div>
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

.screen-type-group {
  display: flex;
  flex-direction: column;
}

.screen-type-controls {
  display: flex;
  gap: 10px;
}

.screen-type-controls select {
  flex-grow: 1;
}

.preview-button {
  padding: 8px 15px;
  background-color: #2196F3;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.3s;
}

.preview-button:hover {
  background-color: #1976D2;
}
</style>
