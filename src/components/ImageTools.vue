<script setup lang="ts">
import { useRouter, useRoute } from 'vue-router'
import { inject, computed } from 'vue'
import ToolItem from './ToolItem.vue'
import ToolsContainer from './ToolsContainer.vue'

const router = useRouter()
const route = useRoute()

// 注入 titles 数据
const titles = inject('titles') as Ref<TitleModule[]>

// 计算当前路由对应的模块
const currentModule = computed(() => {
  return titles.value.find((title) => title.value === '/image-tools') || titles.value[0]
})

// 获取当前模块的子模块
const customTools = computed(() => {
  return currentModule.value.children.map((child) => ({
    name: child.title,
    route: child.value,
    image: 'https://img.icons8.com/?size=100&id=12455&format=png&color=000000' // 默认图标，您可以根据需要修改
  }))
})

const defaultImageTools = [
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
  {
    name: 'Icons8',
    route: 'Icons8Viewer',
    image: 'https://img.icons8.com/?size=100&id=118523&format=png&color=000000'
  },
  {
    name: '图片圆角',
    route: 'ImageRounder',
    image: 'https://img.icons8.com/?size=100&id=0uYcfoG9OUaw&format=png&color=000000'
  },
  {
    name: '屏幕截图',
    route: 'ScreenshotTool',
    image: 'https://img.icons8.com/?size=100&id=112798&format=png&color=000000'
  },
  {
    name: 'Svg渲染',
    route: 'SvgEditor',
    image: 'https://img.icons8.com/?size=100&id=57475&format=png&color=000000'
  }
]

// 合并默认工具和自定义子模块
const allImageTools = computed(() => {
  return [...defaultImageTools, ...customTools.value]
})

const navigateTo = (routeName: string) => {
  if (routeName.startsWith('custom-')) {
    const customTool = customTools.value.find((tool) => tool.route === routeName)
    if (customTool) {
      window.open(customTool.route, '_blank')
    }
  } else {
    router.push({ name: routeName })
  }
}

const goBack = () => {
  router.push({ name: 'Home' })
}
</script>

<template>
  <ToolsContainer title="图片工具" @goBack="goBack">
    <ToolItem
      v-for="tool in allImageTools"
      :key="tool.name"
      :title="tool.name"
      :imageSrc="tool.image"
      :onClick="() => navigateTo(tool.route)"
    />
  </ToolsContainer>
</template>
