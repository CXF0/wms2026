<template>
  <header class="topbar">
    <div class="search-wrap" :class="{ focused: searchFocused }">
      <i class="iconfont icon-sousuo search-icon" />
      <input
        v-model="searchText"
        class="search-input"
        placeholder="搜索订单、货位、人员..."
        @focus="searchFocused = true"
        @blur="searchFocused = false"
      />
      <kbd>⌘K</kbd>
    </div>

    <nav class="top-links" aria-label="顶部导航">
      <span>{{ currentTitle }}</span>
      <span>文档</span>
      <span>支持</span>
    </nav>

    <div class="top-actions">
      <a-tooltip title="刷新页面">
        <button class="icon-btn" aria-label="刷新页面" type="button" @click="() => $router.go(0)">
          <i class="iconfont icon-shuaxin" />
        </button>
      </a-tooltip>

      <a-tooltip title="消息通知">
        <button class="icon-btn" aria-label="消息通知" type="button">
          <i class="iconfont icon-xiaoxi" />
          <span class="notify-dot" />
        </button>
      </a-tooltip>

      <a-dropdown :trigger="['click']" placement="bottomRight">
        <button class="user-pill" type="button">
          <span>{{ userStore.realName || '未命名用户' }}</span>
        </button>

        <template #overlay>
          <div class="user-menu">
            <div class="menu-head">
              <span class="avatar">{{ firstChar }}</span>
              <span>
                <strong>{{ userStore.realName || '未命名用户' }}</strong>
                <small>{{ roleLabel }}</small>
              </span>
            </div>
            <button class="menu-item" type="button">
              <i class="iconfont icon-anquan" />
              <span>账号安全</span>
            </button>
            <button class="menu-item danger" type="button" @click="handleLogout">
              <i class="iconfont icon-shanchu" />
              <span>退出登录</span>
            </button>
          </div>
        </template>
      </a-dropdown>
    </div>
  </header>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user'
import { ROLE_LABELS } from '@/utils/status'

const userStore = useUserStore()
const router = useRouter()
const route = useRoute()

const searchText = ref('')
const searchFocused = ref(false)

const currentTitle = computed(() => String(route.meta.title || '工作台'))
const firstChar = computed(() => (userStore.realName?.[0] ?? 'U').toUpperCase())
const roleLabel = computed(() => {
  const role = userStore.role
  return role ? (ROLE_LABELS[role] ?? role) : ''
})

async function handleLogout() {
  await userStore.logout()
  router.push('/login')
}
</script>

<style scoped>
.topbar {
  height: 76px;
  display: flex;
  align-items: center;
  gap: 24px;
  flex-shrink: 0;
  padding: 0 32px;
  background: rgba(255, 255, 255, 0.86);
  border-bottom: 1px solid var(--wms-line);
  backdrop-filter: blur(12px);
}

.search-wrap {
  width: min(480px, 38vw);
  height: 44px;
  display: flex;
  align-items: center;
  gap: 11px;
  padding: 0 14px;
  border: 1px solid var(--wms-line);
  border-radius: 999px;
  background: #fff;
  transition:
    border-color 0.16s ease,
    box-shadow 0.16s ease;
}

.search-wrap.focused {
  border-color: rgba(16, 185, 129, 0.45);
  box-shadow: 0 0 0 4px rgba(16, 185, 129, 0.1);
}

.search-icon {
  color: var(--wms-text-soft);
}

.search-input {
  flex: 1;
  min-width: 0;
  border: 0;
  outline: 0;
  background: transparent;
  color: var(--wms-text);
  font-size: 14px;
}

.search-input::placeholder {
  color: var(--wms-text-soft);
}

kbd {
  color: var(--wms-text-soft);
  font-size: 12px;
  font-family: inherit;
}

.top-links {
  display: flex;
  align-items: center;
  gap: 28px;
  margin-left: auto;
  color: var(--wms-text-muted);
  font-size: 14px;
  font-weight: 650;
}

.top-actions {
  display: flex;
  align-items: center;
  gap: 10px;
  padding-left: 20px;
  border-left: 1px solid var(--wms-line);
}

.icon-btn {
  position: relative;
  width: 38px;
  height: 38px;
  display: grid;
  place-items: center;
  border: 0;
  border-radius: 999px;
  background: transparent;
  color: var(--wms-text);
  cursor: pointer;
}

.icon-btn:hover {
  background: #f4f4f5;
}

.notify-dot {
  position: absolute;
  top: 8px;
  right: 8px;
  width: 7px;
  height: 7px;
  border-radius: 999px;
  background: var(--wms-primary);
  box-shadow: 0 0 0 3px #fff;
}

.user-pill {
  height: 42px;
  padding: 0 18px;
  border: 0;
  border-radius: 999px;
  background: #18181b;
  color: #fff;
  cursor: pointer;
  font-weight: 700;
}

.user-pill:hover {
  background: #000;
}

.user-menu {
  min-width: 220px;
  padding: 8px;
  border: 1px solid var(--wms-line);
  border-radius: 16px;
  background: #fff;
  box-shadow: var(--wms-shadow-md);
}

.menu-head {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 9px 8px 12px;
  margin-bottom: 4px;
  border-bottom: 1px solid var(--wms-line);
}

.avatar {
  width: 34px;
  height: 34px;
  display: grid;
  place-items: center;
  flex-shrink: 0;
  border-radius: 999px;
  background: var(--wms-primary);
  color: #fff;
  font-weight: 800;
}

.menu-head strong,
.menu-head small {
  display: block;
}

.menu-head strong {
  color: var(--wms-text);
  font-size: 13px;
}

.menu-head small {
  margin-top: 2px;
  color: var(--wms-text-muted);
}

.menu-item {
  width: 100%;
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 9px 10px;
  border: 0;
  border-radius: 10px;
  background: transparent;
  color: var(--wms-text-muted);
  cursor: pointer;
  font: inherit;
  text-align: left;
}

.menu-item:hover {
  background: #f4f4f5;
  color: var(--wms-text);
}

.menu-item.danger {
  color: var(--wms-danger);
}

.menu-item.danger:hover {
  background: var(--wms-danger-soft);
}
</style>
