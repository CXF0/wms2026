import { defineStore } from 'pinia'
import dayjs from 'dayjs'

export const useAppStore = defineStore('app', {
  state: () => ({
    collapsed: false,
    darkMode: false,
    workDate: dayjs().format('YYYY-MM-DD'),
  }),
  actions: {
    toggleCollapsed() { this.collapsed = !this.collapsed },
    toggleDarkMode() { this.darkMode = !this.darkMode },
    setWorkDate(d: string) { this.workDate = d },
    resetToToday() { this.workDate = dayjs().format('YYYY-MM-DD') },
  },
  persist: { key: 'wms-app', storage: localStorage, pick: ['collapsed', 'darkMode'] },
})
