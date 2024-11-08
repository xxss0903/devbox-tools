<script setup lang="ts">
import { useRouter, useRoute } from 'vue-router'
import { inject, computed, ref, onMounted, onUnmounted, watch, type Ref } from 'vue'
import ToolsContainer from '../widgets/ToolsContainer.vue'
import ToolItem from '../components/ToolItem.vue'
import type { CustomModule, TitleModule } from '../types/modules'

const router = useRouter()
const route = useRoute()

// 注入 titles 数据和相关函数
const titles = inject('titles') as Ref<TitleModule[]>
const deleteModule = inject('deleteModule') as (module: CustomModule) => void
const openAddModuleModal = inject('openAddModuleModal') as (parent: string) => void

// 计算当前路由对应的模块
const currentModule = computed(() => {
  return titles.value.find((title) => title.value === route.path) || titles.value[0]
})

// 使用 ref 而不是 computed 来存储自定义工具
const customTools = ref<CustomModule[]>([])

// 更新自定义工具的函数
const updateCustomTools = () => {
  customTools.value = currentModule.value.children.map((child) => ({
    name: child.title,
    route: child.value,
    url: child.url,
    image: 'https://img.icons8.com/?size=100&id=12455&format=png&color=000000'
  }))
}

// 监听 currentModule 的变化
watch(() => currentModule.value, updateCustomTools, { immediate: true })

const defaultTools = [
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
  {
    name: '休息提醒',
    route: 'ScreenBlocker',
    image: 'https://img.icons8.com/?size=100&id=13841&format=png&color=000000'
  }
]

// 合并默认工具和自定义子模块
const allTools = computed(() => {
  return [...defaultTools, ...customTools.value]
})

const navigateTo = (routeName: string) => {
  if (routeName.startsWith('custom-')) {
    const customTool = customTools.value.find((tool) => tool.route === routeName)
    if (customTool) {
      router.push({
        name: 'CustomModuleViewer',
        query: {
          url: customTool.url,
          name: customTool.title
        }
      })
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
  tool: null as (typeof allTools.value)[0] | null
})

const showContextMenu = (event: MouseEvent, tool: (typeof allTools.value)[0]) => {
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
  openAddModuleModal(currentModule.value.value)
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
  router.push('/')
}
</script>

<template>
  <div class="home-view-container">
    <ToolsContainer :title="currentModule.title" @goBack="goBack">
      <ToolItem
        v-for="tool in allTools"
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
      <div class="menu-divider"></div>
      <button class="cancel-button" @click="hideContextMenu">取消</button>
    </div>
  </div>
</template>

<style scoped>
.home-view-container {
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
