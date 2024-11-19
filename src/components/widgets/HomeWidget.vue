<template>
  <div class="home-widget" @click="goHome">
    <el-icon><HomeFilled /></el-icon>
    <span>首页</span>
  </div>
</template>

<script setup lang="ts">
import { HomeFilled } from '@element-plus/icons-vue'
import { useRouter } from 'vue-router'

const router = useRouter()

const goHome = () => {
  router.push({ name: 'Home' })
}
</script>

<style scoped>
.home-widget {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.3s ease;
  background: var(--el-color-primary-light-9);
}

.home-widget:hover {
  background: var(--el-color-primary-light-8);
}

.home-widget .el-icon {
  font-size: 18px;
  color: var(--el-color-primary);
}

.home-widget span {
  font-size: 14px;
  color: var(--el-color-primary);
}
</style> 