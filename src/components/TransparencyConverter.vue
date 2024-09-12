<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()

const color = ref('#000000')
const opacity = ref(100)

const rgba = computed(() => {
  const r = parseInt(color.value.slice(1, 3), 16)
  const g = parseInt(color.value.slice(3, 5), 16)
  const b = parseInt(color.value.slice(5, 7), 16)
  const a = opacity.value / 100
  return `rgba(${r}, ${g}, ${b}, ${a.toFixed(2)})`
})

const goBack = () => {
  router.push({ name: 'ColorTools' })
}
</script>

<template>
  <div class="transparency-converter">
    <div class="navigation-bar">
      <button class="back-button" @click="goBack">返回</button>
      <h2 class="detail-title">透明度颜色转换工具</h2>
    </div>
    <div class="converter-content">
      <div class="control-panel">
        <div>
          <label for="color">颜色：</label>
          <input type="color" id="color" v-model="color" />
        </div>
        <div>
          <label for="opacity">不透明度：</label>
          <input type="range" id="opacity" v-model="opacity" min="0" max="100" step="1" />
          {{ opacity }}%
        </div>
      </div>
      <div class="result">
        <h3>转换结果：</h3>
        <div class="color-preview" :style="{ backgroundColor: rgba }"></div>
        <p>RGBA值：{{ rgba }}</p>
      </div>
    </div>
  </div>
</template>

<style scoped>
.transparency-converter {
  display: flex;
  flex-direction: column;
  height: 100%;
  overflow: hidden;
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

.converter-content {
  flex: 1;
  overflow-y: auto;
  padding: 20px;
}

.control-panel {
  margin-bottom: 20px;
}

.control-panel div {
  margin-bottom: 10px;
}

.control-panel label {
  display: inline-block;
  width: 80px;
}

.result {
  background-color: #f8f9fa;
  padding: 20px;
  border-radius: 4px;
}

.color-preview {
  width: 100px;
  height: 100px;
  border: 1px solid #ddd;
  margin-bottom: 10px;
}
</style>