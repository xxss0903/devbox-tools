import { createRouter, createWebHashHistory } from 'vue-router'
import type { RouteLocationNormalized } from 'vue-router'
import ImageTools from './tools/imagetools/ImageTools.vue'
import ImageCompressor from './tools/imagetools/ImageCompressor.vue'
import PngToIco from './tools/imagetools/PngToIco.vue'
import ColorTools from './tools/colortools/ColorTools.vue'
import TransparencyConverter from './tools/colortools/TransparencyConverter.vue'
import CodeConverter from './tools/commontools/CodeConverter.vue'
import AndroidTools from './components/AndroidTools.vue'
import SignatureInfo from './components/SignatureInfo.vue'
import ImageBase64Converter from './tools/imagetools/ImageBase64Converter.vue'
import ImageCropper from './tools/imagetools/ImageCropper.vue'
import WorkDiary from './tools/commontools/WorkDiary.vue'
import Icons8Viewer from './tools/commontools/Icons8Viewer.vue'
import ScreenshotTool from './tools/imagetools/ScreenshotTool.vue'
import ClipboardManager from './tools/commontools/ClipboardManager.vue'
import ImageRounder from './tools/imagetools/ImageRounder.vue'
import SvgEditor from './components/SvgEditor.vue'
import Calculator from './tools/commontools/Calculator.vue'
import StampEditor from './tools/commontools/StampEditor.vue'
import PDFTools from './tools/pdftools/PDFTools.vue'
import PDFBoxApp from './tools/pdftools/PDFBoxApp.vue'
import ScreenBlocker from './tools/commontools/ScreenBlocker.vue'
import ImageResizer from './tools/imagetools/ImageResizer.vue'
import CustomModuleViewer from './components/CustomModuleViewer.vue'
import CommonTools from './tools/commontools/CommonTools.vue'
import DateTools from './tools/commontools/DateTools.vue'
import WeeklyReportAI from './tools/aitools/WeeklyReportAI.vue'
import ChatAI from './tools/aitools/ChatAI.vue'
import AIModelManager from './tools/aitools/AIModelManager.vue'
import JsonFormatter from './tools/commontools/JsonFormatter.vue'
import NpmRegistry from './tools/commontools/NpmRegistry.vue'
import ResumeBuilder from './tools/resumetools/ResumeBuilder.vue'

const routes = [
  {
    path: '/',
    name: 'Home',
    component: () => import('./views/HomeView.vue'),
    meta: {
      title: '首页',
      searchable: true,
      keywords: ['home', '主页', '首页', '工具箱']
    }
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
  },
  {
    path: '/image-resizer',
    name: 'ImageResizer',
    component: ImageResizer,
    meta: {
      title: '图片大小调整',
      searchable: true,
      keywords: ['image', 'resizer', '图片大小', '图片大小调整']
    }
  },
  {
    path: '/custom-module',
    name: 'CustomModuleViewer',
    component: CustomModuleViewer,
    meta: { title: '自定义模块', searchable: false }
  },
  {
    path: '/date-tools',
    name: 'DateTools',
    component: DateTools,
    meta: {
      title: '日期工具',
      searchable: true,
      keywords: ['date', 'time', 'tools', '日期', '时间', '工具']
    }
  },
  {
    path: '/weekly-report-ai',
    name: 'WeeklyReportAI',
    component: WeeklyReportAI,
    meta: {
      title: '周报管理',
      keywords: ['AI', '周报', '分析']
    }
  },
  {
    path: '/chat-ai',
    name: 'ChatAI',
    component: ChatAI,
    meta: {
      title: '智能问答',
      keywords: ['AI', '聊天', '问答']
    }
  },
  {
    path: '/ai-model-manager',
    name: 'AIModelManager',
    component: AIModelManager,
    meta: {
      title: 'AI模型管理',
      keywords: ['AI', '模型', '管理']
    }
  },
  {
    path: '/project-manage-tools',
    name: 'ProjectManageTools',
    component: () => import('./tools/projecttools/ProjectManageTools.vue'),
    meta: {
      title: '项目工具',
      searchable: true,
      keywords: ['project', 'tools', '项目', '工具', '管理']
    }
  },
  {
    path: '/project-recycle-bin',
    name: 'ProjectRecycleBin',
    component: () => import('./tools/projecttools/ProjectRecycleBin.vue'),
    meta: {
      title: '项目回收站',
      searchable: true,
      keywords: ['project', 'recycle', 'bin', '项目', '回收站']
    }
  },
  {
    path: '/json-formatter',
    name: 'JsonFormatter',
    component: () => JsonFormatter,
    meta: {
      title: 'JSON格式化',
      searchable: true,
      keywords: ['json', 'format', '格式化', '美化', '压缩']
    },
  },
  {
    path: '/npm-registry',
    name: 'NpmRegistry',
    component: NpmRegistry,
    meta: {
      title: 'NPM镜像源',
      searchable: true,
      keywords: ['npm', 'registry', '镜像源', '源']
    }
  },
  {
    path: '/resume-builder',
    name: 'ResumeBuilder',
    component: ResumeBuilder,
    meta: {
      title: '简历生成器',
      searchable: true,
      keywords: ['resume', 'builder', '简历', '生成器']
    }
  },
  {
    path: '/tools/project/:id',
    name: 'ProjectDetail',
    component: () => import('@/tools/projecttools/ProjectDetail.vue'),
    props: (route: RouteLocationNormalized) => ({
      id: route.params.id,
      title: route.query.title,
      from: route.query.from
    }),
    meta: {
      title: (route: RouteLocationNormalized) => `项目：${route.query.title || '详情'}`,
      icon: 'Folder',
      newTab: true
    }
  }
]

const router = createRouter({
  history: createWebHashHistory(),
  routes
})

export default router
