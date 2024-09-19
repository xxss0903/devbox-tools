<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { fabric } from 'fabric'
import NavigationBar from './NavigationBar.vue'

const stampCanvas = ref<fabric.Canvas | null>(null)
const companyName = ref('公司名称') // 公司名称输入框的绑定
const circleSize = ref(50) // 圆形大小的绑定

onMounted(() => {
  stampCanvas.value = new fabric.Canvas('stamp-canvas', {
    width: 300,
    height: 300,
    backgroundColor: 'white'
  })
})

const drawStamp = () => {
  const circle = new fabric.Circle({
    radius: circleSize.value,
    fill: 'transparent',
    stroke: 'red',
    strokeWidth: 2,
    left: 100,
    top: 100,
           originX: 'center',
                        originY: 'center'
  });

  const radius = circleSize.value; // 文字距离圆心的半径
  const angleStep = 180 / companyName.value.length; // 每个字符的角度

  // 创建一个文本组以放置公司名称
  const textGroup = new fabric.Group([], {
    left: 100,
    top: 100,
    originX: 'center',
    originY: 'center'
  });

  for (let i = 0; i < companyName.value.length; i++) {
    const char = new fabric.Text(companyName.value[i], {
      left: 100,
      top: 100,
                        fontFamily:'SumSun',
                        fontSize: 14,
                        fill:'red',
                        angle:-36,
                        originX: 'center',
                        originY: 'center'
    });

    const angle = angleStep * i; // 当前字符的角度
    const x = (radius - 20) * Math.cos((angle * Math.PI) / 180); // 计算 x 坐标
    const y = (radius - 20) * Math.sin((angle * Math.PI) / 180); // 计算 y 坐标

    char.set({ left: x, top: y, angle: angle - 90 }); // 设置字符位置和角度
    textGroup.add(char); // 将字符添加到文本组
  }

  stampCanvas.value?.add(textGroup); // 添加文本组到画布
  stampCanvas.value?.add(circle); // 添加圆圈到画布
}

const clearCanvas = () => {
  stampCanvas.value?.clear(); // 清除画布上的所有内容
}
</script>

<template>
  <div class="stamp-editor">
    <NavigationBar title="印章编辑器" />
    <div class="toolbar">
      <input v-model="companyName" placeholder="输入公司名称" class="text-input" />
      <input v-model.number="circleSize" type="number" placeholder="圆形大小" class="size-input" />
      <button @click="drawStamp" class="tool-button">绘制印章</button>
      <button @click="clearCanvas" class="tool-button">清除所有</button>
    </div>
    <canvas id="stamp-canvas" class="canvas-full"></canvas> <!-- 添加类以撑满 -->
  </div>
</template>

<style scoped>
.text-input, .size-input {
  margin-right: 10px;
  padding: 5px;
}

.canvas-full {
  width: 100%;
  height: 100%;
}
</style>