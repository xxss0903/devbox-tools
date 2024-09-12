<script setup lang="ts">
import { useRouter } from 'vue-router'
import ToolItem from './ToolItem.vue'
import ToolsContainer from './ToolsContainer.vue'

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
  <ToolsContainer title="图片工具" @goBack="goBack">
    <ToolItem
      v-for="tool in imageTools"
      :key="tool.name"
      :title="tool.name"
      :imageSrc="tool.image"
      :onClick="() => navigateTo(tool.route)"
    />
  </ToolsContainer>
</template>