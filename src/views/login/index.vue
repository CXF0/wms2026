<template>
  <main class="login-page">
    <section class="preview-panel">
      <header class="preview-top">
        <div class="brand">
          <span class="brand-mark" />
          <strong>Protocol WMS</strong>
        </div>
        <span class="preview-tag">Warehouse Console</span>
      </header>

      <div class="hero">
        <span class="eyebrow">Flow Documentation</span>
        <h1>把仓配流程整理成清晰、可追踪的工作台。</h1>
        <p>以文档式信息结构承载 WMS 高频操作：货位、质检、配货、打包、运输，每一步都保持清晰和克制。</p>
      </div>

      <div class="guide-grid">
        <article>
          <strong>货位管理</strong>
          <p>按分区、货架、状态快速追踪现场进度。</p>
        </article>
        <article>
          <strong>质检与异常</strong>
          <p>把缺货、降级、退货聚合成可处理的问题队列。</p>
        </article>
        <article>
          <strong>打包发货</strong>
          <p>从面单到交接，保持发货节奏透明。</p>
        </article>
      </div>
    </section>

    <section class="login-panel">
      <div class="login-card">
        <div class="card-header">
          <span class="eyebrow">Sign in</span>
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
  grid-template-columns: minmax(520px, 1fr) 480px;
  background:
    linear-gradient(rgba(16, 185, 129, 0.08) 1px, transparent 1px),
    linear-gradient(90deg, rgba(16, 185, 129, 0.08) 1px, transparent 1px),
    linear-gradient(135deg, rgba(16, 185, 129, 0.12), transparent 36%),
    #fff;
  background-size: 96px 96px, 96px 96px, auto, auto;
}

.preview-panel {
  display: flex;
  flex-direction: column;
  padding: 36px 56px 56px;
  border-right: 1px solid var(--wms-line);
}

.preview-top {
  height: 44px;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.brand {
  display: flex;
  align-items: center;
  gap: 12px;
}

.brand-mark {
  width: 22px;
  height: 22px;
  border-radius: 7px 7px 7px 2px;
  background: var(--wms-primary);
}

.brand strong {
  color: var(--wms-text);
  font-size: 22px;
  font-weight: 850;
}

.preview-tag {
  color: var(--wms-text-muted);
  font-size: 13px;
}

.hero {
  max-width: 720px;
  margin-top: 118px;
}

.eyebrow {
  color: var(--wms-primary-strong);
  font-size: 13px;
  font-weight: 800;
}

.hero h1 {
  margin: 18px 0 0;
  color: var(--wms-text);
  font-size: 48px;
  font-weight: 850;
  line-height: 1.12;
}

.hero p {
  margin: 22px 0 0;
  color: var(--wms-text-muted);
  font-size: 19px;
  line-height: 1.8;
}

.guide-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 0;
  margin-top: auto;
  border-top: 1px solid var(--wms-line);
}

.guide-grid article {
  min-height: 132px;
  padding: 24px 24px 0 0;
  border-right: 1px solid var(--wms-line);
}

.guide-grid article:last-child {
  border-right: 0;
  padding-left: 24px;
}

.guide-grid strong {
  color: var(--wms-text);
  font-size: 15px;
  font-weight: 850;
}

.guide-grid p {
  margin: 10px 0 0;
  color: var(--wms-text-muted);
  line-height: 1.7;
}

.login-panel {
  display: grid;
  place-items: center;
  padding: 48px;
  background: rgba(250, 250, 250, 0.72);
}

.login-card {
  width: 100%;
  padding: 34px;
  border: 1px solid var(--wms-line);
  border-radius: 24px;
  background: #fff;
  box-shadow: var(--wms-shadow-md);
}

.card-header h2 {
  margin: 14px 0 0;
  color: var(--wms-text);
  font-size: 30px;
  font-weight: 850;
}

.card-header p {
  margin: 10px 0 0;
  color: var(--wms-text-muted);
}

.login-form {
  margin-top: 30px;
}

.input-icon {
  color: var(--wms-text-soft);
}

.login-btn {
  margin-top: 6px;
  height: 46px;
}

@media (max-width: 960px) {
  .login-page {
    grid-template-columns: 1fr;
  }

  .preview-panel {
    min-height: 58vh;
    border-right: 0;
    border-bottom: 1px solid var(--wms-line);
  }

  .login-panel {
    padding: 28px;
  }
}
</style>
