type ISecurityPattern = {
  openSecurityPattern: boolean
  securityPatternWidth: number
  securityPatternLength: number
  securityPatternEnabled: boolean
  securityPatternCount: number
  securityPatternAngleRange: number
}

type ICompanyName = {
  companyName: string
  companyNameCompression: number
  textMarginMM: number
  textDistributionFactor: number
  textFontSizeMM: number
  fontFamily: string
}

type ICode = {
  code: string
  codeCompression: number
  codeFontSizeMM: number
  fontFamily: string
}

type IAgingEffectParams = {
  x: number
  y: number
  noiseSize: number
  noise: number
  strongNoiseSize: number
  strongNoise: number
  fade: number
  seed: number
}

type IAgingEffect = {
  applyAging: boolean
  agingIntensity: number
}

type IDrawStar = {
  drawStar: boolean
  starDiameter: number
}

type IShowRuler = {
  showRuler: boolean
  showFullRuler: boolean
}

// 绘制印章的参数
type IDrawStampConfig = {
  ruler: IShowRuler
  drawStar: IDrawStar
  securityPattern: ISecurityPattern
  companyName: ICompanyName
  code: ICode
  width: number
  height: number
  borderWidth: number
  primaryColor: string
  refreshSecurityPattern: boolean
  refreshOld: boolean
}

const RULER_WIDTH = 80
const RULER_HEIGHT = 80

/**
 * 绘制印章工具类
 */
export class DrawStampUtils {
  // 主色
  private primaryColor: string = 'red'
  private mmToPixel: number
  private canvasCtx: CanvasRenderingContext2D
  private offscreenCanvas: HTMLCanvasElement
  private canvas: HTMLCanvasElement
  private stampOffsetX: number = 0
  private stampOffsetY: number = 0
  private applyAging: boolean = false
  private agingIntensity: number = 50
  private ruler: IShowRuler = {
    showRuler: true,
    showFullRuler: true
  }
  private drawStar: IDrawStar = {
    drawStar: false,
    starDiameter: 14
  }
  // 防伪纹路
  private securityPattern: ISecurityPattern = {
    openSecurityPattern: false,
    securityPatternWidth: 0.1,
    securityPatternLength: 0.1,
    securityPatternEnabled: false,
    securityPatternCount: 5,
    securityPatternAngleRange: 30
  }
  private companyName: ICompanyName = {
    companyName: '印章绘制公司',
    companyNameCompression: 1,
    textMarginMM: 0.1,
    textDistributionFactor: 1,
    textFontSizeMM: 0.1,
    fontFamily: 'SimSun'
  }
  private code: ICode = {
    code: '1234567890',
    codeCompression: 1,
    codeFontSizeMM: 0.1,
    fontFamily: 'Arial'
  }
  // 总的印章绘制参数
  private drawStampConfigs: IDrawStampConfig = {
    ruler: this.ruler,
    drawStar: this.drawStar,
    securityPattern: this.securityPattern,
    companyName: this.companyName,
    code: this.code,
    width: 40,
    height: 30,
    primaryColor: this.primaryColor,
    borderWidth: 1,
    refreshSecurityPattern: false,
    refreshOld: false
  }

  private securityPatternParams: Array<{ angle: number; lineAngle: number }> = []

  /**
   * 构造函数
   * @param canvas 画布
   * @param mmToPixel 毫米到像素的转换比例
   */
  constructor(canvas: HTMLCanvasElement | null, mmToPixel: number) {
    if (!canvas) {
      throw new Error('Canvas is null')
    }
    const ctx = canvas.getContext('2d')
    if (!ctx) {
      throw new Error('Failed to get canvas context')
    }
    this.canvasCtx = ctx
    this.mmToPixel = mmToPixel

    // 创建离屏canvas
    this.offscreenCanvas = document.createElement('canvas')
    this.canvas = canvas
    if (this.canvas && this.offscreenCanvas) {
      this.offscreenCanvas.width = canvas.width
      this.offscreenCanvas.height = canvas.height
    }
  }

  setSecurityPattern(securityPattern: ISecurityPattern) {
    this.securityPattern = securityPattern
    // 刷新防伪纹路
    this.refreshSecurityPattern()
  }

  refreshSecurityPattern() {
    this.securityPatternParams = []
  }

  /**
   * 绘制五角星
   * @param canvasCtx 画笔
   * @param x 圆心x坐标
   * @param y 圆心y坐标
   * @param r 半径
   */
  drawStarShape(x: number, y: number, r: number) {
    const starPath = 'M 0 -1 L 0.588 0.809 L -0.951 -0.309 L 0.951 -0.309 L -0.588 0.809 Z'
    const pathData = starPath.split(/(?=[MLZ])/)

    this.canvasCtx.save()
    this.canvasCtx.translate(x, y)
    this.canvasCtx.scale(r, r)
    this.canvasCtx.beginPath()

    pathData.forEach((command) => {
      const [cmd, ...params] = command.trim().split(/\s+/)
      switch (cmd) {
        case 'M':
          this.canvasCtx.moveTo(parseFloat(params[0]), parseFloat(params[1]))
          break
        case 'L':
          this.canvasCtx.lineTo(parseFloat(params[0]), parseFloat(params[1]))
          break
        case 'Z':
          this.canvasCtx.closePath()
          break
      }
    })

    this.canvasCtx.fillStyle = this.primaryColor
    this.canvasCtx.fill()
    this.canvasCtx.restore()
  }

  /**
   * 绘制印章类型文字
   * @param centerX 圆心x坐标
   * @param centerY 圆心y坐标
   * @param radius 半径
   * @param text 文字
   * @param fontSize 字体大小
   * @param letterSpacing 字符间距
   * @param positionY 文字位置
   * @param fillColor 填充颜色
   */
  drawStampTypeText(
    centerX: number,
    centerY: number,
    radius: number,
    text: string,
    fontSize: number,
    letterSpacing: number,
    positionY: number,
    textCompression: number
  ) {
    this.canvasCtx.save()
    this.canvasCtx.font = `${fontSize}px SimSun`
    this.canvasCtx.fillStyle = this.primaryColor
    this.canvasCtx.textAlign = 'center'
    this.canvasCtx.textBaseline = 'middle'

    // 计算文字位置（在五角星正下方）
    const textY = centerY + radius * 0.5 + positionY * this.mmToPixel

    this.canvasCtx.save()
    this.canvasCtx.translate(centerX, textY)
    this.canvasCtx.scale(textCompression, 1) // 应用压缩

    const chars = text.split('')
    const charWidths = chars.map((char) => this.canvasCtx.measureText(char).width)
    const totalWidth =
      charWidths.reduce((sum, width) => sum + width, 0) +
      (chars.length - 1) * letterSpacing * this.mmToPixel

    let currentX = -totalWidth / 2 // 从文本的左边缘开始

    chars.forEach((char, index) => {
      this.canvasCtx.fillText(char, currentX + charWidths[index] / 2, 0) // 绘制在字符的中心
      currentX += charWidths[index] + letterSpacing * this.mmToPixel
    })

    this.canvasCtx.restore()
  }

  /**
   * 绘制防伪纹路
   * @param centerX 圆心x坐标
   * @param centerY 圆心y坐标
   * @param radiusX 半径x
   * @param radiusY 半径y
   * @param securityPatternWidth 纹路宽度
   * @param securityPatternLength 纹路长度
   */
  drawSecurityPattern(
    ctx: CanvasRenderingContext2D,
    centerX: number,
    centerY: number,
    radiusX: number,
    radiusY: number,
    forceRefresh: boolean
  ) {
    if (!this.securityPattern.openSecurityPattern) return

    ctx.save()
    ctx.strokeStyle = '#FFFFFF'
    ctx.lineWidth = this.securityPattern.securityPatternWidth * this.mmToPixel
    ctx.globalCompositeOperation = 'destination-out'

    const angleRangeRad = (this.securityPattern.securityPatternAngleRange * Math.PI) / 180

    // 如果需要刷新或者参数数组为空,则重新生成参数
    if (forceRefresh || this.securityPatternParams.length === 0) {
      this.securityPatternParams = []
      for (let i = 0; i < this.securityPattern.securityPatternCount; i++) {
        const angle = Math.random() * Math.PI * 2
        const normalAngle = Math.atan2(radiusY * Math.cos(angle), radiusX * Math.sin(angle))
        const lineAngle = normalAngle + (Math.random() - 0.5) * angleRangeRad
        this.securityPatternParams.push({ angle, lineAngle })
      }
    }

    // 使用保存的参数绘制纹路
    this.securityPatternParams.forEach(({ angle, lineAngle }) => {
      const x = centerX + radiusX * Math.cos(angle)
      const y = centerY + radiusY * Math.sin(angle)

      const length = this.securityPattern.securityPatternLength * this.mmToPixel
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

  /**
   * 绘制椭圆
   * @param x 圆心x坐标
   * @param y 圆心y坐标
   * @param radiusX 半径x
   * @param radiusY 半径y
   * @param borderWidth 边框宽度
   * @param borderColor 边框颜色
   */
  drawEllipse(
    x: number,
    y: number,
    radiusX: number,
    radiusY: number,
    borderWidth: number,
    borderColor: string
  ) {
    this.canvasCtx.beginPath()
    this.canvasCtx.ellipse(x, y, radiusX, radiusY, 0, 0, Math.PI * 2)
    this.canvasCtx.strokeStyle = borderColor
    this.canvasCtx.lineWidth = borderWidth
    this.canvasCtx.stroke()
  }

  /**
   * 绘制公司名称
   * @param centerX 圆心x坐标
   * @param centerY 圆心y坐标
   * @param radiusX 椭圆长轴半径
   * @param radiusY 椭圆短轴半径
   * @param text 公司名称文本
   * @param fontSize 字体大小
   */
  drawCompanyName(
    centerX: number,
    centerY: number,
    radiusX: number,
    radiusY: number,
    text: string,
    fontSize: number
  ) {
    this.canvasCtx.save()
    this.canvasCtx.font = `${fontSize}px SimSun`
    this.canvasCtx.fillStyle = this.primaryColor
    this.canvasCtx.textAlign = 'center'
    this.canvasCtx.textBaseline = 'middle'

    const characters = text.split('')
    const characterCount = characters.length

    // 调整起始和结束角度，使文字均匀分布在椭圆上半部分
    const totalAngle = Math.PI * (1 + characterCount / this.companyName.textDistributionFactor)
    const startAngle = Math.PI + (Math.PI - totalAngle) / 2
    const anglePerChar = totalAngle / characterCount

    characters.forEach((char, index) => {
      const angle = startAngle + anglePerChar * (index + 0.5)
      const x =
        centerX +
        Math.cos(angle) * (radiusX - fontSize / 2 - this.companyName.textMarginMM * this.mmToPixel)
      const y =
        centerY +
        Math.sin(angle) * (radiusY - fontSize / 2 - this.companyName.textMarginMM * this.mmToPixel)

      this.canvasCtx.save()
      this.canvasCtx.translate(x, y)
      this.canvasCtx.rotate(angle + Math.PI / 2)
      this.canvasCtx.scale(this.companyName.companyNameCompression, 1) // 应用压缩
      this.canvasCtx.fillText(char, 0, 0)
      this.canvasCtx.restore()
    })

    this.canvasCtx.restore()
  }

  /**
   * 绘制印章编码
   * @param centerX 圆心x坐标
   * @param centerY 圆心y坐标
   * @param radiusX 椭圆长轴半径
   * @param radiusY 椭圆短轴半径
   * @param text 编码文本
   * @param fontSize 字体大小
   */
  drawCode(
    centerX: number,
    centerY: number,
    radiusX: number,
    radiusY: number,
    text: string,
    fontSize: number,
    fontFamily: string
  ) {
    this.canvasCtx.save()
    this.canvasCtx.font = `${fontSize}px ${fontFamily}`
    this.canvasCtx.fillStyle = this.primaryColor
    this.canvasCtx.textAlign = 'center'
    this.canvasCtx.textBaseline = 'middle'

    const characters = text.split('')
    const characterCount = characters.length

    // 动态调整总角度
    const totalAngle = Math.PI * (characterCount / 20) * 0.5
    const startAngle = Math.PI / 2 + totalAngle / 2
    const anglePerChar = totalAngle / (characterCount - 1)

    characters.forEach((char, index) => {
      const angle = startAngle - anglePerChar * index
      const x = centerX + Math.cos(angle) * (radiusX - fontSize / 2 - 1 * this.mmToPixel)
      const y = centerY + Math.sin(angle) * (radiusY - fontSize / 2 - 1 * this.mmToPixel)

      this.canvasCtx.save()
      this.canvasCtx.translate(x, y)
      this.canvasCtx.rotate(angle - Math.PI / 2) // 逆时针旋转文字
      this.canvasCtx.scale(1, 1) // 应用压缩
      this.canvasCtx.fillText(char, 0, 0)
      this.canvasCtx.restore()
    })

    this.canvasCtx.restore()
  }

  /**
   * 添加做旧效果
   * @param width 画布宽度
   * @param height 画布高度
   * @param forceRefresh 是否强制刷新
   */
  addAgingEffect(width: number, height: number, forceRefresh: boolean = false) {
    const imageData = this.canvasCtx.getImageData(0, 0, width, height)
    const data = imageData.data

    const centerX = width / 2
    const centerY = height / 2
    const radius = (Math.max(width, height) / 2) * this.mmToPixel

    // 如果需要刷新或者参数数组为空,则重新生成参数
    if (forceRefresh || this.agingEffectParams.length === 0) {
      this.agingEffectParams = []
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
            const intensityFactor = 0.5 // 可以根据需要调整
            const seed = Math.random()
            this.agingEffectParams.push({
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
    this.agingEffectParams.forEach((param) => {
      const { x, y, noiseSize, noise, strongNoiseSize, strongNoise, fade, seed } = param
      const index = (y * width + x) * 4

      if (seed < 0.4) {
        this.addCircularNoise(data, width, x, y, noiseSize, noise)
      }

      if (seed < 0.05) {
        this.addCircularNoise(data, width, x, y, strongNoiseSize, strongNoise)
      }

      if (seed < 0.2) {
        data[index] = Math.min(255, data[index] + fade)
        data[index + 1] = Math.min(255, data[index + 1] + fade)
        data[index + 2] = Math.min(255, data[index + 2] + fade)
      }
    })

    this.canvasCtx.putImageData(imageData, 0, 0)
  }

  private addCircularNoise(
    data: Uint8ClampedArray,
    width: number,
    x: number,
    y: number,
    size: number,
    intensity: number
  ) {
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

  /**
   * 绘制全尺寸标尺
   * @param width 画布宽度
   * @param height 画布高度
   */
  drawFullRuler(width: number, height: number) {
    if (!this.ruler.showFullRuler) return

    this.canvasCtx.save()
    this.canvasCtx.strokeStyle = '#bbbbbb' // 浅灰色
    this.canvasCtx.lineWidth = 1
    this.canvasCtx.setLineDash([5, 5]) // 设置虚线样式

    // 绘制垂直线
    for (let x = RULER_WIDTH; x < width; x += 5 * this.mmToPixel) {
      this.canvasCtx.beginPath()
      this.canvasCtx.moveTo(x, RULER_HEIGHT)
      this.canvasCtx.lineTo(x, height)
      this.canvasCtx.stroke()
    }

    // 绘制水平线
    for (let y = RULER_HEIGHT; y < height; y += 5 * this.mmToPixel) {
      this.canvasCtx.beginPath()
      this.canvasCtx.moveTo(RULER_WIDTH, y)
      this.canvasCtx.lineTo(width, y)
      this.canvasCtx.stroke()
    }

    this.canvasCtx.restore()
  }

  /**
   * 绘制标尺
   * @param rulerLength 标尺长度
   * @param rulerSize 标尺宽度
   * @param isHorizontal 是否为水平标尺
   */
  drawRuler(rulerLength: number, rulerSize: number, isHorizontal: boolean) {
    if (!this.ruler.showRuler) return

    const mmPerPixel = 1 / this.mmToPixel

    // 绘制标尺背景
    this.canvasCtx.fillStyle = 'lightgray'
    if (isHorizontal) {
      this.canvasCtx.fillRect(0, 0, rulerLength, rulerSize)
    } else {
      this.canvasCtx.fillRect(0, 0, rulerSize, rulerLength)
    }

    // 绘制刻度和数字
    this.canvasCtx.fillStyle = 'black'
    this.canvasCtx.font = '10px Arial'
    this.canvasCtx.textAlign = 'center'
    this.canvasCtx.textBaseline = 'top'

    for (let i = 0; i <= rulerLength - rulerSize; i += this.mmToPixel / 10) {
      const pos = i + rulerSize
      const mm = Math.round(i * mmPerPixel * 10) / 10

      if (mm % 5 === 0) {
        // 5毫米刻度
        this.canvasCtx.beginPath()
        if (isHorizontal) {
          this.canvasCtx.moveTo(pos, 0)
          this.canvasCtx.lineTo(pos, rulerSize * 0.8)
        } else {
          this.canvasCtx.moveTo(0, pos)
          this.canvasCtx.lineTo(rulerSize * 0.8, pos)
        }
        this.canvasCtx.lineWidth = 1
        this.canvasCtx.stroke()

        this.canvasCtx.save()
        if (isHorizontal) {
          this.canvasCtx.fillText(mm.toString(), pos, rulerSize * 0.8)
        } else {
          this.canvasCtx.translate(rulerSize * 0.8, pos)
          this.canvasCtx.rotate(-Math.PI / 2)
          this.canvasCtx.fillText(mm.toString(), 0, 0)
        }
        this.canvasCtx.restore()
      } else if (mm % 1 === 0) {
        // 1毫米刻度
        this.canvasCtx.beginPath()
        if (isHorizontal) {
          this.canvasCtx.moveTo(pos, 0)
          this.canvasCtx.lineTo(pos, rulerSize * 0.6)
        } else {
          this.canvasCtx.moveTo(0, pos)
          this.canvasCtx.lineTo(rulerSize * 0.6, pos)
        }
        this.canvasCtx.lineWidth = 0.5
        this.canvasCtx.stroke()
      } else {
        // 0.1毫米刻度
        this.canvasCtx.beginPath()
        if (isHorizontal) {
          this.canvasCtx.moveTo(pos, 0)
          this.canvasCtx.lineTo(pos, rulerSize * 0.2)
        } else {
          this.canvasCtx.moveTo(0, pos)
          this.canvasCtx.lineTo(rulerSize * 0.2, pos)
        }
        this.canvasCtx.lineWidth = 0.5
        this.canvasCtx.stroke()
      }
    }
  }

  /**
   * 将印章保存为PNG图片
   * @param outputSize 输出图片的尺寸
   */
  saveStampAsPNG(outputSize: number = 512) {
    // 创建一个新的 canvas 元素，大小为 outputSize x outputSize
    const saveCanvas = document.createElement('canvas')
    saveCanvas.width = outputSize
    saveCanvas.height = outputSize
    const saveCtx = saveCanvas.getContext('2d')
    if (!saveCtx) return

    // 清除画布，使背景透明
    saveCtx.clearRect(0, 0, outputSize, outputSize)

    // 计算原始 canvas 中印章的位置和大小
    const originalStampSize = (Math.max(this.stampWidth, this.stampHeight) + 2) * this.mmToPixel
    const sourceX = (this.canvas.width - originalStampSize) / 2 + this.stampOffsetX * this.mmToPixel
    const sourceY =
      (this.canvas.height - originalStampSize) / 2 + this.stampOffsetY * this.mmToPixel

    // 设置2%的边距
    const margin = outputSize * 0.01
    const drawSize = outputSize - 2 * margin

    // 将原始 canvas 中的印章部分绘制到新的 canvas 上，并调整大小
    saveCtx.drawImage(
      this.canvas,
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
    if (this.applyAging) {
      this.addAgingEffect(outputSize, outputSize, false)
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

  // 刷新印章绘制
  refreshStamp() {
    // 计算画布中心点
    const x = this.canvas.width / 2
    const y = this.canvas.height / 2

    this.drawStamp(
      x,
      y,
      this.drawStampConfigs.width,
      this.drawStampConfigs.height,
      this.drawStampConfigs.borderWidth,
      this.drawStampConfigs.primaryColor,
      this.drawStampConfigs.refreshSecurityPattern,
      this.drawStampConfigs.refreshOld
    )
  }

  private agingEffectParams: Array<{
    x: number
    y: number
    noiseSize: number
    noise: number
    strongNoiseSize: number
    strongNoise: number
    fade: number
    seed: number
  }> = []

  /**
   * 绘制印章
   * @param x 圆心x坐标
   * @param y 圆心y坐标
   * @param radiusX 半径x
   * @param radiusY 半径y
   * @param borderWidth 边框宽度
   * @param borderColor 边框颜色
   */
  drawStamp(
    x: number,
    y: number,
    radiusX: number,
    radiusY: number,
    borderWidth: number,
    borderColor: string,
    refreshSecurityPattern: boolean = false,
    refreshOld: boolean = false
  ) {
    // 清除整个画布
    this.canvasCtx.clearRect(0, 0, this.canvas.width, this.canvas.height)

    // 创建离屏 canvas
    const offscreenCanvas = document.createElement('canvas')
    offscreenCanvas.width = this.canvas.width
    offscreenCanvas.height = this.canvas.height
    const offscreenCtx = offscreenCanvas.getContext('2d')
    if (!offscreenCtx) return

    // 计算拖动后的中心点
    const centerX = x + this.stampOffsetX * this.mmToPixel
    const centerY = y + this.stampOffsetY * this.mmToPixel

    // 在离屏 canvas 上绘制椭圆边框
    offscreenCtx.beginPath()
    offscreenCtx.ellipse(centerX, centerY, radiusX, radiusY, 0, 0, Math.PI * 2)
    offscreenCtx.strokeStyle = 'white' // 使用白色，稍后会变成红色
    offscreenCtx.lineWidth = borderWidth
    offscreenCtx.stroke()

    // 设置填充颜色为白色
    offscreenCtx.fillStyle = 'white'

    // 设置画布背景
    this.canvasCtx.fillStyle = 'white'
    this.canvasCtx.fillRect(0, 0, this.canvas.width, this.canvas.height)

    // 绘制椭圆
    this.drawEllipse(centerX, centerY, radiusX, radiusY, borderWidth, borderColor)

    // 绘制五角星
    if (this.drawStar.drawStar) {
      this.drawStarShape(centerX, centerY, this.drawStar.starDiameter)
    }

    // 在椭圆边框上绘制防伪纹路
    this.drawSecurityPattern(
      offscreenCtx,
      centerX,
      centerY,
      radiusX,
      radiusY,
      refreshSecurityPattern
    )

    // 绘制公司名称
    this.drawCompanyName(
      centerX,
      centerY,
      radiusX,
      radiusY,
      this.companyName.companyName,
      this.companyName.textFontSizeMM
    )

    // 绘制印章编码
    this.drawCode(
      centerX,
      centerY,
      radiusX,
      radiusY,
      this.code.code,
      this.code.codeFontSizeMM,
      this.code.fontFamily
    )

    // 将离屏 canvas 的内容作为蒙版应用到主 canvas
    this.canvasCtx.save()
    this.canvasCtx.globalCompositeOperation = 'source-over'
    this.canvasCtx.fillStyle = borderColor
    this.canvasCtx.fillRect(0, 0, this.canvas.width, this.canvas.height)
    this.canvasCtx.globalCompositeOperation = 'destination-in'
    this.canvasCtx.drawImage(offscreenCanvas, 0, 0)
    this.canvasCtx.restore()

    // 在绘制完所有内容后，添加做旧效果
    if (refreshOld) {
      this.addAgingEffect(this.canvas.width, this.canvas.height, refreshOld)
    }
  }
}
