import { createRouter, createWebHistory, type RouteRecordRaw } from 'vue-router'
import NProgress from 'nprogress'
import 'nprogress/nprogress.css'
import { useUserStore } from '@/stores/user'

NProgress.configure({ showSpinner: false })

/**
 * meta.roles  — 允许访问的角色列表，不填=所有登录用户
 * meta.title  — 页面标题
 * meta.hidden — 不在菜单中显示
 */
const routes: RouteRecordRaw[] = [
  {
    path: '/login',
    name: 'Login',
    component: () => import('@/views/login/index.vue'),
    meta: { title: '登录', public: true },
  },

  {
    path: '/',
    component: () => import('@/components/layout/AppLayout.vue'),
    redirect: '/dashboard',
    children: [

      // ── 数据看板 ──────────────────────────────────────────
      {
        path: 'dashboard',
        name: 'Dashboard',
        component: () => import('@/views/dashboard/index.vue'),
        meta: { title: '数据总览', icon: 'dashboard' },
      },
      {
        path: 'dashboard/transport',
        name: 'DashboardTransport',
        component: () => import('@/views/dashboard/transport.vue'),
        meta: { title: '集货运输', icon: 'transport', roles: ['admin', 'region_mgr'] },
      },
      {
        path: 'dashboard/picking',
        name: 'DashboardPicking',
        component: () => import('@/views/dashboard/picking.vue'),
        meta: { title: '配货效能', icon: 'picking', roles: ['admin', 'region_mgr'] },
      },
      {
        path: 'dashboard/packing',
        name: 'DashboardPacking',
        component: () => import('@/views/dashboard/packing.vue'),
        meta: { title: '打包发货', icon: 'packing', roles: ['admin', 'region_mgr'] },
      },

      // ── 货位管理 ──────────────────────────────────────────
      {
        path: 'rack-config',
        name: 'RackConfig',
        component: () => import('@/views/rack-config/index.vue'),
        meta: { title: '分区配置', icon: 'rack', roles: ['admin'] },
      },
      {
        path: 'rack-config/zone-detail',
        name: 'ZoneDetail',
        component: () => import('@/views/rack-config/zone-detail.vue'),
        meta: { title: '分区详情', icon: 'zone', roles: ['admin'] },
      },
      {
        path: 'box-type',
        name: 'BoxType',
        component: () => import('@/views/rack-config/box-type.vue'),
        meta: { title: '件型配置', icon: 'box', roles: ['admin'] },
      },
      {
        path: 'nfc',
        name: 'Nfc',
        component: () => import('@/views/rack-config/nfc.vue'),
        meta: { title: 'NFC管理', icon: 'nfc', roles: ['admin'] },
      },

      // ── 单据打印 ──────────────────────────────────────────
      {
        path: 'print/delivery',
        name: 'PrintDelivery',
        component: () => import('@/views/print/delivery.vue'),
        meta: { title: '发货单打印', roles: ['admin', 'logistics'] },
      },
      {
        path: 'print/label',
        name: 'PrintLabel',
        component: () => import('@/views/print/label.vue'),
        meta: { title: '物流面单打印', roles: ['admin', 'logistics'] },
      },

      // ── 记录查询 ──────────────────────────────────────────
      {
        path: 'records/inspection',
        name: 'RecordInspection',
        component: () => import('@/views/records/inspection.vue'),
        meta: { title: '质检记录', roles: ['admin', 'region_mgr', 'inspector'] },
      },
      {
        path: 'records/picking',
        name: 'RecordPicking',
        component: () => import('@/views/records/picking.vue'),
        meta: { title: '配货记录', roles: ['admin', 'region_mgr'] },
      },
      {
        path: 'records/packing',
        name: 'RecordPacking',
        component: () => import('@/views/records/packing.vue'),
        meta: { title: '打包记录', roles: ['admin', 'region_mgr'] },
      },
      {
        path: 'records/shipment',
        name: 'RecordShipment',
        component: () => import('@/views/records/shipment.vue'),
        meta: { title: '发货记录', roles: ['admin', 'region_mgr', 'logistics'] },
      },

      // ── 处罚管理 ──────────────────────────────────────────
      {
        path: 'penalty/business',
        name: 'PenaltyBusiness',
        component: () => import('@/views/penalty/business.vue'),
        meta: { title: '业务处罚', roles: ['admin', 'inspector_patrol'] },
      },
      {
        path: 'penalty/violation',
        name: 'PenaltyViolation',
        component: () => import('@/views/penalty/violation.vue'),
        meta: { title: '违规处罚', roles: ['admin', 'inspector_patrol'] },
      },

      // ── 人员管理 ──────────────────────────────────────────
      {
        path: 'staff/accounts',
        name: 'StaffAccounts',
        component: () => import('@/views/staff/accounts.vue'),
        meta: { title: '账户管理', roles: ['admin'] },
      },
      {
        path: 'staff/groups',
        name: 'StaffGroups',
        component: () => import('@/views/staff/groups.vue'),
        meta: { title: '分组管理', roles: ['admin'] },
      },
      {
        path: 'staff/attendance',
        name: 'StaffAttendance',
        component: () => import('@/views/staff/attendance.vue'),
        meta: { title: '人员考勤', roles: ['admin', 'region_mgr'] },
      },
      {
        path: 'staff/recruit',
        name: 'StaffRecruit',
        component: () => import('@/views/staff/recruit.vue'),
        meta: { title: '兼职招聘', roles: ['admin', 'region_mgr'] },
      },

      // ── 代配管理 ──────────────────────────────────────────
      {
        path: 'proxy',
        name: 'Proxy',
        component: () => import('@/views/proxy/index.vue'),
        meta: { title: '代配管理', roles: ['admin', 'region_mgr'] },
      },

      // ── 工资管理 ──────────────────────────────────────────
      {
        path: 'salary/monthly',
        name: 'SalaryMonthly',
        component: () => import('@/views/salary/monthly.vue'),
        meta: { title: '月度汇总', roles: ['admin'] },
      },
      {
        path: 'salary/settlement',
        name: 'SalarySettlement',
        component: () => import('@/views/salary/settlement.vue'),
        meta: { title: '结算明细', roles: ['admin'] },
      },
      {
        path: 'salary/bonus',
        name: 'SalaryBonus',
        component: () => import('@/views/salary/bonus.vue'),
        meta: { title: '奖金管理', roles: ['admin'] },
      },

      // ── 物资管理 ──────────────────────────────────────────
      {
        path: 'supply/stock',
        name: 'SupplyStock',
        component: () => import('@/views/supply/stock.vue'),
        meta: { title: '库存管理', roles: ['admin', 'supply_mgr'] },
      },
      {
        path: 'supply/inbound',
        name: 'SupplyInbound',
        component: () => import('@/views/supply/inbound.vue'),
        meta: { title: '采购入库', roles: ['admin', 'supply_mgr'] },
      },
      {
        path: 'supply/outbound',
        name: 'SupplyOutbound',
        component: () => import('@/views/supply/outbound.vue'),
        meta: { title: '出库管理', roles: ['admin', 'supply_mgr'] },
      },
      {
        path: 'supply/types',
        name: 'SupplyTypes',
        component: () => import('@/views/supply/types.vue'),
        meta: { title: '物资类型', roles: ['admin', 'supply_mgr'] },
      },

      // ── 角色权限 ──────────────────────────────────────────
      {
        path: 'permission/roles',
        name: 'PermissionRoles',
        component: () => import('@/views/permission/roles.vue'),
        meta: { title: '角色管理', roles: ['admin'] },
      },
      {
        path: 'permission/perms',
        name: 'PermissionPerms',
        component: () => import('@/views/permission/perms.vue'),
        meta: { title: '权限管理', roles: ['admin'] },
      },

      // ── APP版本 ───────────────────────────────────────────
      {
        path: 'app-version',
        name: 'AppVersion',
        component: () => import('@/views/app-version/index.vue'),
        meta: { title: 'APP版本管理', roles: ['admin'] },
      },
    ],
  },

  { path: '/403', name: '403', component: () => import('@/views/error/403.vue'), meta: { public: true } },
  { path: '/:pathMatch(.*)*', redirect: '/dashboard' },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior: () => ({ top: 0 }),
})

router.beforeEach(async (to, _from, next) => {
  NProgress.start()
  const userStore = useUserStore()

  if (to.meta.public) return next()
  if (!userStore.isLoggedIn) return next({ name: 'Login', query: { redirect: to.fullPath } })

  // userInfo 由 pinia-persistedstate 自动恢复，无需再请求接口
  // 若 token 有但 userInfo 丢失（极少数情况），踢回登录重新登录
  if (!userStore.userInfo) {
    userStore.clear()
    return next({ name: 'Login', query: { redirect: to.fullPath } })
  }

  const allowed = to.meta.roles as string[] | undefined
  if (allowed && userStore.role && !allowed.includes(userStore.role)) {
    return next({ name: '403' })
  }
  next()
})

router.afterEach(() => NProgress.done())
router.onError(() => NProgress.done())

export default router