<script setup lang="ts">
import { defineProps, defineEmits } from 'vue'

const props = defineProps<{
  title: string
}>()

const emit = defineEmits<{
  (e: 'goBack'): void
}>()

const goBack = () => {
  emit('goBack')
}
</script>

<template>
  <div class="navigation-bar">
    <button class="back-button" @click="goBack">返回</button>
    <h2 class="detail-title">{{ title }}</h2>
  </div>
</template>

<style scoped>
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
</style>