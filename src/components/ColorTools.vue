<script setup lang="ts">
import { useRouter, useRoute } from 'vue-router'
import { inject, computed, ref, watch, onMounted, onUnmounted, type Ref } from 'vue'
import ToolItem from './ToolItem.vue'
import ToolsContainer from './ToolsContainer.vue'
import type { CustomModule, TitleModule } from '../types/modules'

const router = useRouter()
const route = useRoute()

// 注入 titles 数据和相关函数
const titles = inject('titles') as Ref<TitleModule[]>
const deleteModule = inject('deleteModule') as (module: CustomModule) => void
const openAddModuleModal = inject('openAddModuleModal') as (parent: string) => void

// 计算当前路由对应的模块
const currentModule = computed(() => {
  return titles.value.find((title) => title.value === '/color-tools') || titles.value[0]
})

// 使用 ref 来存储自定义工具
const customTools = ref<CustomModule[]>([
  { title: '配色卡', value: '配色卡', url: 'https://peiseka.com/index-index-peisepan.html' }
])

// 更新自定义工具的函数
const updateCustomTools = () => {
  customTools.value = currentModule.value.children.map((child: any) => ({
    name: child.title,
    route: child.value,
    url: child.url,
    image: 'https://img.icons8.com/?size=100&id=12455&format=png&color=000000'
  }))
}

// 监听 currentModule 的变化
watch(() => currentModule.value, updateCustomTools, { immediate: true })

const defaultColorTools = [
  {
    name: '颜色工具',
    route: 'TransparencyConverter',
    image: 'https://img.icons8.com/?size=100&id=24C4lD5fvL8K&format=png&color=000000'
  }
  // 在这里添加更多颜色工具
]

// 合并默认工具和自定义子模块
const allColorTools = computed(() => {
  return [...defaultColorTools, ...customTools.value]
})

const navigateTo = (routeName: string) => {
  if (routeName.startsWith('custom-')) {
    const customTool = customTools.value.find((tool) => tool.route === routeName)
    if (customTool) {
      window.open(customTool.url, '_blank')
    }
  } else {
    router.push({ name: routeName })
  }
}

// 右键菜单相关
const contextMenu = ref({
  show: false,
  x: 0,
  y: 0,
  tool: null as (typeof allColorTools.value)[0] | null
})

const showContextMenu = (event: MouseEvent, tool: (typeof allColorTools.value)[0]) => {
  event.preventDefault()
  contextMenu.value = {
    show: true,
    x: event.clientX,
    y: event.clientY,
    tool
  }
}

const hideContextMenu = () => {
  contextMenu.value.show = false
}

const deleteCustomTool = () => {
  if (contextMenu.value.tool && contextMenu.value.tool.route.startsWith('custom-')) {
    if (confirm('确定要删除这个自定义模块吗？')) {
      deleteModule(contextMenu.value.tool as CustomModule)
      updateCustomTools()
    }
  }
  hideContextMenu()
}

const addCustomModule = () => {
  openAddModuleModal('/color-tools')
}

const handleModulesUpdated = () => {
  updateCustomTools()
}

onMounted(() => {
  window.addEventListener('modules-updated', handleModulesUpdated)
})

onUnmounted(() => {
  window.removeEventListener('modules-updated', handleModulesUpdated)
})

const goBack = () => {
  router.push({ name: 'Home' })
}
</script>

<template>
  <div class="color-tools-container">
    <ToolsContainer title="颜色工具" @goBack="goBack">
      <ToolItem
        v-for="tool in allColorTools"
        :key="tool.name"
        :title="tool.name"
        :imageSrc="tool.image"
        :onClick="() => navigateTo(tool.route)"
        @contextmenu="showContextMenu($event, tool)"
      />
      <!-- 添加自定义模块按钮 -->
      <div class="add-custom-module" @click="addCustomModule">
        <span>+</span>
        <span>添加自定义模块</span>
      </div>
    </ToolsContainer>

    <!-- 右键菜单 -->
    <div
      v-if="contextMenu.show"
      class="context-menu"
      :style="{ top: `${contextMenu.y}px`, left: `${contextMenu.x}px` }"
      @click.stop
    >
      <div v-if="contextMenu.tool?.route.startsWith('custom-')">
        <button @click="deleteCustomTool">删除</button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.color-tools-container {
  width: 100%;
  height: 100%;
}

.context-menu {
  position: fixed;
  background: white;
  border: 1px solid #ccc;
  box-shadow: 2px 2px 5px rgba(0, 0, 0, 0.1);
  z-index: 1000;
}

.context-menu button {
  display: block;
  width: 100%;
  padding: 8px 10px;
  text-align: left;
  border: none;
  background: none;
  cursor: pointer;
}

.context-menu button:hover {
  background-color: #f0f0f0;
}

.add-custom-module {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 100px;
  height: 100px;
  border: 2px dashed #ccc;
  border-radius: 8px;
  cursor: pointer;
  transition: background-color 0.3s ease;
}

.add-custom-module:hover {
  background-color: #f0f0f0;
}

.add-custom-module span:first-child {
  font-size: 24px;
  margin-bottom: 5px;
}

.add-custom-module span:last-child {
  font-size: 12px;
  text-align: center;
}
</style>
