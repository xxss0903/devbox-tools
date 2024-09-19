<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { fabric } from 'fabric'
import NavigationBar from './NavigationBar.vue'
import { drawOfficialStamp } from './stamps/OfficialStamp'
import { drawContractStamp } from './stamps/ContractStamp'
import { drawInvoiceStamp } from './stamps/InvoiceStamp' // 新增

const STANDARD_SIZE_MM = 45 // 标准印章直径，单位毫米
const CANVAS_SIZE = 400 // 画布尺寸，单位像素
const PIXELS_PER_MM = CANVAS_SIZE / (STANDARD_SIZE_MM * 1.2) // 每毫米对应的像素数，留出一些边距

const companyName = ref('个人实用科技有限公司')
const centerText = ref('我是抬头字')
const stampType = ref('公章')
const legalPerson = ref('张三')
const stampCode = ref('1234567890123')
const showStampCode = ref(true)
const showInnerCircle = ref(false) // 新增: 控制是否显示内圆的开关

const circleSize = computed(() => {
  const size = stampType.value === '公章' ? 45 : 40
  return (size * PIXELS_PER_MM) / 2
})
const ellipseWidth = computed(() => 40 * PIXELS_PER_MM)
const ellipseHeight = computed(() => 30 * PIXELS_PER_MM)
const invoiceStampBorderWidth = computed(() => 1 * PIXELS_PER_MM)

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

  if (stampType.value === '公章') {
    drawOfficialStamp(stampCanvas.value, {
      companyName: companyName.value,
      centerText: centerText.value,
      stampCode: stampCode.value,
      showStampCode: showStampCode.value,
      showInnerCircle: showInnerCircle.value,
      circleSize: circleSize.value,
      starSize: starSize.value,
      borderWidth: borderWidth.value,
      calculateFontSize: calculateFontSize.value
    })
  } else if (stampType.value === '合同专用章') {
    drawContractStamp(stampCanvas.value, {
      companyName: companyName.value,
      centerText: centerText.value,
      stampCode: stampCode.value,
      showStampCode: showStampCode.value,
      showInnerCircle: showInnerCircle.value,
      circleSize: circleSize.value,
      starSize: starSize.value,
      borderWidth: borderWidth.value,
      calculateFontSize: calculateFontSize.value
    })
  } else if (stampType.value === '发票专用章') {
    drawInvoiceStamp(stampCanvas.value, {
      stampCode: stampCode.value,
      showStampCode: showStampCode.value,
      showInnerCircle: showInnerCircle.value,
      ellipseWidth: ellipseWidth.value, // 椭圆的宽度
      ellipseHeight: ellipseHeight.value, // 椭圆的高度
      borderWidth: invoiceStampBorderWidth.value, // 线条的宽度
      companyName: companyName.value // 新增
    })
  } else {
    // 其他类型印章的绘制逻辑
    // ...
  }

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
      <label>
        <input type="checkbox" v-model="showInnerCircle" @change="drawStamp" />
        显示内圆
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
