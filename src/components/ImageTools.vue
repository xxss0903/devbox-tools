<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()

const imageTools = ref([
  { 
    id: 1, 
    title: '图片压缩', 
    icon: 'https://img.icons8.com/?size=100&id=USMo5UMGEvMw&format=png&color=000000', 
    route: 'ImageCompressor' 
  },
  { 
    id: 2, 
    title: '图片转ICO', 
    icon: 'https://img.icons8.com/?size=100&id=H6SA7amfKduZ&format=png&color=000000', 
    route: 'PngToIco' 
  },
  // 可以在这里添加更多图片工具
])

const navigateToTool = (route: string) => {
  router.push({ name: route })
}
</script>

<template>
  <div class="content-wrapper">
    <div class="content-grid">
      <div v-for="tool in imageTools" :key="tool.id" class="grid-item" @click="navigateToTool(tool.route)">
        <div class="icon-wrapper">
          <img :src="tool.icon" :alt="tool.title" class="tool-icon">
        </div>
        <div class="item-title-wrapper">
          <span class="item-title" :title="tool.title">{{ tool.title }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.content-wrapper {
  height: 100%;
  overflow-y: auto;
  padding: 20px;
  box-sizing: border-box;
}

.content-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
  gap: 20px;
  padding-bottom: 20px;
}

.grid-item {
  aspect-ratio: 1 / 1;
  background-color: #ffffff;
  border-radius: 8px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  padding: 15px;
  box-sizing: border-box;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  cursor: pointer;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

.grid-item:hover {
  transform: translateY(-5px);
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.2);
}

.icon-wrapper {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
}

.tool-icon {
  width: 64px;
  height: 64px;
  object-fit: contain;
}

.item-title-wrapper {
  width: 100%;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.item-title {
  font-size: 14px;
  color: #2c3e50;
  text-align: center;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 100%;
  padding: 0 5px;
}
</style>