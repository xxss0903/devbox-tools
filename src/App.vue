<script setup lang="ts">
import { ref, computed, onMounted, watch, provide } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import router from './router'
import type { CustomModule, TitleModule } from './types/modules'
import WidgetComponent from './components/WidgetComponent.vue'

const route = useRoute()

const searchQuery = ref('')

const titles = ref<TitleModule[]>([
  { title: '常用工具', value: '/', children: [] },
  { title: '图片工具', value: '/image-tools', children: [] },
  { title: 'PDF工具', value: '/pdf-tools', children: [] },
  { title: '颜色工具', value: '/color-tools', children: [] },
  { title: 'Android工具', value: '/android-tools', children: [] }
])

const activeIndex = ref(0)
const activeSubIndex = ref(-1)
const showAddModuleModal = ref(false)
const newModuleTitle = ref('')
const newModuleUrl = ref('')
const newModuleParent = ref('')

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

const navigateTo = (path: string) => {
  if (path.startsWith('http')) {
    const width = 1024 // 设置宽度
    const height = 768 // 设置高度
    const left = (screen.width - width) / 2
    const top = (screen.height - height) / 2
    window.open(path, '_blank', `width=${width},height=${height},left=${left},top=${top}`)
  } else {
    router.push(path)
  }
  searchQuery.value = ''
}

const updateActiveIndex = () => {
  const currentPath = route.path
  const index = titles.value.findIndex((title) => title.value === currentPath)
  if (index !== -1) {
    activeIndex.value = index
    activeSubIndex.value = -1
  } else {
    for (let i = 0; i < titles.value.length; i++) {
      const subIndex = titles.value[i].children.findIndex((child: any) => child.url === currentPath)
      if (subIndex !== -1) {
        activeIndex.value = i
        activeSubIndex.value = subIndex
        break
      }
    }
  }
}

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
    // 触发一个自定义事件，通知子组件更新
    window.dispatchEvent(new CustomEvent('modules-updated'))
  }
}

const deleteModule = (moduleToDelete: CustomModule) => {
  console.log('appvue delete module', moduleToDelete.name)
  titles.value = titles.value.map((title) => ({
    ...title,
    children: title.children.filter((child) => child.title !== moduleToDelete.name)
  }))
  saveModules()
  // 触发一个自定义事件，通知子组件更新
  window.dispatchEvent(new CustomEvent('modules-updated'))
}

const saveModules = () => {
  localStorage.setItem('modules', JSON.stringify(titles.value))
}

const loadModules = () => {
  const savedModules = localStorage.getItem('modules')
  if (savedModules) {
    titles.value = JSON.parse(savedModules)
  }
}

// 监听 titles 的变化，当发生变化时保存到 localStorage
watch(
  titles,
  () => {
    saveModules()
  },
  { deep: true }
)

onMounted(() => {
  loadModules()
})

router.afterEach(updateActiveIndex)
updateActiveIndex()

// 提供 titles 给子组件使用
provide('titles', titles)
provide('deleteModule', deleteModule)
provide('openAddModuleModal', openAddModuleModal)

// 添加一个新的计算属性来获取当前选中模块的子模块
const currentChildren = computed(() => {
  if (activeIndex.value >= 0 && activeIndex.value < titles.value.length) {
    return titles.value[activeIndex.value].children
  }
  return []
})

// 添加一个新的函数来处理子模块的导航
const navigateToChild = (child: CustomModule) => {
  if (child.url.startsWith('http')) {
    const width = 1024 // 设置宽度
    const height = 768 // 设置高度
    const left = (screen.width - width) / 2
    const top = (screen.height - height) / 2
    window.open(child.url, '_blank', `width=${width},height=${height},left=${left},top=${top}`)
  } else {
    router.push(child.url)
  }
  activeSubIndex.value = currentChildren.value.findIndex((c) => c.value === child.value)
}

// 添加 tabs 相关的状态
interface Tab {
  path: string
  title: string
}

const openTabs = ref<Tab[]>([])
const currentTab = ref('')

// 监听路由变化，更新 tabs
watch(() => route.path, (newPath) => {
  const routeRecord = router.getRoutes().find(r => r.path === newPath)
  if (!routeRecord) return

  const title = routeRecord.meta?.title as string || routeRecord.name as string
  
  // 检查是否已经存在该 tab
  if (!openTabs.value.find(tab => tab.path === newPath)) {
    openTabs.value.push({
      path: newPath,
      title: title
    })
  }
  currentTab.value = newPath
}, { immediate: true })

// 切换 tab
const switchTab = (path: string) => {
  router.push(path)
}

// 关闭 tab
const closeTab = (path: string) => {
  const index = openTabs.value.findIndex(tab => tab.path === path)
  if (index === -1) return

  openTabs.value.splice(index, 1)
  
  // 如果关闭的是当前 tab，则切换到其他 tab
  if (path === currentTab.value) {
    if (openTabs.value.length > 0) {
      // 切换到前一个或后一个 tab
      const newTab = openTabs.value[index] || openTabs.value[index - 1]
      router.push(newTab.path)
    } else {
      // 如果没有其他 tab，返回首页
      router.push('/')
    }
  }
}
</script>

<template>
  <div class="outer-container">
    <WidgetComponent />
    <div class="container">
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
          <li
            v-for="(title, index) in titles"
            :key="index"
            @click="navigateTo(title.value)"
            :class="{ active: index === activeIndex }"
          >
            {{ title.title }}
          </li>
        </ul>
      </div>
      <div class="content-area">
        <!-- 添加 tabs 区域 -->
        <div class="tabs-container">
          <div class="tabs">
            <div 
              v-for="tab in openTabs" 
              :key="tab.path"
              class="tab"
              :class="{ active: currentTab === tab.path }"
              @click="switchTab(tab.path)"
            >
              <span class="tab-title">{{ tab.title }}</span>
              <span class="close-tab" @click.stop="closeTab(tab.path)">×</span>
            </div>
          </div>
        </div>

        <!-- 修改路由视图区域 -->
        <div class="tab-content">
          <router-view v-slot="{ Component }">
            <transition name="fade" mode="out-in">
              <keep-alive>
                <component :is="Component" />
              </keep-alive>
            </transition>
          </router-view>
        </div>

        <!-- 子模块显示区域移到 tabs 中 -->
        <div v-if="currentChildren.length > 0" class="sub-modules">
          <h3>子模块</h3>
          <ul>
            <li
              v-for="(child, childIndex) in currentChildren"
              :key="child.value"
              @click="navigateToChild(child)"
              :class="{ active: childIndex === activeSubIndex }"
            >
              {{ child.title }}
            </li>
          </ul>
        </div>
      </div>
    </div>
  </div>

  <!-- 添加自定义模块的模态框 -->
  <div v-if="showAddModuleModal" class="modal">
    <div class="modal-content">
      <h2>添加自定义模块</h2>
      <input v-model="newModuleTitle" placeholder="模块标题" />
      <input v-model="newModuleUrl" placeholder="工具网址" />
      <button @click="addCustomModule">添加</button>
      <button @click="showAddModuleModal = false">取消</button>
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
  padding: 20px;
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
</style>
