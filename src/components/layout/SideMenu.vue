<template>
  <a-layout-sider
    v-model:collapsed="appStore.collapsed"
    :trigger="null"
    collapsible
    :width="220"
    :collapsed-width="64"
    class="side-menu"
  >
    <!-- Logo -->
    <div class="logo" :class="{ collapsed: appStore.collapsed }">
      <span class="logo-icon">🌸</span>
      <span v-if="!appStore.collapsed" class="logo-text">花卉 WMS</span>
    </div>

    <!-- Navigation -->
    <a-menu
      v-model:selectedKeys="selectedKeys"
      v-model:openKeys="openKeys"
      mode="inline"
      :inline-collapsed="appStore.collapsed"
      class="nav-menu"
      @click="onMenuClick"
    >
      <template v-for="item in menuItems" :key="item.key">
        <!-- 有子菜单 -->
        <a-sub-menu v-if="item.children?.length" :key="item.key">
          <template #icon><component :is="item.icon" /></template>
          <template #title>{{ item.label }}</template>
          <a-menu-item v-for="child in item.children" :key="child.key">
            {{ child.label }}
          </a-menu-item>
        </a-sub-menu>
        <!-- 无子菜单 -->
        <a-menu-item v-else :key="item.key">
          <template #icon><component :is="item.icon" /></template>
          <span>{{ item.label }}</span>
        </a-menu-item>
      </template>
    </a-menu>
  </a-layout-sider>
</template>

<script setup lang="ts">
import { ref, computed, watch, h } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import {
  DashboardOutlined, AppstoreOutlined, PrinterOutlined,
  FileSearchOutlined, WarningOutlined, TeamOutlined,
  SwapOutlined, MoneyCollectOutlined, InboxOutlined,
  SafetyOutlined, MobileOutlined,
} from '@ant-design/icons-vue'
import { useAppStore } from '@/stores/app'
import { useUserStore } from '@/stores/user'

const appStore   = useAppStore()
const userStore  = useUserStore()
const route  = useRoute()
const router = useRouter()

const selectedKeys = ref<string[]>([])
const openKeys     = ref<string[]>([])

// 菜单配置（与 router 路由名保持一致）
const ALL_MENUS = [
  {
    key: 'dashboard-group', label: '数据看板', icon: h(DashboardOutlined),
    roles: ['admin', 'region_mgr'],
    children: [
      { key: '/dashboard',            label: '数据总览' },
      { key: '/dashboard/transport',  label: '集货运输' },
      { key: '/dashboard/picking',    label: '配货效能' },
      { key: '/dashboard/packing',    label: '打包发货' },
    ],
  },
  {
    key: 'rack-group', label: '货位管理', icon: h(AppstoreOutlined),
    roles: ['admin'],
    children: [
      { key: '/rack-config', label: '分区配置' },
      { key: '/box-type',    label: '件型配置' },
      { key: '/nfc',         label: 'NFC管理' },
    ],
  },
  {
    key: 'print-group', label: '单据打印', icon: h(PrinterOutlined),
    roles: ['admin', 'logistics'],
    children: [
      { key: '/print/delivery', label: '发货单打印' },
      { key: '/print/label',    label: '物流面单打印' },
    ],
  },
  {
    key: 'records-group', label: '记录查询', icon: h(FileSearchOutlined),
    roles: ['admin', 'region_mgr', 'inspector', 'logistics'],
    children: [
      { key: '/records/inspection', label: '质检记录' },
      { key: '/records/picking',    label: '配货记录' },
      { key: '/records/packing',    label: '打包记录' },
      { key: '/records/shipment',   label: '发货记录' },
    ],
  },
  {
    key: 'penalty-group', label: '处罚管理', icon: h(WarningOutlined),
    roles: ['admin', 'inspector_patrol'],
    children: [
      { key: '/penalty/business',  label: '业务处罚' },
      { key: '/penalty/violation', label: '违规处罚' },
    ],
  },
  {
    key: 'staff-group', label: '人员管理', icon: h(TeamOutlined),
    roles: ['admin', 'region_mgr'],
    children: [
      { key: '/staff/accounts',   label: '账户管理' },
      { key: '/staff/groups',     label: '分组管理' },
      { key: '/staff/attendance', label: '人员考勤' },
      { key: '/staff/recruit',    label: '兼职招聘' },
    ],
  },
  {
    key: '/proxy', label: '代配管理', icon: h(SwapOutlined),
    roles: ['admin', 'region_mgr'],
    children: [],
  },
  {
    key: 'salary-group', label: '工资管理', icon: h(MoneyCollectOutlined),
    roles: ['admin'],
    children: [
      { key: '/salary/monthly',    label: '月度汇总' },
      { key: '/salary/settlement', label: '结算明细' },
      { key: '/salary/bonus',      label: '奖金管理' },
    ],
  },
  {
    key: 'supply-group', label: '物资管理', icon: h(InboxOutlined),
    roles: ['admin', 'supply_mgr'],
    children: [
      { key: '/supply/stock',    label: '库存管理' },
      { key: '/supply/inbound',  label: '采购入库' },
      { key: '/supply/outbound', label: '出库管理' },
      { key: '/supply/types',    label: '物资类型' },
    ],
  },
  {
    key: 'permission-group', label: '角色权限', icon: h(SafetyOutlined),
    roles: ['admin'],
    children: [
      { key: '/permission/roles', label: '角色管理' },
      { key: '/permission/perms', label: '权限管理' },
    ],
  },
  {
    key: '/app-version', label: 'APP版本', icon: h(MobileOutlined),
    roles: ['admin'],
    children: [],
  },
]

// 根据角色过滤菜单
const menuItems = computed(() => {
  const role = userStore.role
  if (!role) return []
  return ALL_MENUS.filter(item => !item.roles || item.roles.includes(role))
})

// 同步当前路由到选中状态
watch(() => route.path, (path) => {
  selectedKeys.value = [path]
  // 自动展开父级
  for (const item of menuItems.value) {
    if (item.children?.some(c => c.key === path)) {
      if (!openKeys.value.includes(item.key)) {
        openKeys.value = [...openKeys.value, item.key]
      }
      break
    }
  }
}, { immediate: true })

function onMenuClick({ key }: { key: string }) {
  if (key.startsWith('/')) router.push(key)
}
</script>

<style scoped>
.side-menu {
  height: 100vh;
  position: sticky;
  top: 0;
  overflow-y: auto;
  overflow-x: hidden;
  background: linear-gradient(180deg, rgba(250,255,252,0.95), rgba(234,245,241,0.88)) !important;
  border-right: 1px solid rgba(72, 148, 122, 0.15);
  box-shadow: 8px 0 26px rgba(23, 83, 59, 0.08);
}

.logo {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 18px 20px;
  border-bottom: 1px solid rgba(72, 148, 122, 0.15);
  white-space: nowrap;
  overflow: hidden;
}
.logo.collapsed { justify-content: center; padding: 18px 0; }
.logo-icon { font-size: 22px; flex-shrink: 0; }
.logo-text { font-size: 15px; font-weight: 700; color: #14533a; }

.nav-menu { border-right: none !important; padding: 10px 0; background: transparent !important; }
.nav-menu :deep(.ant-menu-item),
.nav-menu :deep(.ant-menu-submenu-title) { border-radius: 10px; margin: 3px 8px; width: calc(100% - 16px); }
.nav-menu :deep(.ant-menu-item-selected) {
  background: linear-gradient(135deg, rgba(41, 172, 97, 0.16), rgba(8, 112, 56, 0.24)) !important;
  color: #0d5e37 !important;
  font-weight: 600;
}
</style>
