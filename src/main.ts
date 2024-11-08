import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import VCalendar from 'v-calendar'
import 'v-calendar/style.css'

// 添加这个类型声明
declare global {
  interface Window {
    electronAPI: {
      takeScreenshot: () => Promise<string>
    }
  }
}

const app = createApp(App)
app.use(ElementPlus)
app.use(VCalendar)
app.use(router)
app.mount('#app')
