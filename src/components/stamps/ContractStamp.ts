import { fabric } from 'fabric'

interface ContractStampOptions {
  companyName: string
  centerText: string
  stampCode: string
  showStampCode: boolean
  showInnerCircle: boolean
  circleSize: number
  starSize: number
  borderWidth: number
  calculateFontSize: number
}

export const drawContractStamp = (canvas: fabric.Canvas, options: ContractStampOptions) => {
  const {
    companyName,
    centerText,
    stampCode,
    showStampCode,
    showInnerCircle,
    circleSize,
    starSize,
    borderWidth,
    calculateFontSize
  } = options

  const centerX = canvas.width! / 2
  const centerY = canvas.height! / 2

  // 绘制外圆
  const outerCircle = new fabric.Circle({
    radius: circleSize,
    fill: 'transparent',
    stroke: 'blue',
    strokeWidth: borderWidth,
    left: centerX,
    top: centerY,
    originX: 'center',
    originY: 'center'
  })

  // 绘制内圆 (如果开关打开)
  let innerCircle
  if (showInnerCircle) {
    innerCircle = new fabric.Circle({
      radius: circleSize - borderWidth * 2,
      fill: 'transparent',
      stroke: 'blue',
      strokeWidth: borderWidth / 2,
      left: centerX,
      top: centerY,
      originX: 'center',
      originY: 'center'
    })
  }

  // 绘制五角星
  const starPath = 'M 0 -1 L 0.588 0.809 L -0.951 -0.309 L 0.951 -0.309 L -0.588 0.809 Z'
  const star = new fabric.Path(starPath, {
    fill: 'blue',
    left: centerX,
    top: centerY,
    scaleX: starSize,
    scaleY: starSize,
    originX: 'center',
    originY: 'center'
  })

  // 绘制公司名称
  const textRadius = circleSize * 0.75
  const chars = companyName.split('')
  const totalAngle = 270 * (Math.PI / 180) // 270度转换为弧度
  const anglePerChar = totalAngle / chars.length

  chars.forEach((char, index) => {
    const angle = Math.PI - Math.PI / 4 + anglePerChar * (index + 0.5) // 从左侧开始，增加PI/2
    const x = centerX + textRadius * Math.cos(angle)
    const y = centerY + textRadius * Math.sin(angle)

    const charText = new fabric.Text(char, {
      fontSize: calculateFontSize,
      fill: 'blue',
      fontFamily: 'SimSun',
      left: x,
      top: y,
      originX: 'center',
      originY: 'center',
      angle: (angle + Math.PI / 2) * (180 / Math.PI) // 将文字旋转垂直于圆周
    })

    canvas.add(charText)
  })

  // 绘制印章编码
  if (showStampCode && stampCode) {
    const stampCodeFontSize = circleSize * 0.05
    const stampCodeRadius = circleSize * 0.9
    const stampCodeChars = stampCode.split('')
    const stampCodeAnglePerChar = Math.PI / 2 / (stampCodeChars.length + 1) // +1 为了在两端留出一些空间

    stampCodeChars.forEach((char, index) => {
      const angle = (Math.PI * 7) / 4 + Math.PI - stampCodeAnglePerChar * (index + 1) // 从右侧开始，顺时针旋转
      const x = centerX + stampCodeRadius * Math.cos(angle)
      const y = centerY + stampCodeRadius * Math.sin(angle)

      const charText = new fabric.Text(char, {
        fontSize: stampCodeFontSize,
        fill: 'blue',
        fontFamily: 'Arial',
        left: x,
        top: y,
        originX: 'center',
        originY: 'center',
        angle: (angle - Math.PI / 2) * (180 / Math.PI) // 将文字旋转垂直于圆周，顺时针方向
      })

      canvas.add(charText)
    })
  }

  canvas.add(outerCircle)
  if (innerCircle) canvas.add(innerCircle)
  canvas.add(star)
}
