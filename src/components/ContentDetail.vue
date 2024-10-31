<script setup lang="ts">
import { useRoute, useRouter } from 'vue-router'

const route = useRoute()
const router = useRouter()

const goBack = () => {
  router.back()
}
</script>

<template>
  <div class="content-detail">
    <div class="navigation-bar">
      <button class="back-button" @click="goBack">返回</button>
      <h2 class="detail-title">内容详情 {{ route.params.id }}</h2>
    </div>
    <div class="detail-content">
      <!-- 这里添加详细内容 -->
      <p>这是内容 {{ route.params.id }} 的详细信息。</p>
      <p>您可以在这里添加更多的内容，如描述、图片、列表等。</p>
    </div>
  </div>
</template>

<style scoped>
.content-detail {
  display: flex;
  flex-direction: column;
  height: 100%;
}

.navigation-bar {
  display: flex;
  align-items: center;
  padding: 10px 20px;
  background-color: #f8f9fa;
  border-bottom: 1px solid #e9ecef;
}

.back-button {
  padding: 8px 16px;
  background-color: #3498db;
  color: #ffffff;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.3s ease;
}

.back-button:hover {
  background-color: #2980b9;
}

.detail-title {
  margin-left: 20px;
  font-size: 1.2em;
  color: #2c3e50;
}

.detail-content {
  flex: 1;
  padding: 20px;
  overflow-y: auto;
}
</style>