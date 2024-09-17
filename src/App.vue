<script setup lang="ts">
import { ref, computed, onMounted, watch, provide } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import router from './router'

const route = useRoute()

const searchQuery = ref('')

interface CustomModule {
  title: string
  value: string
  url: string
}

interface TitleModule {
  title: string
  value: string
  children: CustomModule[]
}

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
const showEditModuleModal = ref(false)
const editingModule = ref<CustomModule | null>(null)
const editModuleTitle = ref('')
const editModuleUrl = ref('')

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
    window.open(path, '_blank')
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

const openAddModuleModal = () => {
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
  }
}

const openEditModuleModal = (module: CustomModule) => {
  editingModule.value = module
  editModuleTitle.value = module.title
  editModuleUrl.value = module.url
  showEditModuleModal.value = true
}

const saveEditModule = () => {
  if (editingModule.value && editModuleTitle.value && editModuleUrl.value) {
    editingModule.value.title = editModuleTitle.value
    editingModule.value.url = editModuleUrl.value
    showEditModuleModal.value = false
    saveModules()
  }
}

const deleteModule = (moduleToDelete: CustomModule) => {
  titles.value.forEach((title) => {
    title.children = title.children.filter((child) => child.value !== moduleToDelete.value)
  })
  saveModules()
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
provide('openEditModuleModal', openEditModuleModal)
provide('deleteModule', deleteModule)

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
    window.open(child.url, '_blank')
  } else {
    router.push(child.url)
  }
  activeSubIndex.value = currentChildren.value.findIndex((c) => c.value === child.value)
}
</script>

<template>
  <div class="outer-container">
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
          <li class="add-module" @click="openAddModuleModal">+ 添加自定义模块</li>
        </ul>
      </div>
      <div class="content-area">
        <router-view v-slot="{ Component }">
          <transition name="fade" mode="out-in">
            <component :is="Component" />
          </transition>
        </router-view>

        <!-- 添加子模块显示区域 -->
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
      <select v-model="newModuleParent">
        <option value="">选择父模块</option>
        <option v-for="title in titles" :key="title.value" :value="title.value">
          {{ title.title }}
        </option>
      </select>
      <button @click="addCustomModule">添加</button>
      <button @click="showAddModuleModal = false">取消</button>
    </div>
  </div>

  <!-- 添加编辑自定义模块的模态框 -->
  <div v-if="showEditModuleModal" class="modal">
    <div class="modal-content">
      <h2>编辑自定义模块</h2>
      <input v-model="editModuleTitle" placeholder="模块标题" />
      <input v-model="editModuleUrl" placeholder="工具网址" />
      <button @click="saveEditModule">保存</button>
      <button @click="showEditModuleModal = false">取消</button>
    </div>
  </div>
</template>

<style scoped>
.outer-container {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 97vh;
  background-color: #f5f7fa;
  overflow: hidden;
}

.container {
  display: flex;
  max-width: 1200px;
  width: 100%;
  height: 90vh;
  background-color: #ffffff;
  box-shadow: 0 0 20px rgba(0, 0, 0, 0.1);
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
  position: relative;
  overflow: hidden;
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

.add-module {
  cursor: pointer;
  color: #3498db;
  padding: 15px 20px;
}

.add-module:hover {
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

.title-list li ul {
  margin-left: 20px;
}

.title-list li ul li {
  padding: 10px 15px;
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
