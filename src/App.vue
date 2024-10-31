<script setup lang="ts">
import { ref, computed, onMounted, watch, provide } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import router from './router'
import type { CustomModule, TitleModule } from './types/modules'
import WidgetComponent from './components/WidgetComponent.vue'
import type { title } from 'process'

const route = useRoute()
const searchQuery = ref('')

const defaultImageTools = [
  {
    title: '图片压缩',
    value: 'ImageCompressor',
    url: 'https://img.icons8.com/?size=100&id=USMo5UMGEvMw&format=png&color=000000'
  },
  {
    title: 'PNG转ICO',
    value: 'PngToIco',
    url: 'https://img.icons8.com/?size=100&id=H6SA7amfKduZ&format=png&color=000000'
  },
  {
    title: '图片Base64转换',
    value: 'ImageBase64Converter',
    url: 'https://img.icons8.com/?size=100&id=WPr0mrffLj6D&format=png&color=000000'
  },
  {
    title: '图像裁剪',
    value: 'ImageCropper',
      url: 'https://img.icons8.com/?size=100&id=qxnheTBF0af8&format=png&color=000000'
  },
  {
    title: 'Icons8',
    value: 'Icons8Viewer',
    url: 'https://img.icons8.com/?size=100&id=118523&format=png&color=000000'
  },
  {
    title: '图片圆角',
    value: 'ImageRounder',
    url: 'https://img.icons8.com/?size=100&id=0uYcfoG9OUaw&format=png&color=000000'
  },
  {
    title: '屏幕截图(CTR+ALT+C)',
    value: 'ScreenshotTool',
    url: 'https://img.icons8.com/?size=100&id=112798&format=png&color=000000'
  },
  {
    title: 'Svg渲染',
    value: 'SvgEditor',
    url: 'https://img.icons8.com/?size=100&id=57475&format=png&color=000000'
  },
  {
    title: '印章编辑器',
    value: 'StampEditor',
    url: 'https://img.icons8.com/?size=100&id=22964&format=png&color=000000'
  },
  {
    title: '图片大小调整',
    value: 'ImageResizer',
    url: 'https://img.icons8.com/?size=100&id=J2af-td1smV_&format=png&color=000000'
  }
]

const defaultAndroidTools = [
  {
    title: 'Android工具',
    value: 'AndroidTools',
    url: 'https://img.icons8.com/?size=100&id=J2af-td1smV_&format=png&color=000000'
  }
]
const defaultPdfTools = [
  {
    title: 'PDF结构工具',
    value: 'PDFBoxApp',
    url: 'https://img.icons8.com/?size=100&id=USMo5UMGEvMw&format=png&color=000000'
  }
]
const defaultColorTools = [{
    title: '颜色工具',
    value: 'TransparencyConverter',
    url: 'https://img.icons8.com/?size=100&id=24C4lD5fvL8K&format=png&color=000000'
  }
]
const defaultCommonTools =  [
  {
    title: '编码/解码转换',
    value: 'CodeConverter',
    url: 'https://img.icons8.com/?size=100&id=12455&format=png&color=000000'
  },
  {
    title: '工作日记',
    value: 'WorkDiary',
    url: 'https://img.icons8.com/?size=100&id=64503&format=png&color=000000'
  },
  {
    title: '粘贴板管理',
    value: 'ClipboardManager',
    url: 'https://img.icons8.com/?size=100&id=67345&format=png&color=000000'
  },
  {
    title: '计算器',
    value: 'Calculator',
    url: 'https://img.icons8.com/?size=100&id=41LOFTWPsRas&format=png&color=000000'
  },
  {
    title: '休息提醒',
    value: 'ScreenBlocker',
    url: 'https://img.icons8.com/?size=100&id=13841&format=png&color=000000'
  },
  {
    title: '时间戳工具',
    value: 'DateTools',
    url: 'https://img.icons8.com/?size=100&id=b8BSnWwKGHNv&format=png&color=000000'
  }
]
// 基础导航数据
const titles = ref<TitleModule[]>([
  { title: '常用工具', value: '/', children: defaultCommonTools },
  { title: '图片工具', value: '/image-tools', children: defaultImageTools },
  { title: 'PDF工具', value: '/pdf-tools', children: defaultPdfTools },
  { title: '颜色工具', value: '/color-tools', children: defaultColorTools },
  { title: 'Android工具', value: '/android-tools', children: defaultAndroidTools }
])

// 标签页管理
interface Tab {
  path: string
  title: string
}

const openTabs = ref<Tab[]>([])
const currentTab = ref('')

// 模态框状态
const showAddModuleModal = ref(false)
const newModuleTitle = ref('')
const newModuleUrl = ref('')
const newModuleParent = ref('')

// 路由相关计算属性
const allRoutes = computed(() => {
  return router.getRoutes().filter((route) => route.meta?.searchable !== false)
})

const filteredRoutes = computed(() => {
  if (!searchQuery.value) return []
  const query = searchQuery.value.toLowerCase()
  return allRoutes.value.filter((route) => {
    const keywords = (route.meta?.keywords as string[]) || []
    return (
      keywords.some((keyword) => keyword.toLowerCase().includes(query)) ||
      route.name?.toString().toLowerCase().includes(query) ||
      (route.meta?.title as string)?.toLowerCase().includes(query)
    )
  })
})

// 导航函数
const navigateTo = (path: string) => {
  console.log('navigateTo', path)
  if (path.startsWith('http')) {
    router.push({
      name: 'CustomModuleViewer',
      query: {
        url: path,
        title: '自定义模块'
      }
    })
  } else {
    router.push({ name: path })
  }
  searchQuery.value = ''
}

const isActiveTab = (path: string) => {
  return currentTab.value === path
}

// 模块管理函数
const openAddModuleModal = (parent: string) => {
  newModuleParent.value = parent
  showAddModuleModal.value = true
}

const addCustomModule = () => {
  if (newModuleTitle.value && newModuleUrl.value && newModuleParent.value) {
    const newModule: CustomModule = {
      title: newModuleTitle.value,
      value: `custom-${Date.now()}`,
      url: newModuleUrl.value
    }
    const parentIndex = titles.value.findIndex((title) => title.value === newModuleParent.value)
    if (parentIndex !== -1) {
      titles.value[parentIndex].children.push(newModule)
    }
    newModuleTitle.value = ''
    newModuleUrl.value = ''
    newModuleParent.value = ''
    showAddModuleModal.value = false
    saveModules()
    window.dispatchEvent(new CustomEvent('modules-updated'))
  }
}

const deleteModule = (moduleToDelete: CustomModule) => {
  titles.value = titles.value.map((title) => ({
    ...title,
    children: title.children.filter((child) => (child.title !== moduleToDelete.name && child.title !== moduleToDelete.title))
  }))
  console.log('delete module in app.vue', moduleToDelete)
  saveModules()
  window.dispatchEvent(new CustomEvent('modules-updated'))
}

// 本地存储
const saveModules = () => {
  localStorage.setItem('modules', JSON.stringify(titles.value))
}

const loadModules = () => {
  const savedModules = localStorage.getItem('modules')
  console.log('savedModules', savedModules, titles.value)
  if (savedModules) {
    titles.value = JSON.parse(savedModules)
  }
}

// 标签页管理
watch(() => route.path, (newPath) => {
  const routeRecord = router.getRoutes().find(r => r.path === newPath)
  if (!routeRecord) return

  const title = routeRecord.meta?.title as string || routeRecord.name as string
  
  if (!openTabs.value.find(tab => tab.path === newPath)) {
    openTabs.value.push({ path: newPath, title })
  }
  currentTab.value = newPath
}, { immediate: true })

const switchTab = (path: string) => {
  router.push(path)
}

const closeTab = (path: string) => {
  const index = openTabs.value.findIndex(tab => tab.path === path)
  if (index === -1) return

  openTabs.value.splice(index, 1)
  
  if (path === currentTab.value) {
    if (openTabs.value.length > 0) {
      const newTab = openTabs.value[index] || openTabs.value[index - 1]
      router.push(newTab.path)
    } else {
      router.push('/')
    }
  }
}

// 生命周期
onMounted(() => {
  loadModules()
  console.log('titles', titles.value)
})

// 监听存储变化
watch(titles, () => {
  saveModules()
}, { deep: true })

// 提供依赖注入
provide('titles', titles)
provide('deleteModule', deleteModule)
provide('openAddModuleModal', openAddModuleModal)

// 在script setup部分添加新的ref
const expandedMenus = ref<string[]>([])

// 添加切换展开/收缩的方法
const toggleMenu = (value: string) => {
  const index = expandedMenus.value.indexOf(value)
  if (index === -1) {
    expandedMenus.value.push(value)
  } else {
    expandedMenus.value.splice(index, 1)
  }
}

// 判断菜单是否展开的方法
const isExpanded = (value: string) => {
  return expandedMenus.value.includes(value)
}
</script>

<template>
  <div class="outer-container">
    <WidgetComponent />
    <div class="container">
      <!-- 侧边导航 -->
      <div class="title-list">
        <div class="search-bar">
          <input v-model="searchQuery" placeholder="搜索功能..." type="text" />
        </div>
        <ul v-if="searchQuery" class="search-results">
          <li v-for="route in filteredRoutes" :key="route.path" @click="navigateTo(route.path)">
            {{ route.meta?.title || route.name }}
          </li>
        </ul>
        <ul v-else>
          <li v-for="(title, index) in titles" :key="index">
            <div 
              class="menu-item"
              :class="{ active: isActiveTab(title.value) }"
              @click="toggleMenu(title.value)"
            >
              <span>{{ title.title }}</span>
              <span class="arrow" :class="{ expanded: isExpanded(title.value) }">▶</span>
            </div>
            <!-- 子菜单 -->
            <transition name="slide">
              <ul v-if="isExpanded(title.value)" class="submenu">
                <li
                  v-for="child in title.children"
                  :key="child.value"
                  @click.stop="navigateTo(child.value || child.url)"
                  class="submenu-item"
                >
                  {{ child.title }}
                </li>
                <li class="add-module" @click.stop="openAddModuleModal(title.value)">
                  + 添加模块
                </li>
              </ul>
            </transition>
          </li>
        </ul>
      </div>

      <!-- 主内容区 -->
      <div class="content-area">
        <div class="tabs-container">
          <div class="tabs">
            <div 
              v-for="tab in openTabs" 
              :key="tab.path"
              class="tab"
              :class="{ active: isActiveTab(tab.path) }"
              @click="switchTab(tab.path)"
            >
              <span class="tab-title">{{ tab.title }}</span>
              <span class="close-tab" @click.stop="closeTab(tab.path)">×</span>
            </div>
          </div>
        </div>

        <div class="tab-content">
          <router-view v-slot="{ Component }">
            <transition name="fade" mode="out-in">
              <keep-alive>
                <component :is="Component" />
              </keep-alive>
            </transition>
          </router-view>
        </div>
      </div>
    </div>
  </div>

  <!-- 模态框 -->
  <div v-if="showAddModuleModal" class="modal">
    <div class="modal-content">
      <h2>添加自定义模块</h2>
      <input v-model="newModuleTitle" placeholder="模块标题" />
      <input v-model="newModuleUrl" placeholder="工具网址" />
      <button @click="addCustomModule">添加</button>
      <button @click="showAddModuleModal = false">��消</button>
    </div>
  </div>
</template>

<style scoped>
.outer-container {
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  align-items: center;
  height: 97vh;
  background-color: #f5f7fa;
  overflow: hidden;
}

.container {
  display: flex;
  max-width: 1400px;
  width: 100%;
  height: calc(90vh - 60px); /* 减去小组件容器的高度 */
  background-color: #ffffff;
  box-shadow: 0 0 20px rgba(0, 0, 0, 0.1);
  border-radius: 10px;
  margin-top: 10px;
}

.title-list {
  width: 240px;
  padding: 20px;
  background-color: #f8f9fa;
  overflow-y: auto;
  border-right: 1px solid #e9ecef;
}

.title-list ul {
  list-style-type: none;
  padding: 0;
  margin: 0;
}

.title-list li {
  color: #34495e;
  padding: 15px 20px;
  cursor: pointer;
  transition:
    background-color 0.3s ease,
    color 0.3s ease;
  border-radius: 8px;
}

.title-list li:hover {
  background-color: #e9ecef;
  color: #3498db;
}

.title-list li.active {
  background-color: #3498db;
  color: #ffffff;
}

.content-area {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.tabs-container {
  background: #f8f9fa;
  border-bottom: 1px solid #e9ecef;
}

.tabs {
  display: flex;
  gap: 2px;
  padding: 8px 16px 0;
  overflow-x: auto;
  scrollbar-width: thin;
}

.tab {
  padding: 8px 32px 8px 16px;
  background: #e9ecef;
  border-radius: 8px 8px 0 0;
  cursor: pointer;
  position: relative;
  white-space: nowrap;
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  color: #666;
  transition: all 0.3s ease;
}

.tab.active {
  background: white;
  color: #3498db;
  border-bottom: 2px solid #3498db;
}

.tab:hover {
  background: #f8f9fa;
}

.close-tab {
  position: absolute;
  right: 8px;
  top: 50%;
  transform: translateY(-50%);
  width: 16px;
  height: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  font-size: 14px;
  color: #999;
  transition: all 0.3s ease;
}

.close-tab:hover {
  background: rgba(0, 0, 0, 0.1);
  color: #666;
}

.tab-content {
  flex: 1;
  overflow-y: auto;
  background: white;
}

/* 添加滚动条样式 */
.tabs::-webkit-scrollbar {
  height: 4px;
}

.tabs::-webkit-scrollbar-track {
  background: #f1f1f1;
}

.tabs::-webkit-scrollbar-thumb {
  background: #ccc;
  border-radius: 2px;
}

.tabs::-webkit-scrollbar-thumb:hover {
  background: #999;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.search-bar {
  margin-bottom: 15px;
}

.search-bar input {
  width: 100%;
  padding: 8px;
  border: 1px solid #e9ecef;
  border-radius: 4px;
}

.search-results {
  list-style-type: none;
  padding: 0;
  margin: 0;
}

.search-results li {
  padding: 10px;
  cursor: pointer;
  transition: background-color 0.3s ease;
}

.search-results li:hover {
  background-color: #e9ecef;
}

.modal {
  position: fixed;
  z-index: 1000;
  left: 0;
  top: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.4);
  display: flex;
  justify-content: center;
  align-items: center;
}

.modal-content {
  background-color: #fefefe;
  padding: 20px;
  border-radius: 5px;
  width: 300px;
}

.modal-content input {
  width: 100%;
  margin-bottom: 10px;
  padding: 5px;
}

.modal-content select {
  width: 100%;
  margin-bottom: 10px;
  padding: 5px;
}

.modal-content button {
  margin-right: 10px;
}

/* 添加子模块显示区域的样式 */
.sub-modules {
  margin-top: 20px;
  padding: 15px;
  background-color: #f8f9fa;
  border-radius: 8px;
}

.sub-modules h3 {
  margin-bottom: 10px;
  color: #34495e;
}

.sub-modules ul {
  list-style-type: none;
  padding: 0;
}

.sub-modules li {
  padding: 10px 15px;
  cursor: pointer;
  transition: background-color 0.3s ease;
  border-radius: 4px;
}

.sub-modules li:hover {
  background-color: #e9ecef;
}

.sub-modules li.active {
  background-color: #3498db;
  color: #ffffff;
}

.menu-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 15px 20px;
  cursor: pointer;
  transition: all 0.3s ease;
  border-radius: 8px;
}

.menu-item:hover {
  background-color: #e9ecef;
}

.menu-item.active {
  background-color: #3498db;
  color: #ffffff;
}

.arrow {
  transition: transform 0.3s ease;
  font-size: 12px;
}

.arrow.expanded {
  transform: rotate(90deg);
}

.slide-enter-active,
.slide-leave-active {
  transition: all 0.3s ease;
  max-height: 300px;
}

.slide-enter-from,
.slide-leave-to {
  opacity: 0;
  max-height: 0;
  overflow: hidden;
}

.submenu {
  padding-left: 20px;
  margin-top: 5px;
}

.submenu-item {
  padding: 10px 20px !important;
  font-size: 14px;
  color: #666;
}

.submenu-item:hover {
  background-color: #e9ecef;
  color: #3498db;
}

.add-module {
  padding: 10px 20px;
  color: #3498db;
  cursor: pointer;
  font-size: 14px;
}

.add-module:hover {
  background-color: #e9ecef;
}
</style>
