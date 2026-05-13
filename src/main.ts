import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import pinia from './stores'
import 'ant-design-vue/dist/reset.css'
import '@/styles/global.css'

createApp(App).use(pinia).use(router).mount('#app')