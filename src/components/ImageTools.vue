<script setup lang="ts">
import { useRouter } from 'vue-router'
import ToolItem from './ToolItem.vue'

const router = useRouter()

const imageTools = [
  { name: '图片压缩', route: 'ImageCompressor', image: 'https://img.icons8.com/?size=100&id=USMo5UMGEvMw&format=png&color=000000' },
  { name: 'PNG转ICO', route: 'PngToIco', image: 'https://img.icons8.com/?size=100&id=H6SA7amfKduZ&format=png&color=000000' },
  // 添加更多图片工具...
]

const navigateTo = (routeName: string) => {
  router.push({ name: routeName })
}

const goBack = () => {
  router.push({ name: 'Home' })
}
</script>

<template>
  <div class="image-tools">
    <div class="tools-grid">
      <ToolItem
        v-for="tool in imageTools"
        :key="tool.name"
        :title="tool.name"
        :imageSrc="tool.image"
        :onClick="() => navigateTo(tool.route)"
      />
    </div>
  </div>
</template>

<style scoped>
.image-tools {
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
</style>