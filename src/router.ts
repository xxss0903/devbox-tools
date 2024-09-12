import { createRouter, createWebHashHistory } from 'vue-router'
import HomeView from './views/HomeView.vue'
import ImageTools from './components/ImageTools.vue'
import ImageCompressor from './components/ImageCompressor.vue'
import PngToIco from './components/PngToIco.vue'
import ColorTools from './components/ColorTools.vue'
import TransparencyConverter from './components/TransparencyConverter.vue'
import CodeConverter from './components/CodeConverter.vue'

const routes = [
  { path: '/', name: 'Home', component: HomeView },
  { path: '/image-tools', name: 'ImageTools', component: ImageTools },
  { path: '/image-compressor', name: 'ImageCompressor', component: ImageCompressor },
  { path: '/png-to-ico', name: 'PngToIco', component: PngToIco },
  { path: '/color-tools', name: 'ColorTools', component: ColorTools },
  { path: '/transparency-converter', name: 'TransparencyConverter', component: TransparencyConverter },
  { path: '/code-converter', name: 'CodeConverter', component: CodeConverter },
]

const router = createRouter({
  history: createWebHashHistory(),
  routes,
})

export default router