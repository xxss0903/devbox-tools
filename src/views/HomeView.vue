<script setup lang="ts">
import { useRouter, useRoute } from 'vue-router'
import { inject, computed } from 'vue'
import ToolsContainer from '../components/ToolsContainer.vue'
import ToolItem from '../components/ToolItem.vue'

const router = useRouter()
const route = useRoute()

// 注入 titles 数据
const titles = inject('titles') as Ref<TitleModule[]>
// 计算当前路由对应的模块
const currentModule = computed(() => {
  return titles.value.find((title: any) => title.value === route.path) || titles.value[0]
})

// 获取当前模块的子模块
const currentTools = computed(() => {
  return currentModule.value.children.map((child: any) => ({
    name: child.title,
    route: child.value,
    image: 'https://img.icons8.com/?size=100&id=12455&format=png&color=000000' // 默认图标，您可以根据需要修改
  }))
})

// 合并默认工具和自定义子模块
const allTools = computed(() => {
  return [
    {
      name: '编码/解码转换',
      route: 'CodeConverter',
      image: 'https://img.icons8.com/?size=100&id=12455&format=png&color=000000'
    },
    {
      name: '工作日记',
      route: 'WorkDiary',
      image: 'https://img.icons8.com/?size=100&id=64503&format=png&color=000000'
    },
    {
      name: '粘贴板管理',
      route: 'ClipboardManager',
      image: 'https://img.icons8.com/?size=100&id=67345&format=png&color=000000'
    },
    {
      name: '计算器',
      route: 'Calculator',
      image: 'https://img.icons8.com/?size=100&id=41LOFTWPsRas&format=png&color=000000'
    },
    ...currentTools.value
  ]
})

const navigateTo = (routeName: string) => {
  if (routeName.startsWith('custom-')) {
    const customTool = currentTools.value.find((tool) => tool.route === routeName)
    if (customTool) {
      window.open(customTool.route, '_blank')
    }
  } else {
    router.push({ name: routeName })
  }
}

const goBack = () => {
  router.push('/')
}
</script>

<template>
  <ToolsContainer :title="currentModule.title" @goBack="goBack">
    <ToolItem
      v-for="tool in allTools"
      :key="tool.name"
      :title="tool.name"
      :imageSrc="tool.image"
      :onClick="() => navigateTo(tool.route)"
    />
  </ToolsContainer>
</template>
