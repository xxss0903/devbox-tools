<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { fabric } from 'fabric'
import NavigationBar from './NavigationBar.vue'

const stampCanvas = ref<fabric.Canvas | null>(null)
const companyName = ref('个人实用科技有限公司') // 默认公司名称
const circleSize = ref(50) // 圆形大小的绑定
const centerText = ref('我是抬头字') // 中心文字
const starSize = ref(30) // 五角星大小
const canvasHistory = ref<string[]>([])

onMounted(() => {
  stampCanvas.value = new fabric.Canvas('stamp-canvas', {
    width: 400,
    height: 400,
    backgroundColor: 'white'
  })
  saveCanvasState() // 保存初始状态
})

const saveCanvasState = () => {
  if (stampCanvas.value) {
    const json = JSON.stringify(stampCanvas.value.toJSON())
    canvasHistory.value.push(json)
  }
}

const drawStamp = () => {
  if (!stampCanvas.value) return

  stampCanvas.value.clear()

  const centerX = 200
  const centerY = 200

  // 绘制外圆
  const outerCircle = new fabric.Circle({
    radius: circleSize.value,
    fill: 'transparent',
    stroke: 'red',
    strokeWidth: 2,
    left: centerX,
    top: centerY,
    originX: 'center',
    originY: 'center'
  })

  // 绘制内圆
  const innerCircle = new fabric.Circle({
    radius: circleSize.value - 10,
    fill: 'transparent',
    stroke: 'red',
    strokeWidth: 1,
    left: centerX,
    top: centerY,
    originX: 'center',
    originY: 'center'
  })

  // 绘制五角星
  const star = new fabric.Path(
    'M 0 -50 L 14.5 -15.5 L 47.5 -15.5 L 23.5 5.5 L 38 40 L 0 20 L -38 40 L -23.5 5.5 L -47.5 -15.5 L -14.5 -15.5 Z',
    {
      fill: 'red',
      left: centerX,
      top: centerY,
      scaleX: starSize.value / 100,
      scaleY: starSize.value / 100,
      originX: 'center',
      originY: 'center'
    }
  )

  // 绘制公司名称
  const textRadius = circleSize.value - 15
  const textPath = new fabric.Path(
    `M ${centerX - textRadius}, ${centerY} A ${textRadius},${textRadius} 0 1,1 ${centerX + textRadius},${centerY}`,
    {
      fill: 'transparent',
      stroke: 'transparent'
    }
  )

  const companyText = new fabric.Text(companyName.value, {
    fontSize: 16,
    fill: 'red',
    fontFamily: 'SimSun',
    originX: 'center',
    originY: 'center',
    left: centerX,
    top: centerY
  })

  companyText.set({
    path: textPath,
    pathSide: 'left',
    pathStartOffset: 0
  })

  // 绘制中心文字
  const centerTextField = new fabric.Text(centerText.value, {
    fontSize: 20,
    fill: 'red',
    fontFamily: 'SimSun',
    left: centerX,
    top: centerY + 30,
    originX: 'center',
    originY: 'center'
  })

  stampCanvas.value.add(outerCircle, innerCircle, star, companyText, centerTextField)
  stampCanvas.value.renderAll()
  saveCanvasState()
}

const clearCanvas = () => {
  stampCanvas.value?.clear() // 清除画布上的所有内容
  saveCanvasState() // 在清除后保存状态
}

const undo = () => {
  if (canvasHistory.value.length > 1) {
    canvasHistory.value.pop() // 移除当前状态
    const previousState = canvasHistory.value[canvasHistory.value.length - 1]
    stampCanvas.value?.loadFromJSON(JSON.parse(previousState), () => {
      stampCanvas.value?.renderAll()
    })
  }
}
</script>

<template>
  <div class="stamp-editor">
    <NavigationBar title="印章编辑器" />
    <div class="toolbar">
      <input v-model="companyName" placeholder="输入公司名称" class="text-input" />
      <input v-model="centerText" placeholder="输入中心文字" class="text-input" />
      <input v-model.number="circleSize" type="number" placeholder="圆形大小" class="size-input" />
      <input v-model.number="starSize" type="number" placeholder="五角星大小" class="size-input" />
      <button @click="drawStamp" class="tool-button">绘制印章</button>
      <button @click="clearCanvas" class="tool-button">清除所有</button>
      <button @click="undo" class="tool-button">撤销</button>
    </div>
    <canvas id="stamp-canvas" class="canvas-full"></canvas>
    <!-- 添加类以撑满 -->
  </div>
</template>

<style scoped>
.text-input,
.size-input {
  margin-right: 10px;
  padding: 5px;
}

.canvas-full {
  width: 100%;
  height: 100%;
}
</style>
