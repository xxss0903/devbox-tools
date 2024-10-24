<template>
  <div class="widgets-container">
    <ClockWidget />
    <ScreenBlockerWidget />
    <!-- 可以根据需要添加更多小组件 -->
  </div>
</template>

<script setup lang="ts">
import ClockWidget from './widgets/ClockWidget.vue'
import WeatherWidget from './widgets/WeatherWidget.vue'
import ScreenBlockerWidget from './widgets/ScreenBlockerWidget.vue'
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
</style>
