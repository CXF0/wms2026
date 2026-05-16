<template>
  <div class="rack-page">
    <section class="rack-hero">
      <div>
        <span class="eyebrow">Rack Console</span>
        <h1>货位管理</h1>
        <p>按分区查看货架配货进度、货位状态和待处理量，进入分区后可继续查看货位商品明细。</p>
      </div>

      <div class="hero-actions">
        <a-date-picker
          v-model:value="dateVal"
          :allow-clear="false"
          format="YYYY-MM-DD"
          value-format="YYYY-MM-DD"
          class="date-picker"
          @change="onDateChange"
        />
        <a-button class="refresh-btn" :loading="loadingZones" @click="fetchAll">
          <ReloadOutlined />
          刷新
        </a-button>
      </div>
    </section>

    <section class="overview-grid">
      <div class="overview-card">
        <span class="metric-label">分区数</span>
        <strong>{{ zoneNames.length }}</strong>
        <small>当前日期可用分区</small>
      </div>
      <div class="overview-card">
        <span class="metric-label">货架总数</span>
        <strong>{{ overallStat.totalShelves }}</strong>
        <small>已加载货位</small>
      </div>
      <div class="overview-card accent">
        <span class="metric-label">可配货</span>
        <strong>{{ overallStat.need }}</strong>
        <small>待继续处理</small>
      </div>
      <div class="overview-card success">
        <span class="metric-label">已完成</span>
        <strong>{{ overallStat.prepared }}</strong>
        <small>整体进度 {{ overallProgress }}%</small>
      </div>
    </section>

    <div v-if="quietNotice" class="quiet-notice">
      <span class="notice-dot" />
      <div>
        <strong>当前暂无供应商入场数据</strong>
        <p>系统已合并处理分区请求，不再连续弹出全局提示；可切换日期或稍后刷新。</p>
      </div>
    </div>

    <a-spin :spinning="loadingZones" tip="加载货位数据...">
      <div v-if="!loadingZones && zoneNames.length === 0" class="empty-state">
        <div class="empty-mark">R</div>
        <h2>暂无分区数据</h2>
        <p>当前没有可展示的货位分区，请确认账号权限或基础配置。</p>
      </div>

      <div v-else class="zone-grid">
        <button
          v-for="zone in zoneInfoMap"
          :key="zone.name"
          class="zone-card"
          type="button"
          @click="goToDetail(zone.name)"
        >
          <template v-if="zone.loading">
            <a-skeleton active :paragraph="{ rows: 4 }" />
          </template>

          <template v-else>
            <div class="zone-card-head">
              <div class="zone-title-wrap">
                <div class="zone-icon">
                  <AppstoreOutlined />
                </div>
                <div>
                  <strong class="zone-name">{{ zone.name }}</strong>
                  <span class="zone-sub">{{ zone.shelfSnList.length }} 个货架</span>
                </div>
              </div>

              <div class="progress-ring" :style="{ '--pct': zone.progressPct }">
                <span>{{ zone.progressPct }}%</span>
              </div>
            </div>

            <div class="zone-stats">
              <div>
                <strong>{{ zone.need }}</strong>
                <span>可配货</span>
              </div>
              <div>
                <strong>{{ zone.prepared }}</strong>
                <span>已完成</span>
              </div>
              <div>
                <strong>{{ zone.need + zone.prepared }}</strong>
                <span>总计</span>
              </div>
            </div>

            <div v-if="zone.shelfSnList.length" class="shelf-map">
              <a-tooltip
                v-for="shelf in zone.shelfSnList.slice(0, 28)"
                :key="shelf.zoneShelf + shelf.shelfSn"
                :title="`${shelf.zoneShelf} #${shelf.shelfSn} ${shelf.prepared}/${shelf.total}`"
                placement="top"
              >
                <span
                  class="shelf-dot"
                  :class="shelf.status === 1 ? 'is-done' : 'is-picking'"
                  :style="{ '--fill': Math.min(Math.round((shelf.progress ?? 0) * 100), 100) }"
                />
              </a-tooltip>
              <span v-if="zone.shelfSnList.length > 28" class="dots-more">+{{ zone.shelfSnList.length - 28 }}</span>
            </div>

            <div v-else class="zone-empty-line">
              {{ zone.noData ? '暂无入场货位数据' : '暂无货架数据' }}
            </div>

            <div class="zone-foot">
              <span>{{ zone.noData ? '查看分区配置' : '查看货位详情' }}</span>
              <RightOutlined />
            </div>
          </template>
        </button>
      </div>
    </a-spin>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, reactive } from 'vue'
import { useRouter } from 'vue-router'
import dayjs from 'dayjs'
import { AppstoreOutlined, ReloadOutlined, RightOutlined } from '@ant-design/icons-vue'
import { wmsZoneApi, type ShelfSnStatus } from '@/api/wmsZone'

const router = useRouter()
const dateVal = ref<string>(dayjs().format('YYYY-MM-DD'))
const loadingZones = ref(false)
const zoneNames = ref<string[]>([])
const quietNotice = ref(false)
let requestSeq = 0

interface ZoneCardData {
  name: string
  loading: boolean
  need: number
  prepared: number
  progressPct: number
  shelfSnList: ShelfSnStatus[]
  noData?: boolean
}

const zoneInfoMap = reactive<ZoneCardData[]>([])

async function fetchZoneNames() {
  zoneNames.value = await wmsZoneApi.getZoneList()
}

async function fetchZoneInfoAll(seq: number) {
  quietNotice.value = false
  zoneInfoMap.splice(
    0,
    zoneInfoMap.length,
    ...zoneNames.value.map((name) => ({
      name,
      loading: true,
      need: 0,
      prepared: 0,
      progressPct: 0,
      shelfSnList: [],
      noData: false,
    })),
  )

  const results = await Promise.allSettled(
    zoneNames.value.map(async (name, idx) => {
      const info = await wmsZoneApi.getZoneInfo(
        {
          zone: name,
          zoneShelf: '',
          type: -1,
          date: dateVal.value,
        },
        { silent: true },
      )
      if (seq !== requestSeq) return
      const total = (info.need ?? 0) + (info.prepared ?? 0)
      Object.assign(zoneInfoMap[idx], {
        loading: false,
        need: info.need ?? 0,
        prepared: info.prepared ?? 0,
        progressPct: total > 0 ? Math.round((info.prepared / total) * 100) : 0,
        shelfSnList: info.shelfSnList ?? [],
      })
    }),
  )

  if (seq !== requestSeq) return

  let rejected = 0
  results.forEach((result, idx) => {
    if (result.status === 'rejected') {
      rejected += 1
      Object.assign(zoneInfoMap[idx], {
        loading: false,
        need: 0,
        prepared: 0,
        progressPct: 0,
        shelfSnList: [],
        noData: true,
      })
    }
  })
  quietNotice.value = rejected > 0 && rejected === results.length && zoneNames.value.length > 0
}

async function fetchAll() {
  if (loadingZones.value) return
  const seq = ++requestSeq
  loadingZones.value = true
  try {
    await fetchZoneNames()
    if (seq !== requestSeq) return
    if (zoneNames.value.length > 0) await fetchZoneInfoAll(seq)
    else zoneInfoMap.splice(0, zoneInfoMap.length)
  } finally {
    if (seq === requestSeq) loadingZones.value = false
  }
}

function onDateChange() {
  fetchAll()
}

const overallStat = computed(() => ({
  totalShelves: zoneInfoMap.reduce((sum, zone) => sum + zone.shelfSnList.length, 0),
  need: zoneInfoMap.reduce((sum, zone) => sum + zone.need, 0),
  prepared: zoneInfoMap.reduce((sum, zone) => sum + zone.prepared, 0),
}))

const overallProgress = computed(() => {
  const total = overallStat.value.need + overallStat.value.prepared
  return total > 0 ? Math.round((overallStat.value.prepared / total) * 100) : 0
})

function goToDetail(zone: string) {
  router.push({ name: 'ZoneDetail', query: { zone, date: dateVal.value } })
}

onMounted(fetchAll)
</script>

<style scoped>
.rack-page {
  min-height: 100%;
}

.rack-hero {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 20px;
  padding: 24px;
  margin-bottom: 16px;
  border: 1px solid rgba(232, 224, 212, 0.78);
  border-radius: 30px;
  background:
    radial-gradient(circle at 84% 18%, rgba(255, 159, 28, 0.24), transparent 28%),
    radial-gradient(circle at 10% 18%, rgba(0, 143, 90, 0.16), transparent 28%),
    rgba(255, 253, 248, 0.9);
  box-shadow: var(--wms-shadow-sm);
}

.eyebrow {
  display: inline-flex;
  align-items: center;
  height: 24px;
  padding: 0 10px;
  border-radius: 999px;
  background: var(--wms-primary-soft);
  color: var(--wms-primary-strong);
  font-size: 11px;
  font-weight: 850;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.rack-hero h1 {
  margin: 12px 0 0;
  color: var(--wms-text);
  font-size: 32px;
  font-weight: 850;
  letter-spacing: 0;
}

.rack-hero p {
  max-width: 600px;
  margin: 8px 0 0;
  color: var(--wms-text-muted);
  line-height: 1.7;
}

.hero-actions {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-shrink: 0;
}

.date-picker {
  width: 144px;
}

.refresh-btn {
  height: 36px;
  font-weight: 700;
}

.overview-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 14px;
  margin-bottom: 16px;
}

.overview-card {
  min-height: 112px;
  padding: 18px;
  border: 1px solid rgba(232, 224, 212, 0.82);
  border-radius: 24px;
  background: rgba(255, 253, 248, 0.9);
  box-shadow: var(--wms-shadow-sm);
}

.overview-card.accent {
  background:
    radial-gradient(circle at 88% 12%, rgba(255, 159, 28, 0.26), transparent 30%),
    rgba(255, 253, 248, 0.92);
}

.overview-card.success {
  background:
    radial-gradient(circle at 88% 12%, rgba(0, 143, 90, 0.18), transparent 30%),
    rgba(255, 253, 248, 0.92);
}

.metric-label,
.overview-card small {
  display: block;
  color: var(--wms-text-muted);
  font-size: 12px;
}

.overview-card strong {
  display: block;
  margin: 8px 0 3px;
  color: var(--wms-text);
  font-size: 32px;
  font-weight: 850;
  line-height: 1;
}

.quiet-notice {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 14px 16px;
  margin-bottom: 16px;
  border: 1px solid rgba(255, 159, 28, 0.28);
  border-radius: 20px;
  background: rgba(255, 241, 220, 0.72);
}

.notice-dot {
  width: 10px;
  height: 10px;
  flex-shrink: 0;
  margin-top: 5px;
  border-radius: 999px;
  background: var(--wms-accent);
  box-shadow: 0 0 0 5px rgba(255, 159, 28, 0.16);
}

.quiet-notice strong {
  display: block;
  color: var(--wms-text);
  font-size: 14px;
}

.quiet-notice p {
  margin: 3px 0 0;
  color: #8b6b3d;
  font-size: 12.5px;
}

.empty-state {
  min-height: 380px;
  display: grid;
  place-items: center;
  align-content: center;
  padding: 42px;
  border: 1px dashed rgba(0, 143, 90, 0.22);
  border-radius: 30px;
  background: rgba(255, 253, 248, 0.74);
  text-align: center;
}

.empty-mark {
  width: 68px;
  height: 68px;
  display: grid;
  place-items: center;
  margin-bottom: 16px;
  border-radius: 24px;
  background: var(--wms-primary);
  color: #fff;
  font-size: 28px;
  font-weight: 850;
  box-shadow: var(--wms-shadow-glow);
}

.empty-state h2 {
  margin: 0;
  color: var(--wms-text);
  font-size: 24px;
  font-weight: 850;
}

.empty-state p {
  margin: 8px 0 0;
  color: var(--wms-text-muted);
}

.zone-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(286px, 1fr));
  gap: 16px;
}

.zone-card {
  min-height: 254px;
  display: flex;
  flex-direction: column;
  gap: 15px;
  padding: 18px;
  border: 1px solid rgba(232, 224, 212, 0.82);
  border-radius: 28px;
  background:
    radial-gradient(circle at 90% 10%, rgba(255, 159, 28, 0.14), transparent 28%),
    rgba(255, 253, 248, 0.9);
  box-shadow: var(--wms-shadow-sm);
  color: inherit;
  cursor: pointer;
  text-align: left;
  transition:
    border-color 0.18s ease,
    box-shadow 0.18s ease,
    transform 0.18s ease;
}

.zone-card:hover {
  border-color: rgba(0, 143, 90, 0.28);
  box-shadow: var(--wms-shadow-md);
  transform: translateY(-3px);
}

.zone-card-head,
.zone-title-wrap,
.zone-foot {
  display: flex;
  align-items: center;
}

.zone-card-head {
  justify-content: space-between;
  gap: 14px;
}

.zone-title-wrap {
  min-width: 0;
  gap: 11px;
}

.zone-icon {
  width: 42px;
  height: 42px;
  display: grid;
  place-items: center;
  flex-shrink: 0;
  border-radius: 16px;
  background: linear-gradient(135deg, var(--wms-primary), var(--wms-primary-strong));
  color: #fff;
  box-shadow: 0 14px 26px rgba(0, 143, 90, 0.2);
}

.zone-name,
.zone-sub {
  display: block;
}

.zone-name {
  color: var(--wms-text);
  font-size: 18px;
  font-weight: 850;
}

.zone-sub {
  margin-top: 2px;
  color: var(--wms-text-muted);
  font-size: 12px;
}

.progress-ring {
  --pct: 0;
  width: 58px;
  height: 58px;
  display: grid;
  place-items: center;
  flex-shrink: 0;
  border-radius: 999px;
  background:
    radial-gradient(circle closest-side, #fffdf8 72%, transparent 73%),
    conic-gradient(var(--wms-primary) calc(var(--pct) * 1%), #efe7da 0);
}

.progress-ring span {
  color: var(--wms-text);
  font-size: 12px;
  font-weight: 850;
}

.zone-stats {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 8px;
}

.zone-stats div {
  padding: 12px 10px;
  border: 1px solid rgba(232, 224, 212, 0.72);
  border-radius: 18px;
  background: rgba(255, 255, 255, 0.56);
  text-align: center;
}

.zone-stats strong,
.zone-stats span {
  display: block;
}

.zone-stats strong {
  color: var(--wms-text);
  font-size: 21px;
  font-weight: 850;
}

.zone-stats span {
  margin-top: 3px;
  color: var(--wms-text-muted);
  font-size: 11px;
}

.shelf-map {
  display: grid;
  grid-template-columns: repeat(14, 1fr);
  gap: 6px;
  align-items: center;
  min-height: 34px;
}

.shelf-dot {
  --fill: 0;
  aspect-ratio: 1;
  min-width: 9px;
  border-radius: 7px;
  background:
    linear-gradient(180deg, rgba(255, 255, 255, 0.42), transparent),
    var(--wms-accent-wash);
  transition: transform 0.15s ease;
}

.shelf-dot.is-done {
  background:
    linear-gradient(180deg, rgba(255, 255, 255, 0.34), transparent),
    var(--wms-primary);
}

.shelf-dot:hover {
  transform: scale(1.35);
}

.dots-more {
  color: var(--wms-text-muted);
  font-size: 11px;
}

.zone-empty-line {
  display: flex;
  align-items: center;
  min-height: 34px;
  padding: 0 12px;
  border-radius: 14px;
  background: rgba(255, 241, 220, 0.72);
  color: #8b6b3d;
  font-size: 12px;
}

.zone-foot {
  justify-content: flex-end;
  gap: 6px;
  margin-top: auto;
  padding-top: 12px;
  border-top: 1px solid rgba(232, 224, 212, 0.68);
  color: var(--wms-text-muted);
  font-size: 12.5px;
  font-weight: 700;
}

.zone-card:hover .zone-foot {
  color: var(--wms-primary-strong);
}
</style>
