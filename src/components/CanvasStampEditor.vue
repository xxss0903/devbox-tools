<template>
  <div class="container">
    <NavigationBar title="公章编辑器" @goBack="goBack" />
    <div class="editor-controls">
      <label>
        公司名称:
        <input v-model="companyName" />
      </label>
      <label>
        印章编码:
        <input v-model="code" />
      </label>
      <label>
        公司名称字体大小 (mm):
        <input type="number" v-model.number="companyFontSizeMM" />
      </label>
      <label>
        印章编码字体大小 (mm):
        <input type="number" v-model.number="codeFontSizeMM" />
      </label>
      <label>
        圆形半径 (mm):
        <input type="number" v-model.number="circleRadius" />
      </label>
      <label>
        圆形边框宽度 (mm):
        <input type="number" v-model.number="circleBorderWidth" />
      </label>
      <label>
        圆形边框颜色:
        <input type="color" v-model="circleBorderColor" />
      </label>
      <label>
        五角星直径 (mm):
        <input type="number" v-model.number="starDiameter" />
      </label>
      <button @click="updateStamp">刷新印章</button>
    </div>
    <div class="canvas-container">
      <canvas
        ref="stampCanvas"
        width="460"
        height="460"
        @mousemove="onMouseMove"
        @mouseleave="onMouseLeave"
      ></canvas>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import NavigationBar from './NavigationBar.vue'

const router = useRouter()
const stampCanvas = ref<HTMLCanvasElement | null>(null)
const MM_PER_PIXEL = 5 // 毫米换算像素

const RULER_WIDTH = 80
const RULER_HEIGHT = 80

const offscreenCanvas = ref<HTMLCanvasElement | null>(null)

// 添加响应式数据
const companyName = ref('绘制印章有限责任公司')
const code = ref('1234567890123')
const companyFontSizeMM = ref(7)
const codeFontSizeMM = ref(2)
const circleRadius = ref(21)
const circleBorderWidth = ref(1.2)
const circleBorderColor = ref('#ff0000')
const starDiameter = ref(14)

const goBack = () => {
  router.back()
}

// 绘制五角星
const drawStar = (ctx: CanvasRenderingContext2D, x: number, y: number, r: number) => {
  const starPath = 'M 0 -1 L 0.588 0.809 L -0.951 -0.309 L 0.951 -0.309 L -0.588 0.809 Z'
  const pathData = starPath.split(/(?=[MLZ])/)

  ctx.save()
  ctx.translate(x, y)
  ctx.scale(r, r)
  ctx.beginPath()

  pathData.forEach((command) => {
    const [cmd, ...params] = command.trim().split(/\s+/)
    switch (cmd) {
      case 'M':
        ctx.moveTo(parseFloat(params[0]), parseFloat(params[1]))
        break
      case 'L':
        ctx.lineTo(parseFloat(params[0]), parseFloat(params[1]))
        break
      case 'Z':
        ctx.closePath()
        break
    }
  })

  ctx.fillStyle = 'red'
  ctx.fill()
  ctx.restore()
}

// 绘制外边框圆形
const drawCircle = (
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  r: number,
  borderWidth: number,
  circleBorderColor: string
) => {
  ctx.beginPath()
  ctx.arc(x, y, r, 0, Math.PI * 2)
  ctx.strokeStyle = circleBorderColor
  ctx.lineWidth = borderWidth
  ctx.stroke()
}

// 绘制文字
const drawCompanyName = (
  ctx: CanvasRenderingContext2D,
  centerX: number,
  centerY: number,
  radius: number,
  text: string,
  fontSize: number
) => {
  ctx.save()
  ctx.font = `${fontSize}px SimSun`
  ctx.fillStyle = 'red'
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'

  const totalAngle = Math.PI * 1.5 // 270度
  const startAngle = Math.PI - 0.175 * Math.PI // 开始于45度位置
  const characters = text.split('')
  const anglePerChar = totalAngle / characters.length

  characters.forEach((char, index) => {
    const angle = startAngle + anglePerChar * index
    const x = centerX + Math.cos(angle) * (radius - fontSize / 2)
    const y = centerY + Math.sin(angle) * (radius - fontSize / 2)

    ctx.save()
    ctx.translate(x, y)
    ctx.rotate(angle + Math.PI / 2) // 旋转文字以适应圆弧
    ctx.fillText(char, 0, 0)
    ctx.restore()
  })

  ctx.restore()
}

// 修改 drawCode 函数
const drawCode = (
  ctx: CanvasRenderingContext2D,
  centerX: number,
  centerY: number,
  radius: number,
  text: string,
  fontSize: number
) => {
  ctx.save()
  ctx.font = `${fontSize}px Arial`
  ctx.fillStyle = 'red'
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'

  const startAngle = 0.7 * Math.PI //
  const endAngle = 0.3 * Math.PI //
  const totalAngle = startAngle - endAngle
  const characters = text.split('')
  const anglePerChar = totalAngle / (characters.length - 1)

  characters.forEach((char, index) => {
    const angle = startAngle - anglePerChar * index
    const x = centerX + Math.cos(angle) * (radius - fontSize / 2)
    const y = centerY + Math.sin(angle) * (radius - fontSize / 2)

    ctx.save()
    ctx.translate(x, y)
    ctx.rotate(angle - Math.PI / 2) // 逆时针旋转文字
    ctx.fillText(char, 0, 0)
    ctx.restore()
  })

  ctx.restore()
}

const drawRectangle = (
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number
) => {
  ctx.beginPath()
  ctx.rect(x, y, width, height)
  ctx.strokeStyle = 'blue'
  ctx.lineWidth = 1
  ctx.stroke()
}

const drawStamp = () => {
  const canvas = stampCanvas.value
  if (!canvas) return
  const ctx = canvas.getContext('2d')
  if (!ctx) return

  // 清除整个画布
  ctx.clearRect(0, 0, canvas.width, canvas.height)

  // 1. 设置画布背景
  ctx.fillStyle = 'white'
  ctx.fillRect(0, 0, canvas.width, canvas.height)

  // 2. 计算圆心位置
  const centerX = canvas.width / 2
  const centerY = canvas.height / 2

  // 3. 绘制圆形
  drawCircle(
    ctx,
    centerX,
    centerY,
    circleRadius.value * MM_PER_PIXEL,
    circleBorderWidth.value * MM_PER_PIXEL,
    circleBorderColor.value
  )

  // 4. 绘制公司名称
  drawCompanyName(
    ctx,
    centerX,
    centerY,
    (circleRadius.value - 0.8) * MM_PER_PIXEL,
    companyName.value,
    companyFontSizeMM.value * MM_PER_PIXEL
  )

  // 5. 绘制五角星
  const starRadius = (starDiameter.value / 2) * MM_PER_PIXEL
  drawStar(ctx, centerX, centerY, starRadius)

  // 6. 绘制印章编码
  drawCode(
    ctx,
    centerX,
    centerY,
    (circleRadius.value - 0.8) * MM_PER_PIXEL,
    code.value,
    codeFontSizeMM.value * MM_PER_PIXEL
  )

  // 7. 绘制水平标尺
  drawRuler(ctx, canvas.width, RULER_HEIGHT, true)

  // 8. 绘制垂直标尺
  drawRuler(ctx, canvas.height, RULER_WIDTH, false)
}

const drawRuler = (
  ctx: CanvasRenderingContext2D,
  rulerLength: number,
  rulerSize: number,
  isHorizontal: boolean
) => {
  const mmPerPixel = 1 / MM_PER_PIXEL

  // 绘制标尺背景
  ctx.fillStyle = 'lightgray'
  if (isHorizontal) {
    ctx.fillRect(0, 0, rulerLength, rulerSize)
  } else {
    ctx.fillRect(0, 0, rulerSize, rulerLength)
  }

  // 绘制刻度和数字
  ctx.fillStyle = 'black'
  ctx.font = '10px Arial'
  ctx.textAlign = 'center'
  ctx.textBaseline = 'top'

  for (let i = 0; i <= rulerLength - rulerSize; i += MM_PER_PIXEL) {
    const pos = i + rulerSize
    const mm = Math.round(i * mmPerPixel)

    if (mm % 5 === 0) {
      ctx.beginPath()
      if (isHorizontal) {
        ctx.moveTo(pos, 0)
        ctx.lineTo(pos, rulerSize / 2)
      } else {
        ctx.moveTo(0, pos)
        ctx.lineTo(rulerSize / 2, pos)
      }
      ctx.lineWidth = 1
      ctx.stroke()

      ctx.save()
      if (isHorizontal) {
        ctx.fillText(mm.toString(), pos, rulerSize / 2)
      } else {
        ctx.translate(rulerSize / 2, pos)
        ctx.rotate(-Math.PI / 2)
        ctx.fillText(mm.toString(), 0, 0)
      }
      ctx.restore()
    } else {
      ctx.beginPath()
      if (isHorizontal) {
        ctx.moveTo(pos, 0)
        ctx.lineTo(pos, rulerSize / 4)
      } else {
        ctx.moveTo(0, pos)
        ctx.lineTo(rulerSize / 4, pos)
      }
      ctx.stroke()
    }
  }
}

const onMouseMove = (event: MouseEvent) => {
  const canvas = stampCanvas.value
  if (!canvas) return

  const rect = canvas.getBoundingClientRect()
  const x = event.clientX - rect.left
  const y = event.clientY - rect.top
  const mmX = Math.round((x - RULER_WIDTH) / MM_PER_PIXEL)
  const mmY = Math.round((y - RULER_HEIGHT) / MM_PER_PIXEL)

  // 只在需要时重绘主要内容
  drawStamp()
  highlightRulerPosition(mmX, mmY)
  drawCrossLines(x, y)
}

const onMouseLeave = () => {
  drawStamp()
}

const highlightRulerPosition = (mmX: number, mmY: number) => {
  const canvas = stampCanvas.value
  if (!canvas) return
  const ctx = canvas.getContext('2d')
  if (!ctx) return

  const x = mmX * MM_PER_PIXEL + RULER_WIDTH
  const y = mmY * MM_PER_PIXEL + RULER_HEIGHT

  // 高亮水平标尺
  ctx.fillStyle = 'red'
  ctx.fillRect(RULER_WIDTH, y - 1, canvas.width - RULER_WIDTH, 2)

  // 高亮垂直标尺
  ctx.fillRect(x - 1, RULER_HEIGHT, 2, canvas.height - RULER_HEIGHT)

  // 显示坐标
  ctx.fillStyle = 'black'
  ctx.font = 'bold 12px Arial'
  ctx.textAlign = 'left'
  ctx.textBaseline = 'top'
  ctx.fillText(`${mmX}mm, ${mmY}mm`, RULER_WIDTH + 5, RULER_HEIGHT + 5)
}

const drawCrossLines = (x: number, y: number) => {
  const canvas = offscreenCanvas.value
  if (!canvas) return
  const ctx = canvas.getContext('2d')
  if (!ctx) return

  // 清除之前绘制的内容
  ctx.clearRect(0, 0, canvas.width, canvas.height)

  ctx.beginPath()
  ctx.strokeStyle = 'rgba(255, 0, 0, 0.5)'
  ctx.lineWidth = 1

  // 绘制水平线
  ctx.moveTo(RULER_WIDTH, y)
  ctx.lineTo(canvas.width, y)

  // 绘制垂直线
  ctx.moveTo(x, RULER_HEIGHT)
  ctx.lineTo(x, canvas.height)

  ctx.stroke()

  // 将离屏canvas的内容绘制到主canvas上
  const mainCanvas = stampCanvas.value
  if (mainCanvas) {
    const mainCtx = mainCanvas.getContext('2d')
    if (mainCtx) {
      mainCtx.drawImage(canvas, 0, 0)
    }
  }
}

const updateStamp = () => {
  drawStamp()
}

onMounted(() => {
  // 创建离屏canvas
  offscreenCanvas.value = document.createElement('canvas')
  const canvas = stampCanvas.value
  if (canvas && offscreenCanvas.value) {
    offscreenCanvas.value.width = canvas.width
    offscreenCanvas.value.height = canvas.height
  }

  drawStamp()
})

// // 监听所有响应式数据的变化
// watch(
//   [
//     companyName,
//     code,
//     companyFontSizeMM,
//     codeFontSizeMM,
//     circleRadius,
//     circleBorderWidth,
//     circleBorderColor,
//     starDiameter
//   ],
//   () => {
//     drawStamp()
//   }
// )
</script>

<style scoped>
.container {
  display: flex;
  flex-direction: column;
  height: 100%;
  overflow: hidden;
}

.editor-controls {
  padding: 10px;
  background-color: #f0f0f0;
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.editor-controls label {
  display: flex;
  flex-direction: column;
}

.editor-controls input {
}
.container {
  display: flex;
  flex-direction: column;
  height: 100%;
  overflow: hidden;
}

.canvas-container {
  width: 100%;
  height: 100%;
  background-color: aliceblue;
  display: flex;
  justify-content: center;
  align-items: center;
}

canvas {
  max-width: 100%;
  max-height: 100%;
  object-fit: contain;
}
</style>
