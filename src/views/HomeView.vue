<script setup lang="ts">
import { useRouter } from 'vue-router'
import ToolsContainer from '../components/ToolsContainer.vue'
import ToolItem from '../components/ToolItem.vue'

const router = useRouter()

const tools = [
  { name: '图片工具', route: 'ImageTools', image: 'https://img.icons8.com/?size=100&id=12776&format=png&color=000000' },
  { name: '颜色工具', route: 'ColorTools', image: 'https://img.icons8.com/?size=100&id=12784&format=png&color=000000' },
  { name: '编码/解码转换', route: 'CodeConverter', image: 'https://img.icons8.com/?size=100&id=12455&format=png&color=000000' },
  // 添加更多工具...
]

const navigateTo = (routeName: string) => {
  router.push({ name: routeName })
}

const goBack = () => {
  // 如果需要的话，可以实现返回逻辑
}
</script>

<template>
  <ToolsContainer title="工具箱" @goBack="goBack">
    <ToolItem
      v-for="tool in tools"
      :key="tool.name"
      :title="tool.name"
      :imageSrc="tool.image"
      :onClick="() => navigateTo(tool.route)"
    />
  </ToolsContainer>
</template>
