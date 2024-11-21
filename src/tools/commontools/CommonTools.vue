<script setup lang="ts">
import { useRouter, useRoute } from 'vue-router'
import { inject, computed, ref, watch, onMounted, onUnmounted, type Ref } from 'vue'
import ToolItem from '../../components/ToolItem.vue'
import ToolsContainer from '../../widgets/ToolsContainer.vue'
import type { CustomModule, TitleModule } from '../../types/modules'

const router = useRouter()
const route = useRoute()

// 注入 titles 数据
const titles = inject('titles') as Ref<TitleModule[]>

// 计算当前路由对应的模块
const currentModule = computed(() => {
  return titles.value.find((title: TitleModule) => title.value === '/') || titles.value[0]
})

// 使用 ref 存储自定义工具
const customTools = ref<CustomModule[]>([])

// 更新自定义工具
const updateCustomTools = () => {
  customTools.value = currentModule.value.children
}

// 监听 currentModule 更新
watch(() => currentModule.value, updateCustomTools, { immediate: true })

// 默认工具列表
const defaultTools = [
  {
    name: '音乐播放器',
    route: 'MusicPlayer',
    image: 'https://img.icons8.com/?size=100&id=12455&format=png&color=000000'
  },{
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
  },
  {
    name: '时间戳工具',
    route: 'DateTools',
    image: 'https://img.icons8.com/?size=100&id=b8BSnWwKGHNv&format=png&color=000000'
  }
]

// 合并默认工具和自定义工具
const allTools = computed(() => {
  return [...defaultTools, ...customTools.value]
})

// 注入编辑和删除函数
const deleteModule = inject('deleteModule') as (module: CustomModule) => void
const openAddModuleModal = inject('openAddModuleModal') as (parent: string) => void

// 导航函数
const navigateTo = (routeName: string) => {
  if (routeName.startsWith('custom-')) {
    const customTool = customTools.value.find((tool) => tool.value === routeName)
    if (customTool) {
      router.push({
        name: 'CustomModuleViewer',
        query: {
          url: customTool.url,
          title: customTool.title
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
  tool: null as any
})

const showContextMenu = (event: MouseEvent, tool: any) => {
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
  if (contextMenu.value.tool && contextMenu.value.tool.value?.startsWith('custom-')) {
    if (confirm('确定要删除这个自定义模块吗？')) {
      deleteModule(contextMenu.value.tool)
      updateCustomTools()
    }
  }
  hideContextMenu()
}

const goBack = () => {
  router.back()
}

const handleModulesUpdated = () => {
  updateCustomTools()
}

const addCustomModule = () => {
  openAddModuleModal('/')
}

onMounted(() => {
  window.addEventListener('modules-updated', handleModulesUpdated)
})

onUnmounted(() => {
  window.removeEventListener('modules-updated', handleModulesUpdated)
})
</script>

<template>
  <div class="common-tools-container">
    <ToolsContainer title="常用工具" @goBack="goBack">
      <ToolItem
        v-for="tool in allTools"
        :key="tool.name || tool.title"
        :title="tool.name || tool.title"
        :imageSrc="tool.image || 'https://img.icons8.com/?size=100&id=12455&format=png&color=000000'"
        :onClick="() => navigateTo(tool.route || tool.value)"
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
      <div v-if="contextMenu.tool?.value?.startsWith('custom-')">
        <button @click="deleteCustomTool">删除</button>
      </div>
      <div class="menu-divider"></div>
      <button class="cancel-button" @click="hideContextMenu">取消</button>
    </div>
  </div>
</template>

<style scoped>
.common-tools-container {
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
