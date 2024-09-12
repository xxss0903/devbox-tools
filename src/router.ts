import { createRouter, createWebHashHistory } from 'vue-router'
import HomeContent from './components/HomeContent.vue'
import ContentDetail from './components/ContentDetail.vue'
import ImageTools from './components/ImageTools.vue'
import ImageCompressor from './components/ImageCompressor.vue'
import PngToIco from './components/PngToIco.vue'
import ColorTools from './components/ColorTools.vue'
import TransparencyConverter from './components/TransparencyConverter.vue'

const routes = [
  { path: '/', name: 'Home', component: HomeContent },
  { path: '/content/:id', name: 'ContentDetail', component: ContentDetail },
  { path: '/image-tools', name: 'ImageTools', component: ImageTools },
  { path: '/image-compressor', name: 'ImageCompressor', component: ImageCompressor },
  { path: '/png-to-ico', name: 'PngToIco', component: PngToIco },
  { path: '/color-tools', name: 'ColorTools', component: ColorTools },
  { path: '/color-tools/transparency-converter', name: 'TransparencyConverter', component: TransparencyConverter },
]

const router = createRouter({
  history: createWebHashHistory(),
  routes,
})

export default router