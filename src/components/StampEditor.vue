<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { fabric } from 'fabric'
import NavigationBar from './NavigationBar.vue'

const STANDARD_SIZE_MM = 45 // 标准印章直径，单位毫米
const CANVAS_SIZE = 400 // 画布尺寸，单位像素
const PIXELS_PER_MM = CANVAS_SIZE / (STANDARD_SIZE_MM * 1.2) // 每毫米对应的像素数，留出一些边距

const companyName = ref('个人实用科技有限公司')
const centerText = ref('我是抬头字')
const stampType = ref('公章')
const legalPerson = ref('张三')
const stampCode = ref('1234567890123')
const showStampCode = ref(true)

const circleSize = computed(() => {
  const size = stampType.value === '公章' ? 45 : 40
  return (size * PIXELS_PER_MM) / 2
})

const starSize = computed(() => (9 * PIXELS_PER_MM) / 2) // 五角星外接圆半径
const borderWidth = computed(() => circleSize.value * 0.025)

const companyFontSize = computed(() => {
  // 文字高度为6.5mm-8mm，取中间值7.25mm
  return 7.25 * PIXELS_PER_MM
})

const centerFontSize = computed(() => {
  if (stampType.value === '公章') {
    return 5 * PIXELS_PER_MM // 将公章的抬头字大小从7mm减小到5mm
  } else {
    return 4 * PIXELS_PER_MM // 其他类型的印章稍微减小中心文字大小
  }
})

const stampCanvas = ref<fabric.Canvas | null>(null)
const canvasHistory = ref<string[]>([])

const calculateFontSize = computed(() => {
  const baseSize = 7.25 * PIXELS_PER_MM // 基础字体大小
  const length = companyName.value.length
  return Math.max(baseSize - length * 0.5, baseSize * 0.6) // 最小不小于基础大小的60%
})

const drawStamp = () => {
  if (!stampCanvas.value) return

  stampCanvas.value.clear()

  const centerX = CANVAS_SIZE / 2
  const centerY = CANVAS_SIZE / 2

  // 绘制外圆
  const outerCircle = new fabric.Circle({
    radius: circleSize.value,
    fill: 'transparent',
    stroke: 'red',
    strokeWidth: borderWidth.value,
    left: centerX,
    top: centerY,
    originX: 'center',
    originY: 'center'
  })

  // 绘制内圆
  const innerCircle = new fabric.Circle({
    radius: circleSize.value * 0.8,
    fill: 'transparent',
    stroke: 'red',
    strokeWidth: borderWidth.value / 2,
    left: centerX,
    top: centerY,
    originX: 'center',
    originY: 'center'
  })

  // 绘制五角星
  const starPath = 'M 0 -1 L 0.588 0.809 L -0.951 -0.309 L 0.951 -0.309 L -0.588 0.809 Z'
  const star = new fabric.Path(starPath, {
    fill: 'red',
    left: centerX,
    top: centerY,
    scaleX: starSize.value,
    scaleY: starSize.value,
    originX: 'center',
    originY: 'center'
  })

  // 绘制公司名称
  const textRadius = circleSize.value * 0.75
  const chars = companyName.value.split('')
  const totalAngle = 270 * (Math.PI / 180) // 270度转换为弧度
  const anglePerChar = totalAngle / chars.length

  chars.forEach((char, index) => {
    const angle = Math.PI - Math.PI / 4 + anglePerChar * (index + 0.5) // 从左侧开始，增加PI/2
    const x = centerX + textRadius * Math.cos(angle)
    const y = centerY + textRadius * Math.sin(angle)

    const charText = new fabric.Text(char, {
      fontSize: calculateFontSize.value,
      fill: 'red',
      fontFamily: 'SimSun',
      left: x,
      top: y,
      originX: 'center',
      originY: 'center',
      angle: (angle + Math.PI / 2) * (180 / Math.PI) // 将文字旋转垂直于圆周
    })

    stampCanvas.value.add(charText)
  })

  // 绘制印章编码
  if (showStampCode.value && stampCode.value) {
    const stampCodeFontSize = circleSize.value * 0.05
    const stampCodeRadius = circleSize.value * 0.9
    const stampCodeChars = stampCode.value.split('')
    const stampCodeAnglePerChar = Math.PI / 2 / (stampCodeChars.length + 1) // +1 为了在两端留出一些空间

    stampCodeChars.forEach((char, index) => {
      const angle = (Math.PI * 7) / 4 + Math.PI - stampCodeAnglePerChar * (index + 1) // 从右侧开始，顺时针旋转
      const x = centerX + stampCodeRadius * Math.cos(angle)
      const y = centerY + stampCodeRadius * Math.sin(angle)

      const charText = new fabric.Text(char, {
        fontSize: stampCodeFontSize,
        fill: 'red',
        fontFamily: 'Arial',
        left: x,
        top: y,
        originX: 'center',
        originY: 'center',
        angle: (angle - Math.PI / 2) * (180 / Math.PI) // 将文字旋转垂直于圆周，顺时针方向
      })

      stampCanvas.value.add(charText)
    })
  }

  stampCanvas.value.add(outerCircle, innerCircle, star)
  stampCanvas.value.renderAll()
}

const getCenterText = () => {
  switch (stampType.value) {
    case '财务专用章':
      return '财务专用章'
    case '合同专用章':
      return '合同专用章'
    case '法人名章':
      return legalPerson.value
    case '发票专用章':
      return '发票专用章'
    default:
      return ''
  }
}

const saveCanvasState = () => {
  if (stampCanvas.value) {
    const json = JSON.stringify(stampCanvas.value.toJSON())
    canvasHistory.value.push(json)
  }
}

const clearCanvas = () => {
  stampCanvas.value?.clear()
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

onMounted(() => {
  stampCanvas.value = new fabric.Canvas('stamp-canvas', {
    width: CANVAS_SIZE,
    height: CANVAS_SIZE,
    backgroundColor: 'white'
  })
  drawStamp() // 初始绘制印章
  saveCanvasState() // 保存初始状态
})
</script>

<template>
  <div class="stamp-editor">
    <NavigationBar title="标准印章编辑器" />
    <div class="toolbar">
      <input
        v-model="companyName"
        placeholder="输入公司名称"
        class="text-input"
        @input="drawStamp"
      />
      <select v-model="stampType" @change="drawStamp">
        <option>公章</option>
        <option>财务专用章</option>
        <option>合同专用章</option>
        <option>法人名章</option>
        <option>发票专用章</option>
      </select>
      <input
        v-if="stampType === '公章'"
        v-model="centerText"
        placeholder="输入中心文字"
        class="text-input"
        @input="drawStamp"
      />
      <input
        v-if="stampType === '法人名章'"
        v-model="legalPerson"
        placeholder="输入法人姓名"
        class="text-input"
        @input="drawStamp"
      />
      <input v-model="stampCode" placeholder="输入印章编码" class="text-input" @input="drawStamp" />
      <label>
        <input type="checkbox" v-model="showStampCode" @change="drawStamp" />
        显示印章编码
      </label>
      <button @click="clearCanvas" class="tool-button">清除所有</button>
      <button @click="undo" class="tool-button">撤销</button>
    </div>
    <canvas id="stamp-canvas" class="canvas-full"></canvas>
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
