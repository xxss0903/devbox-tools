import { fabric } from 'fabric'

interface InvoiceStampOptions {
  stampCode: string
  showStampCode: boolean
  showInnerCircle: boolean
  ellipseWidth: number
  ellipseHeight: number
  borderWidth: number
  companyName: string // 新增
}

const STANDARD_SIZE_MM = 45 // 标准印章直径，单位毫米
const CANVAS_SIZE = 400 // 画布尺寸，单位像素
const PIXELS_PER_MM = CANVAS_SIZE / (STANDARD_SIZE_MM * 1.2) // 每毫米对应的像素数，留出一些边距

export const drawInvoiceStamp = (canvas: fabric.Canvas, options: InvoiceStampOptions) => {
  const {
    stampCode,
    showStampCode,
    showInnerCircle,
    ellipseWidth,
    ellipseHeight,
    borderWidth,
    companyName
  } = options

  const centerX = canvas.width! / 2
  const centerY = canvas.height! / 2

  // 绘制外椭圆
  const outerEllipse = new fabric.Ellipse({
    rx: ellipseWidth / 2,
    ry: ellipseHeight / 2,
    fill: 'transparent',
    stroke: 'red',
    strokeWidth: borderWidth,
    left: centerX,
    top: centerY,
    originX: 'center',
    originY: 'center'
  })

  // 绘制内椭圆 (如果开关打开)
  let innerEllipse
  if (showInnerCircle) {
    innerEllipse = new fabric.Ellipse({
      rx: (ellipseWidth - borderWidth * 2) / 2,
      ry: (ellipseHeight - borderWidth * 2) / 2,
      fill: 'transparent',
      stroke: 'red',
      strokeWidth: borderWidth / 2,
      left: centerX,
      top: centerY,
      originX: 'center',
      originY: 'center'
    })
  }

  // 绘制“发票专用章”文字
  const invoiceText = new fabric.Text('发票专用章', {
    fontSize: 3.7 * PIXELS_PER_MM,
    fill: 'red',
    fontFamily: 'SimSun',
    left: centerX,
    top: centerY + ellipseHeight * 0.25,
    originX: 'center',
    originY: 'center'
  })

  // 绘制统一社会信用码
  const creditCodeText = new fabric.Text(stampCode, {
    fontSize: 3.7 * PIXELS_PER_MM,
    fill: 'red',
    fontFamily: 'Arial',
    left: centerX,
    top: centerY,
    originX: 'center',
    originY: 'center'
  })

  // 绘制公司名称，其中4.2是文字的高度
  const textRadiusX = (ellipseWidth - borderWidth - 4.2 * PIXELS_PER_MM) / 2 - 0.5 * PIXELS_PER_MM // 减去边线距离和0.5mm边距
  const textRadiusY = (ellipseHeight - borderWidth - 4.2 * PIXELS_PER_MM) / 2 - 0.5 * PIXELS_PER_MM // 减去边线距离和0.5mm边距
  const chars = companyName.split('')
  const totalAngle = 270 * (Math.PI / 180) // 270度转换为弧度
  const anglePerChar = totalAngle / chars.length

  chars.forEach((char, index) => {
    const angle = Math.PI - Math.PI / 4 + anglePerChar * (index + 0.5) // 从左侧开始，增加PI/2
    const x = centerX + textRadiusX * Math.cos(angle)
    const y = centerY + textRadiusY * Math.sin(angle)

    const charText = new fabric.Text(char, {
      fontSize: 4.2 * PIXELS_PER_MM,
      fill: 'red',
      fontFamily: 'FangSong',
      left: x,
      top: y,
      originX: 'center',
      originY: 'center',
      angle: (angle + Math.PI / 2) * (180 / Math.PI) // 将文字旋转垂直于椭圆周
    })

    canvas.add(charText)
  })
  //   // 绘制公司名称
  //   const textRadiusX = (ellipseWidth - borderWidth - 1) / 2 // 减去边线距离
  //   const textRadiusY = (ellipseHeight - borderWidth - 1) / 2 // 减去边线距离
  //   const chars = companyName.split('')
  //   const totalAngle = 270 * (Math.PI / 180) // 270度转换为弧度
  //   const anglePerChar = totalAngle / chars.length

  //   chars.forEach((char, index) => {
  //     const angle = Math.PI - Math.PI / 4 + anglePerChar * (index + 0.5) // 从左侧开始，增加PI/2
  //     const x = centerX + textRadiusX * Math.cos(angle)
  //     const y = centerY + textRadiusY * Math.sin(angle)

  //     const charText = new fabric.Text(char, {
  //       fontSize: 4.2 * PIXELS_PER_MM,
  //       fill: 'red',
  //       fontFamily: 'FangSong',
  //       left: x,
  //       top: y,
  //       originX: 'center',
  //       originY: 'center',
  //       angle: (angle + Math.PI / 2) * (180 / Math.PI) // 将文字旋转垂直于椭圆周
  //     })

  //     canvas.add(charText)
  //   })

  canvas.add(outerEllipse)
  if (innerEllipse) canvas.add(innerEllipse)
  canvas.add(invoiceText)
  canvas.add(creditCodeText)
}
