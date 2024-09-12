<script setup lang="ts">
import { useRouter } from 'vue-router'
import ToolItem from './ToolItem.vue'
import ToolsContainer from './ToolsContainer.vue'

const router = useRouter()

const colorTools = [
  { name: '颜色工具', route: 'TransparencyConverter', image: 'https://img.icons8.com/?size=100&id=24C4lD5fvL8K&format=png&color=000000' },
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
  <ToolsContainer title="颜色工具" @goBack="goBack">
    <ToolItem
      v-for="tool in colorTools"
      :key="tool.name"
      :title="tool.name"
      :imageSrc="tool.image"
      :onClick="() => navigateTo(tool.route)"
    />
  </ToolsContainer>
</template>
