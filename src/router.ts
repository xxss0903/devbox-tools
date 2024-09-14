import { createRouter, createWebHashHistory } from 'vue-router'
import ImageTools from './components/ImageTools.vue'
import ImageCompressor from './components/ImageCompressor.vue'
import Icons8Viewer from './components/Icons8Viewer.vue'
import ScreenshotTool from './components/ScreenshotTool.vue'

const routes = [
  { path: '/', component: ImageTools, name: 'ImageTools' },
  { path: '/compress', component: ImageCompressor, name: 'ImageCompressor' },
  { path: '/icons8', component: Icons8Viewer, name: 'Icons8Viewer' },
  { path: '/screenshot', component: ScreenshotTool, name: 'ScreenshotTool' }
]

const router = createRouter({
  history: createWebHashHistory(),
  routes
})

export default router

