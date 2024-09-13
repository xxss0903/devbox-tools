import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import VCalendar from 'v-calendar'
import 'v-calendar/style.css'

createApp(App).use(VCalendar).use(router).mount('#app')
