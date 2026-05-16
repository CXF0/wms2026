<template>
  <aside class="sidebar" :class="{ collapsed: appStore.collapsed }">
    <div class="sidebar-logo">
      <div class="logo-mark">
        <span>✱</span>
      </div>
      <transition name="fade">
        <div v-if="!appStore.collapsed" class="logo-text">
          <span class="logo-title">鲜花 WMS</span>
          <span class="logo-sub">Flow Warehouse</span>
        </div>
      </transition>
    </div>

    <nav class="sidebar-nav">
      <div v-for="item in menuItems" :key="item.key" class="nav-group">
        <button
          v-if="!item.children?.length"
          class="nav-item"
          :class="{ active: isActive(item.key) }"
          type="button"
          @click="navigate(item.key)"
        >
          <i class="iconfont nav-icon" :class="item.icon" />
          <transition name="fade">
            <span v-if="!appStore.collapsed" class="nav-label">{{ item.label }}</span>
          </transition>
          <span v-if="!appStore.collapsed && isActive(item.key)" class="active-dot" />
        </button>

        <template v-else>
          <button
            class="nav-item nav-parent"
            :class="{ 'is-open': openGroups.includes(item.key), 'has-active': hasActiveChild(item) }"
            type="button"
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
          </button>

          <transition name="expand">
            <div v-if="!appStore.collapsed && openGroups.includes(item.key)" class="nav-children">
              <button
                v-for="child in item.children"
                :key="child.key"
                class="nav-child"
                :class="{ active: isActive(child.key) }"
                type="button"
                @click="navigate(child.key)"
              >
                <span class="child-line" />
                <span>{{ child.label }}</span>
              </button>
            </div>
          </transition>
        </template>
      </div>
    </nav>

    <div class="sidebar-card" v-if="!appStore.collapsed">
      <span class="card-label">今日节奏</span>
      <strong>分拣高峰</strong>
      <p>优先关注待发货与异常货位</p>
    </div>

    <div class="sidebar-bottom">
      <button class="collapse-btn" type="button" @click="appStore.toggleCollapsed()">
        <i class="iconfont icon-a-xiala2" :class="appStore.collapsed ? 'rotate-left' : 'rotate-right'" />
        <transition name="fade">
          <span v-if="!appStore.collapsed">收起导航</span>
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
import type { UserRole } from '@/types/business'

type MenuChild = { key: string; label: string }
type MenuItem = {
  key: string
  label: string
  icon: string
  roles?: UserRole[]
  children?: MenuChild[]
}

const appStore = useAppStore()
const userStore = useUserStore()
const route = useRoute()
const router = useRouter()
const openGroups = ref<string[]>([])

const ALL_MENUS: MenuItem[] = [
  {
    key: 'dashboard-group',
    label: '运营看板',
    icon: 'icon-paihangbang',
    roles: ['admin', 'region_mgr'],
    children: [
      { key: '/dashboard', label: '数据总览' },
      { key: '/dashboard/transport', label: '集货运输' },
      { key: '/dashboard/picking', label: '配货效能' },
      { key: '/dashboard/packing', label: '打包发货' },
    ],
  },
  {
    key: 'rack-group',
    label: '货位管理',
    icon: 'icon-kabao',
    roles: ['admin'],
    children: [
      { key: '/rack-config', label: '分区配置' },
      { key: '/box-type', label: '件型配置' },
      { key: '/nfc', label: 'NFC 管理' },
    ],
  },
  {
    key: 'print-group',
    label: '单据打印',
    icon: 'icon-zaixianyanzi',
    roles: ['admin', 'logistics'],
    children: [
      { key: '/print/delivery', label: '发货单打印' },
      { key: '/print/label', label: '物流面单' },
    ],
  },
  {
    key: 'records-group',
    label: '记录查询',
    icon: 'icon-xitongguanliyuanrizhi',
    roles: ['admin', 'region_mgr', 'inspector', 'logistics'],
    children: [
      { key: '/records/inspection', label: '质检记录' },
      { key: '/records/picking', label: '配货记录' },
      { key: '/records/packing', label: '打包记录' },
      { key: '/records/shipment', label: '发货记录' },
    ],
  },
  {
    key: 'penalty-group',
    label: '处罚管理',
    icon: 'icon-jubao',
    roles: ['admin', 'inspector_patrol'],
    children: [
      { key: '/penalty/business', label: '业务处罚' },
      { key: '/penalty/violation', label: '违规处罚' },
    ],
  },
  {
    key: 'staff-group',
    label: '人员管理',
    icon: 'icon-guanliyuan',
    roles: ['admin', 'region_mgr'],
    children: [
      { key: '/staff/accounts', label: '账户管理' },
      { key: '/staff/groups', label: '分组管理' },
      { key: '/staff/attendance', label: '人员考勤' },
      { key: '/staff/recruit', label: '兼职招聘' },
    ],
  },
  { key: '/proxy', label: '代配管理', icon: 'icon-daimaidan', roles: ['admin', 'region_mgr'], children: [] },
  {
    key: 'salary-group',
    label: '工资管理',
    icon: 'icon-tijiaoyanzi',
    roles: ['admin'],
    children: [
      { key: '/salary/monthly', label: '月度汇总' },
      { key: '/salary/settlement', label: '结算明细' },
      { key: '/salary/bonus', label: '奖金管理' },
    ],
  },
  {
    key: 'supply-group',
    label: '物资管理',
    icon: 'icon-fenxiang1',
    roles: ['admin', 'supply_mgr'],
    children: [
      { key: '/supply/stock', label: '库存管理' },
      { key: '/supply/inbound', label: '采购入库' },
      { key: '/supply/outbound', label: '出库管理' },
      { key: '/supply/types', label: '物资类型' },
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
  { key: '/app-version', label: 'APP 版本', icon: 'icon-kuguanfahuo', roles: ['admin'], children: [] },
]

const menuItems = computed(() => {
  const role = userStore.role
  if (!role) return []
  return ALL_MENUS.filter((m) => !m.roles || m.roles.includes(role))
})

const isActive = (key: string) => route.path === key || route.path.startsWith(key + '/')
const hasActiveChild = (item: MenuItem) => item.children?.some((c) => isActive(c.key))

function toggleGroup(key: string) {
  const i = openGroups.value.indexOf(key)
  if (i === -1) openGroups.value.push(key)
  else openGroups.value.splice(i, 1)
}

function navigate(key: string) {
  if (key.startsWith('/')) router.push(key)
}

watch(
  () => route.path,
  (path) => {
    for (const item of menuItems.value) {
      if (item.children?.some((c) => path === c.key || path.startsWith(c.key + '/'))) {
        if (!openGroups.value.includes(item.key)) openGroups.value.push(item.key)
      }
    }
  },
  { immediate: true },
)
</script>

<style scoped>
.sidebar {
  width: 248px;
  height: calc(100vh - 36px);
  display: flex;
  flex-direction: column;
  flex-shrink: 0;
  overflow: hidden;
  padding: 14px;
  background:
    radial-gradient(circle at 20% 2%, rgba(255, 159, 28, 0.28), transparent 22%),
    linear-gradient(180deg, #fffdf8 0%, #f4f7ee 100%);
  border: 1px solid rgba(255, 255, 255, 0.76);
  border-radius: 28px;
  box-shadow: var(--wms-shadow-md);
  transition: width 0.22s ease;
}

.sidebar.collapsed {
  width: 78px;
}

.sidebar-logo {
  display: flex;
  align-items: center;
  gap: 11px;
  min-height: 52px;
  padding: 6px 8px 18px;
}

.logo-mark {
  width: 38px;
  height: 38px;
  display: grid;
  place-items: center;
  flex-shrink: 0;
  border-radius: 14px;
  background: var(--wms-primary);
  color: #fff;
  box-shadow: var(--wms-shadow-glow);
}

.logo-mark span {
  font-size: 24px;
  line-height: 1;
}

.logo-text {
  min-width: 0;
  display: flex;
  flex-direction: column;
}

.logo-title {
  color: var(--wms-text);
  font-size: 17px;
  font-weight: 800;
  line-height: 1.2;
}

.logo-sub {
  color: var(--wms-text-soft);
  font-size: 11px;
  line-height: 1.4;
}

.sidebar-nav {
  flex: 1;
  min-height: 0;
  overflow: auto;
  padding: 2px 0 8px;
}

.nav-group + .nav-group {
  margin-top: 3px;
}

.nav-item,
.nav-child,
.collapse-btn {
  width: 100%;
  display: flex;
  align-items: center;
  border: 0;
  background: transparent;
  cursor: pointer;
  font: inherit;
  text-align: left;
}

.nav-item {
  position: relative;
  gap: 10px;
  min-height: 42px;
  padding: 9px 10px;
  border-radius: 15px;
  color: #52645a;
  transition:
    background 0.16s ease,
    color 0.16s ease,
    transform 0.16s ease;
}

.nav-item:hover {
  background: rgba(0, 143, 90, 0.08);
  color: var(--wms-primary-strong);
  transform: translateX(2px);
}

.nav-item.active,
.nav-item.has-active {
  background: #e8f5ed;
  color: var(--wms-primary-strong);
  box-shadow: inset 0 0 0 1px rgba(0, 143, 90, 0.08);
}

.nav-icon {
  width: 22px;
  height: 22px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  color: inherit;
}

.nav-label {
  flex: 1;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-size: 13px;
  font-weight: 650;
}

.active-dot {
  width: 7px;
  height: 7px;
  border-radius: 999px;
  background: var(--wms-primary);
  box-shadow: 0 0 0 4px rgba(0, 143, 90, 0.1);
}

.nav-arrow {
  color: var(--wms-text-soft);
  font-size: 10px;
  transition: transform 0.18s ease;
}

.nav-arrow.rotated {
  transform: rotate(180deg);
}

.nav-children {
  margin: 4px 0 8px 31px;
  padding-left: 12px;
  border-left: 1px solid rgba(0, 143, 90, 0.14);
}

.nav-child {
  gap: 8px;
  min-height: 32px;
  padding: 6px 8px;
  border-radius: 12px;
  color: #77847a;
  font-size: 12.5px;
  transition:
    background 0.16s ease,
    color 0.16s ease;
}

.nav-child:hover,
.nav-child.active {
  color: var(--wms-primary-strong);
  background: rgba(255, 159, 28, 0.13);
}

.child-line {
  width: 5px;
  height: 5px;
  border-radius: 999px;
  background: currentColor;
  opacity: 0.65;
}

.sidebar-card {
  margin: 6px 0 12px;
  padding: 14px;
  border-radius: 20px;
  background:
    linear-gradient(135deg, rgba(255, 159, 28, 0.24), rgba(0, 143, 90, 0.14)),
    #fff8ea;
  border: 1px solid rgba(255, 159, 28, 0.2);
}

.card-label,
.sidebar-card p {
  color: #826a45;
  font-size: 11px;
}

.sidebar-card strong {
  display: block;
  margin: 4px 0;
  color: var(--wms-text);
  font-size: 15px;
}

.sidebar-card p {
  margin: 0;
  line-height: 1.5;
}

.sidebar-bottom {
  padding-top: 10px;
  border-top: 1px solid rgba(0, 143, 90, 0.1);
}

.collapse-btn {
  gap: 10px;
  justify-content: center;
  height: 40px;
  padding: 0 10px;
  border-radius: 15px;
  color: var(--wms-text-muted);
  transition:
    background 0.16s ease,
    color 0.16s ease;
}

.collapse-btn:hover {
  background: rgba(0, 143, 90, 0.08);
  color: var(--wms-primary-strong);
}

.rotate-right {
  transform: rotate(-90deg);
}

.rotate-left {
  transform: rotate(90deg);
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.12s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.expand-enter-active,
.expand-leave-active {
  transition:
    opacity 0.16s ease,
    transform 0.16s ease;
}

.expand-enter-from,
.expand-leave-to {
  opacity: 0;
  transform: translateY(-3px);
}
</style>
