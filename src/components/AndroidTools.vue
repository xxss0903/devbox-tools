<script setup lang="ts">
import { useRouter } from 'vue-router'
import ToolsContainer from './ToolsContainer.vue'
import ToolItem from './ToolItem.vue'
import NavigationBar from './NavigationBar.vue'

const router = useRouter()

const androidTools = [
  { name: '获取签名信息', route: 'SignatureInfo', image: 'https://img.icons8.com/?size=100&id=13792&format=png&color=000000' },
  // 在这里添加更多Android工具
]

const navigateTo = (routeName: string) => {
  router.push({ name: routeName })
}

const goBack = () => {
  router.push({ name: 'Home' })
}
</script>

<template>
  <div class="android-tools">
    <NavigationBar title="Android工具" @goBack="goBack" />
    <ToolsContainer title="Android工具" @goBack="goBack">
      <ToolItem
        v-for="tool in androidTools"
        :key="tool.name"
        :title="tool.name"
        :imageSrc="tool.image"
        :onClick="() => navigateTo(tool.route)"
      />
    </ToolsContainer>
  </div>
</template>

<style scoped>
/* 移除 .navigation-bar 相关样式 */
/* 其他样式保持不变 */
</style>