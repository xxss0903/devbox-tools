<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()

const titles = ref([
  'JavaScript开发工具',
  '图片工具',
  'PDF工具',
  '常用组件',
  'JavaScript工具类'
])

const navigateTo = (index: number) => {
  if (index === 0) {
    router.push({ name: 'Home' })
  } else if (index === 1) {
    router.push({ name: 'ImageTools' })
  } else {
    // 处理其他导航
  }
}
</script>

<template>
  <div class="outer-container">
    <div class="container">
      <div class="title-list">
        <ul>
          <li v-for="(title, index) in titles" :key="index" @click="navigateTo(index)">{{ title }}</li>
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
  transition: background-color 0.3s ease, color 0.3s ease;
  border-radius: 8px;
}

.title-list li:hover {
  background-color: #e9ecef;
  color: #3498db;
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
