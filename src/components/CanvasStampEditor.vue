<template>
  <div class="container">
    <div class="editor-controls">
      <div class="button-group">
        <button @click="updateStamp">刷新印章</button>
        <button @click="saveStampAsPNG">保存印章</button>
      </div>
      <div class="control-group">
        <h3>基本信息</h3>
        <label>
          公司名称:
          <input v-model="companyName" />
        </label>
        <label>
          底部文字:
          <input type="text" v-model="bottomText" />
        </label>
        <label>
          印章编码:
          <input v-model="code" />
        </label>
      </div>
      <div class="control-group">
        <h3>文字压缩设置</h3>
        <label>
          <span>公司名称压缩：{{ companyNameCompression.toFixed(2) }}</span>
          <input
            type="range"
            v-model.number="companyNameCompression"
            min="0.5"
            max="1.5"
            step="0.05"
          />
        </label>
        <label>
          <span>公司名称分布因子：{{ textDistributionFactor.toFixed(1) }}</span>
          <input
            type="range"
            v-model.number="textDistributionFactor"
            min="1"
            max="100"
            step="0.5"
          />
        </label>
        <label>
          <span>公司名称边距 (mm): </span>
          <input type="number" v-model.number="textMarginMM" min="-10" max="10" step="0.05" />
        </label>
        <label>
          <span>底部文字压缩：{{ bottomTextCompression.toFixed(2) }}</span>
          <input
            type="range"
            v-model.number="bottomTextCompression"
            min="0.5"
            max="1.5"
            step="0.05"
          />
        </label>
        <label>
          <span>底部文字间隔：{{ bottomTextLetterSpacing.toFixed(2) }}mm</span>
          <input
            type="range"
            v-model.number="bottomTextLetterSpacing"
            min="-1"
            max="5"
            step="0.05"
          />
        </label>
        <label>
          <span>编码文字压缩：{{ codeCompression.toFixed(2) }}</span>
          <input type="range" v-model.number="codeCompression" min="0.5" max="1.5" step="0.05" />
        </label>

        <label>
          <span>编码文字分布因子: {{ codeDistributionFactor.toFixed(1) }}</span>
          <input
            type="range"
            v-model.number="codeDistributionFactor"
            min="10"
            max="40"
            step="0.5"
          />
        </label>

        <label>
          编码边距 (mm):
          <input type="number" v-model.number="codeMarginMM" min="-10" max="10" step="0.05" />
        </label>
      </div>
      <div class="control-group">
        <h3>字体设置</h3>
        <label>
          公司名称字体大小 (mm):
          <input type="number" v-model.number="companyFontSizeMM" step="0.1" />
        </label>
        <label>
          印章编码字体大小 (mm):
          <input type="number" v-model.number="codeFontSizeMM" step="0.1" />
        </label>
        <label>
          底部文字大小 (mm):
          <input type="number" v-model.number="bottomTextFontSizeMM" min="1" max="10" step="0.1" />
        </label>
      </div>

      <div class="control-group">
        <h3>印章设置</h3>
        <label>
          圆形半径 (mm):
          <input type="number" v-model.number="circleRadius" step="0.1" />
        </label>
        <label>
          圆形边框宽度 (mm):
          <input type="number" step="0.1" v-model.number="circleBorderWidth" />
        </label>
        <label>
          印章颜色:
          <input type="color" v-model="circleBorderColor" />
        </label>
      </div>

      <div class="control-group">
        <h3>五角星设置</h3>
        <label class="checkbox-label">
          <input type="checkbox" v-model="shouldDrawStar" />
          绘制五角星
        </label>
        <label v-if="shouldDrawStar">
          五角星直径 (mm):
          <input type="number" v-model.number="starDiameter" step="0.1" />
        </label>
        <label v-if="shouldDrawStar">
          五角星垂直位置:
          <input type="number" v-model.number="starPositionY" min="-10" max="10" step="0.1" />
        </label>
      </div>

      <div class="control-group">
        <h3>底部文字设置</h3>
        <label>
          底部文字字符间距:
          <input
            type="number"
            v-model.number="bottomTextLetterSpacing"
            min="-1"
            max="1"
            step="0.1"
          />
        </label>
        <label>
          底部文字垂直位置:
          <input type="number" v-model.number="bottomTextPositionY" min="-10" max="10" step="0.1" />
        </label>
      </div>

      <div class="control-group">
        <h3>做旧效果</h3>
        <label class="checkbox-label">
          <input type="checkbox" v-model="applyAging" />
          应用做旧效果
        </label>
        <label v-if="applyAging">
          做旧强度:
          <input type="range" v-model.number="agingIntensity" min="0" max="200" step="1" />
        </label>
      </div>
    </div>
    <div class="canvas-container">
      <canvas
        ref="stampCanvas"
        width="600"
        height="600"
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
const MM_PER_PIXEL = 10 // 毫米换算像素

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
// 做旧效果
const applyAging = ref(false)
// 添加新的响应式数据
const agingIntensity = ref(50)
const textDistributionFactor = ref(20)
const textMarginMM = ref(1) // 默认值为1mm
const codeMarginMM = ref(1) // 默认值为1mm
const codeDistributionFactor = ref(20) // 默认值可以根据需要调整
const shouldDrawStar = ref(true) // 默认绘制五角星
const bottomText = ref('合同专用章')

const bottomTextFontSizeMM = ref(4) // 底部文字大小，默认 4mm
const bottomTextLetterSpacing = ref(0) // 底部文字字符间距，默认 0
const starPositionY = ref(0) // 五角星垂直位置调整，默认 0
const bottomTextPositionY = ref(0) // 底部文字垂直位置调整，默认 0
const companyNameCompression = ref(1)
const bottomTextCompression = ref(1)
const codeCompression = ref(1)

const goBack = () => {
  router.back()
}

const addAgingEffect = (ctx: CanvasRenderingContext2D, width: number, height: number) => {
  const imageData = ctx.getImageData(0, 0, width, height)
  const data = imageData.data

  const centerX = width / 2
  const centerY = height / 2
  const radius = (circleRadius.value + 1) * MM_PER_PIXEL

  const addCircularNoise = (x: number, y: number, size: number, intensity: number) => {
    const radiusSquared = (size * size) / 4
    for (let dy = -size / 2; dy < size / 2; dy++) {
      for (let dx = -size / 2; dx < size / 2; dx++) {
        if (dx * dx + dy * dy <= radiusSquared) {
          const nx = Math.round(x + dx)
          const ny = Math.round(y + dy)
          const nIndex = (ny * width + nx) * 4
          if (nIndex >= 0 && nIndex < data.length) {
            data[nIndex] = Math.min(255, data[nIndex] + intensity)
            data[nIndex + 1] = Math.min(255, data[nIndex + 1] + intensity)
            data[nIndex + 2] = Math.min(255, data[nIndex + 2] + intensity)
          }
        }
      }
    }
  }

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const index = (y * width + x) * 4

      const distanceFromCenter = Math.sqrt(Math.pow(x - centerX, 2) + Math.pow(y - centerY, 2))
      if (distanceFromCenter <= radius) {
        if (data[index] > 200 && data[index + 1] < 50 && data[index + 2] < 50) {
          const intensityFactor = agingIntensity.value / 100

          // 添加小型圆形噪点
          if (Math.random() < 0.4 * intensityFactor) {
            const noiseSize = Math.random() * 3 + 1 // 噪点大小从1到4像素不等
            const noise = Math.random() * 200 * intensityFactor
            addCircularNoise(x, y, noiseSize, noise)
          }

          // 添加大型圆形噪点
          if (Math.random() < 0.05 * intensityFactor) {
            const strongNoiseSize = Math.random() * 5 + 2 // 更大的噪点，2到7像素不等
            const strongNoise = Math.random() * 250 * intensityFactor + 5
            addCircularNoise(x, y, strongNoiseSize, strongNoise)
          }

          // 随机添加褪色效果
          if (Math.random() < 0.2 * intensityFactor) {
            const fade = Math.random() * 50 * intensityFactor
            data[index] = Math.min(255, data[index] + fade)
            data[index + 1] = Math.min(255, data[index + 1] + fade)
            data[index + 2] = Math.min(255, data[index + 2] + fade)
          }
        }
      }
    }
  }

  ctx.putImageData(imageData, 0, 0)
}

const saveStampAsPNG = () => {
  const canvas = stampCanvas.value
  if (!canvas) return

  // 设置固定的输出尺寸
  const outputSize = 1024

  // 创建一个新的 canvas 元素，大小为 512x512
  const saveCanvas = document.createElement('canvas')
  saveCanvas.width = outputSize
  saveCanvas.height = outputSize
  const saveCtx = saveCanvas.getContext('2d')
  if (!saveCtx) return

  // 清除画布，使背景透明
  saveCtx.clearRect(0, 0, outputSize, outputSize)

  // 计算原始 canvas 中印章的位置和大小
  const originalStampSize = (circleRadius.value * 2 + 2) * MM_PER_PIXEL
  const sourceX = (canvas.width - originalStampSize) / 2
  const sourceY = (canvas.height - originalStampSize) / 2

  // 计算在新 canvas 中的绘制位置和大小
  const margin = outputSize * 0.1 // 10% 的边距
  const drawSize = outputSize - 2 * margin

  // 将原始 canvas 中的印章部分绘制到新的 canvas 上，并调整大小
  saveCtx.drawImage(
    canvas,
    sourceX,
    sourceY,
    originalStampSize,
    originalStampSize,
    margin,
    margin,
    drawSize,
    drawSize
  )

  // 将新的 canvas 转换为 PNG 数据 URL，指定 alpha 通道
  const dataURL = saveCanvas.toDataURL('image/png')

  // 创建一个临时的 <a> 元素来触发下载
  const link = document.createElement('a')
  link.href = dataURL
  link.download = '印章.png'
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}

const saveStamp = () => {
  const canvas = stampCanvas.value
  if (!canvas) return
  const scaleFactor = 1 // 可以根据需要调整，更大的值会产生更高分辨率的图像
  const tempMMPerPixel = MM_PER_PIXEL * scaleFactor

  // 增加边距，确保完整包含印章
  const margin = 2 * tempMMPerPixel // 10mm 的边距
  const stampSize = (circleRadius.value * 2 + 1) * tempMMPerPixel // 增加 20mm 的总边距
  const saveCanvas = document.createElement('canvas')
  saveCanvas.width = stampSize
  saveCanvas.height = stampSize
  const saveCtx = saveCanvas.getContext('2d')
  if (!saveCtx) return

  // 设置保存 canvas 的背景为白色
  saveCtx.fillStyle = 'white'
  saveCtx.fillRect(0, 0, stampSize, stampSize)

  // 计算原始 canvas 中印章的位置和大小
  const originalStampSize = (circleRadius.value + 1) * 2 * tempMMPerPixel
  const sourceX = (canvas.width - originalStampSize) / 2
  const sourceY = (canvas.height - originalStampSize) / 2

  // 将原始 canvas 中的印章部分绘制到新的 canvas 上，并居中
  saveCtx.drawImage(
    canvas,
    sourceX,
    sourceY,
    originalStampSize,
    originalStampSize,
    margin,
    margin,
    stampSize - 2 * margin,
    stampSize - 2 * margin
  )

  // 将新的 canvas 转换为 PNG 数据 URL
  const dataURL = saveCanvas.toDataURL('image/png')

  // 创建一个临时的 <a> 元素来触发下载
  const link = document.createElement('a')
  link.href = dataURL
  link.download = '印章.png'
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}

// 绘制五角星
const drawStarShape = (ctx: CanvasRenderingContext2D, x: number, y: number, r: number) => {
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

  ctx.fillStyle = circleBorderColor.value
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
  ctx.fillStyle = circleBorderColor.value
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'

  const characters = text.split('')
  const characterCount = characters.length

  const totalAngle = Math.PI * (1 + characterCount / textDistributionFactor.value)
  const startAngle = Math.PI + (Math.PI - totalAngle) / 2
  const endAngle = startAngle + totalAngle
  const anglePerChar = totalAngle / characterCount

  characters.forEach((char, index) => {
    const angle = startAngle + anglePerChar * (index + 0.5)
    const x =
      centerX + Math.cos(angle) * (radius - fontSize / 2 - textMarginMM.value * MM_PER_PIXEL)
    const y =
      centerY + Math.sin(angle) * (radius - fontSize / 2 - textMarginMM.value * MM_PER_PIXEL)

    ctx.save()
    ctx.translate(x, y)
    ctx.rotate(angle + Math.PI / 2)
    ctx.scale(companyNameCompression.value, 1) // 应用压缩
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
  ctx.fillStyle = circleBorderColor.value
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'

  const characters = text.split('')
  const characterCount = characters.length

  const totalAngle = Math.PI * (characterCount / codeDistributionFactor.value) * 0.5
  const startAngle = Math.PI / 2 + totalAngle / 2
  const endAngle = Math.PI / 2 - totalAngle / 2
  const anglePerChar = totalAngle / (characterCount - 1)

  characters.forEach((char, index) => {
    const angle = startAngle - anglePerChar * index
    const x =
      centerX + Math.cos(angle) * (radius - fontSize / 2 - codeMarginMM.value * MM_PER_PIXEL)
    const y =
      centerY + Math.sin(angle) * (radius - fontSize / 2 - codeMarginMM.value * MM_PER_PIXEL)

    ctx.save()
    ctx.translate(x, y)
    ctx.rotate(angle - Math.PI / 2)
    ctx.scale(codeCompression.value, 1) // 应用压缩
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

const drawBottomText = (
  ctx: CanvasRenderingContext2D,
  centerX: number,
  centerY: number,
  radius: number,
  text: string,
  fontSize: number,
  letterSpacing: number,
  positionY: number
) => {
  ctx.save()
  ctx.font = `${fontSize}px SimSun`
  ctx.fillStyle = circleBorderColor.value
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'

  const textY = centerY + radius * 0.5 + positionY * MM_PER_PIXEL

  ctx.save()
  ctx.translate(centerX, textY)
  ctx.scale(bottomTextCompression.value, 1) // 应用压缩

  const chars = text.split('')
  const charWidths = chars.map((char) => ctx.measureText(char).width)
  const totalWidth =
    charWidths.reduce((sum, width) => sum + width, 0) +
    (chars.length - 1) * letterSpacing * MM_PER_PIXEL

  let currentX = -totalWidth / 2 // 从文本的左边缘开始

  chars.forEach((char, index) => {
    ctx.fillText(char, currentX + charWidths[index] / 2, 0) // 绘制在字符的中心
    currentX += charWidths[index] + letterSpacing * MM_PER_PIXEL
  })

  ctx.restore()
  ctx.restore()
}

const drawStamp = () => {
  const canvas = stampCanvas.value
  if (!canvas) return
  const ctx = canvas.getContext('2d')
  if (!ctx) return

  // 清除整个画布
  ctx.clearRect(0, 0, canvas.width, canvas.height)

  // 创建离屏 canvas
  const offscreenCanvas = document.createElement('canvas')
  offscreenCanvas.width = canvas.width
  offscreenCanvas.height = canvas.height
  const offscreenCtx = offscreenCanvas.getContext('2d')
  if (!offscreenCtx) return

  // 在离屏 canvas 上绘制印章
  const centerX = canvas.width / 2
  const centerY = canvas.height / 2
  const radius = circleRadius.value * MM_PER_PIXEL

  // 绘制圆形边框
  offscreenCtx.beginPath()
  offscreenCtx.arc(centerX, centerY, radius, 0, Math.PI * 2)
  offscreenCtx.lineWidth = circleBorderWidth.value * MM_PER_PIXEL
  offscreenCtx.strokeStyle = 'white' // 使用白色，稍后会变成红色
  offscreenCtx.stroke()

  // 绘制其他元素（公司名称、底部文字、编码等）
  offscreenCtx.fillStyle = 'white' // 使用白色，稍后会变成红色

  // 1. 设置画布背景
  ctx.fillStyle = 'white'
  ctx.fillRect(0, 0, canvas.width, canvas.height)

  // 3. 绘制圆形
  drawCircle(
    offscreenCtx,
    centerX,
    centerY,
    circleRadius.value * MM_PER_PIXEL,
    circleBorderWidth.value * MM_PER_PIXEL,
    circleBorderColor.value
  )

  // 4. 绘制公司名称
  drawCompanyName(
    offscreenCtx,
    centerX,
    centerY,
    circleRadius.value * MM_PER_PIXEL,
    companyName.value,
    companyFontSizeMM.value * MM_PER_PIXEL
  )

  // 5. 绘制五角星
  if (shouldDrawStar.value) {
    // const starRadius = (starDiameter.value / 2) * MM_PER_PIXEL
    // drawStar(ctx, centerX, centerY, starRadius)
    const starRadius = (starDiameter.value / 2) * MM_PER_PIXEL
    const starY = centerY + starPositionY.value * MM_PER_PIXEL
    drawStarShape(offscreenCtx, centerX, starY, starRadius)
  }

  // 6. 绘制底部文字
  // 6. 绘制底部文字
  const bottomFontSize = bottomTextFontSizeMM.value * MM_PER_PIXEL
  drawBottomText(
    offscreenCtx,
    centerX,
    centerY,
    circleRadius.value * MM_PER_PIXEL,
    bottomText.value,
    bottomFontSize,
    bottomTextLetterSpacing.value * MM_PER_PIXEL,
    bottomTextPositionY.value
  )

  // 6. 绘制印章编码
  drawCode(
    offscreenCtx,
    centerX,
    centerY,
    circleRadius.value * MM_PER_PIXEL,
    code.value,
    codeFontSizeMM.value * MM_PER_PIXEL
  )

  // 将离屏 canvas 的内容作为蒙版应用到主 canvas
  ctx.save()
  ctx.globalCompositeOperation = 'source-over'
  ctx.fillStyle = circleBorderColor.value // 使用设置的印章颜色
  ctx.fillRect(0, 0, canvas.width, canvas.height)
  ctx.globalCompositeOperation = 'destination-in'
  ctx.drawImage(offscreenCanvas, 0, 0)
  ctx.restore()

  // 如果需要，在这里添加做旧效果
  if (applyAging.value) {
    addAgingEffect(ctx, canvas.width, canvas.height)
  }

  // // 在绘制完所有内容后，添加做旧效果
  // if (applyAging.value) {
  //   addAgingEffect(ctx, canvas.width, canvas.height)
  // }

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

  for (let i = 0; i <= rulerLength - rulerSize; i += MM_PER_PIXEL / 10) {
    const pos = i + rulerSize
    const mm = Math.round(i * mmPerPixel * 10) / 10

    if (mm % 5 === 0) {
      // 10毫米刻度
      ctx.beginPath()
      if (isHorizontal) {
        ctx.moveTo(pos, 0)
        ctx.lineTo(pos, rulerSize * 0.8)
      } else {
        ctx.moveTo(0, pos)
        ctx.lineTo(rulerSize * 0.8, pos)
      }
      ctx.lineWidth = 1
      ctx.stroke()

      ctx.save()
      if (isHorizontal) {
        ctx.fillText(mm.toString(), pos, rulerSize * 0.8)
      } else {
        ctx.translate(rulerSize * 0.8, pos)
        ctx.rotate(-Math.PI / 2)
        ctx.fillText(mm.toString(), 0, 0)
      }
      ctx.restore()
    } else if (mm % 1 === 0) {
      // 1毫米刻度
      ctx.beginPath()
      if (isHorizontal) {
        ctx.moveTo(pos, 0)
        ctx.lineTo(pos, rulerSize * 0.6)
      } else {
        ctx.moveTo(0, pos)
        ctx.lineTo(rulerSize * 0.6, pos)
      }
      ctx.lineWidth = 0.5
      ctx.stroke()
    } else if (mm % 0.5 === 0) {
      // 0.5毫米刻度
      ctx.beginPath()
      if (isHorizontal) {
        ctx.moveTo(pos, 0)
        ctx.lineTo(pos, rulerSize * 0.4)
      } else {
        ctx.moveTo(0, pos)
        ctx.lineTo(rulerSize * 0.4, pos)
      }
      ctx.lineWidth = 0.5
      ctx.stroke()
    } else {
      // 0.1毫米刻度
      ctx.beginPath()
      if (isHorizontal) {
        ctx.moveTo(pos, 0)
        ctx.lineTo(pos, rulerSize * 0.2)
      } else {
        ctx.moveTo(0, pos)
        ctx.lineTo(rulerSize * 0.2, pos)
      }
      ctx.lineWidth = 0.5
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
  const mmX = Math.round(((x - RULER_WIDTH) / MM_PER_PIXEL) * 10) / 10
  const mmY = Math.round(((y - RULER_HEIGHT) / MM_PER_PIXEL) * 10) / 10

  // 只在需要时重绘主要内容
  drawStamp()
  highlightRulerPosition(mmX, mmY)
  drawCrossLines(x, y)
}

const highlightRulerPosition = (mmX: number, mmY: number) => {
  const canvas = stampCanvas.value
  if (!canvas) return
  const ctx = canvas.getContext('2d')
  if (!ctx) return

  const x = mmX * MM_PER_PIXEL + RULER_WIDTH
  const y = mmY * MM_PER_PIXEL + RULER_HEIGHT

  // 高亮水平标尺
  ctx.fillStyle = circleBorderColor.value
  ctx.fillRect(RULER_WIDTH, y - 1, canvas.width - RULER_WIDTH, 2)

  // 高亮垂直标尺
  ctx.fillRect(x - 1, RULER_HEIGHT, 2, canvas.height - RULER_HEIGHT)

  // 显示坐标
  ctx.fillStyle = 'black'
  ctx.font = 'bold 12px Arial'
  ctx.textAlign = 'left'
  ctx.textBaseline = 'top'
  ctx.fillText(`${mmX.toFixed(1)}mm, ${mmY.toFixed(1)}mm`, RULER_WIDTH + 5, RULER_HEIGHT + 5)
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

const onMouseLeave = () => {
  drawStamp()
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

// 监听所有响应式数据的变化
watch(
  [
    companyName,
    code,
    companyFontSizeMM,
    codeFontSizeMM,
    circleRadius,
    circleBorderWidth,
    circleBorderColor,
    starDiameter,
    codeDistributionFactor,
    textDistributionFactor,
    textMarginMM,
    codeMarginMM,
    agingIntensity,
    shouldDrawStar,
    bottomText,
    bottomTextFontSizeMM,
    bottomTextLetterSpacing,
    starPositionY,
    bottomTextPositionY,
    companyNameCompression,
    bottomTextCompression,
    codeCompression,
    bottomTextLetterSpacing
  ],
  () => {
    drawStamp()
  }
)
</script>
<style scoped>
.container {
  display: flex;
  height: 100%;
  overflow: hidden;
}

.editor-controls {
  width: 300px;
  padding: 10px;
  background-color: #f0f0f0;
  overflow-y: auto;
  max-height: 70vh;
  box-sizing: border-box;
}

.control-group {
  margin-bottom: 15px;
  padding: 10px;
  background-color: white;
  border-radius: 5px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.12);
}

.control-group h3 {
  margin-top: 0;
  margin-bottom: 10px;
  font-size: 16px;
  color: #333;
}

.editor-controls label {
  display: flex;
  flex-direction: column;
  margin-bottom: 8px;
  font-size: 14px;
}

.editor-controls input[type='text'],
.editor-controls input[type='number'],
.editor-controls input[type='range'] {
  width: 100%;
  padding: 5px;
  border: 1px solid #ccc;
  border-radius: 3px;
  box-sizing: border-box;
}

.editor-controls input[type='color'] {
  width: 100%;
  height: 30px;
  padding: 0;
  border: none;
}

.checkbox-label {
  flex-direction: row !important;
  align-items: center;
}

.checkbox-label input {
  margin-right: 5px;
}

.button-group {
  display: flex;
  justify-content: space-between;
  margin-bottom: 15px;
}

button {
  padding: 8px 16px;
  background-color: #4caf50;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
}

button:hover {
  background-color: #45a049;
}

.canvas-container {
  flex-grow: 1;
  background-color: aliceblue;
  display: flex;
  justify-content: center;
  align-items: center;
  overflow: auto;
}

canvas {
  max-width: 100%;
  max-height: 100%;
  object-fit: contain;
}
</style>
