<script setup lang="ts">
import { ref } from 'vue'
import { useRouter, useRoute } from 'vue-router'

const router = useRouter()
const route = useRoute()

const titles = ref([
  { title: '常用工具', value: 'Home' },
  { title: '图片工具', value: 'ImageTools' },
  { title: 'PDF工具', value: 'Home' }, // 暂时导航到Home
  { title: '颜色工具', value: 'ColorTools' },
  { title: 'Android工具', value: 'AndroidTools' }
])

const activeIndex = ref(0)

const navigateTo = (index: number) => {
  activeIndex.value = index
  router.push({ name: titles.value[index].value })
}

// 根据当前路由更新activeIndex
const updateActiveIndex = () => {
  const currentRouteName = route.name as string
  const index = titles.value.findIndex((title) => title.value === currentRouteName)
  if (index !== -1) {
    activeIndex.value = index
  }
}

// 监听路由变化
router.afterEach(updateActiveIndex)

// 初始化activeIndex
updateActiveIndex()
</script>

<template>
  <div class="outer-container">
    <div class="container">
      <div class="title-list">
        <ul>
          <li
            v-for="(title, index) in titles"
            :key="index"
            @click="navigateTo(index)"
            :class="{ active: index === activeIndex }"
          >
            {{ title.title }}
          </li>
        </ul>
      </div>
      <div class="content-area">
        <router-view v-slot="{ Component }">
          <transition name="fade" mode="out-in">
            <component :is="Component" />
          </transition>
        </router-view>
      </div>
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
</style>
