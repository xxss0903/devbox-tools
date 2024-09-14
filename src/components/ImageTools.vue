<script setup lang="ts">
import { useRouter } from 'vue-router'
import ToolItem from './ToolItem.vue'
import ToolsContainer from './ToolsContainer.vue'

const router = useRouter()

const imageTools = [
  {
    name: '图片压缩',
    route: 'ImageCompressor',
    image: 'https://img.icons8.com/?size=100&id=USMo5UMGEvMw&format=png&color=000000'
  },
  {
    name: 'PNG转ICO',
    route: 'PngToIco',
    image: 'https://img.icons8.com/?size=100&id=H6SA7amfKduZ&format=png&color=000000'
  },
  {
    name: '图片Base64转换',
    route: 'ImageBase64Converter',
    image: 'https://img.icons8.com/?size=100&id=WPr0mrffLj6D&format=png&color=000000'
  },
  {
    name: '图像裁剪',
    route: 'ImageCropper',
    image: 'https://img.icons8.com/?size=100&id=qxnheTBF0af8&format=png&color=000000'
  },
  // 添加Icons8工具
  {
    name: 'Icons8',
    route: 'Icons8Viewer',
    image: 'https://img.icons8.com/?size=100&id=118523&format=png&color=000000'
  },
  {
    name: '屏幕截图',
    route: 'ScreenshotTool',
    image: 'https://img.icons8.com/?size=100&id=112798&format=png&color=000000'
  }
  // ... 其他工具 ...
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
