<template>
  <aside class="sidebar" :class="{ collapsed: appStore.collapsed }">
    <!-- Logo -->
    <div class="sidebar-logo">
      <div class="logo-icon-wrap">
        <span class="logo-flower">🌸</span>
      </div>
      <transition name="fade">
        <div v-if="!appStore.collapsed" class="logo-text-wrap">
          <span class="logo-title">寻梦鲜花</span>
          <span class="logo-sub">WMS</span>
        </div>
      </transition>
    </div>

    <!-- 导航 -->
    <nav class="sidebar-nav">
      <div v-for="item in menuItems" :key="item.key" class="nav-group">
        <!-- 无子菜单 -->
        <div
          v-if="!item.children?.length"
          class="nav-item"
          :class="{ active: isActive(item.key) }"
          @click="navigate(item.key)"
        >
          <i class="iconfont nav-icon" :class="item.icon" />
          <transition name="fade">
            <span v-if="!appStore.collapsed" class="nav-label">{{ item.label }}</span>
          </transition>
        </div>

        <!-- 有子菜单 -->
        <template v-else>
          <div
            class="nav-item nav-parent"
            :class="{ 'is-open': openGroups.includes(item.key), 'has-active': hasActiveChild(item) }"
            @click="toggleGroup(item.key)"
          >
            <i class="iconfont nav-icon" :class="item.icon" />
            <transition name="fade">
              <span v-if="!appStore.collapsed" class="nav-label">{{ item.label }}</span>
            </transition>
            <transition name="fade">
              <i
                v-if="!appStore.collapsed"
                class="iconfont icon-a-xiala2 nav-arrow"
                :class="{ rotated: openGroups.includes(item.key) }"
              />
            </transition>
          </div>

          <transition name="expand">
            <div v-if="!appStore.collapsed && openGroups.includes(item.key)" class="nav-children">
              <div
                v-for="child in item.children"
                :key="child.key"
                class="nav-child"
                :class="{ active: isActive(child.key) }"
                @click="navigate(child.key)"
              >
                <span class="child-bullet" />
                <span>{{ child.label }}</span>
              </div>
            </div>
          </transition>
        </template>
      </div>
    </nav>

    <!-- 底部折叠 -->
    <div class="sidebar-bottom">
      <button class="collapse-btn" @click="appStore.toggleCollapsed()">
        <i class="iconfont" :class="appStore.collapsed ? 'icon-a-xiala2 rotate-left' : 'icon-a-xiala2 rotate-right'" />
        <transition name="fade">
          <span v-if="!appStore.collapsed" class="collapse-label">收起菜单</span>
        </transition>
      </button>
    </div>
  </aside>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAppStore } from '@/stores/app'
import { useUserStore } from '@/stores/user'

const appStore  = useAppStore()
const userStore = useUserStore()
const route     = useRoute()
const router    = useRouter()
const openGroups = ref<string[]>([])

const ALL_MENUS = [
  {
    key: 'dashboard-group',
    label: '数据看板',
    icon: 'icon-shuju',
    roles: ['admin', 'region_mgr'],
    children: [
      { key: '/dashboard',           label: '数据总览' },
      { key: '/dashboard/transport', label: '集货运输' },
      { key: '/dashboard/picking',   label: '配货效能' },
      { key: '/dashboard/packing',   label: '打包发货' },
    ],
  },
  {
    key: 'rack-group',
    label: '货位管理',
    icon: 'icon-peihuopeizhi',
    roles: ['admin'],
    children: [
      { key: '/rack-config', label: '分区配置' },
      { key: '/box-type',    label: '件型配置' },
      { key: '/nfc',         label: 'NFC管理' },
    ],
  },
  {
    key: 'print-group',
    label: '单据打印',
    icon: 'icon-dabao',
    roles: ['admin', 'logistics'],
    children: [
      { key: '/print/delivery', label: '发货单打印' },
      { key: '/print/label',    label: '物流面单打印' },
    ],
  },
  {
    key: 'records-group',
    label: '记录查询',
    icon: 'icon-shaixuan',
    roles: ['admin', 'region_mgr', 'inspector', 'logistics'],
    children: [
      { key: '/records/inspection', label: '质检记录' },
      { key: '/records/picking',    label: '配货记录' },
      { key: '/records/packing',    label: '打包记录' },
      { key: '/records/shipment',   label: '发货记录' },
    ],
  },
  {
    key: 'penalty-group',
    label: '处罚管理',
    icon: 'icon-tishi',
    roles: ['admin', 'inspector_patrol'],
    children: [
      { key: '/penalty/business',  label: '业务处罚' },
      { key: '/penalty/violation', label: '违规处罚' },
    ],
  },
  {
    key: 'staff-group',
    label: '人员管理',
    icon: 'icon-guanliyuan',
    roles: ['admin', 'region_mgr'],
    children: [
      { key: '/staff/accounts',   label: '账户管理' },
      { key: '/staff/groups',     label: '分组管理' },
      { key: '/staff/attendance', label: '人员考勤' },
      { key: '/staff/recruit',    label: '兼职招聘' },
    ],
  },
  {
    key: '/proxy',
    label: '代配管理',
    icon: 'icon-fuzhi',
    roles: ['admin', 'region_mgr'],
    children: [],
  },
  {
    key: 'salary-group',
    label: '工资管理',
    icon: 'icon-paihangbang',
    roles: ['admin'],
    children: [
      { key: '/salary/monthly',    label: '月度汇总' },
      { key: '/salary/settlement', label: '结算明细' },
      { key: '/salary/bonus',      label: '奖金管理' },
    ],
  },
  {
    key: 'supply-group',
    label: '物资管理',
    icon: 'icon-buhuoguanli',
    roles: ['admin', 'supply_mgr'],
    children: [
      { key: '/supply/stock',    label: '库存管理' },
      { key: '/supply/inbound',  label: '采购入库' },
      { key: '/supply/outbound', label: '出库管理' },
      { key: '/supply/types',    label: '物资类型' },
    ],
  },
  {
    key: 'permission-group',
    label: '角色权限',
    icon: 'icon-anquan',
    roles: ['admin'],
    children: [
      { key: '/permission/roles', label: '角色管理' },
      { key: '/permission/perms', label: '权限管理' },
    ],
  },
  {
    key: '/app-version',
    label: 'APP版本',
    icon: 'icon-kuguanfahuo',
    roles: ['admin'],
    children: [],
  },
]

const menuItems = computed(() => {
  const role = userStore.role
  if (!role) return []
  return ALL_MENUS.filter(m => !m.roles || m.roles.includes(role))
})

const isActive       = (key: string) => route.path === key || route.path.startsWith(key + '/')
const hasActiveChild = (item: typeof ALL_MENUS[0]) => item.children?.some(c => isActive(c.key))

function toggleGroup(key: string) {
  const i = openGroups.value.indexOf(key)
  if (i === -1) openGroups.value.push(key)
  else openGroups.value.splice(i, 1)
}

function navigate(key: string) {
  if (key.startsWith('/')) router.push(key)
}

watch(() => route.path, path => {
  for (const item of menuItems.value) {
    if (item.children?.some(c => path === c.key || path.startsWith(c.key + '/'))) {
      if (!openGroups.value.includes(item.key)) openGroups.value.push(item.key)
    }
  }
}, { immediate: true })
</script>

<style scoped>
.sidebar {
  width: 228px;
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
  background: rgba(255, 255, 255, 0.72);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.9);
  border-radius: 18px;
  box-shadow: 0 4px 24px rgba(30, 100, 200, 0.08);
  padding: 16px 12px;
  transition: width 0.25s ease;
  overflow: hidden;
}
.sidebar.collapsed { width: 68px; }

/* Logo */
.sidebar-logo {
  display: flex; align-items: center; gap: 10px;
  padding: 6px 8px 18px;
  white-space: nowrap;
}
.logo-icon-wrap {
  width: 38px; height: 38px; border-radius: 11px;
  background: linear-gradient(135deg, #e8f4ff 0%, #d0eaff 100%);
  box-shadow: 0 2px 8px rgba(26,109,216,0.12);
  display: flex; align-items: center; justify-content: center;
  flex-shrink: 0;
}
.logo-flower { font-size: 18px; }
.logo-text-wrap { display: flex; flex-direction: column; gap: 1px; }
.logo-title { font-size: 14px; font-weight: 700; color: #1a2e50; letter-spacing: -0.2px; }
.logo-sub   { font-size: 10px; color: #78a8cc; letter-spacing: 1.5px; font-weight: 500; }

/* 导航 */
.sidebar-nav {
  flex: 1; overflow-y: auto; overflow-x: hidden;
  display: flex; flex-direction: column; gap: 2px;
  padding-right: 2px;
}
.sidebar-nav::-webkit-scrollbar { width: 3px; }
.sidebar-nav::-webkit-scrollbar-thumb { background: rgba(100,160,220,0.2); border-radius: 2px; }

.nav-item {
  display: flex; align-items: center; gap: 9px;
  padding: 9px 11px; border-radius: 10px;
  cursor: pointer; color: #4a6888;
  font-size: 13px; font-weight: 500;
  white-space: nowrap;
  transition: background 0.15s, color 0.15s;
  user-select: none;
}
.nav-item:hover { background: rgba(255,255,255,0.75); color: #1a5db8; }
.nav-item.active,
.nav-item.has-active {
  background: rgba(255,255,255,0.88);
  color: #1a5db8; font-weight: 600;
  box-shadow: 0 2px 8px rgba(26,100,216,0.1);
}
.nav-item.is-open { color: #1a5db8; }

/* iconfont 图标 */
.nav-icon {
  font-size: 17px;
  width: 20px; height: 20px;
  display: flex; align-items: center; justify-content: center;
  flex-shrink: 0;
  color: inherit;
}

.nav-label { flex: 1; }

.nav-arrow {
  font-size: 11px; color: #90b8d8;
  transition: transform 0.22s;
  display: inline-flex; align-items: center;
}
.nav-arrow.rotated { transform: rotate(-180deg); }

/* 子菜单 */
.nav-children {
  margin: 2px 0 4px 26px;
  display: flex; flex-direction: column; gap: 1px;
}
.nav-child {
  display: flex; align-items: center; gap: 8px;
  padding: 7px 10px; border-radius: 8px;
  cursor: pointer; font-size: 12.5px; color: #5a7a9a;
  transition: background 0.12s, color 0.12s;
  user-select: none;
}
.nav-child:hover { background: rgba(255,255,255,0.65); color: #1a5db8; }
.nav-child.active { background: rgba(255,255,255,0.82); color: #1a5db8; font-weight: 600; }
.child-bullet {
  width: 4px; height: 4px; border-radius: 50%;
  background: #a8c8e8; flex-shrink: 0;
  transition: background 0.15s;
}
.nav-child.active .child-bullet { background: #1a6dd8; }

/* 底部折叠 */
.sidebar-bottom {
  margin-top: 12px; padding-top: 12px;
  border-top: 1px solid rgba(180,215,248,0.35);
}
.collapse-btn {
  width: 100%; height: 36px;
  border: none; border-radius: 9px; background: transparent;
  cursor: pointer; color: #7aaac8; font-size: 13px;
  display: flex; align-items: center; justify-content: center; gap: 8px;
  transition: background 0.15s, color 0.15s;
  font-family: inherit;
}
.collapse-btn:hover { background: rgba(255,255,255,0.75); color: #1a5db8; }
.collapse-label { font-size: 12.5px; }

/* 折叠按钮箭头方向 */
.rotate-right { transform: rotate(-90deg); display: inline-flex; }
.rotate-left  { transform: rotate(90deg);  display: inline-flex; }

/* 动画 */
.fade-enter-active, .fade-leave-active { transition: opacity 0.15s; }
.fade-enter-from, .fade-leave-to { opacity: 0; }
.expand-enter-active { transition: all 0.2s ease; }
.expand-leave-active { transition: all 0.15s ease; }
.expand-enter-from   { opacity: 0; transform: translateY(-4px); }
.expand-leave-to     { opacity: 0; transform: translateY(-3px); }
</style>