<template>
  <div class="widgets-container">
    <div class="widget">
      <h3>时钟</h3>
      <div class="clock">{{ currentTime }}</div>
    </div>
    <div class="widget">
      <h3>天气</h3>
      <div class="weather">晴天 25°C</div>
    </div>
    <!-- 可以根据需要添加更多小组件 -->
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'

const currentTime = ref('')

const updateTime = () => {
  const now = new Date()
  currentTime.value = now.toLocaleTimeString()
}

let timer: number

onMounted(() => {
  updateTime()
  timer = setInterval(updateTime, 1000) // 每秒更新一次时间
})

onUnmounted(() => {
  clearInterval(timer) // 清除定时器
})
</script>

<style scoped>
.widgets-container {
  display: flex;
  justify-content: space-around;
  width: 100%;
  padding: 10px;
  background-color: #ffffff;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

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

.clock, .weather {
  font-size: 16px;
  font-weight: bold;
  color: #3498db;
}
</style>

