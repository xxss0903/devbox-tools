// 防伪纹路
export type ISecurityPattern = {
  openSecurityPattern: boolean // 是否启用防伪纹路
  securityPatternWidth: number // 防伪纹路宽度
  securityPatternLength: number // 防伪纹路长度
  securityPatternCount: number // 防伪纹路数量
  securityPatternAngleRange: number // 防伪纹路角度范围
}

// 绘制印章的公司
export type ICompany = {
  companyName: string // 公司名称
  compression: number // 公司名称压缩比例
  borderOffset: number // 边框偏移量
  textDistributionFactor: number // 文字分布因子
  fontFamily: string // 字体
  fontHeight: number // 字体高度
}

// 印章编码
export type ICode = {
  code: string // 编码
  compression: number // 编码压缩比例
  fontHeight: number // 编码字体大小
  fontFamily: string // 编码字体
  borderOffset: number // 编码边框偏移量
  fontWidth: number // 编码字体宽度
  textDistributionFactor: number // 文字分布因子
}

export type ITaxNumber = {
  code: string // 税号
  compression: number // 税号压缩比例
  fontHeight: number // 税号字体大小
  fontFamily: string // 编码字体
  fontWidth: number // 编码字体宽度
  letterSpacing: number // 编码字符间距
  positionY: number // 编码文字位置
  totalWidth: number // 编码文字总宽度
}

// 做旧效果参数
export type IAgingEffectParams = {
  x: number
  y: number
  noiseSize: number
  noise: number
  strongNoiseSize: number
  strongNoise: number
  fade: number
  seed: number
}

// 做旧效果
export type IAgingEffect = {
  applyAging: boolean
  agingIntensity: number
}

// 绘制五角星
export type IDrawStar = {
  drawStar: boolean
  starDiameter: number
  starPositionY: number
}

// 印章类型
export type IStampType = {
  stampType: string
  fontHeight: number
  compression: number
  letterSpacing: number
  positionY: number
  fontWidth: number
}

// 是否绘制标尺
export type IShowRuler = {
  showRuler: boolean
  showFullRuler: boolean
}

// 绘制印章的参数
export type IDrawStampConfig = {
  agingEffect: IAgingEffect
  ruler: IShowRuler
  drawStar: IDrawStar
  securityPattern: ISecurityPattern
  company: ICompany
  stampCode: ICode
  taxNumber: ITaxNumber
  stampType: IStampType
  width: number
  height: number
  borderWidth: number
  primaryColor: string
  refreshSecurityPattern: boolean
  refreshOld: boolean
  shouldDrawRuler: boolean
}

// 标尺宽度
const RULER_WIDTH = 80
// 标尺高度
const RULER_HEIGHT = 80

/**
 * 绘制印章工具类
 */
export class DrawStampUtils {
  // 主色
  private primaryColor: string = '#ff0000'
  // 毫米到像素的
  private mmToPixel: number
  // 主canvas的context
  private canvasCtx: CanvasRenderingContext2D
  // 离屏的canvas
  private offscreenCanvas: HTMLCanvasElement
  // 主canvas
  private canvas: HTMLCanvasElement
  private stampOffsetX: number = 0
  private stampOffsetY: number = 0
  private agingIntensity: number = 50
  private ruler: IShowRuler = {
    showRuler: true,
    showFullRuler: true
  }
  private drawStar: IDrawStar = {
    drawStar: false,
    starDiameter: 14,
    starPositionY: 0
  }
  // 防伪纹路
  private securityPattern: ISecurityPattern = {
    openSecurityPattern: true,
    securityPatternWidth: 0.15,
    securityPatternLength: 3,
    securityPatternCount: 5,
    securityPatternAngleRange: 40
  }
  private company: ICompany = {
    companyName: '印章绘制有限责任公司',
    compression: 1,
    borderOffset: 1,
    textDistributionFactor: 20,
    fontFamily: 'SimSun',
    fontHeight: 4.2
  }
  private taxNumber: ITaxNumber = {
    code: '000000000000000000',
    compression: 0.7,
    fontHeight: 3.7,
    fontFamily: 'Arial',
    fontWidth: 1.3,
    letterSpacing: 8,
    positionY: 0,
    totalWidth: 26
  }
  private stampCode: ICode = {
    code: '1234567890',
    compression: 1,
    fontHeight: 1.2,
    fontFamily: 'Arial',
    borderOffset: 1,
    fontWidth: 1.2,
    textDistributionFactor: 50
  }
  private stampType: IStampType = {
    stampType: '发票专用章',
    fontHeight: 4.6,
    fontWidth: 3,
    compression: 0.75,
    letterSpacing: 0,
    positionY: -3
  }
  // 做旧效果
  private agingEffect: IAgingEffect = {
    applyAging: false,
    agingIntensity: 50
  }
  // 总的印章绘制参数
  private drawStampConfigs: IDrawStampConfig = {
    ruler: this.ruler,
    drawStar: this.drawStar,
    securityPattern: this.securityPattern,
    company: this.company,
    stampCode: this.stampCode,
    width: 40,
    height: 30,
    stampType: this.stampType,
    primaryColor: this.primaryColor,
    borderWidth: 1,
    refreshSecurityPattern: false,
    refreshOld: false,
    taxNumber: this.taxNumber,
    agingEffect: this.agingEffect,
    shouldDrawRuler: true
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
    this.canvas = canvas
    // 创建离屏canvas
    this.offscreenCanvas = document.createElement('canvas')

    if (this.canvas && this.offscreenCanvas) {
      this.offscreenCanvas.width = canvas.width
      this.offscreenCanvas.height = canvas.height
    }
    this.addCanvasListener()
  }

  private isDragging = false
  private dragStartX = 0
  private dragStartY = 0

  getDrawConfigs() {
    return this.drawStampConfigs
  }

  setDrawConfigs(drawConfigs: IDrawStampConfig) {
    this.drawStampConfigs = drawConfigs
  }

  private addCanvasListener() {
    this.canvas.addEventListener('mousemove', (event) => {
      this.onMouseMove(event)
    })
    this.canvas.addEventListener('mouseleave', (event) => {
      this.onMouseLeave(event)
    })
    this.canvas.addEventListener('mousedown', (event) => {
      this.onMouseDown(event)
    })
    this.canvas.addEventListener('mouseup', (event) => {
      this.onMouseUp()
    })
    this.canvas.addEventListener('click', (event) => {
      this.onCanvasClick(event)
    })
  }

  private onMouseUp = () => {
    this.isDragging = false
  }

  // 点击印章区域，比如五角星等位置然后进行相应的跳转之类的
  private onCanvasClick = (event: MouseEvent) => {
    const canvas = this.canvas
    if (!canvas) return
  }

  private onMouseLeave = (event: MouseEvent) => {
    this.isDragging = false
    this.refreshStamp()
  }

  private onMouseDown = (event: MouseEvent) => {
    this.isDragging = true
    this.dragStartX = event.clientX - this.stampOffsetX * this.mmToPixel
    this.dragStartY = event.clientY - this.stampOffsetY * this.mmToPixel
  }

  private onMouseMove = (event: MouseEvent) => {
    if (this.isDragging) {
      const newOffsetX = (event.clientX - this.dragStartX) / this.mmToPixel
      const newOffsetY = (event.clientY - this.dragStartY) / this.mmToPixel
      this.stampOffsetX = Math.round(newOffsetX * 10) / 10 // 四舍五入到小数点后一位
      this.stampOffsetY = Math.round(newOffsetY * 10) / 10
      this.refreshStamp()
    } else {
      // 原有的鼠标移动逻辑
      const rect = this.canvas.getBoundingClientRect()
      const x = event.clientX - rect.left
      const y = event.clientY - rect.top
      const mmX = Math.round(((x - RULER_WIDTH) / this.mmToPixel) * 10) / 10
      const mmY = Math.round(((y - RULER_HEIGHT) / this.mmToPixel) * 10) / 10

      this.refreshStamp()
      this.highlightRulerPosition(this.canvasCtx, mmX, mmY)
      this.drawCrossLines(x, y)
    }
  }

  private highlightRulerPosition = (ctx: CanvasRenderingContext2D, mmX: number, mmY: number) => {
    const x = mmX * this.mmToPixel + RULER_WIDTH
    const y = mmY * this.mmToPixel + RULER_HEIGHT

    // 高亮水平标尺
    ctx.fillStyle = this.drawStampConfigs.primaryColor
    ctx.fillRect(RULER_WIDTH, y - 1, this.canvas.width - RULER_WIDTH, 2)

    // 高亮垂直标尺
    ctx.fillRect(x - 1, RULER_HEIGHT, 2, this.canvas.height - RULER_HEIGHT)

    // 显示坐标
    ctx.fillStyle = 'black'
    ctx.font = 'bold 12px Arial'
    ctx.textAlign = 'left'
    ctx.textBaseline = 'top'
    ctx.fillText(`${mmX.toFixed(1)}mm, ${mmY.toFixed(1)}mm`, RULER_WIDTH + 5, RULER_HEIGHT + 5)
  }

  private drawCrossLines = (x: number, y: number) => {
    const canvas = this.offscreenCanvas
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
    const mainCanvas = this.canvas
    if (mainCanvas) {
      const mainCtx = mainCanvas.getContext('2d')
      if (mainCtx) {
        mainCtx.drawImage(canvas, 0, 0)
      }
    }
  }

  private setSecurityPattern(securityPattern: ISecurityPattern) {
    this.securityPattern = securityPattern
    // 刷新防伪纹路
    this.refreshSecurityPattern()
  }

  private refreshSecurityPattern() {
    this.securityPatternParams = []
  }

  /**
   * 绘制五角星
   * @param canvasCtx 画笔
   * @param x 圆心x坐标
   * @param y 圆心y坐标
   * @param r 半径
   */
  private drawStarShape(ctx: CanvasRenderingContext2D, x: number, y: number, r: number) {
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

    ctx.fillStyle = this.primaryColor
    ctx.fill()
    ctx.restore()
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
  private drawStampType(
    ctx: CanvasRenderingContext2D,
    stampType: IStampType,
    centerX: number,
    centerY: number,
    radiusX: number
  ) {
    const fontSize = stampType.fontHeight * this.mmToPixel
    const letterSpacing = stampType.letterSpacing
    const positionY = stampType.positionY

    ctx.save()
    ctx.font = `${fontSize}px SimSun`
    ctx.fillStyle = this.primaryColor
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'

    // 计算文字位置（在五角星正下方）
    const textY = centerY + radiusX * 0.5 + positionY * this.mmToPixel

    ctx.save()
    ctx.translate(centerX, textY)

    const chars = stampType.stampType.split('')
    const charWidths = chars.map((char) => ctx.measureText(char).width)
    const totalWidth =
      charWidths.reduce((sum, width) => sum + width, 0) +
      (chars.length - 1) * letterSpacing * this.mmToPixel

    let currentX = -totalWidth / 2 // 从文本的左边缘开始

    ctx.scale(this.drawStampConfigs.stampType.compression, 1)
    chars.forEach((char, index) => {
      ctx.fillText(char, currentX + charWidths[index] / 2, 0) // 绘制在字符的中心
      currentX += charWidths[index] + letterSpacing * this.mmToPixel
    })

    ctx.restore()
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
  private drawSecurityPattern(
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
  private drawEllipse(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    radiusX: number,
    radiusY: number,
    borderWidth: number,
    borderColor: string
  ) {
    ctx.beginPath()
    ctx.ellipse(x, y, radiusX, radiusY, 0, 0, Math.PI * 2)
    ctx.strokeStyle = borderColor
    ctx.lineWidth = borderWidth
    ctx.stroke()
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
  private drawCompanyName(
    ctx: CanvasRenderingContext2D,
    company: ICompany,
    centerX: number,
    centerY: number,
    radiusX: number,
    radiusY: number
  ) {
    const fontSize = company.fontHeight * this.mmToPixel
    ctx.save()
    ctx.font = `${fontSize}px ${company.fontFamily}`
    ctx.fillStyle = this.primaryColor
    ctx.textAlign = 'center'
    ctx.textBaseline = 'bottom'

    const characters = company.companyName.split('')
    const characterCount = characters.length
    const borderOffset = company.borderOffset * this.mmToPixel

    // 调整起始和结束角度，使文字均匀分布在椭圆上半部分
    const totalAngle = Math.PI * (1 + characterCount / company.textDistributionFactor)
    const startAngle = Math.PI + (Math.PI - totalAngle) / 2
    const anglePerChar = totalAngle / characterCount

    characters.forEach((char, index) => {
      const angle = startAngle + anglePerChar * (index + 0.5)
      const x = centerX + Math.cos(angle) * (radiusX - fontSize - borderOffset)
      const y = centerY + Math.sin(angle) * (radiusY - fontSize - borderOffset)

      ctx.save()
      ctx.translate(x, y)
      ctx.rotate(angle + Math.PI / 2)
      ctx.scale(company.compression, 1) // 应用压缩
      ctx.fillText(char, 0, 0)
      ctx.restore()
    })

    ctx.restore()
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
  private drawCode(
    ctx: CanvasRenderingContext2D,
    code: ICode,
    centerX: number,
    centerY: number,
    radiusX: number,
    radiusY: number
  ) {
    const fontSize = code.fontHeight * this.mmToPixel
    const text = code.code

    ctx.save()
    ctx.font = `${fontSize}px ${code.fontFamily}`
    ctx.fillStyle = this.primaryColor
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'

    const characters = text.split('')
    const characterCount = characters.length

    // 动态调整总角度
    // const totalAngle = Math.PI * (characterCount / 20) * 0.5
    const totalAngle = Math.PI * ((1 + characterCount) / code.textDistributionFactor)
    const startAngle = Math.PI / 2 + totalAngle / 2
    const anglePerChar = totalAngle / (characterCount - 1)

    characters.forEach((char, index) => {
      const angle = startAngle - anglePerChar * index
      const x =
        centerX + Math.cos(angle) * (radiusX - fontSize / 2 - code.borderOffset * this.mmToPixel)
      const y =
        centerY + Math.sin(angle) * (radiusY - fontSize / 2 - code.borderOffset * this.mmToPixel)

      ctx.save()
      ctx.translate(x, y)
      ctx.rotate(angle - Math.PI / 2) // 逆时针旋转文字
      ctx.scale(code.compression, 1) // 应用压缩
      ctx.fillText(char, 0, 0)
      ctx.restore()
    })

    ctx.restore()
  }

  /**
   * 绘制税号
   * @param ctx 画布上下文
   * @param centerX 圆心x坐标
   * @param centerY 圆心y坐标
   */
  private drawTaxNumber(
    ctx: CanvasRenderingContext2D,
    taxNumber: ITaxNumber,
    centerX: number,
    centerY: number
  ) {
    const fontSize = taxNumber.fontHeight * this.mmToPixel
    const totalWidth = taxNumber.totalWidth * this.mmToPixel
    const positionY = taxNumber.positionY * this.mmToPixel + 0.3

    ctx.save()
    ctx.font = `${fontSize}px ${taxNumber.fontFamily}`
    ctx.fillStyle = this.primaryColor
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'

    const characters = taxNumber.code.split('')
    const charCount = characters.length
    const letterSpacing = this.drawStampConfigs.taxNumber.letterSpacing * this.mmToPixel

    // 计算压缩后的总宽度
    const compressedTotalWidth = totalWidth * this.drawStampConfigs.taxNumber.compression

    // 计算单个字符的宽度（考虑压缩）
    const charWidth = (compressedTotalWidth - (charCount - 1) * letterSpacing) / charCount

    // 计算整个文本的实际宽度
    const actualWidth = charCount * charWidth + (charCount - 1) * letterSpacing

    // 计算起始位置，确保文字居中
    const startX = centerX - actualWidth / 2 + charWidth / 2
    const adjustedCenterY = centerY + positionY * this.mmToPixel

    characters.forEach((char, index) => {
      const x = startX + index * (charWidth + letterSpacing)
      ctx.save()
      ctx.translate(x, adjustedCenterY)
      ctx.scale(this.drawStampConfigs.taxNumber.compression, 1.35)
      ctx.fillText(char, 0, 0)
      ctx.restore()
    })
    ctx.restore()

    // // 绘制包含税号的矩形
    // const rectWidth = 26 * this.mmToPixel // 26mm 转换为像素
    // const rectHeight = fontSize * 1.2 // 矩形高度略大于字体大小
    // const rectX = centerX - rectWidth / 2
    // const rectY = adjustedCenterY - rectHeight / 2

    // ctx.save()
    // ctx.strokeStyle = this.primaryColor
    // ctx.lineWidth = 1
    // ctx.strokeRect(rectX, rectY, rectWidth, rectHeight)
    // ctx.restore()
  }

  private addAgingEffectForSave(ctx: CanvasRenderingContext2D, width: number, height: number) {
    if (!this.drawStampConfigs.agingEffect.applyAging) return
    const imageData = ctx.getImageData(0, 0, width, height)
    const data = imageData.data

    // 使用保存的参数应用做旧效果
    this.agingEffectParams.forEach((param) => {
      const { x, y, noiseSize, noise, strongNoiseSize, strongNoise, fade, seed } = param
      const realX = x
      const realY = y
      const index = (realY * width + realX) * 4

      if (seed < 0.4) {
        this.addCircularNoise(data, width, realX, realY, noiseSize, noise)
      }

      if (seed < 0.05) {
        this.addCircularNoise(data, width, realX, realY, strongNoiseSize, strongNoise)
      }

      if (seed < 0.2) {
        data[index] = Math.min(255, data[index] + fade)
        data[index + 1] = Math.min(255, data[index + 1] + fade)
        data[index + 2] = Math.min(255, data[index + 2] + fade)
      }
    })

    ctx.putImageData(imageData, 0, 0)
  }

  /**
   * 添加做旧效果
   * @param width 画布宽度
   * @param height 画布高度
   * @param forceRefresh 是否强制刷新
   */
  private addAgingEffect(
    ctx: CanvasRenderingContext2D,
    width: number,
    height: number,
    forceRefresh: boolean = false
  ) {
    if (!this.drawStampConfigs.agingEffect.applyAging) return
    const imageData = ctx.getImageData(0, 0, width, height)
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
            const intensityFactor = this.drawStampConfigs.agingEffect.agingIntensity / 100 // 可以根据需要调整
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

    ctx.putImageData(imageData, 0, 0)
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
  private drawFullRuler(ctx: CanvasRenderingContext2D, width: number, height: number) {
    if (!this.ruler.showFullRuler) return

    ctx.save()
    ctx.strokeStyle = '#bbbbbb' // 浅灰色
    ctx.lineWidth = 1
    ctx.setLineDash([5, 5]) // 设置虚线样式

    // 绘制垂直线
    for (let x = RULER_WIDTH; x < width; x += 5 * this.mmToPixel) {
      ctx.beginPath()
      ctx.moveTo(x, RULER_HEIGHT)
      ctx.lineTo(x, height)
      ctx.stroke()
    }

    // 绘制水平线
    for (let y = RULER_HEIGHT; y < height; y += 5 * this.mmToPixel) {
      ctx.beginPath()
      ctx.moveTo(RULER_WIDTH, y)
      ctx.lineTo(width, y)
      ctx.stroke()
    }

    ctx.restore()
  }

  /**
   * 绘制标尺
   * @param rulerLength 标尺长度
   * @param rulerSize 标尺宽度
   * @param isHorizontal 是否为水平标尺
   */
  private drawRuler(
    ctx: CanvasRenderingContext2D,
    rulerLength: number,
    rulerSize: number,
    isHorizontal: boolean
  ) {
    if (!this.ruler.showRuler) return

    const mmPerPixel = 1 / this.mmToPixel

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

    for (let i = 0; i <= rulerLength - rulerSize; i += this.mmToPixel / 10) {
      const pos = i + rulerSize
      const mm = Math.round(i * mmPerPixel * 10) / 10

      if (mm % 5 === 0) {
        // 5毫米刻度
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

  /**
   * 将印章保存为PNG图片
   * @param outputSize 输出图片的尺寸
   */
  saveStampAsPNG(outputSize: number = 512) {
    // 首先隐藏虚线
    this.drawStampConfigs.shouldDrawRuler = false
    this.refreshStamp()
    setTimeout(() => {
      // 创建一个新的 canvas 元素，大小为 outputSize x outputSize
      const saveCanvas = document.createElement('canvas')
      saveCanvas.width = outputSize
      saveCanvas.height = outputSize
      const saveCtx = saveCanvas.getContext('2d')
      if (!saveCtx) return

      // 清除画布，使背景透明
      saveCtx.clearRect(0, 0, outputSize, outputSize)

      // 计算原始 canvas 中印章的位置和大小
      const originalStampSize =
        (Math.max(this.drawStampConfigs.width, this.drawStampConfigs.height) + 2) * this.mmToPixel
      const sourceX =
        (this.canvas.width - originalStampSize) / 2 + this.stampOffsetX * this.mmToPixel
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
      if (this.drawStampConfigs.agingEffect.applyAging) {
        this.addAgingEffect(saveCtx, outputSize, outputSize, false)
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

      // 首先隐藏虚线
      this.drawStampConfigs.shouldDrawRuler = true
      this.refreshStamp()
    }, 300)
  }

  // 刷新印章绘制
  refreshStamp(refreshSecurityPattern: boolean = false, refreshOld: boolean = false) {
    // 计算画布中心点
    const x = this.canvas.width / 2
    const y = this.canvas.height / 2
    const mmToPixel = this.mmToPixel
    const drawRadiusX = (this.drawStampConfigs.width - this.drawStampConfigs.borderWidth) / 2
    const drawRadiusY = (this.drawStampConfigs.height - this.drawStampConfigs.borderWidth) / 2
    const offsetX = this.stampOffsetX * this.mmToPixel
    const offsetY = this.stampOffsetY * this.mmToPixel
    const centerX = x + offsetX
    const centerY = y + offsetY

    this.drawStamp(
      this.canvasCtx,
      centerX,
      centerY,
      drawRadiusX * mmToPixel,
      drawRadiusY * mmToPixel,
      this.drawStampConfigs.borderWidth * mmToPixel,
      this.drawStampConfigs.primaryColor,
      refreshSecurityPattern,
      refreshOld
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
    ctx: CanvasRenderingContext2D,
    centerX: number,
    centerY: number,
    radiusX: number,
    radiusY: number,
    borderWidth: number,
    borderColor: string,
    refreshSecurityPattern: boolean = false,
    refreshOld: boolean = false
  ) {
    // 清除整个画布
    ctx.clearRect(0, 0, this.canvas.width, this.canvas.height)

    // // 创建离屏 canvas
    // const offscreenCanvas = document.createElement('canvas')
    // offscreenCanvas.width = this.canvas.width
    // offscreenCanvas.height = this.canvas.height
    // const offscreenCtx = offscreenCanvas.getContext('2d')
    // if (!offscreenCtx) return

    // 在离屏 canvas 上绘制椭圆边框
    const offscreenCanvas = this.offscreenCanvas
    offscreenCanvas.width = this.canvas.width
    offscreenCanvas.height = this.canvas.height
    const offscreenCtx = offscreenCanvas.getContext('2d')
    if (!offscreenCtx) return
    offscreenCtx.beginPath()
    offscreenCtx.ellipse(centerX, centerY, radiusX, radiusY, 0, 0, Math.PI * 2)
    offscreenCtx.strokeStyle = 'white' // 使用白色，稍后会变成红色
    offscreenCtx.lineWidth = borderWidth
    offscreenCtx.stroke()

    // // 设置填充颜色为白色
    offscreenCtx.fillStyle = 'white'

    // 设置画布背景
    ctx.fillStyle = 'white'
    ctx.fillRect(0, 0, this.canvas.width, this.canvas.height)

    // 绘制椭圆
    this.drawEllipse(offscreenCtx, centerX, centerY, radiusX, radiusY, borderWidth, borderColor)

    // 在椭圆边框上绘制防伪纹路
    this.drawSecurityPattern(
      offscreenCtx!!,
      centerX,
      centerY,
      radiusX,
      radiusY,
      refreshSecurityPattern
    )

    // 绘制五角星
    if (this.drawStampConfigs.drawStar.drawStar) {
      const drawStarDia = this.drawStampConfigs.drawStar.starDiameter / 2
      this.drawStarShape(offscreenCtx, centerX, centerY, drawStarDia * this.mmToPixel)
    }

    // 绘制公司名称
    this.drawCompanyName(
      offscreenCtx,
      this.drawStampConfigs.company,
      centerX,
      centerY,
      radiusX,
      radiusY
    )

    // 绘制印章类型
    this.drawStampType(offscreenCtx, this.drawStampConfigs.stampType, centerX, centerY, radiusX)

    // 绘制印章编码
    this.drawCode(offscreenCtx, this.drawStampConfigs.stampCode, centerX, centerY, radiusX, radiusY)

    // 绘制纳税识别号
    this.drawTaxNumber(offscreenCtx, this.drawStampConfigs.taxNumber, centerX, centerY)

    // 将离屏 canvas 的内容作为蒙版应用到主 canvas
    ctx.save()
    ctx.globalCompositeOperation = 'source-over'
    ctx.fillStyle = borderColor
    ctx.fillRect(0, 0, this.canvas.width, this.canvas.height)
    ctx.globalCompositeOperation = 'destination-in'
    ctx.drawImage(offscreenCanvas, 0, 0)
    ctx.restore()

    // 在绘制完所有内容后，添加做旧效果
    this.addAgingEffect(ctx, this.canvas.width, this.canvas.height, refreshOld)

    if (this.drawStampConfigs.shouldDrawRuler) {
      // 绘制标尺
      this.drawRuler(ctx, this.canvas.width, RULER_HEIGHT, true)
      this.drawRuler(ctx, this.canvas.height, RULER_HEIGHT, false)
      // 将全尺寸标尺绘制到离屏canvas上
      this.drawFullRuler(ctx, this.canvas.width, this.canvas.height)
    }
  }
}
