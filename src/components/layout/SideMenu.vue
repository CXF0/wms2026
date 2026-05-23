<template>
  <aside class="sidebar" :class="{ collapsed: appStore.collapsed }">
    <div class="brand">
      <div class="brand-mark" />
      <transition name="fade">
        <div v-if="!appStore.collapsed" class="brand-copy">
          <strong>Protocol WMS</strong>
          <span>Flower Warehouse</span>
        </div>
      </transition>
    </div>

    <nav class="nav">
      <section v-for="group in menuItems" :key="group.key" class="nav-section">
        <button
          v-if="!group.children?.length"
          type="button"
          class="nav-link"
          :class="{ active: isActive(group.key) }"
          @click="navigate(group.key)"
        >
          <i class="iconfont nav-icon" :class="group.icon" />
          <span v-if="!appStore.collapsed">{{ group.label }}</span>
        </button>

        <template v-else>
          <button
            type="button"
            class="nav-link nav-parent"
            :class="{ active: hasActiveChild(group), open: openGroupKey === group.key }"
            @click="toggleGroup(group.key)"
          >
            <i class="iconfont nav-icon" :class="group.icon" />
            <span v-if="!appStore.collapsed">{{ group.label }}</span>
            <i v-if="!appStore.collapsed" class="iconfont icon-a-xiala2 nav-arrow" />
          </button>

          <div
            v-if="!appStore.collapsed"
            class="nav-children"
            :class="{ open: openGroupKey === group.key }"
            :style="{ '--child-count': group.children.length }"
          >
            <button
              v-for="child in group.children"
              :key="child.key"
              type="button"
              class="nav-child"
              :class="{ active: isActive(child.key) }"
              @click="navigate(child.key)"
            >
              {{ child.label }}
            </button>
          </div>
        </template>
      </section>
    </nav>

    <div class="sidebar-footer">
      <button class="collapse-btn" type="button" @click="appStore.toggleCollapsed()">
        <i class="iconfont icon-a-xiala2" :class="appStore.collapsed ? 'rotate-left' : 'rotate-right'" />
        <span v-if="!appStore.collapsed">收起导航</span>
      </button>
    </div>
  </aside>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
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
const openGroupKey = ref<string | null>(null)

const ALL_MENUS: MenuItem[] = [
  {
    key: '/dashboard',
    label: '仓库看板',
    icon: 'icon-paihangbang',
    roles: ['admin', 'region_mgr'],
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
    key: 'people-group',
    label: '人员管理',
    icon: 'icon-guanliyuan',
    roles: ['admin'],
    children: [
      { key: '/staff/accounts', label: '账户管理' },
      { key: '/staff/groups', label: '分组管理' },
      { key: '/staff/attendance', label: '人员考勤' },
      { key: '/staff/recruit', label: '兼职招聘' },
    ],
  },
  {
    key: '/proxy',
    label: '代配管理',
    icon: 'icon-daiban',
    roles: ['admin', 'region_mgr'],
  },
  {
    key: 'salary-group',
    label: '工资管理',
    icon: 'icon-qianbao',
    roles: ['admin'],
    children: [
      { key: '/salary/monthly', label: '月度汇总' },
      { key: '/salary/settlement', label: '结算明细' },
      { key: '/salary/bonus', label: '奖金管理' },
    ],
  },
  {
    key: 'material-group',
    label: '物资管理',
    icon: 'icon-kabao',
    roles: ['admin', 'logistics'],
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
    icon: 'icon-guanliyuan',
    roles: ['admin'],
    children: [
      { key: '/permission/roles', label: '角色管理' },
      { key: '/permission/perms', label: '权限管理' },
    ],
  },
  {
    key: '/app-version',
    label: 'APP 版本',
    icon: 'icon-shezhi',
    roles: ['admin'],
  },
]

const menuItems = computed(() =>
  ALL_MENUS.filter((item) => !item.roles || item.roles.includes(userStore.role)),
)

function isActive(key: string) {
  return route.path === key
}

function hasActiveChild(item: MenuItem) {
  return Boolean(item.children?.some((child) => route.path === child.key))
}

function toggleGroup(key: string) {
  if (appStore.collapsed) return
  openGroupKey.value = openGroupKey.value === key ? null : key
}

function navigate(key: string) {
  const isLeafMenu = menuItems.value.some((item) => item.key === key && !item.children?.length)
  if (isLeafMenu) openGroupKey.value = null
  if (key !== route.path) router.push(key)
}

watch(
  () => route.path,
  () => {
    const current = menuItems.value.find((item) => item.children?.some((child) => child.key === route.path))
    openGroupKey.value = current?.key ?? null
  },
  { immediate: true },
)
</script>

<style scoped>
.sidebar {
  width: 280px;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  flex-shrink: 0;
  border-right: 1px solid var(--wms-line);
  background: rgba(255, 255, 255, 0.94);
  transition: width 0.2s ease;
}

.sidebar.collapsed {
  width: 84px;
}

.brand {
  height: 76px;
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 0 32px;
}

.collapsed .brand {
  justify-content: center;
  padding: 0;
}

.brand-mark {
  width: 24px;
  height: 24px;
  flex-shrink: 0;
  border-radius: 8px 8px 8px 2px;
  background: var(--wms-primary);
}

.brand-copy strong,
.brand-copy span {
  display: block;
}

.brand-copy strong {
  color: var(--wms-text);
  font-size: 20px;
  font-weight: 850;
}

.brand-copy span {
  margin-top: 2px;
  color: var(--wms-text-muted);
  font-size: 12px;
}

.nav {
  flex: 1;
  overflow-y: auto;
  padding: 22px 20px;
}

.nav-section + .nav-section {
  margin-top: 4px;
}

.nav-link,
.nav-child,
.collapse-btn {
  width: 100%;
  border: 0;
  background: transparent;
  color: var(--wms-text-muted);
  cursor: pointer;
  font: inherit;
  text-align: left;
}

.nav-link {
  position: relative;
  height: 42px;
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 0 12px;
  border-radius: 10px;
  font-size: 14px;
  font-weight: 650;
}

.nav-link::before,
.nav-child::before {
  content: '';
  position: absolute;
  left: -12px;
  top: 9px;
  bottom: 9px;
  width: 2px;
  border-radius: 999px;
  background: transparent;
}

.nav-link:hover,
.nav-link.active,
.nav-link.open,
.nav-child:hover,
.nav-child.active {
  background: #f4f4f5;
  color: var(--wms-text);
}

.nav-link.active::before,
.nav-link.open::before,
.nav-child.active::before {
  background: var(--wms-primary);
}

.nav-icon {
  width: 18px;
  color: inherit;
  font-size: 17px;
}

.nav-arrow {
  margin-left: auto;
  color: var(--wms-text-soft);
  font-size: 12px;
  transform: rotate(0deg);
  transition: transform 0.18s ease;
}

.nav-parent.open .nav-arrow {
  transform: rotate(180deg);
}

.nav-children {
  position: relative;
  max-height: 0;
  margin: 0 0 0 18px;
  padding-left: 16px;
  overflow: hidden;
  border-left: 1px solid transparent;
  opacity: 0;
  transform: translateY(-4px);
  will-change: max-height, opacity, transform;
  transition:
    max-height 0.24s cubic-bezier(0.2, 0, 0, 1),
    margin 0.24s cubic-bezier(0.2, 0, 0, 1),
    opacity 0.16s ease,
    transform 0.2s ease,
    border-color 0.2s ease;
}

.nav-children.open {
  max-height: calc(var(--child-count) * 38px + 14px);
  margin: 4px 0 10px 18px;
  border-left-color: var(--wms-line);
  opacity: 1;
  transform: translateY(0);
}

.nav-child {
  position: relative;
  height: 34px;
  display: block;
  padding: 0 12px;
  border-radius: 9px;
  font-size: 14px;
}

.nav-child + .nav-child {
  margin-top: 4px;
}

.sidebar-footer {
  padding: 16px 20px 24px;
  border-top: 1px solid var(--wms-line);
}

.collapse-btn {
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  border: 1px solid var(--wms-line);
  border-radius: 999px;
  color: var(--wms-text);
  font-weight: 750;
}

.collapse-btn:hover {
  border-color: rgba(16, 185, 129, 0.42);
  color: var(--wms-primary-strong);
}

.rotate-right {
  transform: rotate(90deg);
}

.rotate-left {
  transform: rotate(-90deg);
}

.fade-enter-active,
.fade-leave-active {
  transition: all 0.18s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
  transform: translateY(-4px);
}
</style>
