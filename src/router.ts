import { createRouter, createWebHashHistory } from 'vue-router'
import HomeView from './views/HomeView.vue'
import ImageTools from './components/ImageTools.vue'
import ImageCompressor from './components/ImageCompressor.vue'
import PngToIco from './components/PngToIco.vue'
import ColorTools from './components/ColorTools.vue'
import TransparencyConverter from './components/TransparencyConverter.vue'
import CodeConverter from './components/CodeConverter.vue'
import AndroidTools from './components/AndroidTools.vue'
import SignatureInfo from './components/SignatureInfo.vue'
import ImageBase64Converter from './components/ImageBase64Converter.vue'
import ImageCropper from './components/ImageCropper.vue'
import WorkDiary from './components/WorkDiary.vue'
import Icons8Viewer from './components/Icons8Viewer.vue'
import ScreenshotTool from './components/ScreenshotTool.vue'
import ClipboardManager from './components/ClipboardManager.vue'
import ImageRounder from './components/ImageRounder.vue'
import SvgEditor from './components/SvgEditor.vue'
import Calculator from './components/Calculator.vue'
import CanvasStampEditor from './components/CanvasStampEditor.vue'
import StampEditor from './components/StampEditor.vue'
import PDFTools from './components/PDFTools.vue'
import PDFBoxApp from './components/PDFBoxApp.vue'
import ScreenBlocker from './components/ScreenBlocker.vue'

const routes = [
  {
    path: '/',
    name: 'Home',
    component: HomeView,
    meta: { title: '首页', searchable: true, keywords: ['home', '主页', '首页'] }
  },
  {
    path: '/work-diary',
    name: 'WorkDiary',
    component: WorkDiary,
    meta: {
      title: '工作日记',
      searchable: true,
      keywords: ['work', 'diary', '工作', '日记', '日志']
    }
  },
  {
    path: '/image-tools',
    name: 'ImageTools',
    component: ImageTools,
    meta: { title: '图片工具', searchable: true, keywords: ['image', 'tools', '图片', '工具'] }
  },
  {
    path: '/pdf-tools',
    name: 'PDFTools',
    component: PDFTools,
    meta: { title: 'PDF工具', searchable: true, keywords: ['pdf', 'tools', 'pdf', '工具'] }
  },
  {
    path: '/image-compressor',
    name: 'ImageCompressor',
    component: ImageCompressor,
    meta: { title: '图片压缩', searchable: true, keywords: ['image', 'compress', '图片', '压缩'] }
  },
  {
    path: '/png-to-ico',
    name: 'PngToIco',
    component: PngToIco,
    meta: { title: 'PNG转ICO', searchable: true, keywords: ['png', 'ico', '转换'] }
  },
  {
    path: '/color-tools',
    name: 'ColorTools',
    component: ColorTools,
    meta: { title: '颜色工具', searchable: true, keywords: ['color', 'tools', '颜色', '工具'] }
  },
  {
    path: '/transparency-converter',
    name: 'TransparencyConverter',
    component: TransparencyConverter,
    meta: {
      title: '透明度转换',
      searchable: true,
      keywords: ['transparency', 'convert', '透明度', '转换']
    }
  },
  {
    path: '/code-converter',
    name: 'CodeConverter',
    component: CodeConverter,
    meta: { title: '代码转换', searchable: true, keywords: ['code', 'convert', '代码', '转换'] }
  },
  {
    path: '/android-tools',
    name: 'AndroidTools',
    component: AndroidTools,
    meta: { title: 'Android工具', searchable: true, keywords: ['android', 'tools', '安卓', '工具'] }
  },
  {
    path: '/signature-info',
    name: 'SignatureInfo',
    component: SignatureInfo,
    meta: { title: '签名信息', searchable: true, keywords: ['signature', 'info', '签名', '信息'] }
  },
  {
    path: '/image-base64-converter',
    name: 'ImageBase64Converter',
    component: ImageBase64Converter,
    meta: {
      title: '图片Base64转换',
      searchable: true,
      keywords: ['image', 'base64', 'convert', '图片', '转换']
    }
  },
  {
    path: '/image-cropper',
    name: 'ImageCropper',
    component: ImageCropper,
    meta: { title: '图片裁剪', searchable: true, keywords: ['image', 'crop', '图片', '裁剪'] }
  },
  {
    path: '/icons8-viewer',
    name: 'Icons8Viewer',
    component: Icons8Viewer,
    meta: {
      title: 'Icons8查看器',
      searchable: true,
      keywords: ['icons8', 'viewer', '图标', '查看器']
    }
  },
  {
    path: '/screenshot-tool',
    name: 'ScreenshotTool',
    component: ScreenshotTool,
    meta: { title: '截图工具', searchable: true, keywords: ['screenshot', 'tool', '截图', '工具'] }
  },
  {
    path: '/clipboard-manager',
    name: 'ClipboardManager',
    component: ClipboardManager,
    meta: {
      title: '剪贴板管理器',
      searchable: true,
      keywords: ['clipboard', 'manager', '剪贴板', '管理']
    }
  },
  {
    path: '/image-rounder',
    name: 'ImageRounder',
    component: ImageRounder,
    meta: { title: '图片圆角处理', searchable: true, keywords: ['image', 'round', '图片', '圆角'] }
  },
  {
    path: '/svg-editor',
    name: 'SvgEditor',
    component: SvgEditor,
    meta: { title: 'SVG编辑器', searchable: true, keywords: ['svg', 'editor', '编辑器'] }
  },
  {
    path: '/calculator',
    name: 'Calculator',
    component: Calculator,
    meta: { title: '计算器', searchable: true, keywords: ['calculator', '计算器'] }
  },
  {
    path: '/stamp-editor',
    name: 'StampEditor',
    component: StampEditor,
    meta: { title: '印章编辑器', searchable: true, keywords: ['stamp', 'editor', '印章', '编辑器'] }
  },
  {
    path: '/pdf-box-app',
    name: 'PDFBoxApp',
    component: PDFBoxApp,
    meta: { title: 'PDF结构工具', searchable: true, keywords: ['pdf', 'tools', 'pdf', '工具'] }
  },
  {
    path: '/screen-blocker',
    name: 'ScreenBlocker',
    component: ScreenBlocker,
    meta: {
      title: '痔疮来了',
      searchable: true,
      keywords: ['屏幕关闭', '痔疮来了', '锁屏', 'tools', 'ScreenBolocker', '休息']
    }
  }
]

const router = createRouter({
  history: createWebHashHistory(),
  routes
})

export default router
