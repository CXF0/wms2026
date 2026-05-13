import { defineStore } from 'pinia'
import { authApi } from '@/api'
import type { UserInfo, LoginParams, UserRole, RoleInfo } from '@/types/business'

/**
 * 根据 roleList 派生前端 UserRole
 * 优先级从高到低，取最高权限角色
 * 角色名来自接口实际返回值
 */
function deriveRole(roleList: RoleInfo[]): UserRole {
  const names = roleList.map(r => r.roleName)

  // 超级管理员
  if (names.some(n => /场地管理员|城市仓超管|超管|admin/i.test(n)))         return 'admin'
  // 管理员
  if (names.some(n => /^管理员$|仓库管理员|代卖管理员|到场货管理员|补货管理员|农资管理员/i.test(n))) return 'admin'
  // 大区负责人
  if (names.some(n => /大区负责人/i.test(n)))                               return 'region_mgr'
  // 分区主管
  if (names.some(n => /分区主管|主管/i.test(n)))                            return 'zone_sup'
  // 巡察员
  if (names.some(n => /巡察/i.test(n)))                                     return 'inspector_patrol'
  // 质检
  if (names.some(n => /质检/i.test(n)))                                     return 'inspector'
  // 配货
  if (names.some(n => /配货/i.test(n)))                                     return 'picker'
  // 打包
  if (names.some(n => /打包/i.test(n)))                                     return 'packer'
  // 物流
  if (names.some(n => /物流|车队长|司机组长/i.test(n)))                     return 'logistics'
  // 司机
  if (names.some(n => /^司机$/i.test(n)))                                   return 'driver'
  // 物资
  if (names.some(n => /物资/i.test(n)))                                     return 'supply_mgr'
  // 基地
  if (names.some(n => /基地.*负责|片区|入场/i.test(n)))                     return 'base_leader'

  return 'base_staff'
}

export const useUserStore = defineStore('user', {
  state: () => ({
    token:    '' as string,
    userInfo: null as UserInfo | null,
  }),

  getters: {
    isLoggedIn: (s) => !!s.token,
    role:       (s): UserRole | null => s.userInfo?.role ?? null,
    realName:   (s) => s.userInfo?.nickname || s.userInfo?.userName || '',
    isAdmin:    (s) => s.userInfo?.role === 'admin',
    canViewAll: (s) => ['admin', 'region_mgr'].includes(s.userInfo?.role ?? ''),
  },

  actions: {
    async login(params: LoginParams) {
      // 接口一次返回完整用户信息（含 token），无需二次请求
      const data = await authApi.login({
        userName: params.userName,
        password: params.password,
        type:     params.type ?? 1,   // WEB 端固定传 1
      })

      // 派生前端权限角色
      data.role = deriveRole(data.roleList ?? [])

      this.token    = data.token
      this.userInfo = data
    },

    async logout() {
      try { await authApi.logout() } catch { /* 忽略注销接口异常 */ }
      this.clear()
    },

    clear() {
      this.token    = ''
      this.userInfo = null
    },
  },

  persist: {
    key:     'wms-user',
    storage: localStorage,
    pick:    ['token', 'userInfo'],  // token + userInfo 都持久化，刷新免登录
  },
})