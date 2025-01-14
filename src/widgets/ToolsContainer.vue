<template>
  <div class="tools-container">
    <!-- <div class="navigation-bar">
      <button class="back-button" @click="$emit('goBack')">返回</button>
      <h2 class="page-title">{{ title }}</h2>
    </div> -->
    <div class="tools-grid">
      <slot></slot>
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  title: string
}>()

defineEmits<{
  (e: 'goBack'): void
}>()
</script>

<style scoped>
.tools-container {
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

.page-title {
  margin-left: 20px;
  font-size: 1.5em;
  color: #2c3e50;
}

.tools-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 20px;
  padding: 20px;
  overflow-y: auto;
  max-width: 1000px;
}

@media (max-width: 1000px) {
  .tools-grid {
    grid-template-columns: repeat(3, 1fr);
  }
}

@media (max-width: 768px) {
  .tools-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 480px) {
  .tools-grid {
    grid-template-columns: 1fr;
  }
}
</style>
