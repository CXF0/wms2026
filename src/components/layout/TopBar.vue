<template>
  <a-layout-header class="topbar">
    <!-- 左侧：折叠按钮 + 面包屑 -->
    <div class="topbar-left">
      <a-button
        type="text"
        class="collapse-btn"
        @click="appStore.toggleCollapsed()"
      >
        <MenuFoldOutlined v-if="!appStore.collapsed" />
        <MenuUnfoldOutlined v-else />
      </a-button>

      <a-breadcrumb class="breadcrumb">
        <a-breadcrumb-item v-for="crumb in breadcrumbs" :key="crumb.path">
          <RouterLink v-if="crumb.path" :to="crumb.path">{{ crumb.title }}</RouterLink>
          <span v-else>{{ crumb.title }}</span>
        </a-breadcrumb-item>
      </a-breadcrumb>
    </div>

    <!-- 右侧：工具区 -->
    <div class="topbar-right">
      <!-- 日期选择（仅管理员/主管可见） -->
      <a-date-picker
        v-if="userStore.canViewAll"
        v-model:value="workDateValue"
        :allow-clear="false"
        size="small"
        format="YYYY-MM-DD"
        class="date-picker"
        @change="(d: Dayjs) => appStore.setWorkDate(d.format('YYYY-MM-DD'))"
      />

      <!-- 暗色模式 -->
      <a-tooltip title="切换主题">
        <a-button type="text" size="small" @click="appStore.toggleDarkMode()">
          <BulbOutlined v-if="!appStore.darkMode" />
          <BulbFilled v-else />
        </a-button>
      </a-tooltip>

      <!-- 用户头像菜单 -->
      <a-dropdown :trigger="['click']">
        <div class="user-info">
          <a-avatar :size="28" style="background:#1677ff;font-size:13px">
            {{ userStore.realName?.[0] ?? 'U' }}
          </a-avatar>
          <span class="user-name">{{ userStore.realName }}</span>
          <DownOutlined style="font-size:10px;color:#a0a8b4" />
        </div>
        <template #overlay>
          <a-menu>
            <a-menu-item key="profile" disabled>
              <UserOutlined /> {{ ROLE_LABELS[userStore.role!] ?? userStore.role }}
            </a-menu-item>
            <a-menu-divider />
            <a-menu-item key="logout" @click="handleLogout">
              <LogoutOutlined /> 退出登录
            </a-menu-item>
          </a-menu>
        </template>
      </a-dropdown>
    </div>
  </a-layout-header>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import dayjs, { type Dayjs } from 'dayjs'
import {
  MenuFoldOutlined, MenuUnfoldOutlined,
  BulbOutlined, BulbFilled,
  DownOutlined, UserOutlined, LogoutOutlined,
} from '@ant-design/icons-vue'
import { useAppStore } from '@/stores/app'
import { useUserStore } from '@/stores/user'
import { ROLE_LABELS } from '@/utils/status'

const appStore  = useAppStore()
const userStore = useUserStore()
const route  = useRoute()
const router = useRouter()

const workDateValue = ref<Dayjs>(dayjs(appStore.workDate))
watch(() => appStore.workDate, d => { workDateValue.value = dayjs(d) })

// 面包屑（从路由 meta.title 生成）
const breadcrumbs = computed(() => {
  const crumbs = [{ title: '首页', path: '/dashboard' }]
  const matched = route.matched.filter(r => r.meta?.title && r.name !== 'Layout')
  for (const r of matched) {
    crumbs.push({ title: r.meta.title as string, path: r.path !== route.path ? r.path : '' })
  }
  return crumbs
})

async function handleLogout() {
  await userStore.logout()
  router.push('/login')
}
</script>

<style scoped>
.topbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: linear-gradient(180deg, rgba(255,255,255,0.92), rgba(243,249,247,0.88));
  padding: 0 20px;
  height: 56px;
  border-bottom: 1px solid rgba(72, 148, 122, 0.18);
  backdrop-filter: blur(8px);
  position: sticky;
  top: 0;
  z-index: 100;
}

.topbar-left { display: flex; align-items: center; gap: 8px; }
.collapse-btn { color: #2b6b53; font-size: 16px; }
.breadcrumb { font-size: 13px; }

.topbar-right { display: flex; align-items: center; gap: 6px; }
.date-picker { width: 130px; }

.user-info {
  display: flex; align-items: center; gap: 6px;
  cursor: pointer; padding: 4px 8px;
  border-radius: 8px; transition: background 0.15s;
}
.user-info:hover { background: rgba(65, 165, 122, 0.12); }
.user-name { font-size: 13px; color: #1a4f38; font-weight: 600; }
</style>
