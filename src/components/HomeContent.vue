<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()

const contentItems = ref(
  Array.from({ length: 24 }, (_, index) => ({
    id: index + 1,
    title: `内容${index + 1}`,
    icon: 'mdi-star'
  }))
)

const navigateToContent = (id: number) => {
  router.push({ name: 'ContentDetail', params: { id: id.toString() } })
}
</script>

<template>
  <div class="content-wrapper">
    <div class="content-grid">
      <div v-for="item in contentItems" :key="item.id" class="grid-item" @click="navigateToContent(item.id)">
        <span class="material-icons">{{ item.icon }}</span>
        <div class="item-title-wrapper">
          <span class="item-title">{{ item.title }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.content-wrapper {
  height: 100%;
  overflow-y: auto;
  padding: 20px;
  box-sizing: border-box;
}

.content-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(calc(25% - 15px), 1fr));
  gap: 20px;
  padding-bottom: 20px; /* 保持底部内边距 */
}

.grid-item {
  aspect-ratio: 1 / 1;
  background-color: #ffffff;
  border-radius: 8px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  align-items: center;
  padding: 15px;
  box-sizing: border-box;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  cursor: pointer;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

.grid-item:hover {
  transform: translateY(-5px);
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.2);
}

.material-icons {
  font-size: 36px;
  color: #3498db;
  flex-grow: 1;
  display: flex;
  align-items: center;
}

.item-title-wrapper {
  height: 40px; /* 固定高度 */
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
}

.item-title {
  font-size: 14px;
  color: #2c3e50;
  text-align: center;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 100%;
}
</style>