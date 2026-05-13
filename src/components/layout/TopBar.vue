<template>
  <header class="topbar">
    <!-- 左：搜索框 -->
    <div class="topbar-left">
      <div class="search-box" :class="{ focused: searchFocused }">
        <i class="iconfont icon-sousuo search-icon" />
        <input
          v-model="searchText"
          class="search-input"
          placeholder="搜索..."
          @focus="searchFocused = true"
          @blur="searchFocused = false"
        />
      </div>
    </div>

    <!-- 右：工具区 -->
    <div class="topbar-right">
      <!-- 工作日期 -->
      <a-date-picker
        v-if="userStore.canViewAll"
        v-model:value="workDateValue"
        :allow-clear="false"
        size="small"
        format="YYYY-MM-DD"
        class="work-date"
        @change="(d: Dayjs) => appStore.setWorkDate(d.format('YYYY-MM-DD'))"
      />

      <!-- 刷新 -->
      <a-tooltip title="刷新页面">
        <button class="icon-btn" aria-label="刷新" @click="() => $router.go(0)">
          <i class="iconfont icon-shuaxin" />
        </button>
      </a-tooltip>

      <!-- 消息通知 -->
      <a-tooltip title="消息通知">
        <button class="icon-btn" aria-label="消息通知">
          <i class="iconfont icon-xiaoxi" />
        </button>
      </a-tooltip>

      <!-- 分割线 -->
      <div class="vline" />

      <!-- 用户胶囊 -->
      <a-dropdown :trigger="['click']" placement="bottomRight">
        <div class="user-pill" role="button" tabindex="0">
          <div class="avatar">{{ firstChar }}</div>
          <div class="user-info">
            <span class="user-name">{{ userStore.realName }}</span>
            <span class="user-role">{{ roleLabel }}</span>
          </div>
          <i class="iconfont icon-a-xiala2 pill-arrow" />
        </div>

        <template #overlay>
          <div class="user-menu">
            <div class="menu-head">
              <div class="menu-avatar">{{ firstChar }}</div>
              <div>
                <div class="menu-name">{{ userStore.realName }}</div>
                <div class="menu-role">{{ roleLabel }}</div>
              </div>
            </div>
            <div class="menu-divider" />
            <div class="menu-item" @click="() => {}">
              <i class="iconfont icon-anquan" />
              <span>账号安全</span>
            </div>
            <div class="menu-item danger" @click="handleLogout">
              <i class="iconfont icon-shanchu" />
              <span>退出登录</span>
            </div>
          </div>
        </template>
      </a-dropdown>
    </div>
  </header>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useRouter } from 'vue-router'
import dayjs, { type Dayjs } from 'dayjs'
import { useAppStore } from '@/stores/app'
import { useUserStore } from '@/stores/user'
import { ROLE_LABELS } from '@/utils/status'

const appStore  = useAppStore()
const userStore = useUserStore()
const router    = useRouter()

const searchText    = ref('')
const searchFocused = ref(false)
const workDateValue = ref<Dayjs>(dayjs(appStore.workDate))
watch(() => appStore.workDate, d => { workDateValue.value = dayjs(d) })

const firstChar = computed(() => (userStore.realName?.[0] ?? 'U').toUpperCase())
const roleLabel = computed(() => {
  const r = userStore.role
  return r ? (ROLE_LABELS[r] ?? r) : ''
})

async function handleLogout() {
  await userStore.logout()
  router.push('/login')
}
</script>

<style scoped>
.topbar {
  height: 62px;
  display: flex; align-items: center; justify-content: space-between;
  padding: 0 22px;
  border-bottom: 1px solid rgba(200, 228, 252, 0.45);
  background: transparent;
  flex-shrink: 0;
}

/* 搜索框 */
.topbar-left { flex: 1; max-width: 400px; }
.search-box {
  display: flex; align-items: center; gap: 9px;
  height: 38px; padding: 0 14px;
  background: rgba(255,255,255,0.7);
  border: 1px solid rgba(190,220,248,0.6);
  border-radius: 10px;
  transition: border-color 0.15s, background 0.15s, box-shadow 0.15s;
}
.search-box.focused {
  border-color: rgba(60,140,230,0.45);
  background: rgba(255,255,255,0.92);
  box-shadow: 0 0 0 3px rgba(26,109,216,0.08);
}
.search-icon { font-size: 16px; color: #98bcd8; }
.search-input {
  flex: 1; border: none; outline: none;
  background: transparent;
  font-size: 13.5px; color: #1e3a5a;
  font-family: inherit;
}
.search-input::placeholder { color: #b8d4ea; }

/* 右侧工具 */
.topbar-right { display: flex; align-items: center; gap: 8px; }
.work-date { width: 124px; }

.icon-btn {
  width: 36px; height: 36px;
  border: 1px solid rgba(190,220,248,0.5);
  background: rgba(255,255,255,0.65);
  border-radius: 10px; cursor: pointer;
  color: #72a0c0;
  display: flex; align-items: center; justify-content: center;
  transition: background 0.15s, color 0.15s;
}
.icon-btn .iconfont { font-size: 17px; }
.icon-btn:hover { background: rgba(255,255,255,0.92); color: #1a6dd8; }

.vline { width: 1px; height: 22px; background: rgba(170,210,245,0.4); margin: 0 2px; }

/* 用户胶囊 */
.user-pill {
  display: flex; align-items: center; gap: 9px;
  padding: 5px 12px 5px 5px;
  background: rgba(255,255,255,0.72);
  border: 1px solid rgba(190,220,248,0.55);
  border-radius: 22px; cursor: pointer;
  transition: background 0.15s;
  user-select: none;
}
.user-pill:hover { background: rgba(255,255,255,0.92); }
.avatar {
  width: 30px; height: 30px; border-radius: 50%;
  background: linear-gradient(135deg, #5aaae0 0%, #1a6dd8 100%);
  color: #fff; font-size: 12px; font-weight: 700;
  display: flex; align-items: center; justify-content: center;
  flex-shrink: 0;
}
.user-info { display: flex; flex-direction: column; }
.user-name { font-size: 12.5px; font-weight: 600; color: #1a2e50; line-height: 1.3; }
.user-role { font-size: 10.5px; color: #80aac8; line-height: 1.3; }
.pill-arrow { font-size: 10px; color: #a0c4e0; }

/* 下拉菜单 */
.user-menu {
  min-width: 192px;
  background: rgba(255,255,255,0.96);
  backdrop-filter: blur(16px);
  border: 1px solid rgba(200,228,252,0.8);
  border-radius: 14px;
  box-shadow: 0 8px 28px rgba(26,100,200,0.1);
  padding: 8px; overflow: hidden;
}
.menu-head {
  display: flex; align-items: center; gap: 10px;
  padding: 8px 10px 10px;
}
.menu-avatar {
  width: 36px; height: 36px; border-radius: 50%;
  background: linear-gradient(135deg, #5aaae0 0%, #1a6dd8 100%);
  color: #fff; font-size: 14px; font-weight: 700;
  display: flex; align-items: center; justify-content: center;
}
.menu-name { font-size: 13.5px; font-weight: 600; color: #1a2e50; }
.menu-role { font-size: 11.5px; color: #88aac8; margin-top: 1px; }
.menu-divider { height: 1px; background: rgba(190,220,250,0.4); margin: 4px 0; }
.menu-item {
  display: flex; align-items: center; gap: 8px;
  padding: 9px 12px; border-radius: 8px;
  cursor: pointer; font-size: 13px; color: #3a6080;
  transition: background 0.12s;
}
.menu-item .iconfont { font-size: 16px; }
.menu-item:hover { background: rgba(240,248,255,0.9); }
.menu-item.danger { color: #d04040; }
.menu-item.danger:hover { background: rgba(255,236,236,0.7); }
</style>