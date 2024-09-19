<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { fabric } from 'fabric'

const stampCanvas = ref<fabric.Canvas | null>(null)

onMounted(() => {
  stampCanvas.value = new fabric.Canvas('stamp-canvas', {
    width: 300,
    height: 300,
    backgroundColor: 'white'
  })
})

onUnmounted(() => {
  stampCanvas.value?.dispose()
})

const addText = () => {
  const text = new fabric.IText('印章文字', {
    left: 50,
    top: 50,
    fontSize: 20,
    fill: 'red'
  })
  stampCanvas.value?.add(text)
}

const addCircle = () => {
  const circle = new fabric.Circle({
    radius: 50,
    fill: 'transparent',
    stroke: 'red',
    strokeWidth: 2,
    left: 100,
    top: 100
  })
  stampCanvas.value?.add(circle)
}

const saveStamp = () => {
  if (stampCanvas.value) {
    const dataURL = stampCanvas.value.toDataURL({
      format: 'png',
      quality: 1
    })
    // 这里可以添加保存逻辑,例如发送到服务器或保存到本地
    console.log('印章已保存:', dataURL)
  }
}
</script>

<template>
  <div class="stamp-editor">
    <div class="toolbar">
      <button @click="addText" class="tool-button">添加文字</button>
      <button @click="addCircle" class="tool-button">添加圆形</button>
      <button @click="saveStamp" class="tool-button">保存印章</button>
    </div>
    <canvas id="stamp-canvas"></canvas>
  </div>
</template>

<style scoped>
.stamp-editor {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 20px;
}

.toolbar {
  margin-bottom: 20px;
  display: flex;
  gap: 10px;
}

.tool-button {
  padding: 8px 12px;
  background-color: #4CAF50;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.3s;
}

.tool-button:hover {
  background-color: #45a049;
}

#stamp-canvas {
  border: 1px solid #ccc;
  max-width: 100%;
}
</style>