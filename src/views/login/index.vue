<template>
  <div class="login-page" @mousemove="onMouseMove">
    <div class="bg" />

    <!-- 左侧：眼睛跟随小人 + 品牌信息 -->
    <div class="left-panel">
      <div class="left-content">
        <!-- 品牌 -->
        <div class="brand-area">
          <h1 class="brand-title">寻梦鲜花 WMS</h1>
          <p class="brand-desc">智慧仓储 · 精准分拣 · 高效发货</p>
        </div>

        <!-- 四个小人 -->
        <div class="character-group" ref="characterGroupRef">
          <!-- 小人1：紫色高个 -->
          <div class="character char-purple" :class="{ speaking: speakingIdx === 0 }">
            <div class="face">
              <div class="eye"><div class="pupil" /></div>
              <div class="eye"><div class="pupil" /></div>
            </div>
            <div class="mouth" :class="{ open: speakingIdx === 0 }">
              <span class="mouth-char">{{ speakChars[0] }}</span>
            </div>
          </div>
          <!-- 小人2：深色中个 -->
          <div class="character char-dark" :class="{ speaking: speakingIdx === 1 }">
            <div class="face">
              <div class="eye"><div class="pupil" /></div>
              <div class="eye"><div class="pupil" /></div>
            </div>
            <div class="mouth" :class="{ open: speakingIdx === 1 }">
              <span class="mouth-char">{{ speakChars[1] }}</span>
            </div>
          </div>
          <!-- 小人3：橙色矮胖 -->
          <div class="character char-orange" :class="{ speaking: speakingIdx === 2 }">
            <div class="face">
              <div class="eye"><div class="pupil" /></div>
              <div class="eye"><div class="pupil" /></div>
            </div>
            <div class="mouth" :class="{ open: speakingIdx === 2 }">
              <span class="mouth-char">{{ speakChars[2] }}</span>
            </div>
          </div>
          <!-- 小人4：黄色圆滚 -->
          <div class="character char-yellow" :class="{ speaking: speakingIdx === 3 }">
            <div class="face">
              <div class="eye"><div class="pupil" /></div>
              <div class="eye"><div class="pupil" /></div>
            </div>
            <div class="mouth" :class="{ open: speakingIdx === 3 }">
              <span class="mouth-char">{{ speakChars[3] }}</span>
            </div>
          </div>
        </div>

        <!-- 特性列表 -->
        <div class="feature-list">
          <div class="feature-item">
            <i class="iconfont icon-peihuopeizhi feature-icon" />
            <span>货位智能分配管理</span>
          </div>
          <div class="feature-item">
            <i class="iconfont icon-shuju feature-icon" />
            <span>实时数据看板监控</span>
          </div>
          <div class="feature-item">
            <i class="iconfont icon-kuguanfahuo feature-icon" />
            <span>集货运输全流程追踪</span>
          </div>
          <div class="feature-item">
            <i class="iconfont icon-guanliyuan feature-icon" />
            <span>人员效能分析管理</span>
          </div>
        </div>
      </div>
    </div>

    <!-- 右侧：登录框 -->
    <div class="right-panel">
      <div class="login-card">
        <div class="card-header">
          <h2 class="card-title">欢迎使用</h2>
          <p class="card-sub">请登录您的账号</p>
        </div>

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
              @focus="onPasswordFocus"
              @blur="onPasswordBlur"
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

        <p class="copyright">© {{ new Date().getFullYear() }} 寻梦鲜花 WMS</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
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

// ── 眼睛跟随鼠标 ────────────────────────────────────────────
const characterGroupRef = ref<HTMLElement | null>(null)
// 密码框状态：'normal'=正常跟鼠标 | 'shy'=假装不看 | 'peek'=偷看
const eyeMode = ref<'normal' | 'shy' | 'peek'>('normal')

function setAllPupils(x: number, y: number, opacity = 1) {
  if (!characterGroupRef.value) return
  const eyes = characterGroupRef.value.querySelectorAll<HTMLElement>('.eye')
  eyes.forEach(eye => {
    const pupil = eye.querySelector<HTMLElement>('.pupil')
    if (!pupil) return
    pupil.style.transform = `translate(calc(-50% + ${x}px), calc(-50% + ${y}px))`
    pupil.style.opacity = String(opacity)
  })
}

function onMouseMove(e: MouseEvent) {
  if (eyeMode.value !== 'normal') return
  if (!characterGroupRef.value) return
  const eyes = characterGroupRef.value.querySelectorAll<HTMLElement>('.eye')
  eyes.forEach(eye => {
    const pupil = eye.querySelector<HTMLElement>('.pupil')
    if (!pupil) return
    const rect = eye.getBoundingClientRect()
    const cx = rect.left + rect.width / 2
    const cy = rect.top + rect.height / 2
    const angle = Math.atan2(e.clientY - cy, e.clientX - cx)
    const maxDist = 5
    const x = Math.cos(angle) * maxDist
    const y = Math.sin(angle) * maxDist
    pupil.style.transform = `translate(calc(-50% + ${x}px), calc(-50% + ${y}px))`
    pupil.style.opacity = '1'
  })
}

// 密码框聚焦：小人假装看向两侧（奇数眼左，偶数眼右）
function onPasswordFocus() {
  if (form.value.password) {
    // 已有内容时直接进入偷看模式
    eyeMode.value = 'peek'
    peekAtPassword()
    return
  }
  eyeMode.value = 'shy'
  if (!characterGroupRef.value) return
  const eyes = characterGroupRef.value.querySelectorAll<HTMLElement>('.eye')
  eyes.forEach((eye, i) => {
    const pupil = eye.querySelector<HTMLElement>('.pupil')
    if (!pupil) return
    // 奇数眼看左，偶数眼看右，制造"刻意回避"感
    const x = i % 2 === 0 ? -5 : 5
    pupil.style.transition = 'transform 0.3s ease'
    pupil.style.transform = `translate(calc(-50% + ${x}px), calc(-50% + -3px))`
    pupil.style.opacity = '1'
  })
}

// 密码框失焦：恢复跟随鼠标
function onPasswordBlur() {
  eyeMode.value = 'normal'
  if (!characterGroupRef.value) return
  const eyes = characterGroupRef.value.querySelectorAll<HTMLElement>('.eye')
  eyes.forEach(eye => {
    const pupil = eye.querySelector<HTMLElement>('.pupil')
    if (!pupil) return
    pupil.style.transition = 'transform 0.3s ease'
    pupil.style.transform = 'translate(-50%, -50%)'
    pupil.style.opacity = '1'
  })
  setTimeout(() => {
    if (!characterGroupRef.value) return
    const eyes = characterGroupRef.value.querySelectorAll<HTMLElement>('.eye')
    eyes.forEach(eye => {
      const pupil = eye.querySelector<HTMLElement>('.pupil')
      if (pupil) pupil.style.transition = 'transform 0.08s ease-out'
    })
  }, 300)
}

// 偷看：眼珠朝密码框方向偷偷移动（向右下角偷瞄）
function peekAtPassword() {
  if (!characterGroupRef.value) return
  const eyes = characterGroupRef.value.querySelectorAll<HTMLElement>('.eye')
  eyes.forEach((eye, i) => {
    const pupil = eye.querySelector<HTMLElement>('.pupil')
    if (!pupil) return
    // 各小人偷看角度略有不同，增加趣味感
    const offsets = [
      { x: 4, y: 3 },
      { x: 3, y: 4 },
      { x: 5, y: 3 },
      { x: 4, y: 4 },
    ]
    const o = offsets[i % 4]
    pupil.style.transition = 'transform 0.2s ease'
    pupil.style.transform = `translate(calc(-50% + ${o.x}px), calc(-50% + ${o.y}px))`
  })
}

// ── 小人说话（密码输入时）──────────────────────────────────
// speakingIdx: 当前正在说话的小人（-1=无）
// speakChars: 四个小人各自嘴里显示的字符
const speakingIdx = ref(-1)
const speakChars  = ref(['', '', '', ''])
let speakTimer: ReturnType<typeof setTimeout> | null = null

watch(() => form.value.password, (val) => {
  if (speakTimer) clearTimeout(speakTimer)

  if (!val) {
    // 清空密码：回到害羞模式（如果密码框还在聚焦）
    speakingIdx.value = -1
    speakChars.value  = ['', '', '', '']
    if (eyeMode.value !== 'normal') {
      eyeMode.value = 'shy'
      onPasswordFocus()
    }
    return
  }

  // 开始输入：切换到偷看模式
  if (eyeMode.value === 'shy') {
    eyeMode.value = 'peek'
    peekAtPassword()
  }

  // 当前最新输入的字符
  const lastChar = val[val.length - 1]
  const idx = (val.length - 1) % 4
  speakChars.value[idx] = lastChar
  speakingIdx.value = idx

  speakTimer = setTimeout(() => {
    speakingIdx.value = -1
  }, 300)
})

// ── 登录 ────────────────────────────────────────────────────
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

/* ── 左侧 ─────────────────────────────────────────────────── */
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
  max-width: 480px;
  width: 100%;
}

/* 品牌文字 */
.brand-area { margin-bottom: 40px; }
.brand-title {
  font-size: 32px;
  font-weight: 700;
  color: #1a3a6a;
  margin: 0 0 8px;
  letter-spacing: -0.5px;
}
.brand-desc { font-size: 15px; color: #4a7aaa; margin: 0; }

/* ── 小人区域 ─────────────────────────────────────────────── */
.character-group {
  display: flex;
  align-items: flex-end;
  justify-content: center;
  gap: 16px;
  margin-bottom: 36px;
  height: 220px;
}

.character {
  position: relative;
  border-radius: 16px 16px 0 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-start;
  padding-top: 22px;
  transition: transform 0.3s ease;
  box-shadow: 0 8px 24px rgba(0,0,0,0.12);
}
.character:hover { transform: translateY(-6px); }

/* 四种小人 */
.char-purple { width: 100px; height: 200px; background: linear-gradient(160deg, #7c5df5, #5a3de0); }
.char-dark   { width: 78px;  height: 160px; background: linear-gradient(160deg, #3a3a4a, #222230); }
.char-orange { width: 120px; height: 130px; background: linear-gradient(160deg, #ffb07c, #ff7e3a); border-radius: 60px 60px 0 0; }
.char-yellow { width: 90px;  height: 150px; background: linear-gradient(160deg, #f5e060, #e8c820); border-radius: 45px 45px 0 0; }

/* 脸部 */
.face {
  display: flex;
  gap: 10px;
  align-items: center;
  justify-content: center;
}

/* 眼白 */
.eye {
  width: 22px;
  height: 22px;
  background: #fff;
  border-radius: 50%;
  position: relative;
  box-shadow: inset 0 1px 3px rgba(0,0,0,0.1);
  overflow: hidden;
}

/* 瞳孔 */
.pupil {
  width: 10px;
  height: 10px;
  background: #1a1a2e;
  border-radius: 50%;
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  transition: transform 0.08s ease-out, opacity 0.2s;
}
.pupil::after {
  content: '';
  width: 3px;
  height: 3px;
  background: rgba(255,255,255,0.7);
  border-radius: 50%;
  position: absolute;
  top: 2px;
  left: 2px;
}

/* ── 嘴巴 ─────────────────────────────────────────────────── */
.mouth {
  width: 28px;
  height: 6px;
  background: rgba(0,0,0,0.25);
  border-radius: 0 0 14px 14px;
  margin-top: 8px;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: height 0.12s ease, background 0.12s ease;
  position: relative;
}
.mouth.open {
  height: 22px;
  background: rgba(0,0,0,0.55);
  border-radius: 0 0 14px 14px;
}
.mouth-char {
  font-size: 11px;
  font-weight: 700;
  color: #fff;
  opacity: 0;
  transform: scale(0.5);
  transition: opacity 0.1s, transform 0.1s;
  line-height: 1;
  font-family: monospace;
  letter-spacing: 0;
}
.mouth.open .mouth-char {
  opacity: 1;
  transform: scale(1);
}

/* 说话时小人轻微弹动 */
.character.speaking {
  animation: char-bounce 0.25s ease;
}
@keyframes char-bounce {
  0%   { transform: translateY(0); }
  40%  { transform: translateY(-8px); }
  100% { transform: translateY(0); }
}

/* ── 特性列表 ─────────────────────────────────────────────── */
.feature-list {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
}

.feature-item {
  display: flex;
  align-items: center;
  gap: 10px;
  background: rgba(255,255,255,0.55);
  backdrop-filter: blur(8px);
  border: 1px solid rgba(255,255,255,0.8);
  border-radius: 10px;
  padding: 11px 14px;
  font-size: 13px;
  color: #2a5080;
  font-weight: 500;
  transition: background 0.2s, transform 0.2s;
}
.feature-item:hover { background: rgba(255,255,255,0.8); transform: translateY(-2px); }
.feature-icon { font-size: 18px; color: #1a6dd8; flex-shrink: 0; }

/* ── 右侧登录框 ───────────────────────────────────────────── */
.right-panel {
  position: relative;
  z-index: 1;
  width: 460px;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 40px;
}

.login-card {
  width: 100%;
  background: rgba(255,255,255,0.88);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border: 1px solid rgba(200,228,255,0.8);
  border-radius: 24px;
  padding: 44px 40px 36px;
  box-shadow: 0 8px 40px rgba(30,100,200,0.1), 0 2px 8px rgba(30,100,200,0.06);
}

.card-header { margin-bottom: 28px; }
.card-title { font-size: 24px; font-weight: 700; color: #1a2a40; margin: 0 0 5px; letter-spacing: -0.3px; }
.card-sub { font-size: 14px; color: #7aaac8; margin: 0; }

/* 表单 */
.login-form :deep(.ant-form-item) { margin-bottom: 18px; }
.login-form :deep(.ant-form-item-label) { padding-bottom: 6px !important; }
.field-label { font-size: 11px; letter-spacing: 1.5px; color: #6a92b8; font-weight: 600; text-transform: uppercase; }

.form-input :deep(.ant-input-affix-wrapper) {
  background: rgba(255,255,255,0.75) !important;
  border: 1px solid rgba(180,215,248,0.7) !important;
  border-radius: 10px !important;
  height: 46px !important;
  font-size: 14px !important;
  color: #1a2a40 !important;
  transition: all 0.15s !important;
}
.form-input :deep(.ant-input-affix-wrapper:hover) {
  border-color: rgba(80,150,230,0.5) !important;
  background: rgba(255,255,255,0.9) !important;
}
.form-input :deep(.ant-input-affix-wrapper-focused) {
  border-color: #1a6dd8 !important;
  background: #fff !important;
  box-shadow: 0 0 0 3px rgba(26,109,216,0.1) !important;
}
.form-input :deep(.ant-input-affix-wrapper .ant-input) {
  background: transparent !important;
  color: #1a2a40 !important;
}
.form-input :deep(.ant-input::placeholder) { color: #b0cce8 !important; }

/* autofill 覆盖 */
.form-input :deep(input:-webkit-autofill),
.form-input :deep(input:-webkit-autofill:hover),
.form-input :deep(input:-webkit-autofill:focus),
.form-input :deep(input:-webkit-autofill:active) {
  -webkit-text-fill-color: #1a2a40 !important;
  caret-color: #1a2a40 !important;
  -webkit-box-shadow: 0 0 0 1000px rgba(255,255,255,0.75) inset !important;
  box-shadow: 0 0 0 1000px rgba(255,255,255,0.75) inset !important;
  transition: background-color 9999s ease-in-out 0s;
}
.form-input :deep(.ant-input-affix-wrapper-focused input:-webkit-autofill) {
  -webkit-box-shadow: 0 0 0 1000px #ffffff inset !important;
  box-shadow: 0 0 0 1000px #ffffff inset !important;
}

.input-icon { color: #8ab8da; font-size: 15px; }

/* 登录按钮 */
.login-btn {
  height: 48px !important;
  border-radius: 10px !important;
  font-size: 15px !important;
  font-weight: 600 !important;
  letter-spacing: 2px !important;
  background: linear-gradient(135deg, #2a82e8 0%, #1a6dd8 100%) !important;
  border: none !important;
  margin-top: 6px;
  box-shadow: 0 4px 16px rgba(26,109,216,0.3) !important;
  transition: all 0.2s !important;
}
.login-btn:hover {
  background: linear-gradient(135deg, #3a8ef0 0%, #2a7ee8 100%) !important;
  box-shadow: 0 6px 20px rgba(26,109,216,0.4) !important;
  transform: translateY(-1px);
}

.copyright { font-size: 11px; color: #aac8e0; text-align: center; margin: 24px 0 0; }

@media (max-width: 768px) {
  .left-panel { display: none; }
  .right-panel { width: 100%; padding: 24px 20px; }
  .login-card { padding: 36px 28px 28px; }
}
</style>