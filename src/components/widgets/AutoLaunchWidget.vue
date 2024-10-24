<template>
  <div class="widget auto-launch-widget">
    <h3>开机自启动</h3>
    <div class="auto-launch-switch">
      <label>
        <input type="checkbox" v-model="autoLaunch" @change="toggleAutoLaunch">
        {{ autoLaunch ? '已启用' : '已禁用' }}
      </label>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'

const autoLaunch = ref(false)

onMounted(async () => {
  // 获取当前的自启动状态
  autoLaunch.value = await window.electronAPI.getAutoLaunch()
})

const toggleAutoLaunch = async () => {
  autoLaunch.value = await window.electronAPI.setAutoLaunch(autoLaunch.value)
}
</script>

<style scoped>
.auto-launch-widget {
  background-color: #f8f9fa;
  border-radius: 8px;
  padding: 10px;
  margin: 0 5px;
  min-width: 150px;
  text-align: center;
}

.auto-launch-widget h3 {
  margin: 0 0 5px 0;
  font-size: 14px;
  color: #34495e;
}

.auto-launch-switch {
  font-size: 16px;
  color: #3498db;
}

.auto-launch-switch label {
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
}

.auto-launch-switch input[type="checkbox"] {
  margin-right: 5px;
}
</style>
