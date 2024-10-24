<template>
  <div class="widget-container">
    <ClockWidget />
    <ScreenBlockerWidget />
    <AutoLaunchWidget />
    <!-- 可以根据需要添加更多小组件 -->
  </div>
</template>

<script setup lang="ts">
import ClockWidget from './widgets/ClockWidget.vue'
import ScreenBlockerWidget from './widgets/ScreenBlockerWidget.vue'
import AutoLaunchWidget from './widgets/AutoLaunchWidget.vue'
</script>

<style scoped>
.widget-container {
  display: flex;
  justify-content: space-around;
  width: 100%;
  padding: 10px;
  background-color: #ffffff;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}
</style>
