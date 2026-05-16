<template>
  <header class="topbar">
    <div class="topbar-left">
      <div class="date-badge">
        <strong>{{ dayNumber }}</strong>
        <span>{{ dayLabel }}</span>
      </div>

      <div class="route-meta">
        <span class="route-kicker">WMS Command Center</span>
        <strong>{{ currentTitle }}</strong>
      </div>

      <div class="search-box" :class="{ focused: searchFocused }">
        <i class="iconfont icon-sousuo search-icon" />
        <input
          v-model="searchText"
          class="search-input"
          placeholder="搜索订单、货位、人员"
          @focus="searchFocused = true"
          @blur="searchFocused = false"
        />
      </div>
    </div>

    <div class="topbar-right">
      <a-date-picker
        v-if="userStore.canViewAll"
        v-model:value="workDateValue"
        :allow-clear="false"
        size="small"
        format="YYYY-MM-DD"
        class="work-date"
        @change="onWorkDateChange"
      />

      <a-tooltip title="刷新页面">
        <button class="icon-btn" aria-label="刷新页面" type="button" @click="() => $router.go(0)">
          <i class="iconfont icon-shuaxin" />
        </button>
      </a-tooltip>

      <a-tooltip title="消息通知">
        <button class="icon-btn alert" aria-label="消息通知" type="button">
          <i class="iconfont icon-xiaoxi" />
          <span class="notify-dot" />
        </button>
      </a-tooltip>

      <a-dropdown :trigger="['click']" placement="bottomRight">
        <button class="user-pill" type="button">
          <span class="avatar">{{ firstChar }}</span>
          <span class="user-info">
            <span class="user-name">{{ userStore.realName || '未命名用户' }}</span>
            <span class="user-role">{{ roleLabel }}</span>
          </span>
          <i class="iconfont icon-a-xiala2 pill-arrow" />
        </button>

        <template #overlay>
          <div class="user-menu">
            <div class="menu-head">
              <span class="menu-avatar">{{ firstChar }}</span>
              <span>
                <span class="menu-name">{{ userStore.realName || '未命名用户' }}</span>
                <span class="menu-role">{{ roleLabel }}</span>
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
import { ref, computed, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import dayjs, { type Dayjs } from 'dayjs'
import { useAppStore } from '@/stores/app'
import { useUserStore } from '@/stores/user'
import { ROLE_LABELS } from '@/utils/status'

const appStore = useAppStore()
const userStore = useUserStore()
const router = useRouter()
const route = useRoute()

const searchText = ref('')
const searchFocused = ref(false)
const workDateValue = ref<Dayjs>(dayjs(appStore.workDate))

watch(
  () => appStore.workDate,
  (d) => {
    workDateValue.value = dayjs(d)
  },
)

const currentTitle = computed(() => String(route.meta.title || '工作台'))
const dayNumber = computed(() => dayjs(appStore.workDate).format('DD'))
const dayLabel = computed(() => dayjs(appStore.workDate).format('ddd'))
const firstChar = computed(() => (userStore.realName?.[0] ?? 'U').toUpperCase())
const roleLabel = computed(() => {
  const r = userStore.role
  return r ? (ROLE_LABELS[r] ?? r) : ''
})

function onWorkDateChange(value: string | Dayjs) {
  appStore.setWorkDate(typeof value === 'string' ? value : value.format('YYYY-MM-DD'))
}

async function handleLogout() {
  await userStore.logout()
  router.push('/login')
}
</script>

<style scoped>
.topbar {
  height: 72px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 18px;
  flex-shrink: 0;
  padding: 0 18px;
  background: rgba(255, 253, 248, 0.72);
  border-bottom: 1px solid rgba(232, 224, 212, 0.75);
  backdrop-filter: blur(14px);
}

.topbar-left {
  flex: 1;
  min-width: 0;
  display: flex;
  align-items: center;
  gap: 16px;
}

.date-badge {
  width: 44px;
  height: 44px;
  display: grid;
  place-items: center;
  flex-shrink: 0;
  padding: 5px 0;
  border-radius: 15px;
  background: #11241c;
  color: #fff;
  box-shadow: 0 12px 24px rgba(18, 36, 28, 0.18);
}

.date-badge strong,
.date-badge span {
  line-height: 1;
}

.date-badge strong {
  font-size: 16px;
  font-weight: 850;
}

.date-badge span {
  color: #b7d6c5;
  font-size: 10px;
}

.route-meta {
  min-width: 166px;
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.route-kicker {
  color: var(--wms-primary);
  font-size: 11px;
  font-weight: 800;
  letter-spacing: 0.06em;
  text-transform: uppercase;
}

.route-meta strong {
  color: var(--wms-text);
  font-size: 17px;
  font-weight: 800;
  line-height: 1.25;
}

.search-box {
  width: min(370px, 42vw);
  height: 40px;
  display: flex;
  align-items: center;
  gap: 9px;
  padding: 0 13px;
  background: #fff;
  border: 1px solid rgba(232, 224, 212, 0.9);
  border-radius: 15px;
  box-shadow: 0 10px 22px rgba(21, 52, 39, 0.04);
  transition:
    background 0.16s ease,
    border-color 0.16s ease,
    box-shadow 0.16s ease;
}

.search-box.focused {
  border-color: rgba(0, 143, 90, 0.38);
  box-shadow: 0 0 0 4px rgba(0, 143, 90, 0.09);
}

.search-icon {
  color: var(--wms-text-soft);
  font-size: 15px;
}

.search-input {
  flex: 1;
  min-width: 0;
  border: 0;
  outline: 0;
  background: transparent;
  color: var(--wms-text);
  font-size: 13px;
}

.search-input::placeholder {
  color: #a9ada2;
}

.topbar-right {
  display: flex;
  align-items: center;
  gap: 8px;
}

.work-date {
  width: 132px;
}

.icon-btn {
  position: relative;
  width: 38px;
  height: 38px;
  display: grid;
  place-items: center;
  border: 1px solid rgba(232, 224, 212, 0.9);
  border-radius: 14px;
  background: #fff;
  color: var(--wms-text-muted);
  cursor: pointer;
  box-shadow: 0 8px 18px rgba(21, 52, 39, 0.04);
  transition:
    border-color 0.16s ease,
    color 0.16s ease,
    background 0.16s ease,
    transform 0.16s ease;
}

.icon-btn:hover {
  border-color: rgba(0, 143, 90, 0.34);
  color: var(--wms-primary);
  background: var(--wms-primary-soft);
  transform: translateY(-1px);
}

.icon-btn.alert:hover {
  border-color: rgba(255, 159, 28, 0.42);
  color: var(--wms-accent-strong);
  background: var(--wms-accent-soft);
}

.notify-dot {
  position: absolute;
  top: 8px;
  right: 8px;
  width: 7px;
  height: 7px;
  border-radius: 999px;
  background: var(--wms-accent);
  box-shadow: 0 0 0 3px #fff;
}

.user-pill {
  height: 42px;
  display: flex;
  align-items: center;
  gap: 9px;
  padding: 4px 12px 4px 4px;
  border: 1px solid rgba(232, 224, 212, 0.9);
  border-radius: 999px;
  background: #fff;
  color: var(--wms-text);
  cursor: pointer;
  box-shadow: 0 8px 18px rgba(21, 52, 39, 0.04);
  transition:
    border-color 0.16s ease,
    background 0.16s ease,
    transform 0.16s ease;
}

.user-pill:hover {
  border-color: rgba(0, 143, 90, 0.28);
  background: #fbfff8;
  transform: translateY(-1px);
}

.avatar,
.menu-avatar {
  display: grid;
  place-items: center;
  border-radius: 999px;
  background:
    linear-gradient(135deg, rgba(255, 159, 28, 0.26), transparent),
    var(--wms-primary);
  color: #fff;
  font-weight: 800;
}

.avatar {
  width: 34px;
  height: 34px;
  font-size: 12px;
}

.user-info,
.menu-head > span:last-child {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  line-height: 1.2;
}

.user-name {
  color: var(--wms-text);
  font-size: 12.5px;
  font-weight: 750;
}

.user-role {
  color: var(--wms-primary);
  font-size: 11px;
}

.pill-arrow {
  color: var(--wms-text-soft);
  font-size: 10px;
}

.user-menu {
  min-width: 216px;
  padding: 8px;
  background: #fffdf8;
  border: 1px solid var(--wms-line);
  border-radius: 18px;
  box-shadow: var(--wms-shadow-md);
}

.menu-head {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 8px 8px 11px;
  margin-bottom: 4px;
  border-bottom: 1px solid var(--wms-line);
}

.menu-avatar {
  width: 36px;
  height: 36px;
  flex-shrink: 0;
  font-size: 13px;
}

.menu-name,
.menu-role {
  display: block;
}

.menu-name {
  color: var(--wms-text);
  font-size: 13px;
  font-weight: 750;
}

.menu-role {
  margin-top: 2px;
  color: var(--wms-text-muted);
  font-size: 12px;
}

.menu-item {
  width: 100%;
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 9px 10px;
  border: 0;
  border-radius: 12px;
  background: transparent;
  color: var(--wms-text-muted);
  cursor: pointer;
  font: inherit;
  text-align: left;
}

.menu-item:hover {
  background: var(--wms-primary-soft);
  color: var(--wms-primary-strong);
}

.menu-item.danger {
  color: var(--wms-danger);
}

.menu-item.danger:hover {
  background: var(--wms-danger-soft);
}
</style>
