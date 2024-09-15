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

const routes = [
  { path: '/', name: 'Home', component: HomeView },
  { path: '/image-tools', name: 'ImageTools', component: ImageTools },
  { path: '/image-compressor', name: 'ImageCompressor', component: ImageCompressor },
  { path: '/png-to-ico', name: 'PngToIco', component: PngToIco },
  { path: '/color-tools', name: 'ColorTools', component: ColorTools },
  {
    path: '/transparency-converter',
    name: 'TransparencyConverter',
    component: TransparencyConverter
  },
  { path: '/code-converter', name: 'CodeConverter', component: CodeConverter },
  { path: '/android-tools', name: 'AndroidTools', component: AndroidTools },
  { path: '/signature-info', name: 'SignatureInfo', component: SignatureInfo },
  {
    path: '/image-base64-converter',
    name: 'ImageBase64Converter',
    component: ImageBase64Converter
  },
  { path: '/image-cropper', name: 'ImageCropper', component: ImageCropper },
  { path: '/work-diary', name: 'WorkDiary', component: WorkDiary },
  { path: '/icons8-viewer', name: 'Icons8Viewer', component: Icons8Viewer },
  { path: '/screenshot-tool', name: 'ScreenshotTool', component: ScreenshotTool },
  { path: '/clipboard-manager', name: 'ClipboardManager', component: ClipboardManager },
  { path: '/image-rounder', name: 'ImageRounder', component: ImageRounder }
]

const router = createRouter({
  history: createWebHashHistory(),
  routes
})

export default router
