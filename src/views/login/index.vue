<template>
  <div class="login-page">
    <div class="bg-scene" aria-hidden="true">
      <svg viewBox="0 0 1440 900" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg">

        <!-- 地面（水泥地，明亮灰白） -->
        <rect width="1440" height="900" fill="#dcdad4"/>
        <rect x="0" y="720" width="1440" height="180" fill="#d0cec6"/>
        <!-- 地面反光 -->
        <ellipse cx="380" cy="790" rx="420" ry="60" fill="#e8e6e0" opacity="0.7"/>
        <ellipse cx="900" cy="790" rx="380" ry="52" fill="#e8e6e0" opacity="0.55"/>
        <!-- 地面纹理线 -->
        <line x1="140" y1="720" x2="192" y2="900" stroke="#c4c2ba" stroke-width="1.2" opacity="0.5"/>
        <line x1="460" y1="720" x2="494" y2="900" stroke="#c4c2ba" stroke-width="0.8" opacity="0.4"/>
        <line x1="780" y1="720" x2="800" y2="900" stroke="#c4c2ba" stroke-width="0.8" opacity="0.35"/>

        <!-- 拱形棚顶（白天，钢结构透光感）-->
        <path d="M-40 660 Q360 -90 720 -90 Q1080 -90 1480 660" fill="#c8c4bc"/>
        <path d="M-40 660 Q360 -90 720 -90 Q1080 -90 1480 660" fill="none" stroke="#a8a49c" stroke-width="3.5"/>
        <path d="M20 610 Q368 -45 720 -45 Q1072 -45 1420 610" fill="none" stroke="#b0aca4" stroke-width="2" opacity="0.65"/>
        <path d="M85 555 Q378 20 720 20 Q1062 20 1355 555" fill="none" stroke="#b8b4ac" stroke-width="1.4" opacity="0.5"/>
        <path d="M155 495 Q390 80 720 80 Q1050 80 1285 495" fill="none" stroke="#bfbcb4" stroke-width="1" opacity="0.38"/>
        <path d="M225 430 Q405 138 720 138 Q1035 138 1215 430" fill="none" stroke="#c4c0b8" stroke-width="0.8" opacity="0.28"/>
        <!-- 棚顶横向钢管 -->
        <line x1="240" y1="62"  x2="1200" y2="62"  stroke="#b0aca4" stroke-width="1"   opacity="0.5"/>
        <line x1="145" y1="145" x2="1295" y2="145" stroke="#b4b0a8" stroke-width="0.9" opacity="0.4"/>
        <line x1="72"  y1="248" x2="1368" y2="248" stroke="#b8b4ac" stroke-width="0.7" opacity="0.3"/>
        <line x1="25"  y1="368" x2="1415" y2="368" stroke="#bcb8b0" stroke-width="0.6" opacity="0.22"/>

        <!-- 自然光从棚顶漫射（模拟透光钢棚） -->
        <ellipse cx="720" cy="0" rx="600" ry="280" fill="#f8f6f0" opacity="0.35"/>
        <ellipse cx="720" cy="0" rx="380" ry="160" fill="#fff8ec" opacity="0.25"/>

        <!-- 吊灯1（白天灯不亮，仅显示灯具轮廓） -->
        <line x1="370" y1="0" x2="370" y2="128" stroke="#a8a49c" stroke-width="2"/>
        <ellipse cx="370" cy="136" rx="22" ry="8" fill="#b8b4ac"/>
        <ellipse cx="370" cy="130" rx="16" ry="6" fill="#c4c0b8"/>
        <rect x="358" y="128" width="24" height="5" rx="1" fill="#ccc8c0" opacity="0.8"/>

        <!-- 吊灯2 -->
        <line x1="840" y1="0" x2="840" y2="112" stroke="#a8a49c" stroke-width="2"/>
        <ellipse cx="840" cy="120" rx="22" ry="8" fill="#b8b4ac"/>
        <ellipse cx="840" cy="114" rx="16" ry="6" fill="#c4c0b8"/>
        <rect x="828" y="112" width="24" height="5" rx="1" fill="#ccc8c0" opacity="0.8"/>

        <!-- ─── 左货架（上下两层，白天明亮）─── -->
        <rect x="-20" y="268" width="660" height="462" fill="#b8b4ac" opacity="0.55"/>

        <!-- 竖线 -->
        <g stroke="#909088" stroke-width="1" opacity="0.75">
          <line x1="30"  y1="268" x2="30"  y2="730"/>
          <line x1="88"  y1="268" x2="88"  y2="730"/>
          <line x1="146" y1="268" x2="146" y2="730"/>
          <line x1="204" y1="268" x2="204" y2="730"/>
          <line x1="262" y1="268" x2="262" y2="730"/>
          <line x1="320" y1="268" x2="320" y2="730"/>
          <line x1="378" y1="268" x2="378" y2="730"/>
          <line x1="436" y1="268" x2="436" y2="730"/>
          <line x1="494" y1="268" x2="494" y2="730"/>
          <line x1="552" y1="268" x2="552" y2="730"/>
        </g>

        <!-- 横线上层 -->
        <g stroke="#909088" stroke-width="1" opacity="0.75">
          <line x1="-20" y1="318" x2="640" y2="318"/>
          <line x1="-20" y1="368" x2="640" y2="368"/>
          <line x1="-20" y1="418" x2="640" y2="418"/>
          <line x1="-20" y1="468" x2="640" y2="468"/>
          <line x1="-20" y1="510" x2="640" y2="510"/>
        </g>
        <!-- 横线下层 -->
        <g stroke="#909088" stroke-width="1" opacity="0.75">
          <line x1="-20" y1="572" x2="640" y2="572"/>
          <line x1="-20" y1="614" x2="640" y2="614"/>
          <line x1="-20" y1="656" x2="640" y2="656"/>
          <line x1="-20" y1="698" x2="640" y2="698"/>
        </g>

        <!-- 中间主梁 -->
        <rect x="-24" y="524" width="662" height="14" rx="3" fill="#989490"/>
        <rect x="-24" y="526" width="662" height="5"  fill="#b0aca4" opacity="0.5"/>
        <!-- 顶底梁 -->
        <rect x="-24" y="266" width="662" height="10" rx="3" fill="#989490"/>
        <rect x="-24" y="728" width="662" height="10" rx="3" fill="#989490"/>
        <!-- 立柱（均匀4根） -->
        <rect x="-8"  y="262" width="10" height="480" rx="3" fill="#a8a49c"/>
        <rect x="-6"  y="262" width="4"  height="480" fill="#d0ccc4" opacity="0.4"/>
        <rect x="204" y="262" width="9"  height="480" rx="3" fill="#a0a098"/>
        <rect x="416" y="262" width="9"  height="480" rx="3" fill="#a0a098"/>
        <rect x="630" y="262" width="9"  height="480" rx="3" fill="#a8a49c"/>

        <!-- 编号牌：全红黄字 -->
        <rect x="4"   y="266" width="84" height="48" rx="3" fill="#cc1e1e"/>
        <text x="46"  y="296" text-anchor="middle" fill="#ffd040" font-size="11" font-family="monospace" font-weight="700">03-001</text>
        <rect x="210" y="266" width="84" height="48" rx="3" fill="#cc1e1e"/>
        <text x="252" y="296" text-anchor="middle" fill="#ffd040" font-size="11" font-family="monospace" font-weight="700">03-016</text>
        <rect x="4"   y="528" width="84" height="48" rx="3" fill="#cc1e1e"/>
        <text x="46"  y="558" text-anchor="middle" fill="#ffd040" font-size="11" font-family="monospace" font-weight="700">03-031</text>
        <rect x="210" y="528" width="84" height="48" rx="3" fill="#cc1e1e"/>
        <text x="252" y="558" text-anchor="middle" fill="#ffd040" font-size="11" font-family="monospace" font-weight="700">03-046</text>

        <!-- 纸箱（左货架，白天色更饱和） -->
        <rect x="6"   y="174" width="88"  height="94" rx="2" fill="#d4aa40"/>
        <polygon points="6,174   94,174  106,152  -6,152"  fill="#e8c050"/>
        <polygon points="94,174 106,152 106,256  94,268"  fill="#a88828"/>

        <rect x="102" y="182" width="92"  height="84" rx="2" fill="#d0a63c"/>
        <polygon points="102,182  194,182  207,160   89,160" fill="#e4bc48"/>
        <polygon points="194,182  207,160  207,244  194,266" fill="#a48420"/>

        <rect x="208" y="174" width="86"  height="92" rx="2" fill="#d6aa3e"/>
        <polygon points="208,174  294,174  306,154  196,154" fill="#e8be4a"/>
        <polygon points="294,174  306,154  306,244  294,266" fill="#a88828"/>

        <rect x="298" y="182" width="88"  height="84" rx="2" fill="#d2a43a"/>
        <polygon points="298,182  386,182  398,161  286,161" fill="#e6ba46"/>
        <polygon points="386,182  398,161  398,244  386,266" fill="#a48020"/>

        <rect x="390" y="178" width="82"  height="88" rx="2" fill="#d4a83e"/>
        <polygon points="390,178  472,178  483,157  379,157" fill="#e8bc4a"/>
        <polygon points="472,178  483,157  483,244  472,266" fill="#a68622"/>

        <rect x="476" y="186" width="78"  height="80" rx="2" fill="#cca238"/>
        <polygon points="476,186  554,186  564,167  466,167" fill="#e0b844"/>
        <polygon points="554,186  564,167  564,244  554,266" fill="#a07e1c"/>

        <!-- ─── 右货架 ─── -->
        <rect x="740" y="268" width="660" height="462" fill="#b8b4ac" opacity="0.5"/>
        <g stroke="#909088" stroke-width="1" opacity="0.72">
          <line x1="780"  y1="268" x2="780"  y2="730"/>
          <line x1="838"  y1="268" x2="838"  y2="730"/>
          <line x1="896"  y1="268" x2="896"  y2="730"/>
          <line x1="954"  y1="268" x2="954"  y2="730"/>
          <line x1="1012" y1="268" x2="1012" y2="730"/>
          <line x1="1070" y1="268" x2="1070" y2="730"/>
          <line x1="1128" y1="268" x2="1128" y2="730"/>
          <line x1="1186" y1="268" x2="1186" y2="730"/>
          <line x1="1244" y1="268" x2="1244" y2="730"/>
          <line x1="1302" y1="268" x2="1302" y2="730"/>
          <line x1="1360" y1="268" x2="1360" y2="730"/>
        </g>
        <g stroke="#909088" stroke-width="1" opacity="0.72">
          <line x1="740" y1="318" x2="1400" y2="318"/>
          <line x1="740" y1="368" x2="1400" y2="368"/>
          <line x1="740" y1="418" x2="1400" y2="418"/>
          <line x1="740" y1="468" x2="1400" y2="468"/>
          <line x1="740" y1="510" x2="1400" y2="510"/>
        </g>
        <g stroke="#909088" stroke-width="1" opacity="0.72">
          <line x1="740" y1="572" x2="1400" y2="572"/>
          <line x1="740" y1="614" x2="1400" y2="614"/>
          <line x1="740" y1="656" x2="1400" y2="656"/>
          <line x1="740" y1="698" x2="1400" y2="698"/>
        </g>
        <rect x="736" y="524" width="662" height="14" rx="3" fill="#989490"/>
        <rect x="736" y="526" width="662" height="5"  fill="#b0aca4" opacity="0.5"/>
        <rect x="736" y="266" width="662" height="10" rx="3" fill="#989490"/>
        <rect x="736" y="728" width="662" height="10" rx="3" fill="#989490"/>
        <rect x="740"  y="262" width="9" height="480" rx="3" fill="#a8a49c"/>
        <rect x="950"  y="262" width="9" height="480" rx="3" fill="#a0a098"/>
        <rect x="1160" y="262" width="9" height="480" rx="3" fill="#a0a098"/>
        <rect x="1370" y="262" width="9" height="480" rx="3" fill="#a8a49c"/>

        <!-- 右货架编号牌 -->
        <rect x="752"  y="266" width="84" height="48" rx="3" fill="#cc1e1e"/>
        <text x="794"  y="296" text-anchor="middle" fill="#ffd040" font-size="11" font-family="monospace" font-weight="700">03-061</text>
        <rect x="962"  y="266" width="84" height="48" rx="3" fill="#cc1e1e"/>
        <text x="1004" y="296" text-anchor="middle" fill="#ffd040" font-size="11" font-family="monospace" font-weight="700">03-076</text>
        <rect x="752"  y="528" width="84" height="48" rx="3" fill="#cc1e1e"/>
        <text x="794"  y="558" text-anchor="middle" fill="#ffd040" font-size="11" font-family="monospace" font-weight="700">03-091</text>
        <rect x="962"  y="528" width="84" height="48" rx="3" fill="#cc1e1e"/>
        <text x="1004" y="558" text-anchor="middle" fill="#ffd040" font-size="11" font-family="monospace" font-weight="700">03-096</text>

        <!-- 右货架纸箱 -->
        <rect x="752"  y="174" width="86" height="92" rx="2" fill="#d4aa40" opacity="0.9"/>
        <polygon points="752,174  838,174  850,152  740,152" fill="#e8c050" opacity="0.9"/>
        <polygon points="838,174  850,152  850,254  838,266" fill="#a88828" opacity="0.9"/>

        <rect x="854"  y="182" width="90" height="84" rx="2" fill="#d0a63c" opacity="0.84"/>
        <polygon points="854,182  944,182  956,160  842,160" fill="#e4bc48" opacity="0.84"/>
        <polygon points="944,182  956,160  956,244  944,266" fill="#a48420" opacity="0.84"/>

        <rect x="958"  y="176" width="86" height="90" rx="2" fill="#d6aa3e" opacity="0.78"/>
        <polygon points="958,176  1044,176  1056,154  946,154" fill="#e8be4a" opacity="0.78"/>
        <polygon points="1044,176 1056,154 1056,244 1044,266" fill="#a88828" opacity="0.78"/>

        <rect x="1062" y="182" width="84" height="84" rx="2" fill="#d2a43a" opacity="0.72"/>
        <polygon points="1062,182 1146,182 1157,161 1051,161" fill="#e6ba46" opacity="0.72"/>
        <polygon points="1146,182 1157,161 1157,244 1146,266" fill="#a48020" opacity="0.72"/>

        <rect x="1162" y="178" width="82" height="88" rx="2" fill="#d4a83e" opacity="0.65"/>
        <polygon points="1162,178 1244,178 1254,157 1152,157" fill="#e8bc4a" opacity="0.65"/>
        <polygon points="1244,178 1254,157 1254,244 1244,266" fill="#a68622" opacity="0.65"/>

        <!-- ─── 灯箱牌（白天更清晰）─── -->
        <line x1="720" y1="62"  x2="720" y2="112" stroke="#909088" stroke-width="2.5"/>
        <line x1="666" y1="112" x2="778" y2="112" stroke="#909088" stroke-width="2"/>
        <polygon points="778,112 786,117 786,192 778,186" fill="#d8d6d0"/>
        <rect x="666" y="186" width="112" height="7"  rx="1" fill="#d0cec8"/>
        <rect x="666" y="112" width="112" height="74" rx="3" fill="#ffffff"/>
        <rect x="666" y="112" width="112" height="74" rx="3" fill="none" stroke="#d4d2cc" stroke-width="1.2"/>
        <rect x="670" y="116" width="104" height="66" rx="2" fill="#fafafa"/>
        <text x="722" y="152" text-anchor="middle" fill="#cc1e1e"
              font-size="22" font-family="'PingFang SC','Microsoft YaHei',sans-serif" font-weight="700">三区</text>
        <text x="722" y="174" text-anchor="middle" fill="#cc1e1e"
              font-size="17" font-family="monospace" font-weight="700">45-96</text>

        <!-- ─── 黄色平板车（白天更鲜艳）─── -->
        <!-- 地面阴影 -->
        <ellipse cx="660" cy="822" rx="80" ry="10" fill="#c4c0b8" opacity="0.6"/>
        <!-- 把手竖管 -->
        <rect x="618" y="520" width="10" height="262" rx="4" fill="#d4a808"/>
        <!-- 把手顶横管 -->
        <rect x="614" y="516" width="18" height="10" rx="4" fill="#e8bc10"/>
        <!-- 台面 -->
        <rect x="618" y="782" width="190" height="14" rx="3" fill="#f0c010"/>
        <!-- 台面底面厚度 -->
        <rect x="618" y="794" width="190" height="8"  rx="2" fill="#c89008"/>
        <!-- 正面两个轮子 -->
        <circle cx="644" cy="808" r="12" fill="#3a3830"/>
        <circle cx="644" cy="808" r="8"  fill="#4e4c48"/>
        <circle cx="644" cy="808" r="3"  fill="#686460"/>
        <circle cx="782" cy="808" r="12" fill="#3a3830"/>
        <circle cx="782" cy="808" r="8"  fill="#4e4c48"/>
        <circle cx="782" cy="808" r="3"  fill="#686460"/>
        <!-- 另一侧轮子漏出 -->
        <circle cx="648" cy="812" r="8"  fill="#302e2c" opacity="0.35"/>
        <circle cx="778" cy="812" r="8"  fill="#302e2c" opacity="0.35"/>

        <!-- 渐变遮罩（右侧过渡到白色登录框） -->
        <defs>
          <linearGradient id="gr" x1="0" y1="0" x2="1" y2="0">
            <stop offset="48%" stop-color="#dcdad4" stop-opacity="0"/>
            <stop offset="76%" stop-color="#dcdad4" stop-opacity="0.85"/>
            <stop offset="100%" stop-color="#dcdad4" stop-opacity="1"/>
          </linearGradient>
          <linearGradient id="gb" x1="0" y1="0" x2="0" y2="1">
            <stop offset="70%" stop-color="#dcdad4" stop-opacity="0"/>
            <stop offset="100%" stop-color="#c8c6be" stop-opacity="0.7"/>
          </linearGradient>
          <linearGradient id="gl" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%"  stop-color="#d4d2ca" stop-opacity="0.38"/>
            <stop offset="10%" stop-color="#d4d2ca" stop-opacity="0"/>
          </linearGradient>
        </defs>
        <rect width="1440" height="900" fill="url(#gr)"/>
        <rect width="1440" height="900" fill="url(#gb)"/>
        <rect width="1440" height="900" fill="url(#gl)"/>
      </svg>
    </div>

    <!-- 登录面板 -->
    <aside class="login-panel">
      <div class="panel-inner">
        <div class="brand">
          <div class="brand-accent"/>
          <div>
            <h1 class="brand-name">寻梦鲜花分拣发货管理平台</h1>
            <p class="brand-sub">WAREHOUSE MANAGEMENT</p>
          </div>
        </div>

        <a-form
          ref="formRef"
          :model="form"
          :rules="rules"
          layout="vertical"
          @finish="handleLogin"
        >
          <a-form-item name="userName">
            <template #label><span class="field-lbl">账 号</span></template>
            <a-input
              v-model:value="form.userName"
              size="large"
              placeholder="请输入账号"
              autocomplete="username"
              class="wms-input"
            />
          </a-form-item>
          <a-form-item name="password">
            <template #label><span class="field-lbl">密 码</span></template>
            <a-input-password
              v-model:value="form.password"
              size="large"
              placeholder="请输入密码"
              autocomplete="current-password"
              class="wms-input"
            />
          </a-form-item>
          <a-button
            type="primary"
            html-type="submit"
            size="large"
            block
            :loading="loading"
            class="btn-enter"
          >
            {{ loading ? '登录中...' : '进 入 系 统' }}
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

const router    = useRouter()
const route     = useRoute()
const userStore = useUserStore()

const currentYear = new Date().getFullYear()
const loading     = ref(false)
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
  width: 100%;
  min-height: 100vh;
  display: flex;
  align-items: stretch;
  overflow: hidden;
  background: #dcdad4;
}
.bg-scene {
  position: absolute;
  inset: 0;
  pointer-events: none;
}
.bg-scene svg {
  width: 100%;
  height: 100%;
  display: block;
}

/* 登录面板 */
.login-panel {
  position: relative;
  z-index: 20;
  margin-left: auto;
  width: 440px;
  flex-shrink: 0;
  min-height: 100vh;
  display: flex;
  align-items: center;
  background: #ffffff;
  border-left: 1px solid #e8e4de;
  box-shadow: -8px 0 32px rgba(0,0,0,0.06);
}
.panel-inner { width: 100%; padding: 72px 56px; }

/* 品牌 */
.brand { display: flex; align-items: center; gap: 16px; margin-bottom: 52px; }
.brand-accent {
  width: 3px; height: 36px; background: #1a1a1a;
  border-radius: 2px; flex-shrink: 0;
}
.brand-name {
  font-size: 18px; font-weight: 600; color: #1a1a1a;
  margin: 0 0 5px; letter-spacing: -0.3px;
}
.brand-sub { font-size: 10px; color: #b0aba4; margin: 0; letter-spacing: 2px; font-weight: 500; }

/* 表单 */
:deep(.ant-form-item) { margin-bottom: 24px; }
:deep(.ant-form-item-label) { padding-bottom: 8px !important; }
.field-lbl { font-size: 10px; letter-spacing: 1.8px; color: #a8a49e; font-weight: 500; text-transform: uppercase; }

/* Input */
.wms-input :deep(.ant-input-affix-wrapper),
.wms-input :deep(.ant-input) {
  border-radius: 4px !important;
  border-color: #e8e4de !important;
  background: #fafaf8 !important;
  font-size: 14px !important;
  color: #1a1a1a !important;
  height: 48px !important;
  transition: border-color 0.15s, background 0.15s !important;
}
.wms-input :deep(.ant-input-affix-wrapper:hover),
.wms-input :deep(.ant-input-affix-wrapper-focused) {
  border-color: #1a1a1a !important;
  background: #ffffff !important;
}
.wms-input :deep(.ant-input-affix-wrapper .ant-input) {
  height: auto !important; background: transparent !important;
}
.wms-input :deep(.ant-input::placeholder) { color: #ccc8c0 !important; }

/* 按钮 */
.btn-enter {
  height: 48px !important;
  background: #1a1a1a !important;
  border-color: #1a1a1a !important;
  border-radius: 4px !important;
  font-size: 12px !important;
  font-weight: 500 !important;
  letter-spacing: 3px !important;
  margin-top: 8px;
  transition: background 0.15s !important;
}
.btn-enter:hover { background: #333 !important; border-color: #333 !important; }

.copyright { font-size: 11px; color: #c8c4bc; text-align: center; margin: 52px 0 0; letter-spacing: 0.3px; }

@media (max-width: 768px) {
  .login-panel { width: 100%; margin-left: 0; }
  .panel-inner { padding: 48px 32px; }
}
</style>