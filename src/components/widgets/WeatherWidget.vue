<template>
  <div class="widget">
    <h3>天气</h3>
    <div class="weather">晴天 25°C</div>
  </div>
</template>

<script setup lang="ts">
// 这里可以添加获取实际天气数据的逻辑
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

.weather {
  font-size: 16px;
  font-weight: bold;
  color: #3498db;
}
</style>
