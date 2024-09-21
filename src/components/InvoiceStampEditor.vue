<template>
  <div class="container">
    <div class="editor-controls" ref="editorControls">
      <!-- 顶部固定按钮 -->
      <div
        class="button-group"
        style="position: sticky; top: 0; z-index: 1000; background-color: white; padding: 10px"
      >
        <button @click="updateStamp()">刷新印章</button>
        <button @click="saveStampAsPNG">保存印章</button>
      </div>

      <!-- 印章基本设置 -->
      <div class="control-group" id="stamp-settings">
        <h3>印章基本设置</h3>
        <label
          >印章宽度 (mm):
          <input type="number" v-model.number="drawStampWidth" min="1" max="50" step="1"
        /></label>
        <label
          >印章高度 (mm):
          <input type="number" v-model.number="drawStampHeight" min="1" max="50" step="1"
        /></label>
        <label
          >圆形边框宽度 (mm): <input type="number" step="0.1" v-model.number="circleBorderWidth"
        /></label>
        <label>圆形边框颜色: <input type="color" v-model="circleBorderColor" /></label>
      </div>

      <!-- 公司名称设置 -->
      <div class="control-group" id="company-name-settings">
        <h3>公司名称设置</h3>
        <label>公司名称: <input v-model="companyName" /></label>
        <label
          >字体大小 (mm): <input type="number" v-model.number="companyFontSizeMM" step="0.1"
        /></label>
        <label>
          <span>压缩比例：{{ companyNameCompression.toFixed(2) }}</span>
          <input
            type="range"
            v-model.number="companyNameCompression"
            min="0.5"
            max="1.5"
            step="0.05"
          />
        </label>
        <label>
          <span>分布因子：{{ textDistributionFactor.toFixed(1) }}</span>
          <input
            type="range"
            v-model.number="textDistributionFactor"
            min="1"
            max="100"
            step="0.5"
          />
        </label>
        <label>
          <span>边距 (mm): </span>
          <input type="number" v-model.number="textMarginMM" min="-10" max="10" step="0.05" />
        </label>
      </div>

      <!-- 底部文字设置 -->
      <div class="control-group" id="bottom-text-settings">
        <h3>底部文字设置</h3>
        <label>底部文字: <input type="text" v-model="bottomText" /></label>
        <label
          >字体大小 (mm):
          <input type="number" v-model.number="bottomTextFontSizeMM" min="1" max="10" step="0.1"
        /></label>
        <label>
          <span>压缩比例：{{ bottomTextCompression.toFixed(2) }}</span>
          <input
            type="range"
            v-model.number="bottomTextCompression"
            min="0.5"
            max="1.5"
            step="0.05"
          />
        </label>
        <label>
          <span>字符间距 (mm)：{{ bottomTextLetterSpacing.toFixed(2) }}</span>
          <input
            type="range"
            v-model.number="bottomTextLetterSpacing"
            min="-1"
            max="10"
            step="0.05"
          />
        </label>
        <label>
          垂直位置调整 (mm):
          <input type="number" v-model.number="bottomTextPositionY" min="-10" max="10" step="0.1" />
        </label>
      </div>

      <!-- 印章编码设置 -->
      <div class="control-group" id="code-settings">
        <h3>印章编码设置</h3>
        <label>印章编码: <input v-model="code" /></label>
        <label
          >字体大小 (mm): <input type="number" v-model.number="codeFontSizeMM" step="0.1"
        /></label>
        <label>
          <span>压缩比例：{{ codeCompression.toFixed(2) }}</span>
          <input type="range" v-model.number="codeCompression" min="0.5" max="1.5" step="0.05" />
        </label>
        <label>
          <span>分布因子: {{ codeDistributionFactor.toFixed(1) }}</span>
          <input
            type="range"
            v-model.number="codeDistributionFactor"
            min="10"
            max="40"
            step="0.5"
          />
        </label>
        <label>
          边距 (mm):
          <input type="number" v-model.number="codeMarginMM" min="-10" max="10" step="0.05" />
        </label>
      </div>

      <!-- 税号设置 -->
      <div class="control-group" id="tax-number-settings">
        <h3>税号设置</h3>
        <label>税号: <input v-model="taxNumber" /></label>
        <label>
          <span>压缩比例：{{ taxNumberCompression.toFixed(2) }}</span>
          <input
            type="range"
            v-model.number="taxNumberCompression"
            min="0.5"
            max="1.5"
            step="0.05"
          />
        </label>
        <label>
          <span>字符间距 (mm)：{{ taxNumberLetterSpacing.toFixed(2) }}</span>
          <input
            type="range"
            v-model.number="taxNumberLetterSpacing"
            min="-1"
            max="20"
            step="0.05"
          />
        </label>
        <label>
          <span>垂直位置调整 (mm)：{{ taxNumberPositionY.toFixed(1) }}</span>
          <input type="range" v-model.number="taxNumberPositionY" min="-10" max="10" step="0.1" />
        </label>
      </div>

      <!-- 五角星设置 -->
      <div class="control-group" id="star-settings">
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
          五角星垂直位置 (mm):
          <input type="number" v-model.number="starPositionY" min="-10" max="10" step="0.1" />
        </label>
      </div>

      <!-- 防伪纹路设置 -->
      <div class="control-group">
        <h3>防伪纹路设置</h3>
        <label>
          启用防伪纹路:
          <input type="checkbox" v-model="securityPatternEnabled" />
        </label>
        <button @click="drawStamp(true, false)">刷新纹路</button>
        <label
          >纹路数量:
          <input type="range" v-model.number="securityPatternCount" min="1" max="20" step="1"
        /></label>
        <label
          >纹路长度 (mm):
          <input type="range" v-model.number="securityPatternLength" min="0.1" max="20" step="0.1"
        /></label>
        <label
          >纹路宽度 (mm):
          <input
            type="range"
            v-model.number="securityPatternWidth"
            min="0.05"
            max="0.5"
            step="0.05"
        /></label>
      </div>

      <!-- 做旧效果设置 -->
      <div class="control-group">
        <h3>做旧效果</h3>
        <label class="checkbox-label">
          <input type="checkbox" v-model="applyAging" />
          启用做旧效果
        </label>
        <label v-if="applyAging">
          做旧强度:
          <input type="range" v-model.number="agingIntensity" min="0" max="100" step="1" />
        </label>
        <button @click="drawStamp(false, true)">刷新做旧</button>
      </div>

      <!-- 标尺设置 -->
      <div class="control-group">
        <h3>标尺设置</h3>
        <label class="checkbox-label">
          <input type="checkbox" v-model="showFullRuler" />
          显示完整标尺
        </label>
      </div>
    </div>

    <!-- Canvas 容器 -->
    <div class="canvas-container">
      <canvas
        ref="stampCanvas"
        width="600"
        height="600"
        @mousemove="onMouseMove"
        @mouseleave="onMouseLeave"
        @mousedown="onMouseDown"
        @mouseup="onMouseUp"
        @click="onCanvasClick"
      ></canvas>
    </div>
  </div>
</template>
<script setup lang="ts">
import { ref, onMounted, watch, computed } from 'vue'
import { useRouter } from 'vue-router'
import NavigationBar from './NavigationBar.vue'
const editorControls = ref<HTMLDivElement | null>(null)
const router = useRouter()
const stampCanvas = ref<HTMLCanvasElement | null>(null)
const MM_PER_PIXEL = 10 // 毫米换算像素

const RULER_WIDTH = 80
const RULER_HEIGHT = 80

const offscreenCanvas = ref<HTMLCanvasElement | null>(null)

// 定义印章区域及其对应的设置组 ID
const stampAreas = [
  {
    name: 'companyName',
    id: 'company-name-settings',
    shape: 'arc',
    startAngle: Math.PI,
    endAngle: 2 * Math.PI
  },
  { name: 'bottomText', id: 'bottom-text-settings', shape: 'rectangle', y: 0.7, height: 0.3 },
  { name: 'taxNumber', id: 'tax-number-settings', shape: 'rectangle', y: 0.4, height: 0.3 },
  { name: 'code', id: 'code-settings', shape: 'arc', startAngle: 0, endAngle: Math.PI },
  { name: 'star', id: 'star-settings', shape: 'circle', radius: 0.2 },
  { name: 'border', id: 'stamp-settings', shape: 'ellipse' }
]
// 添加响应式数据
const companyName = ref('绘制印章有限责任公司')
// 印章编码
const code = ref('1234567890123')
// 税号
const taxNumber = ref('000000000000000000')
// 公司名称字体大小（毫米）
const companyFontSizeMM = ref(4.2)
// 编码字体大小（毫米）
const codeFontSizeMM = ref(2.2)
// 编码字体宽度（毫米）
const codeFontWidthMM = ref(1.7)
// 圆形印章半径（毫米）
const circleRadius = ref(20)
// 圆形边框宽度（毫米）
const circleBorderWidth = ref(1)
// 圆形边框颜色
const circleBorderColor = ref('#ff0000')
// 五角星直径（毫米）
const starDiameter = ref(14)
// 做旧效果
const applyAging = ref(false)
// 添加新的响应式数据
const agingIntensity = ref(50)
// 文字分布因子，控制公司名称文字在椭圆上的分布范围
const textDistributionFactor = ref(20)
// 文字边距，控制公司名称文字距离椭圆边缘的距离（单位：毫米）
const textMarginMM = ref(1) // 默认值为1mm
// 编码边距，控制印章编码距离椭圆边缘的距离（单位：毫米）
const codeMarginMM = ref(1) // 默认值为1mm
// 编码分布因子，控制印章编码在椭圆下方的分布范围
const codeDistributionFactor = ref(20) // 默认值可以根据需要调整
// 印章底部文字
const bottomText = ref('合同专用章')
// 底部文字大小，默认 4mm
const bottomTextFontSizeMM = ref(4.6)
const bottomTextFontWidthMM = ref(3)
// 底部文字字符间距，默认 0
const bottomTextLetterSpacing = ref(0)
// 五角星垂直位置调整，默认 0
const starPositionY = ref(0)
// 底部文字垂直位置调整，默认 0
const bottomTextPositionY = ref(-5)
const companyNameCompression = ref(1)
const bottomTextCompression = ref(1)
const codeCompression = ref(1)
// 防伪纹路
const securityPatternEnabled = ref(true)
const securityPatternDensity = ref(0.5)
const securityPatternWidth = ref(0.2) // 纹路宽度，单位为毫米
const securityPatternColor = ref('#FF0000')
const securityPatternCount = ref(5) // 防伪纹路数量
const securityPatternLength = ref(2) // 纹路长度，单位为毫米
const securityPatternAngleRange = ref(30) // 纹路倾斜角度范围，单位为度
const isDragging = ref(false)
const dragStartX = ref(0)
const dragStartY = ref(0)

const stampOffsetX = ref(0) // 水平偏移量（单位：毫米）
const stampOffsetY = ref(0) // 垂直偏移量（单位：毫米）
const showFullRuler = ref(false)
const shouldDrawStar = ref(false) // 默认绘制五角星
const taxNumberCompression = ref(1) // 税号文字宽度缩放比例
const taxNumberLetterSpacing = ref(0.3) // 税号文字间距（单位：毫米）
const taxNumberPositionY = ref(0) // 税号垂直位置调整，默认为0
const goBack = () => {
  router.back()
}

// 新增一个响应式变量来存储做旧效果的参数
const agingEffectParams = ref<
  Array<{
    x: number
    y: number
    noiseSize: number
    noise: number
    strongNoiseSize: number
    strongNoise: number
    fade: number
    seed: number // 保存随机数字
  }>
>([])

const addAgingEffect = (
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  forceRefresh: boolean = false
) => {
  const imageData = ctx.getImageData(0, 0, width, height)
  const data = imageData.data

  const centerX = width / 2
  const centerY = height / 2
  const radius = (circleRadius.value + 1) * MM_PER_PIXEL

  // 如果需要刷新或者参数数组为空,则重新生成参数
  if (forceRefresh || agingEffectParams.value.length === 0) {
    agingEffectParams.value = []
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const index = (y * width + x) * 4
        const distanceFromCenter = Math.sqrt(Math.pow(x - centerX, 2) + Math.pow(y - centerY, 2))
        if (
          distanceFromCenter <= radius &&
          data[index] > 200 &&
          data[index + 1] < 50 &&
          data[index + 2] < 50
        ) {
          const intensityFactor = agingIntensity.value / 100
          let seed = Math.random()
          agingEffectParams.value.push({
            x,

            y,
            noiseSize: Math.random() * 3 + 1,
            noise: Math.random() * 200 * intensityFactor,
            strongNoiseSize: Math.random() * 5 + 2,
            strongNoise: Math.random() * 250 * intensityFactor + 5,
            fade: Math.random() * 50 * intensityFactor,
            seed: seed
          })
        }
      }
    }
  }

  // 使用保存的参数应用做旧效果
  agingEffectParams.value.forEach((param) => {
    const { x, y, noiseSize, noise, strongNoiseSize, strongNoise, fade, seed } = param
    const index = (y * width + x) * 4

    if (seed < 0.4) {
      addCircularNoise(data, width, x, y, noiseSize, noise)
    }

    if (seed < 0.05) {
      addCircularNoise(data, width, x, y, strongNoiseSize, strongNoise)
    }

    if (seed < 0.2) {
      data[index] = Math.min(255, data[index] + fade)
      data[index + 1] = Math.min(255, data[index + 1] + fade)
      data[index + 2] = Math.min(255, data[index + 2] + fade)
    }
  })

  ctx.putImageData(imageData, 0, 0)
}

const drawFullRuler = (ctx: CanvasRenderingContext2D, width: number, height: number) => {
  if (!showFullRuler.value) return

  ctx.save()
  ctx.strokeStyle = '#bbbbbb' // 浅灰色，半透明
  ctx.lineWidth = 1
  ctx.setLineDash([5, 5]) // 设置虚线样式

  // 绘制垂直线
  for (let x = RULER_WIDTH; x < width; x += 5 * MM_PER_PIXEL) {
    ctx.beginPath()
    ctx.moveTo(x, RULER_HEIGHT)
    ctx.lineTo(x, height)
    ctx.stroke()
  }

  // 绘制水平线
  for (let y = RULER_HEIGHT; y < height; y += 5 * MM_PER_PIXEL) {
    ctx.beginPath()
    ctx.moveTo(RULER_WIDTH, y)
    ctx.lineTo(width, y)
    ctx.stroke()
  }

  ctx.restore()
}

// 辅助函数,用于添加圆形噪点
const addCircularNoise = (
  data: Uint8ClampedArray,
  width: number,
  x: number,
  y: number,
  size: number,
  intensity: number
) => {
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

const saveStampAsPNG = () => {
  const canvas = stampCanvas.value
  if (!canvas) return

  // 设置固定的输出尺寸
  const outputSize = 512

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
  const sourceX = (canvas.width - originalStampSize) / 2 + stampOffsetX.value * MM_PER_PIXEL
  const sourceY = (canvas.height - originalStampSize) / 2 + stampOffsetY.value * MM_PER_PIXEL

  // 减少边距，这里我们将边距从 10% 减少到 2%
  const margin = outputSize * 0.01 // 2% 的边距
  const drawSize = outputSize

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

  // 如果启用了做旧效果，在新的 canvas 上应用做旧效果
  if (applyAging.value) {
    addAgingEffect(saveCtx, outputSize, outputSize, false)
  }

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

const drawEllipse = (
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  radiusX: number,
  radiusY: number,
  borderWidth: number,
  borderColor: string
) => {
  ctx.beginPath()
  ctx.ellipse(x, y, radiusX, radiusY, 0, 0, Math.PI * 2)
  ctx.strokeStyle = borderColor
  ctx.lineWidth = borderWidth
  ctx.stroke()
}

const onCanvasClick = (event: MouseEvent) => {
  const canvas = stampCanvas.value
  if (!canvas) return

  const rect = canvas.getBoundingClientRect()
  const x = event.clientX - rect.left - RULER_WIDTH
  const y = event.clientY - rect.top - RULER_HEIGHT

  const centerX = canvas.width / 2 - RULER_WIDTH + stampOffsetX.value * MM_PER_PIXEL
  const centerY = canvas.height / 2 - RULER_HEIGHT + stampOffsetY.value * MM_PER_PIXEL
  const radiusX = stampWidth.value * MM_PER_PIXEL
  const radiusY = stampHeight.value * MM_PER_PIXEL

  const clickedArea = stampAreas.find((area) => {
    switch (area.shape) {
      case 'arc':
        const angle = Math.atan2(y - centerY, x - centerX)
        return angle >= area.startAngle && angle <= area.endAngle
      case 'rectangle':
        return y >= centerY + radiusY * area.y && y <= centerY + radiusY * (area.y + area.height)
      case 'circle':
        const distance = Math.sqrt((x - centerX) ** 2 + (y - centerY) ** 2)
        return distance <= radiusX * area.radius
      case 'ellipse':
        return ((x - centerX) / radiusX) ** 2 + ((y - centerY) / radiusY) ** 2 <= 1
    }
  })

  if (clickedArea) {
    scrollToSection(clickedArea.id)
  }
}

const scrollToSection = (sectionId: string) => {
  const controlsElement = editorControls.value
  if (!controlsElement) return

  const section = controlsElement.querySelector(`#${sectionId}`)
  if (section) {
    section.scrollIntoView({ behavior: 'smooth' })
  }
}

// 新增一个响应式变量来存储随机参数
const securityPatternParams = ref<Array<{ angle: number; lineAngle: number }>>([])

const drawSecurityPattern = (
  ctx: CanvasRenderingContext2D,
  centerX: number,
  centerY: number,
  radiusX: number,
  radiusY: number,
  forceRefresh: boolean = false
) => {
  if (!securityPatternEnabled.value) return

  ctx.save()
  ctx.strokeStyle = '#FFFFFF'
  ctx.lineWidth = securityPatternWidth.value * MM_PER_PIXEL
  ctx.globalCompositeOperation = 'destination-out'

  const angleRangeRad = (securityPatternAngleRange.value * Math.PI) / 180

  // 如果需要刷新或者参数数组为空,则重新生成参数
  if (forceRefresh || securityPatternParams.value.length === 0) {
    securityPatternParams.value = []
    for (let i = 0; i < securityPatternCount.value; i++) {
      const angle = Math.random() * Math.PI * 2
      const normalAngle = Math.atan2(radiusY * Math.cos(angle), radiusX * Math.sin(angle))
      const lineAngle = normalAngle + (Math.random() - 0.5) * angleRangeRad
      securityPatternParams.value.push({ angle, lineAngle })
    }
  }

  // 使用保存的参数绘制纹路
  securityPatternParams.value.forEach(({ angle, lineAngle }) => {
    const x = centerX + radiusX * Math.cos(angle)
    const y = centerY + radiusY * Math.sin(angle)

    const length = securityPatternLength.value * MM_PER_PIXEL
    const startX = x - (length / 2) * Math.cos(lineAngle)
    const startY = y - (length / 2) * Math.sin(lineAngle)
    const endX = x + (length / 2) * Math.cos(lineAngle)
    const endY = y + (length / 2) * Math.sin(lineAngle)

    ctx.beginPath()
    ctx.moveTo(startX, startY)
    ctx.lineTo(endX, endY)
    ctx.stroke()
  })

  ctx.restore()
}

const drawCompanyName = (
  ctx: CanvasRenderingContext2D,
  centerX: number,
  centerY: number,
  radiusX: number,
  radiusY: number,
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

  // 调整起始和结束角度，使文字均匀分布在椭圆上半部分
  const totalAngle = Math.PI * (1 + characterCount / textDistributionFactor.value)
  const startAngle = Math.PI + (Math.PI - totalAngle) / 2
  const anglePerChar = totalAngle / characterCount

  characters.forEach((char, index) => {
    const angle = startAngle + anglePerChar * (index + 0.5)
    const x =
      centerX + Math.cos(angle) * (radiusX - fontSize / 2 - textMarginMM.value * MM_PER_PIXEL)
    const y =
      centerY + Math.sin(angle) * (radiusY - fontSize / 2 - textMarginMM.value * MM_PER_PIXEL)

    ctx.save()
    ctx.translate(x, y)
    ctx.rotate(angle + Math.PI / 2)
    ctx.scale(companyNameCompression.value, 1) // 应用压缩
    ctx.fillText(char, 0, 0)
    ctx.restore()
  })

  ctx.restore()
}

const drawCode = (
  ctx: CanvasRenderingContext2D,
  centerX: number,
  centerY: number,
  radiusX: number,
  radiusY: number,
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

  // 动态调整总角度
  const totalAngle = Math.PI * (characterCount / codeDistributionFactor.value) * 0.5
  const startAngle = Math.PI / 2 + totalAngle / 2
  const endAngle = Math.PI / 2 - totalAngle / 2
  const anglePerChar = totalAngle / (characterCount - 1)

  characters.forEach((char, index) => {
    const angle = startAngle - anglePerChar * index
    const x =
      centerX + Math.cos(angle) * (radiusX - fontSize / 2 - codeMarginMM.value * MM_PER_PIXEL)
    const y =
      centerY + Math.sin(angle) * (radiusY - fontSize / 2 - codeMarginMM.value * MM_PER_PIXEL)

    ctx.save()
    ctx.translate(x, y)
    ctx.rotate(angle - Math.PI / 2) // 逆时针旋转文字
    ctx.scale(codeCompression.value, 1) // 应用压缩
    ctx.fillText(char, 0, 0)
    ctx.restore()
  })

  ctx.restore()
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

  // 计算文字位置（在五角星正下方）
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

const drawStampWidth = ref(40)
const drawStampHeight = ref(30)

// 印章尺寸，本来是20*15，现在改成19.5*14.5，为了减去线条宽度的一半
const stampHeight = computed(() => {
  return drawStampHeight.value / 2 - circleBorderWidth.value / 2
})

const stampWidth = computed(() => {
  return drawStampWidth.value / 2 - circleBorderWidth.value / 2
})

const drawStamp = (refreshSecurityPattern: boolean = false, refreshOld: boolean = false) => {
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
  const oldCenterX = canvas.width / 2
  const oldCenterY = canvas.height / 2
  const radius = circleRadius.value * MM_PER_PIXEL
  const radiusX = stampWidth.value * MM_PER_PIXEL // 长轴半径
  const radiusY = stampHeight.value * MM_PER_PIXEL // 短轴半径

  // 计算偏移后的中心点
  const centerX = oldCenterX + stampOffsetX.value * MM_PER_PIXEL
  const centerY = oldCenterY + stampOffsetY.value * MM_PER_PIXEL

  // 绘制椭圆边框
  offscreenCtx.beginPath()
  offscreenCtx.ellipse(centerX, centerY, radiusX, radiusY, 0, 0, Math.PI * 2)
  offscreenCtx.strokeStyle = 'white' // 使用白色，稍后会变成红色
  offscreenCtx.lineWidth = circleBorderWidth.value * MM_PER_PIXEL
  offscreenCtx.stroke()

  // 绘制其他元素（公司名称、底部文字、编码等）
  offscreenCtx.fillStyle = 'white' // 使用白色，稍后会变成红色

  // 1. 设置画布背景
  ctx.fillStyle = 'white'
  ctx.fillRect(0, 0, canvas.width, canvas.height)

  // 2. 计算圆心位置
  //   const centerX = canvas.width / 2
  //   const centerY = canvas.height / 2

  drawEllipse(
    offscreenCtx,
    centerX,
    centerY,
    stampWidth.value * MM_PER_PIXEL, // 长轴半径
    stampHeight.value * MM_PER_PIXEL, // 短轴半径
    circleBorderWidth.value * MM_PER_PIXEL,
    circleBorderColor.value
  )

  // 在椭圆边框上绘制防伪纹路
  drawSecurityPattern(
    offscreenCtx,
    centerX,
    centerY,
    circleRadius.value * MM_PER_PIXEL,
    circleRadius.value * MM_PER_PIXEL * 0.75,
    refreshSecurityPattern
  )

  // 在 drawStamp 函数中调用 drawCompanyName 时，传入椭圆的长轴和短轴半径
  drawCompanyName(
    offscreenCtx,
    centerX,
    centerY,
    stampWidth.value * MM_PER_PIXEL, // 长轴半径
    stampHeight.value * MM_PER_PIXEL, // 短轴半径
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

  // 绘制税号
  const taxNumberFontHeight = 3.7 * MM_PER_PIXEL
  const taxNumberTotalWidth = 26 * MM_PER_PIXEL
  const taxNumberCharWidth = 1.3 * MM_PER_PIXEL
  drawTaxNumber(
    offscreenCtx,
    centerX,
    centerY,
    taxNumber.value,
    taxNumberFontHeight,
    taxNumberTotalWidth,
    taxNumberPositionY.value
  )

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

  drawCode(
    offscreenCtx,
    centerX,
    centerY,
    stampWidth.value * MM_PER_PIXEL, // 长轴半径
    stampHeight.value * MM_PER_PIXEL, // 短轴半径
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

  // 在绘制完所有内容后，添加做旧效果
  if (applyAging.value) {
    addAgingEffect(ctx, canvas.width, canvas.height, refreshOld)
  }

  // 7. 绘制水平标尺
  drawRuler(ctx, canvas.width, RULER_HEIGHT, true)

  // 8. 绘制垂直标尺
  drawRuler(ctx, canvas.height, RULER_WIDTH, false)

  // 在绘制完所有内容后，添加完整标尺
  drawFullRuler(ctx, canvas.width, canvas.height)
}

// 绘制中间横排税号
const drawTaxNumber = (
  ctx: CanvasRenderingContext2D,
  centerX: number,
  centerY: number,
  text: string,
  fontSize: number,
  totalWidth: number,
  positionY: number
) => {
  ctx.save()
  ctx.font = `${fontSize}px Arial`
  ctx.fillStyle = circleBorderColor.value
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'

  const characters = text.split('')
  const charCount = characters.length
  const letterSpacing = taxNumberLetterSpacing.value * MM_PER_PIXEL

  // 计算压缩后的总宽度
  const compressedTotalWidth = totalWidth * taxNumberCompression.value

  // 计算单个字符的宽度（考虑压缩）
  const charWidth = (compressedTotalWidth - (charCount - 1) * letterSpacing) / charCount

  // 计算整个文本的实际宽度
  const actualWidth = charCount * charWidth + (charCount - 1) * letterSpacing

  // 计算起始位置，确保文字居中
  const startX = centerX - actualWidth / 2 + charWidth / 2
  const adjustedCenterY = centerY + positionY * MM_PER_PIXEL // 使用调整后的Y位置

  characters.forEach((char, index) => {
    const x = startX + index * (charWidth + letterSpacing)
    ctx.save()
    ctx.translate(x, adjustedCenterY)
    ctx.scale(taxNumberCompression.value, 1)
    ctx.fillText(char, 0, 0)
    ctx.restore()
  })

  ctx.restore()
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
const onMouseMove = (event: MouseEvent) => {
  if (isDragging.value) {
    const newOffsetX = (event.clientX - dragStartX.value) / MM_PER_PIXEL
    const newOffsetY = (event.clientY - dragStartY.value) / MM_PER_PIXEL
    stampOffsetX.value = Math.round(newOffsetX * 10) / 10 // 四舍五入到小数点后一位
    stampOffsetY.value = Math.round(newOffsetY * 10) / 10
    drawStamp(false, false)
  } else {
    // 原有的鼠标移动逻辑
    const canvas = stampCanvas.value
    if (!canvas) return

    const rect = canvas.getBoundingClientRect()
    const x = event.clientX - rect.left
    const y = event.clientY - rect.top
    const mmX = Math.round(((x - RULER_WIDTH) / MM_PER_PIXEL) * 10) / 10
    const mmY = Math.round(((y - RULER_HEIGHT) / MM_PER_PIXEL) * 10) / 10

    drawStamp(false, false)
    highlightRulerPosition(mmX, mmY)
    drawCrossLines(x, y)
  }
}

const onMouseLeave = () => {
  isDragging.value = false
  drawStamp(false, false)
}

const updateStamp = () => {
  drawStamp(false, false)
}

const onMouseDown = (event: MouseEvent) => {
  isDragging.value = true
  dragStartX.value = event.clientX - stampOffsetX.value * MM_PER_PIXEL
  dragStartY.value = event.clientY - stampOffsetY.value * MM_PER_PIXEL
}

const onMouseUp = () => {
  isDragging.value = false
}

onMounted(() => {
  // 创建离屏canvas
  offscreenCanvas.value = document.createElement('canvas')
  const canvas = stampCanvas.value
  if (canvas && offscreenCanvas.value) {
    offscreenCanvas.value.width = canvas.width
    offscreenCanvas.value.height = canvas.height
  }

  drawStamp(false, false)
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
    bottomText,
    bottomTextFontSizeMM,
    bottomTextLetterSpacing,
    starPositionY,
    bottomTextPositionY,
    taxNumber,
    applyAging,
    agingIntensity,
    companyNameCompression,
    bottomTextCompression,
    codeCompression,
    bottomTextLetterSpacing,
    securityPatternDensity,
    securityPatternColor,
    securityPatternDensity,
    securityPatternColor,
    securityPatternEnabled,
    securityPatternCount,
    securityPatternLength,
    securityPatternWidth,
    drawStampWidth,
    drawStampHeight,
    shouldDrawStar,
    starDiameter,
    starPositionY,
    taxNumberCompression,
    taxNumberLetterSpacing,
    taxNumberPositionY
  ],
  () => {
    drawStamp(false, false)
  }
)
</script>
<style scoped>
.container {
  display: flex;
  height: 50%; /* 使用视口高度 */
  overflow: hidden;
}

.editor-controls {
  width: 300px;
  padding: 10px;
  background-color: #f0f0f0;
  overflow-y: auto; /* 允许垂直滚动 */
  max-height: 70vh; /* 最大高度为视口高度 */
  box-sizing: border-box; /* 确保padding不会增加总宽度 */
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
  box-sizing: border-box; /* 确保padding不会增加总宽度 */
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
  overflow: auto; /* 允许内容溢出时滚动 */
}

canvas {
  max-width: 100%;
  max-height: 100%;
  object-fit: contain;
}
</style>
