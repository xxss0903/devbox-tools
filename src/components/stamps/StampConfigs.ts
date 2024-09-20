// 画布配置
export const CanvasConfig = {
  width: 500, // 画布宽度(像素)
  height: 500, // 画布高度(像素)
  standardSizeMM: 45, // 标准印章直径,单位毫米
  canvasSize: 180, // 画布中印章的实际尺寸,单位像素 (减小这个值来留出边距)
  canvasContainerSize: 400, // 画布的包裹器大小
};

// 计算每毫米对应的像素数
export const PIXELS_PER_MM = CanvasConfig.canvasSize / CanvasConfig.standardSizeMM;

// 将毫米转换为像素
export function mmToPixels(mm: number): number {
  return mm * PIXELS_PER_MM;
}



// 将像素转换为毫米
export function pixelsToMM(pixels: number): number {
  return pixels / PIXELS_PER_MM;
}

// 印章类型配置
export const StampTypeConfig = {
  official: {
    size: 45, // 标准尺寸(毫米)
    borderWidth: 1.5, // 边框宽度(毫米)
    textHeight: 8, // 边缘文字高度(毫米)
    codeHeight: 1.2, // 印章编码高度(毫米)
    codeTextWidth: 1, // 印章编码文字宽度(毫米)
    centerTextSize: 7, // 中心文字大小(毫米)
    starSize: 16, // 五角星直径大小(毫米)
    borderOffset: 1.5, // 边框偏移量(毫米)
    titleTextSize: 8, // 标题文字大小(毫米)
    codeBorderOffset: 1, // 印章编码边框偏移量(毫米)
    codeTextCenter: 2, // 印章编码文字中心偏移量(毫米)
    titleFont: "宋体", // 标题字体
    codeTextFont: "Arial", // 编码的字体
    perPixelSize: CanvasConfig.canvasSize / 45, // 每像素大小
  },
  financial: {
    size: 38, // 标准尺寸(毫米)
    borderWidth: 0.8, // 边框宽度(毫米)
    textHeight: 2.8, // 边缘文字高度(毫米)
    codeHeight: 1.8, // 印章编码高度(毫米)
    centerTextSize: 6 // 中心文字大小(毫米)
  },
  contract: {
    size: 40, // 标准尺寸(毫米)
    borderWidth: 1, // 边框宽度(毫米)
    textHeight: 3, // 边缘文字高度(毫米)
    codeHeight: 2, // 印章编码高度(毫米)
    centerTextSize: 6 // 中心文字大小(毫米)
  },
  legal: {
    size: 18, // 标准尺寸(毫米)
    borderWidth: 0.6, // 边框宽度(毫米)
    textHeight: 2, // 文字高度(毫米)
    codeHeight: 1.5 // 印章编码高度(毫米)
  },
  invoice: {
    width: 40, // 宽度(毫米)
    height: 30, // 高度(毫米)
    borderWidth: 1, // 边框宽度(毫米)
    textHeight: 2.5, // 文字高度(毫米)
    codeHeight: 1.8 // 印章编码高度(毫米)
  }
};

// ... 其他现有的配置代码 ...
