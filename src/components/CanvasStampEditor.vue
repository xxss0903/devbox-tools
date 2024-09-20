<template>
  <div class="container">
    <NavigationBar title="公章编辑器" @goBack="goBack" />
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
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import NavigationBar from './NavigationBar.vue'

const router = useRouter()
const stampCanvas = ref<HTMLCanvasElement | null>(null)
const MM_PER_PIXEL = 10 // 毫米换算像素

const RULER_WIDTH = 40
const RULER_HEIGHT = 40

const goBack = () => {
  router.back()
}

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
  x: number,
  y: number,
  text: string,
  size: number
) => {
  ctx.font = `${size}px SimSun`
  ctx.fillStyle = 'red'
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.fillText(text, x, y)
}

// 绘制印章编码
const drawCode = (
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  text: string,
  size: number
) => {
  ctx.font = `${size}px Arial`
  ctx.fillStyle = 'red'
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.fillText(text, x, y)
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

  // 印章标准字段
  let circleRadius = 21 // 圆形半径，直径是乘以2，单位mm
  let circleBorderWidth = 1.2 // 圆形边框宽度，单位mm
  let circleBorderColor = 'red' // 圆形边框颜色

  // 1. 设置画布背景
  ctx.fillStyle = 'white'
  ctx.fillRect(0, 0, canvas.width, canvas.height)

  // 2. 计算圆心位置
  const centerX = canvas.width / 2
  const centerY = canvas.height / 2

  // 3. 绘制矩形
  const rectangleWidth = circleRadius * 2 * MM_PER_PIXEL
  const rectangleHeight = circleRadius * 2 * MM_PER_PIXEL
  const rectangleX = centerX - rectangleWidth / 2
  const rectangleY = centerY - rectangleHeight / 2
  drawRectangle(ctx, rectangleX, rectangleY, rectangleWidth, rectangleHeight)

  // 4. 绘制圆形
  drawCircle(
    ctx,
    centerX,
    centerY,
    circleRadius * MM_PER_PIXEL,
    circleBorderWidth * MM_PER_PIXEL,
    circleBorderColor
  )

  // 5. 绘制水平标尺
  drawRuler(ctx, canvas.width, RULER_HEIGHT, true)

  // 6. 绘制垂直标尺
  drawRuler(ctx, canvas.height, RULER_WIDTH, false)

  // ... 其他绘制代码 ...
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
  const x = event.clientX - rect.left - RULER_WIDTH
  const y = event.clientY - rect.top - RULER_HEIGHT
  const mmX = Math.round(x / MM_PER_PIXEL)
  const mmY = Math.round(y / MM_PER_PIXEL)

  drawStamp()
  highlightRulerPosition(mmX, mmY)
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
  ctx.fillRect(x - 1, 0, 2, RULER_HEIGHT)

  // 高亮垂直标尺
  ctx.fillRect(0, y - 1, RULER_WIDTH, 2)

  // 显示坐标
  ctx.fillStyle = 'white'
  ctx.font = 'bold 12px Arial'
  ctx.textAlign = 'left'
  ctx.textBaseline = 'top'
  ctx.fillText(`${mmX}mm, ${mmY}mm`, 5, RULER_HEIGHT + 5)
}

onMounted(() => {
  drawStamp()
})
</script>

<style scoped>
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
