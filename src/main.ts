import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
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

createApp(App).use(router).mount('#app')
