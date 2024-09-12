<script setup lang="ts">
import { useRouter } from 'vue-router'

const router = useRouter()

const colorTools = [
  { name: '透明度颜色转换工具', route: 'TransparencyConverter' },
  // 在这里添加更多颜色工具
]

const navigateTo = (routeName: string) => {
  router.push({ name: routeName })
}

const goBack = () => {
  router.push({ name: 'Home' })
}
</script>

<template>
  <div class="color-tools">
    <div class="navigation-bar">
      <button class="back-button" @click="goBack">返回</button>
      <h2 class="page-title">颜色工具</h2>
    </div>
    <div class="tools-grid">
      <div v-for="tool in colorTools" :key="tool.name" class="tool-item" @click="navigateTo(tool.route)">
        <h3>{{ tool.name }}</h3>
      </div>
    </div>
  </div>
</template>

<style scoped>
.color-tools {
  display: flex;
  flex-direction: column;
  height: 100%;
}

.navigation-bar {
  display: flex;
  align-items: center;
  padding: 10px 20px;
  background-color: #f8f9fa;
  border-bottom: 1px solid #e9ecef;
}

.back-button {
  padding: 8px 16px;
  background-color: #3498db;
  color: #ffffff;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.3s ease;
}

.back-button:hover {
  background-color: #2980b9;
}

.page-title {
  margin-left: 20px;
  font-size: 1.5em;
  color: #2c3e50;
}

.tools-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 20px;
  padding: 20px;
  overflow-y: auto;
}

.tool-item {
  background-color: #ffffff;
  border: 1px solid #e9ecef;
  border-radius: 8px;
  padding: 20px;
  text-align: center;
  cursor: pointer;
  transition: box-shadow 0.3s ease;
}

.tool-item:hover {
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

.tool-item h3 {
  margin: 0;
  font-size: 1.2em;
  color: #2c3e50;
}
</style>