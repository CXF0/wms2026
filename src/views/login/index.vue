<template>
  <div class="login-page">
    <div class="aurora" aria-hidden="true">
      <div class="orb orb-a" />
      <div class="orb orb-b" />
      <div class="orb orb-c" />
      <div class="stripe" />
    </div>

    <section class="hero-card" aria-hidden="true">
      <div class="chip-grid">
        <span class="chip">#FullTime</span>
        <span class="chip">#RemoteJob</span>
        <span class="chip chip-wide">#UIUXDesigner</span>
        <span class="chip">#Paris</span>
      </div>
      <div class="status-switch">
        <span class="switch-dot" />
      </div>
    </section>

    <aside class="login-panel">
      <div class="panel-inner">
        <div class="brand">
          <h1 class="brand-name">寻梦鲜花分拣发货管理平台</h1>
          <p class="brand-sub">Warehouse Management System</p>
        </div>

        <a-form ref="formRef" :model="form" :rules="rules" layout="vertical" @finish="handleLogin">
          <a-form-item name="userName">
            <template #label><span class="field-lbl">账号</span></template>
            <a-input v-model:value="form.userName" size="large" placeholder="请输入账号" autocomplete="username" class="wms-input" />
          </a-form-item>
          <a-form-item name="password">
            <template #label><span class="field-lbl">密码</span></template>
            <a-input-password v-model:value="form.password" size="large" placeholder="请输入密码" autocomplete="current-password" class="wms-input" />
          </a-form-item>
          <a-button type="primary" html-type="submit" size="large" block :loading="loading" class="btn-enter">
            {{ loading ? '登录中...' : '进入系统' }}
          </a-button>
        </a-form>

        <p class="copyright">© {{ currentYear }} 鲜花WMS管理平台</p>
      </div>
    </aside>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { message as AMessage } from 'ant-design-vue'
import { useUserStore } from '@/stores/user'

const router = useRouter()
const route = useRoute()
const userStore = useUserStore()

const currentYear = new Date().getFullYear()
const loading = ref(false)
const form = ref({ userName: '', password: '', type: 3 })
const rules = {
  userName: [{ required: true, message: '请输入账号' }],
  password: [{ required: true, message: '请输入密码' }],
}

async function handleLogin() {
  loading.value = true
  try {
    await userStore.login(form.value)
    const redirect = (route.query.redirect as string) || '/dashboard'
    router.push(redirect)
  } catch {
    AMessage.error('账号或密码错误，请重试')
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.login-page {
  position: relative;
  min-height: 100vh;
  display: grid;
  grid-template-columns: minmax(420px, 1fr) 430px;
  overflow: hidden;
  background: linear-gradient(135deg, #78c0ef 0%, #6ba9df 45%, #8fc3ea 100%);
}

.aurora { position: absolute; inset: 0; pointer-events: none; }
.orb {
  position: absolute;
  border-radius: 50%;
  filter: blur(70px);
  opacity: 0.5;
}
.orb-a { width: 380px; height: 380px; background: #88dcff; top: -80px; left: -90px; }
.orb-b { width: 420px; height: 420px; background: #9ad8ff; right: 20%; top: 16%; opacity: 0.32; }
.orb-c { width: 500px; height: 300px; background: #7fb2f9; bottom: -90px; right: -110px; opacity: 0.45; }
.stripe {
  position: absolute;
  inset: auto -10% -22% -10%;
  height: 40%;
  transform: skewY(-28deg);
  background: repeating-linear-gradient(95deg, rgba(30, 100, 171, 0.78) 0 13%, rgba(85, 166, 224, 0.58) 13% 25%);
}

.hero-card {
  z-index: 1;
  align-self: center;
  justify-self: center;
  width: min(760px, 82%);
  padding: 48px;
  border-radius: 46px;
  background: linear-gradient(160deg, rgba(255, 255, 255, 0.92), rgba(237, 241, 245, 0.72));
  box-shadow: 0 26px 70px rgba(3, 12, 36, 0.28), inset 1px 1px 0 rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(8px);
}
.chip-grid { display: grid; grid-template-columns: repeat(2, minmax(180px, 1fr)); gap: 24px; }
.chip {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 18px 24px;
  border-radius: 999px;
  background: linear-gradient(180deg, rgba(245, 251, 252, 0.95), rgba(225, 236, 239, 0.85));
  color: #18486d;
  font-size: 40px;
  font-weight: 700;
  letter-spacing: 0.4px;
  box-shadow: 0 14px 26px rgba(36, 96, 79, 0.2);
}
.chip-wide { grid-column: span 1; }
.status-switch {
  width: 168px;
  margin-top: 42px;
  padding: 10px;
  border-radius: 999px;
  background: linear-gradient(180deg, rgba(245, 250, 248, 0.95), rgba(205, 223, 214, 0.9));
  box-shadow: inset 8px 8px 15px rgba(168, 193, 180, 0.48), inset -6px -6px 12px rgba(255, 255, 255, 0.82);
}
.switch-dot {
  display: block;
  width: 56px;
  height: 56px;
  margin-left: auto;
  border-radius: 50%;
  background: radial-gradient(circle at 30% 30%, #74bfff, #2e7ed9);
  box-shadow: 0 6px 14px rgba(8, 85, 39, 0.4);
}

.login-panel {
  z-index: 2;
  min-height: 100vh;
  display: flex;
  align-items: center;
  background: rgba(245, 249, 250, 0.85);
  border-left: 1px solid rgba(255, 255, 255, 0.35);
  backdrop-filter: blur(14px);
}
.panel-inner { width: 100%; padding: 64px 48px; }
.brand { margin-bottom: 36px; }
.brand-name { margin: 0 0 8px; font-size: 22px; color: #0d2f1f; }
.brand-sub { margin: 0; color: #346d57; font-size: 12px; letter-spacing: 1.2px; }

:deep(.ant-form-item) { margin-bottom: 20px; }
.field-lbl { color: #325f50; font-weight: 600; }
.wms-input :deep(.ant-input-affix-wrapper),
.wms-input :deep(.ant-input) {
  border-radius: 12px !important;
  border: 1px solid rgba(89, 141, 123, 0.28) !important;
  background: rgba(255, 255, 255, 0.86) !important;
  height: 48px !important;
}
.btn-enter {
  height: 48px !important;
  margin-top: 6px;
  border: none !important;
  border-radius: 12px !important;
  font-size: 15px !important;
  font-weight: 600 !important;
  background: linear-gradient(135deg, #4aa3ff, #206ec8) !important;
  box-shadow: 0 10px 20px rgba(7, 106, 48, 0.35);
}
.copyright { margin: 34px 0 0; color: #4f7f6b; font-size: 12px; text-align: center; }

@media (max-width: 1120px) {
  .login-page { grid-template-columns: 1fr; }
  .hero-card { display: none; }
  .login-panel { width: 100%; }
}
</style>
