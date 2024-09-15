<script setup lang="ts">
import { defineProps, defineEmits } from 'vue'

const props = defineProps<{
  title: string
}>()

const emit = defineEmits(['goBack'])
</script>

<template>
  <div class="navigation-bar">
    <div class="left-section">
      <button @click="$emit('goBack')" class="back-button">返回</button>
      <h2 class="title">{{ title }}</h2>
    </div>
    <div class="right-section">
      <slot></slot>
    </div>
  </div>
</template>

<style scoped>
.navigation-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background-color: #f8f9fa;
  border-bottom: 1px solid #e9ecef;
  box-sizing: border-box;

  padding: 10px 20px;
}

.left-section {
  display: flex;
  align-items: center;
}

.back-button {
  padding: 8px 16px;
  background-color: #3498db;
  color: #ffffff;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.3s ease;
  margin-right: 15px;
}

.back-button:hover {
  background-color: #2980b9;
}

.title {
  font-size: 1.2em;
  color: #2c3e50;
  margin: 0;
}

.right-section {
  display: flex;
  align-items: center;
}
</style>
