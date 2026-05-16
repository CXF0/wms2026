<template>
  <main class="login-page">
    <section class="login-shell">
      <div class="brand-panel">
        <div class="brand-head">
          <div class="brand-mark">✱</div>
          <div>
            <strong>鲜花 WMS</strong>
            <span>Flow Warehouse</span>
          </div>
        </div>

        <div class="hero-copy">
          <span class="eyebrow">Dispatch Center</span>
          <h1>把分拣、配货、打包、发货放进一个清爽工作台。</h1>
          <p>面向鲜花仓配现场的高频操作后台，强调快速识别状态、减少切换、让异常处理更顺手。</p>
        </div>

        <div class="signal-card">
          <div class="heatmap">
            <span v-for="n in 28" :key="n" :class="{ hot: [3, 8, 13, 18, 19, 24].includes(n), warm: n % 4 === 0 }" />
          </div>
          <div class="signal-copy">
            <strong>今日出库节奏</strong>
            <span>橙色高峰提醒，绿色状态闭环</span>
          </div>
        </div>

        <div class="metric-row">
          <div>
            <strong>96%</strong>
            <span>货位可视率</span>
          </div>
          <div>
            <strong>18m</strong>
            <span>平均处理时长</span>
          </div>
          <div>
            <strong>24h</strong>
            <span>现场协同</span>
          </div>
        </div>
      </div>

      <div class="login-panel">
        <div class="login-card">
          <div class="card-header">
            <span class="eyebrow">Welcome back</span>
            <h2>登录工作台</h2>
            <p>请输入账号和密码，继续处理今日仓配任务。</p>
          </div>

          <a-form :model="form" :rules="rules" layout="vertical" class="login-form" @finish="handleLogin">
            <a-form-item label="账号" name="userName">
              <a-input v-model:value="form.userName" size="large" placeholder="请输入账号" autocomplete="username">
                <template #prefix>
                  <i class="iconfont icon-guanliyuan input-icon" />
                </template>
              </a-input>
            </a-form-item>

            <a-form-item label="密码" name="password">
              <a-input-password
                v-model:value="form.password"
                size="large"
                placeholder="请输入密码"
                autocomplete="current-password"
              >
                <template #prefix>
                  <i class="iconfont icon-mima input-icon" />
                </template>
              </a-input-password>
            </a-form-item>

            <a-button type="primary" html-type="submit" size="large" block :loading="loading" class="login-btn">
              {{ loading ? '登录中...' : '登录' }}
            </a-button>
          </a-form>

          <div class="quick-row">
            <span>安全连接</span>
            <span>实时同步</span>
            <span>权限隔离</span>
          </div>
        </div>
      </div>
    </section>
  </main>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { message as AMessage } from 'ant-design-vue'
import { useUserStore } from '@/stores/user'

const router = useRouter()
const route = useRoute()
const userStore = useUserStore()

const loading = ref(false)
const form = ref({ userName: '', password: '', type: 1 })
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
  min-height: 100vh;
  display: grid;
  place-items: center;
  padding: 44px;
  background:
    radial-gradient(circle at 18% 0%, rgba(0, 143, 90, 0.34), transparent 28%),
    radial-gradient(circle at 76% 10%, rgba(255, 159, 28, 0.28), transparent 24%),
    linear-gradient(135deg, #07110e 0%, #12241c 42%, #edf5ea 100%);
}

.login-shell {
  width: min(1120px, 100%);
  min-height: 680px;
  display: grid;
  grid-template-columns: minmax(0, 1.08fr) minmax(400px, 0.92fr);
  overflow: hidden;
  border: 1px solid rgba(255, 255, 255, 0.58);
  border-radius: 30px;
  background: rgba(255, 253, 248, 0.94);
  box-shadow: 0 32px 72px rgba(0, 0, 0, 0.28);
}

.brand-panel,
.login-panel {
  padding: 34px;
}

.brand-panel {
  display: flex;
  flex-direction: column;
  position: relative;
  color: #fff;
  background:
    radial-gradient(circle at 18% 18%, rgba(255, 159, 28, 0.18), transparent 28%),
    linear-gradient(160deg, #0b1b15 0%, #0f3022 56%, #005b39 100%);
}

.brand-head {
  display: flex;
  align-items: center;
  gap: 12px;
}

.brand-mark {
  width: 42px;
  height: 42px;
  display: grid;
  place-items: center;
  border-radius: 15px;
  background: var(--wms-primary);
  color: #fff;
  font-size: 26px;
  box-shadow: 0 18px 36px rgba(0, 143, 90, 0.34);
}

.brand-head strong,
.brand-head span {
  display: block;
}

.brand-head strong {
  font-size: 18px;
  font-weight: 850;
}

.brand-head span {
  color: #a8d4bc;
  font-size: 12px;
}

.hero-copy {
  max-width: 560px;
  margin-top: 86px;
}

.eyebrow {
  display: inline-flex;
  align-items: center;
  height: 24px;
  padding: 0 10px;
  border-radius: 999px;
  background: rgba(0, 143, 90, 0.12);
  color: var(--wms-primary);
  font-size: 11px;
  font-weight: 850;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.brand-panel .eyebrow {
  background: rgba(255, 255, 255, 0.1);
  color: #9be4bd;
}

.hero-copy h1 {
  margin: 18px 0 0;
  font-size: 48px;
  line-height: 1.04;
  font-weight: 850;
  letter-spacing: 0;
}

.hero-copy p {
  max-width: 500px;
  margin: 18px 0 0;
  color: #bdd5c7;
  font-size: 15px;
  line-height: 1.8;
}

.signal-card {
  width: min(520px, 100%);
  display: grid;
  grid-template-columns: 1fr 190px;
  gap: 18px;
  margin-top: 46px;
  padding: 18px;
  border: 1px solid rgba(255, 255, 255, 0.14);
  border-radius: 24px;
  background: rgba(255, 255, 255, 0.08);
  backdrop-filter: blur(14px);
}

.heatmap {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 8px;
}

.heatmap span {
  aspect-ratio: 1;
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.18);
}

.heatmap span.warm {
  background: #ffbd85;
}

.heatmap span.hot {
  background: #ff9f1c;
  box-shadow: 0 10px 22px rgba(255, 159, 28, 0.24);
}

.signal-copy {
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.signal-copy strong {
  font-size: 18px;
}

.signal-copy span {
  margin-top: 6px;
  color: #bdd5c7;
  font-size: 12px;
  line-height: 1.6;
}

.metric-row {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 12px;
  margin-top: auto;
}

.metric-row div {
  padding: 16px;
  border: 1px solid rgba(255, 255, 255, 0.13);
  border-radius: 18px;
  background: rgba(255, 255, 255, 0.07);
}

.metric-row strong,
.metric-row span {
  display: block;
}

.metric-row strong {
  font-size: 23px;
}

.metric-row span {
  margin-top: 4px;
  color: #a8d4bc;
  font-size: 12px;
}

.login-panel {
  display: grid;
  place-items: center;
  background:
    radial-gradient(circle at 84% 18%, rgba(255, 159, 28, 0.2), transparent 30%),
    #fffdf8;
}

.login-card {
  width: min(420px, 100%);
  padding: 34px;
  background: rgba(255, 255, 255, 0.78);
  border: 1px solid rgba(232, 224, 212, 0.82);
  border-radius: 26px;
  box-shadow: var(--wms-shadow-md);
  backdrop-filter: blur(16px);
}

.card-header {
  margin-bottom: 28px;
}

.card-header h2 {
  margin: 12px 0 0;
  color: var(--wms-text);
  font-size: 31px;
  font-weight: 850;
  letter-spacing: 0;
}

.card-header p {
  margin: 9px 0 0;
  color: var(--wms-text-muted);
  line-height: 1.7;
}

.login-form :deep(.ant-form-item-label > label) {
  color: var(--wms-text);
  font-weight: 700;
}

.input-icon {
  color: var(--wms-primary);
}

.login-btn {
  height: 46px;
  margin-top: 4px;
  font-weight: 800;
}

.quick-row {
  display: flex;
  justify-content: center;
  gap: 8px;
  margin-top: 20px;
  color: var(--wms-text-soft);
  font-size: 12px;
}

.quick-row span {
  padding: 5px 9px;
  border-radius: 999px;
  background: #f7f2e9;
}
</style>
