<script setup lang="ts">
defineProps<{
  title: string
  imageSrc: string
  onClick: () => void
}>()
</script>

<template>
  <div class="tool-item" @click="onClick">
    <img :src="imageSrc" :alt="title" class="tool-image">
    <h3 class="tool-title">{{ title }}</h3>
  </div>
</template>

<style scoped>
.tool-item {
  background-color: #ffffff;
  border: 1px solid #e9ecef;
  border-radius: 8px;
  padding: 20px;
  text-align: center;
  cursor: pointer;
  transition: box-shadow 0.3s ease;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.tool-item:hover {
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

.tool-image {
  width: 64px;
  height: 64px;
  margin-bottom: 10px;
}

.tool-title {
  margin: 0;
  font-size: 1.2em;
  color: #2c3e50;
}
</style>