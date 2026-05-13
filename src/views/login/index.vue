<template>
  <div class="login-page">
    <!-- 背景渐变 -->
    <div class="bg" />

    <!-- 左侧装饰区 -->
    <div class="left-panel">
      <div class="left-content">
        <div class="brand-logo">🌸</div>
        <h1 class="brand-title">寻梦鲜花</h1>
        <p class="brand-desc">分拣发货中心管理平台</p>

        <div class="feature-list">
          <div class="feature-item">
            <span class="feature-icon">📦</span>
            <span>货位智能分配管理</span>
          </div>
          <div class="feature-item">
            <span class="feature-icon">📊</span>
            <span>实时数据看板监控</span>
          </div>
          <div class="feature-item">
            <span class="feature-icon">🚚</span>
            <span>物流配送全流程追踪</span>
          </div>
          <div class="feature-item">
            <span class="feature-icon">👥</span>
            <span>人员效能分析管理</span>
          </div>
        </div>
      </div>
    </div>

    <!-- 右侧登录框 -->
    <div class="right-panel">
      <div class="login-card">
        <!-- 头部 -->
        <div class="card-header">
          <h2 class="card-title">欢迎回来</h2>
          <p class="card-sub">请登录您的账号</p>
        </div>

        <!-- 表单 -->
        <a-form
          ref="formRef"
          :model="form"
          :rules="rules"
          layout="vertical"
          class="login-form"
          @finish="handleLogin"
        >
          <a-form-item name="userName">
            <template #label><span class="field-label">账 号</span></template>
            <a-input
              v-model:value="form.userName"
              size="large"
              placeholder="请输入账号"
              class="form-input"
              autocomplete="username"
            >
              <template #prefix>
                <i class="iconfont icon-guanliyuan input-icon" />
              </template>
            </a-input>
          </a-form-item>

          <a-form-item name="password">
            <template #label><span class="field-label">密 码</span></template>
            <a-input-password
              v-model:value="form.password"
              size="large"
              placeholder="请输入密码"
              class="form-input"
              autocomplete="current-password"
            >
              <template #prefix>
                <i class="iconfont icon-mima input-icon" />
              </template>
            </a-input-password>
          </a-form-item>

          <a-button
            type="primary"
            html-type="submit"
            size="large"
            block
            :loading="loading"
            class="login-btn"
          >
            {{ loading ? '登录中...' : '登 录' }}
          </a-button>
        </a-form>

        <p class="copyright">© {{ new Date().getFullYear() }} 寻梦鲜花供应链管理平台</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { message as AMessage } from 'ant-design-vue'

import { useUserStore } from '@/stores/user'

const router    = useRouter()
const route     = useRoute()
const userStore = useUserStore()

const loading = ref(false)
const form    = ref({ userName: '', password: '', type: 1 })
const rules   = {
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
/* ── 整体 ─────────────────────────────────────────────────── */
.login-page {
  min-height: 100vh;
  display: flex;
  position: relative;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'PingFang SC', sans-serif;
}

.bg {
  position: fixed;
  inset: 0;
  background: linear-gradient(145deg, #daeffe 0%, #c2e4f8 35%, #cce9fd 65%, #e4f4ff 100%);
  z-index: 0;
}

/* ── 左侧装饰 ─────────────────────────────────────────────── */
.left-panel {
  position: relative;
  z-index: 1;
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 60px;
}

.left-content {
  max-width: 420px;
}

.brand-logo {
  font-size: 52px;
  margin-bottom: 16px;
  filter: drop-shadow(0 4px 12px rgba(30, 100, 200, 0.2));
}

.brand-title {
  font-size: 36px;
  font-weight: 800;
  color: #1a3a6a;
  margin: 0 0 8px;
  letter-spacing: -0.5px;
}

.brand-desc {
  font-size: 16px;
  color: #4a7aaa;
  margin: 0 0 48px;
  font-weight: 400;
}

.feature-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.feature-item {
  display: flex;
  align-items: center;
  gap: 14px;
  background: rgba(255, 255, 255, 0.5);
  backdrop-filter: blur(8px);
  border: 1px solid rgba(255, 255, 255, 0.8);
  border-radius: 12px;
  padding: 14px 18px;
  font-size: 14px;
  color: #2a5080;
  font-weight: 500;
  transition: background 0.2s, transform 0.2s;
}

.feature-item:hover {
  background: rgba(255, 255, 255, 0.75);
  transform: translateX(4px);
}

.feature-icon { font-size: 20px; }

/* ── 右侧登录框 ───────────────────────────────────────────── */
.right-panel {
  position: relative;
  z-index: 1;
  width: 480px;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 40px;
}

.login-card {
  width: 100%;
  background: rgba(255, 255, 255, 0.88);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border: 1px solid rgba(200, 228, 255, 0.8);
  border-radius: 24px;
  padding: 44px 40px 36px;
  box-shadow: 0 8px 40px rgba(30, 100, 200, 0.1), 0 2px 8px rgba(30, 100, 200, 0.06);
}

/* ── 卡片头部 ─────────────────────────────────────────────── */
.card-header { margin-bottom: 32px; }

.card-title {
  font-size: 24px;
  font-weight: 700;
  color: #1a2a40;
  margin: 0 0 6px;
  letter-spacing: -0.3px;
}

.card-sub {
  font-size: 14px;
  color: #7aaac8;
  margin: 0;
}

/* ── 表单 ─────────────────────────────────────────────────── */
.login-form :deep(.ant-form-item) {
  margin-bottom: 20px;
}

.login-form :deep(.ant-form-item-label) {
  padding-bottom: 7px !important;
}

.field-label {
  font-size: 11px;
  letter-spacing: 1.5px;
  color: #6a92b8;
  font-weight: 600;
  text-transform: uppercase;
}

.form-input :deep(.ant-input-affix-wrapper) {
  background: rgba(255, 255, 255, 0.75) !important;
  border: 1px solid rgba(180, 215, 248, 0.7) !important;
  border-radius: 10px !important;
  height: 48px !important;
  font-size: 14px !important;
  color: #1a2a40 !important;
  transition: all 0.15s !important;
}

.form-input :deep(.ant-input-affix-wrapper:hover) {
  border-color: rgba(80, 150, 230, 0.5) !important;
  background: rgba(255, 255, 255, 0.9) !important;
}

.form-input :deep(.ant-input-affix-wrapper-focused) {
  border-color: #1a6dd8 !important;
  background: #fff !important;
  box-shadow: 0 0 0 3px rgba(26, 109, 216, 0.1) !important;
}

.form-input :deep(.ant-input-affix-wrapper .ant-input) {
  background: transparent !important;
  color: #1a2a40 !important;
}

.form-input :deep(.ant-input::placeholder) {
  color: #b0cce8 !important;
}

.input-icon {
  color: #8ab8da;
  font-size: 15px;
}

/* ── 按钮 ─────────────────────────────────────────────────── */
.login-btn {
  height: 50px !important;
  border-radius: 12px !important;
  font-size: 15px !important;
  font-weight: 600 !important;
  letter-spacing: 2px !important;
  background: linear-gradient(135deg, #2a82e8 0%, #1a6dd8 100%) !important;
  border: none !important;
  margin-top: 8px;
  box-shadow: 0 4px 16px rgba(26, 109, 216, 0.3) !important;
  transition: all 0.2s !important;
}

.login-btn:hover {
  background: linear-gradient(135deg, #3a8ef0 0%, #2a7ee8 100%) !important;
  box-shadow: 0 6px 20px rgba(26, 109, 216, 0.4) !important;
  transform: translateY(-1px);
}

/* ── 版权 ─────────────────────────────────────────────────── */
.copyright {
  font-size: 11px;
  color: #aac8e0;
  text-align: center;
  margin: 28px 0 0;
  letter-spacing: 0.3px;
}

/* ── 响应式 ───────────────────────────────────────────────── */
@media (max-width: 768px) {
  .left-panel { display: none; }
  .right-panel { width: 100%; padding: 24px 20px; }
  .login-card { padding: 36px 28px 28px; }
}
</style>