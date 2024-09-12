<script setup lang="ts">
import { useRouter } from 'vue-router'
import ToolItem from './ToolItem.vue'

const router = useRouter()

const colorTools = [
  { name: '透明度颜色转换工具', route: 'TransparencyConverter', image: 'https://img.icons8.com/?size=100&id=24C4lD5fvL8K&format=png&color=000000' },
  { name: '16进制颜色值', route: 'HexColorConverter', image: 'https://img.icons8.com/?size=100&id=12784&format=png&color=000000' },
  // 在这里添加更多颜色工具
]

const navigateTo = (routeName: string) => {
  router.push({ name: routeName })
}


</script>

<template>
  <div class="color-tools">
    <div class="tools-grid">
      <ToolItem
        v-for="tool in colorTools"
        :key="tool.name"
        :title="tool.name"
        :imageSrc="tool.image"
        :onClick="() => navigateTo(tool.route)"
      />
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
  max-width: 880px; /* 设置最大宽度为 4 * 200px + 3 * 20px(间隔) + 40px(左右内边距) */
  margin: 0 auto; /* 居中显示 */
}

@media (min-width: 880px) {
  .tools-grid {
    grid-template-columns: repeat(4, 1fr); /* 在宽度足够时,固定为4列 */
  }
}
</style>