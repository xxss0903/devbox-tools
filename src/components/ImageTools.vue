<script setup lang="ts">
import { useRouter, useRoute } from 'vue-router'
import { inject, computed, ref, watch, onMounted, onUnmounted, type Ref } from 'vue'
import ToolItem from './ToolItem.vue'
import ToolsContainer from './ToolsContainer.vue'
import type { CustomModule, TitleModule } from '../types/modules'

const router = useRouter()
const route = useRoute()

// 注入 titles 数据
const titles = inject('titles') as Ref<TitleModule[]>

// 计算当前路由对应的模块
const currentModule = computed(() => {
  return (
    titles.value.find((title: TitleModule) => title.value === '/image-tools') || titles.value[0]
  )
})

// 修改这里，使用 ref 而不是 computed
const customTools = ref([])

// 添加一个函数来更新 customTools
const updateCustomTools = () => {
  customTools.value = currentModule.value.children.map((child: CustomModule) => ({
    name: child.title,
    route: child.value,
    url: child.url,
    image: 'https://img.icons8.com/?size=100&id=12455&format=png&color=000000'
  }))
}

// 在 currentModule 更新时调用 updateCustomTools
watch(() => currentModule.value, updateCustomTools, { immediate: true })

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
  },
  {
    name: '印章编辑器',
    route: 'StampEditor',
    image: 'https://img.icons8.com/?size=100&id=22964&format=png&color=000000'
  },
  {
    name: '图片大小调整',
    route: 'ImageResizer',
    image: 'https://img.icons8.com/?size=100&id=22964&format=png&color=000000'
  }
]

// 合并默认工具和自定义子模块
const allImageTools = computed(() => {
  return [...defaultImageTools, ...customTools.value]
})

// 注入编辑和删除函数
const deleteModule = inject('deleteModule') as (module: CustomModule) => void

// 修改 openAddModuleModal 的类型
const openAddModuleModal = inject('openAddModuleModal') as (parent: string) => void

// 修改 navigateTo 函数
const navigateTo = (routeName: string) => {
  if (routeName.startsWith('custom-')) {
    const customTool = customTools.value.find((tool) => tool.route === routeName)
    if (customTool) {
      const width = 1024 // 设置宽度
      const height = 768 // 设置高度
      const left = (screen.width - width) / 2
      const top = (screen.height - height) / 2
      window.open(
        customTool.url,
        '_blank',
        `width=${width},height=${height},left=${left},top=${top}`
      )
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
  tool: null as (typeof allImageTools.value)[0] | null
})

const showContextMenu = (event: MouseEvent, tool: (typeof allImageTools.value)[0]) => {
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
      let deleteModuleData = contextMenu.value.tool as CustomModule
      console.log('delete module', deleteModuleData)
      deleteModule(deleteModuleData)
      updateCustomTools()
    }
  }
  hideContextMenu()
}

const goBack = () => {
  router.push({ name: 'Home' })
}

const handleModulesUpdated = () => {
  updateCustomTools()
}

const addCustomModule = () => {
  if (openAddModuleModal) {
    openAddModuleModal('/image-tools') // 传入父模块的值
  }
}

onMounted(() => {
  window.addEventListener('modules-updated', handleModulesUpdated)
})

onUnmounted(() => {
  window.removeEventListener('modules-updated', handleModulesUpdated)
})
</script>

<template>
  <div class="image-tools-container">
    <ToolsContainer title="图片工具" @goBack="goBack">
      <ToolItem
        v-for="tool in allImageTools"
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
      <router-link to="/image-resizer" class="tool-item">
        <div class="tool-icon">🔧</div>
        <div class="tool-name">图片大小调整</div>
      </router-link>
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
.image-tools-container {
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
