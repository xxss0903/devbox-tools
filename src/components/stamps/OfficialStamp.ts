import { fabric } from 'fabric'
import { calculateFontSizeByHeight, mmToPixels, pixelsToMM, StampTypeConfig } from './StampConfigs'
const { official } = StampTypeConfig

interface OfficialStampOptions {
  companyName: string
  centerText: string
  stampCode: string
  showStampCode: boolean
  showInnerCircle: boolean
  calculateFontSize: number
}

export const drawOfficialStamp = (canvas: fabric.Canvas, options: OfficialStampOptions) => {
  const {
    companyName,
    stampCode,
    showStampCode,
    showInnerCircle,
  } = options

  const centerX = canvas.width! / 2
  const centerY = canvas.height! / 2
  const circleSize = mmToPixels(official.size / 2)
  const borderWidth = mmToPixels(official.borderWidth)
  const textHeight = mmToPixels(official.textHeight)
  const codeHeight = mmToPixels(official.codeHeight)

  const titleFontSize = mmToPixels(official.textHeight)
  const centerTextFontSize = mmToPixels(official.centerTextHeight)
  const codeFontSize = mmToPixels(official.codeHeight)
  const titleOffset = mmToPixels(official.borderOffset)

  const circleRadius = mmToPixels(45 / 2 - official.borderWidth / 2)
  // 绘制外圆
  const outerCircle = new fabric.Circle({
    radius: circleRadius, // 直径45mm减去边框宽度1.5mm，再除以2得到半径
    fill: 'transparent',
    stroke: 'red',
    strokeWidth: mmToPixels(official.borderWidth),
    left: centerX,
    top: centerY,
    originX: 'center',
    originY: 'center'
  })
  
  canvas.add(outerCircle)
  // 绘制五角星
  const starPath = 'M 0 -1 L 0.588 0.809 L -0.951 -0.309 L 0.951 -0.309 L -0.588 0.809 Z'
  const starSize = mmToPixels(16) // 16毫米直径
  const star = new fabric.Path(starPath, {
    fill: 'red',
    left: centerX,
    top: centerY,
    scaleX: starSize / 2, // 除以2是因为Path的默认大小是2x2
    scaleY: starSize / 2,
    originX: 'center',
    originY: 'center'
  })
  canvas.add(star)

  // 绘制公司名称
  const textRadius = circleRadius - mmToPixels(5) - mmToPixels(1)
  const chars = companyName.split('')
  const totalAngle = 270 * (Math.PI / 180) // 270度转换为弧度
  const anglePerChar = totalAngle / chars.length

  chars.forEach((char, index) => {
    const angle = Math.PI - Math.PI / 4 + anglePerChar * (index + 0.5) // 从左侧开始，增加PI/2
    const x = centerX + textRadius * Math.cos(angle)
    const y = centerY + textRadius * Math.sin(angle)

    const charText = new fabric.Text(char, {
      fontSize: mmToPixels(8),
      fill: 'red',
      fontFamily: official.titleFont,
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
    const stampCodeRadius = circleRadius - mmToPixels(1.7) - mmToPixels(1)
    const stampCodeChars = stampCode.split('')
    const stampCodeAnglePerChar = Math.PI / 2 / (stampCodeChars.length + 1) // +1 为了在两端留出一些空间

    stampCodeChars.forEach((char, index) => {
      const angle = (Math.PI * 7) / 4 + Math.PI - stampCodeAnglePerChar * (index + 1) // 从右侧开始，顺时针旋转
      const x = centerX + stampCodeRadius * Math.cos(angle)
      const y = centerY + stampCodeRadius * Math.sin(angle)

      const charText = new fabric.Text(char, {
        fontSize: mmToPixels(2),
        fill: 'red',
        fontFamily: official.codeTextFont,
        left: x,
        top: y,
        originX: 'center',
        originY: 'center',
        angle: (angle - Math.PI / 2) * (180 / Math.PI) // 将文字旋转垂直于圆周，顺时针方向
      })
      canvas.add(charText)
    })
  }
}
