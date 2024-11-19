<template>
  <div class="page-header">
    <div class="header-left">
      <el-button 
        type="primary" 
        plain
        size="small"
        @click="goHome"
      >
        <el-icon><HomeFilled /></el-icon>
        返回首页
      </el-button>
      <div class="divider"></div>
      <h2 class="page-title">{{ title }}</h2>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'
import { HomeFilled } from '@element-plus/icons-vue'

defineProps<{
  title: string
}>()

const router = useRouter()

const goHome = () => {
  router.push({ name: 'Home' })
}
</script>

<style scoped>
.page-header {
  padding: 16px 20px;
  background: var(--el-bg-color);
  border-bottom: 1px solid var(--el-border-color-light);
  margin-bottom: 20px;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 16px;
}

.divider {
  width: 1px;
  height: 24px;
  background: var(--el-border-color);
}

.page-title {
  margin: 0;
  font-size: 18px;
  font-weight: 500;
  color: var(--el-text-color-primary);
}
</style> 