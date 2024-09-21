<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import { fabric } from 'fabric'

const canvasRef = ref<HTMLCanvasElement | null>(null)
let canvas: fabric.Canvas | null = null

const companyName = ref('个人实用科技有限公司')
const stampCode = ref('1234567890123')

const PIXELS_PER_MM = 3.78 // 假设1mm = 3.78像素
const WIDTH = 40 * PIXELS_PER_MM
const HEIGHT = 30 * PIXELS_PER_MM

const drawInvoiceStamp = () => {
  if (!canvas) return

  canvas.clear()

  // 绘制外框
  const rect = new fabric.Rect({
    width: WIDTH,
    height: HEIGHT,
    fill: 'transparent',
    stroke: 'red',
    strokeWidth: 2
  })
  canvas.add(rect)

  // 添加公司名称
  const companyNameText = new fabric.Text(companyName.value, {
    fontSize: 16,
    fill: 'red',
    top: 10,
    left: WIDTH / 2,
    originX: 'center'
  })
  canvas.add(companyNameText)

  // 添加"发票专用章"文字
  const invoiceText = new fabric.Text('发票专用章', {
    fontSize: 20,
    fill: 'red',
    top: HEIGHT / 2,
    left: WIDTH / 2,
    originX: 'center',
    originY: 'center'
  })
  canvas.add(invoiceText)

  // 添加印章编码
  const codeText = new fabric.Text(stampCode.value, {
    fontSize: 12,
    fill: 'red',
    top: HEIGHT - 20,
    left: WIDTH / 2,
    originX: 'center'
  })
  canvas.add(codeText)

  canvas.renderAll()
}

onMounted(() => {
  if (canvasRef.value) {
    canvas = new fabric.Canvas(canvasRef.value, {
      width: WIDTH,
      height: HEIGHT
    })
    drawInvoiceStamp()
  }
})

watch([companyName, stampCode], () => {
  drawInvoiceStamp()
})
</script>

<template>
  <div class="invoice-stamp-editor">
    <div class="controls">
      <input v-model="companyName" placeholder="公司名称" />
      <input v-model="stampCode" placeholder="印章编码" />
    </div>
    <canvas ref="canvasRef"></canvas>
  </div>
</template>

<style scoped>
.invoice-stamp-editor {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.controls {
  margin-bottom: 20px;
}

input {
  margin-right: 10px;
  padding: 5px;
}

canvas {
  border: 1px solid #ccc;
}
</style>
