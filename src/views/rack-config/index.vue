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
import { computed, onMounted, reactive, ref } from 'vue'
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
  padding: 40px 0 34px;
  margin-bottom: 18px;
  border-bottom: 1px solid var(--wms-line);
  background:
    linear-gradient(rgba(16, 185, 129, 0.08) 1px, transparent 1px),
    linear-gradient(90deg, rgba(16, 185, 129, 0.08) 1px, transparent 1px);
  background-size: 96px 96px;
}

.eyebrow {
  color: var(--wms-primary-strong);
  font-size: 13px;
  font-weight: 800;
}

.rack-hero h1 {
  margin: 14px 0 0;
  color: var(--wms-text);
  font-size: 40px;
  font-weight: 850;
  letter-spacing: 0;
}

.rack-hero p {
  max-width: 680px;
  margin: 12px 0 0;
  color: var(--wms-text-muted);
  font-size: 17px;
  line-height: 1.8;
}

.hero-actions {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-shrink: 0;
}

.date-picker {
  width: 148px;
}

.refresh-btn {
  height: 36px;
  border-radius: 999px;
  font-weight: 750;
}

.overview-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 14px;
  margin-bottom: 18px;
}

.overview-card {
  min-height: 112px;
  padding: 18px;
  border: 1px solid var(--wms-line);
  border-radius: 16px;
  background: #fff;
  box-shadow: var(--wms-shadow-xs);
}

.overview-card.accent {
  background: linear-gradient(135deg, rgba(24, 24, 27, 0.08), #fff 58%);
}

.overview-card.success {
  background: linear-gradient(135deg, rgba(16, 185, 129, 0.12), #fff 58%);
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
  border: 1px solid rgba(16, 185, 129, 0.24);
  border-radius: 16px;
  background: var(--wms-primary-soft);
}

.notice-dot {
  width: 10px;
  height: 10px;
  flex-shrink: 0;
  margin-top: 5px;
  border-radius: 999px;
  background: var(--wms-primary);
  box-shadow: 0 0 0 5px rgba(16, 185, 129, 0.14);
}

.quiet-notice strong {
  display: block;
  color: var(--wms-text);
  font-size: 14px;
}

.quiet-notice p {
  margin: 3px 0 0;
  color: var(--wms-text-muted);
  font-size: 12.5px;
}

.empty-state {
  min-height: 380px;
  display: grid;
  place-items: center;
  align-content: center;
  padding: 42px;
  border: 1px dashed rgba(16, 185, 129, 0.3);
  border-radius: 20px;
  background: #fff;
  text-align: center;
}

.empty-mark {
  width: 68px;
  height: 68px;
  display: grid;
  place-items: center;
  margin-bottom: 16px;
  border-radius: 18px 18px 18px 5px;
  background: var(--wms-primary);
  color: #fff;
  font-size: 28px;
  font-weight: 850;
  box-shadow: var(--wms-shadow-md);
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
  border: 1px solid var(--wms-line);
  border-radius: 18px;
  background: #fff;
  box-shadow: var(--wms-shadow-xs);
  color: inherit;
  cursor: pointer;
  text-align: left;
  transition:
    border-color 0.18s ease,
    box-shadow 0.18s ease,
    transform 0.18s ease;
}

.zone-card:hover {
  border-color: rgba(16, 185, 129, 0.42);
  box-shadow: var(--wms-shadow-md);
  transform: translateY(-2px);
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
  border-radius: 12px;
  background: var(--wms-primary-soft);
  color: var(--wms-primary-strong);
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
    radial-gradient(circle closest-side, #fff 72%, transparent 73%),
    conic-gradient(var(--wms-primary) calc(var(--pct) * 1%), #e5e7eb 0);
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
  border: 1px solid var(--wms-line);
  border-radius: 14px;
  background: #fafafa;
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
  aspect-ratio: 1;
  min-width: 9px;
  border-radius: 7px;
  background: #e5e7eb;
  transition: transform 0.15s ease;
}

.shelf-dot.is-done {
  background: var(--wms-primary);
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
  border-radius: 12px;
  background: var(--wms-accent-soft);
  color: var(--wms-text-muted);
  font-size: 12px;
}

.zone-foot {
  justify-content: flex-end;
  gap: 6px;
  margin-top: auto;
  padding-top: 12px;
  border-top: 1px solid var(--wms-line);
  color: var(--wms-text-muted);
  font-size: 12.5px;
  font-weight: 750;
}

.zone-card:hover .zone-foot {
  color: var(--wms-primary-strong);
}
</style>
