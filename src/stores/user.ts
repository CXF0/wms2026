import { defineStore } from 'pinia'
import { authApi } from '@/api'
import type { UserInfo, LoginParams, UserRole } from '@/types/business'

export const useUserStore = defineStore('user', {
  state: () => ({ token: '', userInfo: null as UserInfo | null }),

  getters: {
    isLoggedIn: (s) => !!s.token,
    role: (s): UserRole | null => s.userInfo?.role ?? null,
    realName: (s) => s.userInfo?.realName ?? '',
    isAdmin: (s) => s.userInfo?.role === 'admin',
    canViewAll: (s) => ['admin', 'region_mgr'].includes(s.userInfo?.role ?? ''),
  },

  actions: {
    async login(p: LoginParams) {
      const { token } = await authApi.login(p)
      this.token = token
      await this.fetchMe()
    },
    async fetchMe() { this.userInfo = await authApi.getMe() },
    async logout() {
      try { await authApi.logout() } catch { /* ignore */ }
      this.clear()
    },
    clear() { this.token = ''; this.userInfo = null },
  },

  persist: { key: 'wms-user', storage: localStorage, pick: ['token'] },
})
