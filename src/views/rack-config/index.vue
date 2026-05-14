<template>
  <div class="rack-page">
    <!-- 页头 -->
    <div class="page-header">
      <div class="header-left">
        <h1 class="page-title">货位管理</h1>
        <p class="page-sub">分区货位概览，点击区卡片查看详情</p>
      </div>
      <div class="header-right">
        <a-date-picker
          v-model:value="dateVal"
          :allow-clear="false"
          format="YYYY-MM-DD"
          value-format="YYYY-MM-DD"
          @change="onDateChange"
          style="width:140px"
        />
        <a-button @click="fetchAll" :loading="loadingZones">
          <ReloadOutlined /> 刷新
        </a-button>
      </div>
    </div>

    <!-- 整体统计 -->
    <div class="overview-bar" v-if="overallStat">
      <div class="ov-stat">
        <span class="ov-num">{{ zoneNames.length }}</span>
        <span class="ov-label">分区数</span>
      </div>
      <div class="ov-divider"></div>
      <div class="ov-stat">
        <span class="ov-num">{{ overallStat.totalShelves }}</span>
        <span class="ov-label">货架总数</span>
      </div>
      <div class="ov-divider"></div>
      <div class="ov-stat text-blue">
        <span class="ov-num">{{ overallStat.need }}</span>
        <span class="ov-label">可配货</span>
      </div>
      <div class="ov-divider"></div>
      <div class="ov-stat text-green">
        <span class="ov-num">{{ overallStat.prepared }}</span>
        <span class="ov-label">配货完成</span>
      </div>
      <div class="ov-divider"></div>
      <div class="ov-stat text-orange" v-if="overallStat.totalShelves > 0">
        <span class="ov-num">{{ Math.round(overallStat.prepared / overallStat.totalShelves * 100) }}%</span>
        <span class="ov-label">整体进度</span>
      </div>
    </div>

    <!-- 分区卡片网格 -->
    <a-spin :spinning="loadingZones" tip="加载分区数据...">
      <div v-if="!loadingZones && zoneNames.length === 0" class="empty-wrap">
        <a-empty description="暂无分区数据" />
      </div>

      <div v-else class="zone-grid">
        <div
          v-for="zone in zoneInfoMap"
          :key="zone.name"
          class="zone-card"
          @click="goToDetail(zone.name)"
        >
          <!-- 加载骨架 -->
          <template v-if="zone.loading">
            <a-skeleton active :paragraph="{ rows: 3 }" />
          </template>

          <template v-else>
            <!-- 区名 + 进度环 -->
            <div class="zone-card-head">
              <div class="zone-name-wrap">
                <div class="zone-icon">
                  <AppstoreOutlined />
                </div>
                <div>
                  <div class="zone-name">{{ zone.name }}</div>
                  <div class="zone-shelf-count">{{ zone.shelfSnList?.length ?? 0 }} 个货架</div>
                </div>
              </div>
              <div class="zone-progress-ring">
                <a-progress
                  type="circle"
                  :percent="zone.progressPct"
                  :width="54"
                  :stroke-color="zone.progressPct >= 100 ? '#52c41a' : '#5b72ee'"
                  :trail-color="'#f0f2f5'"
                />
              </div>
            </div>

            <!-- 数量统计 -->
            <div class="zone-stats">
              <div class="zone-stat">
                <span class="zs-num text-blue">{{ zone.need }}</span>
                <span class="zs-label">可配货</span>
              </div>
              <div class="zone-stat-divider"></div>
              <div class="zone-stat">
                <span class="zs-num text-green">{{ zone.prepared }}</span>
                <span class="zs-label">已完成</span>
              </div>
              <div class="zone-stat-divider"></div>
              <div class="zone-stat">
                <span class="zs-num">{{ (zone.need ?? 0) + (zone.prepared ?? 0) }}</span>
                <span class="zs-label">总计</span>
              </div>
            </div>

            <!-- 货架状态小点阵 -->
            <div class="shelf-dots" v-if="zone.shelfSnList?.length">
              <a-tooltip
                v-for="shelf in zone.shelfSnList.slice(0, 20)"
                :key="shelf.shelfSn"
                :title="`${shelf.zoneShelf} #${shelf.shelfSn}  ${shelf.prepared}/${shelf.total}`"
                placement="top"
              >
                <span
                  class="shelf-dot"
                  :class="shelf.status === 1 ? 'dot-done' : 'dot-picking'"
                ></span>
              </a-tooltip>
              <span v-if="zone.shelfSnList.length > 20" class="dots-more">
                +{{ zone.shelfSnList.length - 20 }}
              </span>
            </div>

            <!-- 底部 CTA -->
            <div class="zone-card-foot">
              <span class="view-detail-btn">
                查看货位详情 <RightOutlined />
              </span>
            </div>
          </template>
        </div>
      </div>
    </a-spin>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, reactive } from 'vue'
import { useRouter } from 'vue-router'
import dayjs from 'dayjs'
import { ReloadOutlined, AppstoreOutlined, RightOutlined } from '@ant-design/icons-vue'
import { wmsZoneApi, type ShelfSnStatus } from '@/api/wmsZone'

const router = useRouter()

// ── 日期 ────────────────────────────────────────────────────
const dateVal = ref<string>(dayjs().format('YYYY-MM-DD'))

// ── 分区列表 & 信息 ─────────────────────────────────────────
const loadingZones = ref(false)
const zoneNames    = ref<string[]>([])

interface ZoneCardData {
  name: string
  loading: boolean
  need: number
  prepared: number
  progressPct: number
  shelfSnList: ShelfSnStatus[]
}

const zoneInfoMap = reactive<ZoneCardData[]>([])

async function fetchZoneNames() {
  loadingZones.value = true
  try {
    zoneNames.value = await wmsZoneApi.getZoneList()
  } finally {
    loadingZones.value = false
  }
}

async function fetchZoneInfoAll() {
  // 初始化卡片（loading 状态）
  zoneInfoMap.splice(0, zoneInfoMap.length,
    ...zoneNames.value.map(name => ({
      name,
      loading: true,
      need: 0,
      prepared: 0,
      progressPct: 0,
      shelfSnList: [],
    }))
  )

  // 并发拉取每个区的信息
  await Promise.allSettled(
    zoneNames.value.map(async (name, idx) => {
      try {
        const info = await wmsZoneApi.getZoneInfo({
          zone:      name,
          zoneShelf: '',
          type:      -1,
          date:      dateVal.value,
        })
        const total = (info.need ?? 0) + (info.prepared ?? 0)
        Object.assign(zoneInfoMap[idx], {
          loading:     false,
          need:        info.need ?? 0,
          prepared:    info.prepared ?? 0,
          progressPct: total > 0 ? Math.round((info.prepared / total) * 100) : 0,
          shelfSnList: info.shelfSnList ?? [],
        })
      } catch {
        zoneInfoMap[idx].loading = false
      }
    })
  )
}

async function fetchAll() {
  await fetchZoneNames()
  if (zoneNames.value.length > 0) {
    await fetchZoneInfoAll()
  }
}

function onDateChange() {
  if (zoneNames.value.length > 0) fetchZoneInfoAll()
}

// ── 整体统计 ─────────────────────────────────────────────────
const overallStat = computed(() => {
  if (zoneInfoMap.length === 0) return null
  return {
    totalShelves: zoneInfoMap.reduce((s, z) => s + z.shelfSnList.length, 0),
    need:         zoneInfoMap.reduce((s, z) => s + z.need, 0),
    prepared:     zoneInfoMap.reduce((s, z) => s + z.prepared, 0),
  }
})

// ── 跳转 ─────────────────────────────────────────────────────
function goToDetail(zone: string) {
  router.push({ name: 'ZoneDetail', query: { zone, date: dateVal.value } })
}

onMounted(fetchAll)
</script>

<style scoped>
/* ─── 页面 ─────────────────────────────────────────────────── */
.rack-page { padding: 24px; background: #f5f6fa; min-height: 100%; }

.page-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  margin-bottom: 18px;
  gap: 16px;
}
.page-title { font-size: 22px; font-weight: 600; color: #1a1d23; margin: 0 0 2px; }
.page-sub   { font-size: 13px; color: #8c92a0; margin: 0; }
.header-right { display: flex; align-items: center; gap: 10px; flex-shrink: 0; }

/* ─── 概览条 ─────────────────────────────────────────────── */
.overview-bar {
  display: flex;
  align-items: center;
  gap: 24px;
  background: #fff;
  border-radius: 12px;
  border: 1.5px solid #ebedf2;
  padding: 14px 24px;
  margin-bottom: 20px;
}
.ov-stat   { display: flex; flex-direction: column; align-items: center; gap: 2px; }
.ov-num    { font-size: 24px; font-weight: 700; color: #1a1d23; }
.ov-label  { font-size: 12px; color: #8c92a0; }
.ov-divider{ width: 1px; height: 36px; background: #f0f2f5; }
.ov-stat.text-blue  .ov-num { color: #1677ff; }
.ov-stat.text-green .ov-num { color: #52c41a; }
.ov-stat.text-orange .ov-num{ color: #fa8c16; }

/* ─── 卡片网格 ─────────────────────────────────────────────── */
.empty-wrap { display: flex; justify-content: center; padding: 80px 0; }

.zone-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
  gap: 16px;
}

.zone-card {
  background: #fff;
  border-radius: 14px;
  border: 1.5px solid #ebedf2;
  padding: 18px 18px 14px;
  cursor: pointer;
  transition: all .2s;
  display: flex;
  flex-direction: column;
  gap: 12px;
}
.zone-card:hover {
  border-color: #5b72ee;
  box-shadow: 0 6px 20px rgba(91,114,238,.16);
  transform: translateY(-3px);
}

/* 卡头 */
.zone-card-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.zone-name-wrap { display: flex; align-items: center; gap: 10px; }
.zone-icon {
  width: 38px; height: 38px;
  border-radius: 10px;
  background: linear-gradient(135deg, #5b72ee, #9b6ee8);
  display: flex; align-items: center; justify-content: center;
  color: #fff; font-size: 18px;
  flex-shrink: 0;
}
.zone-name        { font-size: 17px; font-weight: 600; color: #1a1d23; }
.zone-shelf-count { font-size: 12px; color: #8c92a0; }

/* 统计行 */
.zone-stats {
  display: flex;
  align-items: center;
  background: #f8f9fc;
  border-radius: 8px;
  padding: 10px 0;
}
.zone-stat         { flex: 1; text-align: center; }
.zone-stat-divider { width: 1px; height: 28px; background: #ebedf2; }
.zs-num   { display: block; font-size: 18px; font-weight: 700; color: #1a1d23; }
.zs-label { font-size: 11px; color: #8c92a0; }
.text-blue  { color: #1677ff; }
.text-green { color: #52c41a; }

/* 货架点阵 */
.shelf-dots {
  display: flex;
  flex-wrap: wrap;
  gap: 5px;
  align-items: center;
}
.shelf-dot {
  width: 10px; height: 10px;
  border-radius: 50%;
  display: inline-block;
  transition: transform .15s;
}
.shelf-dot:hover  { transform: scale(1.4); }
.dot-done         { background: #52c41a; }
.dot-picking      { background: #1677ff; }
.dots-more        { font-size: 11px; color: #8c92a0; }

/* 卡脚 */
.zone-card-foot {
  display: flex;
  justify-content: flex-end;
  border-top: 1px solid #f5f6fa;
  padding-top: 8px;
}
.view-detail-btn {
  font-size: 12px;
  color: #8c92a0;
  display: flex;
  align-items: center;
  gap: 4px;
  transition: color .15s;
}
.zone-card:hover .view-detail-btn { color: #5b72ee; }
</style>