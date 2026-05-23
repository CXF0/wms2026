<template>
  <div class="transport-board">
    <section class="board-head">
      <div>
        <span class="eyebrow">Transport Control</span>
        <h1>集货运输看板</h1>
        <p>从站点货量预测、车辆派遣、发车签到到运输轨迹和油耗预警，统一看当天集货运输状态。</p>
      </div>

      <a-date-picker
        v-model:value="dateValue"
        :allow-clear="false"
        format="YYYY-MM-DD"
        value-format="YYYY-MM-DD"
        class="date-picker"
      />
    </section>

    <section class="fleet-kpis">
      <article v-for="item in fleetStats" :key="item.label" class="fleet-card" :class="item.tone">
        <i class="iconfont icon-kuguanfahuo" />
        <strong>{{ item.value }}</strong>
        <span>{{ item.label }}</span>
        <small>{{ item.hint }}</small>
      </article>
    </section>

    <section class="board-grid">
      <article class="panel map-panel">
        <div class="panel-head">
          <div>
            <h2>集货运输</h2>
            <p>基于昆明市经纬度范围投影，展示集货站位置、扎数、筐数和车辆实时位置。</p>
          </div>
          <a-tag color="green">GIS 点位</a-tag>
        </div>

        <div class="geo-map-wrap">
          <div ref="geoChartEl" class="geo-chart" />
          <div class="map-legend">
            <span v-for="item in stationStatusLegend" :key="item.label">
              <i :style="{ background: item.color }" />
              {{ item.label }}
            </span>
          </div>
          <div v-if="selectedMapPoint" class="map-card">
            <button type="button" @click="selectedMapPoint = null">×</button>
            <span>{{ selectedMapPoint.type }}</span>
            <strong>{{ selectedMapPoint.name }}</strong>
            <em>{{ selectedMapPoint.main }}</em>
            <small>{{ selectedMapPoint.sub }}</small>
          </div>
        </div>
      </article>

      <article class="panel plan-panel">
        <div class="panel-head compact">
          <div>
            <h2>运输计划</h2>
            <p>发车上报、抵达基地签到、返回斗南签到。</p>
          </div>
          <button class="text-btn" type="button">更多</button>
        </div>

        <div class="plan-table">
          <div class="plan-row header">
            <span>基地</span>
            <span>派车</span>
            <span>打车</span>
            <span>预估筐数</span>
            <span>操作</span>
          </div>
          <div v-for="plan in transportPlans" :key="plan.base" class="plan-row">
            <span>{{ plan.base }}</span>
            <strong>{{ plan.dispatchCars }} 辆</strong>
            <span>{{ plan.hailingCars }} 辆</span>
            <span>{{ plan.baskets }} 筐</span>
            <button class="detail-btn" type="button">详情</button>
          </div>
        </div>
      </article>

      <article class="panel dispatch-panel">
        <div class="panel-head">
          <div>
            <h2>派遣与打车推荐</h2>
            <p>根据车辆容量组合派遣，自有车辆优先，货拉拉用于尖峰补位。</p>
          </div>
        </div>

        <div class="dispatch-flow">
          <div v-for="item in dispatchSteps" :key="item.title" class="flow-card">
            <span>{{ item.tag }}</span>
            <strong>{{ item.title }}</strong>
            <small>{{ item.desc }}</small>
          </div>
        </div>
      </article>

      <article class="panel assets-panel">
        <div class="panel-head compact">
          <div>
            <h2>车辆资产</h2>
            <p>可用车辆与标准筐容量。</p>
          </div>
        </div>

        <div class="asset-summary">
          <div>
            <span>花材运输车辆</span>
            <strong>25 辆</strong>
          </div>
          <div>
            <span>商务用车</span>
            <strong>5 辆</strong>
          </div>
        </div>

        <div class="asset-table">
          <div class="asset-row header">
            <span>车牌</span>
            <span>车型</span>
            <span>品牌型号</span>
            <span>装载</span>
          </div>
          <div v-for="asset in vehicleAssets" :key="asset.plate" class="asset-row">
            <strong>{{ asset.plate }}</strong>
            <span>{{ asset.type }}</span>
            <span>{{ asset.model }}</span>
            <span>{{ asset.capacity }}</span>
          </div>
        </div>
      </article>

      <article class="panel track-panel">
        <div class="panel-head">
          <div>
            <h2>车辆行驶轨迹</h2>
            <p>按 15 分钟粒度跟踪发车、抵达和返场状态。</p>
          </div>
        </div>
        <div ref="trackChartEl" class="chart line-chart" />
      </article>

      <article class="panel warning-panel">
        <div class="panel-head">
          <div>
            <h2>油耗监控预警</h2>
            <p>识别异常油耗、绕路和长时间怠速车辆。</p>
          </div>
        </div>

        <div class="warning-list">
          <div v-for="item in warnings" :key="item.plate">
            <span :class="item.level">{{ item.levelText }}</span>
            <strong>{{ item.plate }}</strong>
            <em>{{ item.desc }}</em>
            <small>{{ item.time }}</small>
          </div>
        </div>
      </article>
    </section>
  </div>
</template>

<script setup lang="ts">
import { nextTick, onBeforeUnmount, onMounted, ref } from 'vue'
import dayjs from 'dayjs'
import * as echarts from 'echarts'
import kunmingGeoJson from '@/assets/geo/kunming-530100-full.json'
import { stationApi } from '@/api'
import type { StationRecord } from '@/types/business'

type EChart = echarts.ECharts

const dateValue = ref(dayjs().format('YYYY-MM-DD'))
const geoChartEl = ref<HTMLDivElement | null>(null)
const trackChartEl = ref<HTMLDivElement | null>(null)
const selectedMapPoint = ref<{
  type: string
  name: string
  main: string
  sub: string
} | null>(null)

let geoChart: EChart | null = null
let trackChart: EChart | null = null

const fleetStats = [
  { label: '装货中', value: '5 辆', hint: '基地签到后装车', tone: 'loading' },
  { label: '在途', value: '15 辆', hint: '返回斗南途中', tone: 'running' },
  { label: '空闲', value: '5 辆', hint: '可参与补位', tone: 'idle' },
  { label: '维修中', value: '2 辆', hint: '不可派遣', tone: 'repair' },
]

const stations = ref<StationRecord[]>([])

const stationStatusLegend = [
  { key: 'waiting', label: '待装车', color: '#94a3b8' },
  { key: 'loading', label: '装车中', color: '#f97316' },
  { key: 'partial', label: '部分发车', color: '#0284c7' },
  { key: 'done', label: '全部发车', color: '#10b981' },
]

const stationStatusColors = stationStatusLegend.reduce<Record<string, string>>((map, item) => {
  map[item.key] = item.color
  return map
}, {})

const mapTrucks = [
  { plate: '云A88888', label: '装货中', lng: 103.11, lat: 24.93, status: 'loading' },
  { plate: '云A77777', label: '返场', lng: 102.92, lat: 24.86, status: 'running' },
  { plate: '云A23456', label: '在途', lng: 102.62, lat: 24.77, status: 'running' },
  { plate: '云A54321', label: '待派', lng: 102.81, lat: 24.88, status: 'idle' },
]

const transportPlans = ref<{ base: string; dispatchCars: number; hailingCars: number; baskets: number }[]>([])

const dispatchSteps = [
  { tag: '01', title: '按 GIS 站点预测筐数', desc: '以集货站经纬度、扎数和筐数估算车型需求。' },
  { tag: '02', title: '车辆容量组合派遣', desc: '优先匹配自有车，按 65/90/120 筐容量组合出车。' },
  { tag: '03', title: '尖峰缺口打车补位', desc: '当自有车辆不足时，自动生成货拉拉车型与辆数建议。' },
  { tag: '04', title: '轨迹与油耗预警', desc: '对绕路、怠速和油耗异常车辆进行调度提醒。' },
]

const vehicleAssets = [
  { plate: '云A56789', type: '厢式货车', model: '解放A01', capacity: '65 筐' },
  { plate: '云A98765', type: '厢式货车', model: '解放A01', capacity: '65 筐' },
  { plate: '云A23456', type: '厢式货车', model: '解放A01', capacity: '65 筐' },
  { plate: '云A65432', type: '冷藏货车', model: '江铃T8', capacity: '90 筐' },
  { plate: '云A34567', type: '厢式货车', model: '解放A01', capacity: '65 筐' },
  { plate: '云A76543', type: '平板货车', model: '东风K7', capacity: '120 筐' },
]

const warnings = [
  { plate: '云A88888', level: 'high', levelText: '高', desc: '宜良线油耗高于均值 18%，建议复核路线。', time: '10:45' },
  { plate: '云A66666', level: 'mid', levelText: '中', desc: '宝峰基地装货等待 42 分钟。', time: '10:28' },
  { plate: '云A23456', level: 'low', levelText: '低', desc: '返场预计晚到 11 分钟。', time: '10:12' },
]

function renderGeoChart() {
  if (!geoChart) return
  echarts.registerMap('kunming', kunmingGeoJson as never)

  const list = stations.value
  const stationData = list.map((item) => ({
    name: item.name,
    value: [parseFloat(item.longitude), parseFloat(item.latitude), 0],
    address: item.address,
    contactTel: item.contactTel,
    latestCheckTime: item.latestCheckTime,
    shortName: item.shortName,
    stationFee: item.stationFee,
    mapStatus: 'waiting',  // 实时状态从运营数据获取，默认待装车
  }))
  const truckData = mapTrucks.map((item) => ({
    name: item.plate,
    value: [item.lng, item.lat],
    label: item.label,
    status: item.status,
  }))
  const linesData = mapTrucks
    .filter((item) => item.status !== 'idle')
    .map((item) => ({
      fromName: item.plate,
      toName: '斗南中心站',
      coords: [[item.lng, item.lat], [102.79, 24.89]],
    }))

  const lngs = [...list.map((s) => parseFloat(s.longitude)), ...mapTrucks.map((t) => t.lng)]
  const lats = [...list.map((s) => parseFloat(s.latitude)), ...mapTrucks.map((t) => t.lat)]
  const geoBounds = [
    [Math.min(...lngs) - 0.12, Math.max(...lats) + 0.1],
    [Math.max(...lngs) + 0.12, Math.min(...lats) - 0.1],
  ]

  geoChart.setOption({
    tooltip: {
      trigger: 'item',
      borderWidth: 0,
      backgroundColor: 'rgba(24, 24, 27, 0.92)',
      textStyle: { color: '#fff' },
      formatter: (params: unknown) => {
        const item = params as { seriesName?: string; name?: string; data?: { address?: string; contactTel?: string; latestCheckTime?: string; stationFee?: string; label?: string; value?: number[] } }
        if (item.seriesName === '集货站') {
          return `${item.name}<br/>位置：${item.data?.address ?? '-'}<br/>电话：${item.data?.contactTel ?? '-'}<br/>最晚签到：${item.data?.latestCheckTime?.slice(0, 5) ?? '-'}<br/>站点费：¥${item.data?.stationFee ?? '-'}/件`
        }
        if (item.seriesName === '车辆位置') {
          return `${item.name}<br/>状态：${item.data?.label ?? '-'}`
        }
        return item.name ?? ''
      },
    },
    geo: {
      map: 'kunming',
      roam: true,
      layoutCenter: ['50%', '52%'],
      layoutSize: '98%',
      aspectScale: 0.98,
      boundingCoords: geoBounds,
      itemStyle: {
        areaColor: '#f4fbf7',
        borderColor: 'rgba(16, 185, 129, 0.42)',
        borderWidth: 1,
      },
      emphasis: {
        label: { color: '#18181b', fontWeight: 800 },
        itemStyle: { areaColor: '#dcfce7' },
      },
      label: {
        show: true,
        color: '#71717a',
        fontSize: 11,
      },
    },
    series: [
      {
        name: '运输线路',
        type: 'lines',
        coordinateSystem: 'geo',
        zlevel: 2,
        data: linesData,
        symbol: ['none', 'arrow'],
        symbolSize: 8,
        lineStyle: {
          color: '#10b981',
          width: 1.4,
          opacity: 0.46,
          curveness: 0.22,
        },
        effect: {
          show: true,
          period: 5,
          trailLength: 0.22,
          symbol: 'circle',
          symbolSize: 4,
          color: '#10b981',
        },
      },
      {
        name: '集货站',
        type: 'effectScatter',
        coordinateSystem: 'geo',
        zlevel: 3,
        data: stationData,
        symbolSize: (value: number[]) => Math.max(13, Math.min(28, value[2] / 58)),
        rippleEffect: { brushType: 'stroke', scale: 3.5 },
        itemStyle: {
          color: (params: { data?: { mapStatus?: string } }) => {
            return stationStatusColors[params.data?.mapStatus ?? ''] ?? '#94a3b8'
          },
          shadowBlur: 14,
          shadowColor: 'rgba(16, 185, 129, 0.32)',
        },
        label: {
          show: false,
          position: 'right',
          formatter: (params: { name: string; data?: { shortName?: string } }) =>
            `${params.data?.shortName ?? params.name}`,
          color: '#18181b',
          fontSize: 11,
          lineHeight: 15,
          backgroundColor: 'rgba(255,255,255,0.86)',
          borderColor: '#e4e4e7',
          borderWidth: 1,
          borderRadius: 8,
          padding: [5, 7],
        },
        emphasis: {
          label: { show: false },
        },
      },
      {
        name: '车辆位置',
        type: 'scatter',
        coordinateSystem: 'geo',
        zlevel: 4,
        data: truckData,
        symbol: 'path://M82 30H58V18H12C7.6 18 4 21.6 4 26v30h8.2A13.8 13.8 0 0 0 40 56h28.2A13.8 13.8 0 0 0 96 56H108V42L96 30H82ZM58 30h18v12H58V30ZM26 65a9 9 0 1 1 0-18 9 9 0 0 1 0 18Zm56 0a9 9 0 1 1 0-18 9 9 0 0 1 0 18Z',
        symbolSize: [34, 24],
        itemStyle: {
          color: (params: { data?: { status?: string } }) => {
            if (params.data?.status === 'loading') return '#0284c7'
            if (params.data?.status === 'running') return '#18181b'
            return '#f59e0b'
          },
          borderColor: '#fff',
          borderWidth: 1.2,
          shadowBlur: 10,
          shadowColor: 'rgba(24,24,27,0.18)',
        },
        label: {
          show: false,
          position: 'bottom',
          formatter: (params: { name: string; data?: { label?: string } }) => `${params.name} · ${params.data?.label ?? ''}`,
          color: '#18181b',
          fontSize: 11,
          fontWeight: 800,
          backgroundColor: 'rgba(255,255,255,0.9)',
          borderRadius: 999,
          padding: [4, 7],
        },
        emphasis: {
          label: {
            show: true,
          },
        },
      },
    ],
  })

  geoChart.off('click')
  geoChart.getZr().off('click')
  geoChart.on('click', (params: unknown) => {
    const item = params as { seriesName?: string; name?: string; data?: { address?: string; contactTel?: string; latestCheckTime?: string; stationFee?: string; label?: string } }
    if (item.seriesName === '集货站') {
      selectedMapPoint.value = {
        type: '集货站',
        name: item.name ?? '-',
        main: `站点费 ¥${item.data?.stationFee ?? '-'}/件`,
        sub: `${item.data?.address ?? ''} · 电话 ${item.data?.contactTel ?? '-'} · 最晚签到 ${item.data?.latestCheckTime?.slice(0, 5) ?? '-'}`,
      }
      return
    }
    if (item.seriesName === '车辆位置') {
      selectedMapPoint.value = {
        type: '车辆',
        name: item.name ?? '-',
        main: item.data?.label ?? '',
        sub: '点击详情可查看司机、路线和轨迹',
      }
    }
  })
  geoChart.getZr().on('click', (event) => {
    if (!event.target) selectedMapPoint.value = null
  })
}

function renderTrackChart() {
  if (!trackChart) return
  const times = Array.from({ length: 17 }, (_, index) => dayjs('2026-05-20 07:30').add(index * 15, 'minute').format('HH:mm'))
  trackChart.setOption({
    color: ['#10b981', '#18181b', '#60a5fa'],
    tooltip: { trigger: 'axis' },
    grid: { left: 38, right: 18, top: 18, bottom: 32, containLabel: true },
    legend: {
      top: 0,
      right: 0,
      itemWidth: 10,
      itemHeight: 6,
      textStyle: { color: '#71717a' },
    },
    xAxis: {
      type: 'category',
      boundaryGap: false,
      data: times,
      axisLine: { lineStyle: { color: '#e4e4e7' } },
      axisLabel: { color: '#71717a' },
    },
    yAxis: {
      type: 'value',
      minInterval: 1,
      axisLabel: { color: '#71717a' },
      splitLine: { lineStyle: { color: '#f4f4f5' } },
    },
    series: [
      {
        name: '发车',
        type: 'line',
        smooth: true,
        symbol: 'none',
        lineStyle: { width: 3 },
        data: [2, 3, 4, 5, 8, 10, 12, 14, 15, 16, 18, 19, 20, 20, 21, 22, 23],
      },
      {
        name: '抵达基地',
        type: 'line',
        smooth: true,
        symbol: 'none',
        lineStyle: { width: 3 },
        data: [0, 1, 2, 4, 5, 7, 10, 12, 13, 14, 15, 17, 18, 18, 19, 20, 20],
      },
      {
        name: '返回斗南',
        type: 'line',
        smooth: true,
        symbol: 'none',
        lineStyle: { width: 3 },
        areaStyle: { opacity: 0.08 },
        data: [0, 0, 0, 1, 2, 4, 5, 7, 9, 11, 13, 15, 16, 18, 19, 20, 21],
      },
    ],
  })
}

function resizeCharts() {
  geoChart?.resize()
  trackChart?.resize()
}

onMounted(async () => {
  await nextTick()
  if (geoChartEl.value) geoChart = echarts.init(geoChartEl.value)
  if (trackChartEl.value) trackChart = echarts.init(trackChartEl.value)

  try {
    const result = await stationApi.page(1, 200)
    stations.value = result.records.filter((s) => s.longitude && s.latitude)
    transportPlans.value = stations.value
      .slice()
      .sort((a, b) => Number(b.sequence) - Number(a.sequence))
      .slice(0, 9)
      .map((s) => ({
        base: s.name,
        dispatchCars: 1,
        hailingCars: 0,
        baskets: 0,
      }))
  } catch {
    // 接口不可用时降级为空列表，地图仍可渲染底图
  }

  renderGeoChart()
  renderTrackChart()
  window.addEventListener('resize', resizeCharts)
})

onBeforeUnmount(() => {
  window.removeEventListener('resize', resizeCharts)
  geoChart?.dispose()
  trackChart?.dispose()
})
</script>

<style scoped>
.transport-board {
  min-height: 100%;
}

.board-head {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 20px;
  padding: 10px 0 18px;
  border-bottom: 1px solid var(--wms-line);
  background:
    linear-gradient(rgba(16, 185, 129, 0.08) 1px, transparent 1px),
    linear-gradient(90deg, rgba(16, 185, 129, 0.08) 1px, transparent 1px);
  background-size: 96px 96px;
}

.eyebrow {
  color: var(--wms-primary-strong);
  font-size: 14px;
  font-weight: 850;
}

.board-head h1 {
  margin: 12px 0 0;
  color: var(--wms-text);
  font-size: 30px;
  font-weight: 850;
}

.board-head p {
  max-width: 780px;
  margin: 10px 0 0;
  color: var(--wms-text-muted);
  font-size: 15px;
  line-height: 1.8;
}

.date-picker {
  width: 148px;
}

.fleet-kpis {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 14px;
  margin: 18px 0;
}

.fleet-card {
  min-height: 118px;
  padding: 18px;
  border: 1px solid var(--wms-line);
  border-radius: 18px;
  background: #fff;
  box-shadow: var(--wms-shadow-xs);
}

.fleet-card i,
.fleet-card strong,
.fleet-card span,
.fleet-card small {
  display: block;
}

.fleet-card i {
  color: var(--card-color);
  font-size: 25px;
}

.fleet-card strong {
  margin-top: 13px;
  color: var(--card-color);
  font-size: 24px;
  font-weight: 850;
}

.fleet-card span {
  margin-top: 3px;
  color: var(--wms-text);
  font-weight: 800;
}

.fleet-card small {
  margin-top: 5px;
  color: var(--wms-text-muted);
}

.fleet-card.loading {
  --card-color: #0284c7;
}

.fleet-card.running {
  --card-color: var(--wms-primary-strong);
}

.fleet-card.idle {
  --card-color: #71717a;
}

.fleet-card.repair {
  --card-color: #f97316;
}

.board-grid {
  display: grid;
  grid-template-columns: minmax(680px, 1.72fr) minmax(360px, 0.82fr) minmax(340px, 0.76fr);
  grid-template-areas:
    "map plan assets"
    "map dispatch dispatch"
    "track warning warning";
  align-items: stretch;
  gap: 16px;
}

.panel {
  min-width: 0;
  padding: 18px;
  border: 1px solid var(--wms-line);
  border-radius: 18px;
  background: rgba(255, 255, 255, 0.96);
  box-shadow: var(--wms-shadow-xs);
}

.map-panel {
  grid-area: map;
  display: flex;
  flex-direction: column;
}

.plan-panel {
  grid-area: plan;
}

.dispatch-panel {
  grid-area: dispatch;
}

.assets-panel {
  grid-area: assets;
}

.track-panel {
  grid-area: track;
}

.warning-panel {
  grid-area: warning;
}

.panel-head {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 14px;
  margin-bottom: 14px;
}

.panel-head.compact {
  margin-bottom: 10px;
}

.panel h2 {
  margin: 0;
  color: var(--wms-text);
  font-size: 18px;
  font-weight: 850;
}

.panel p {
  margin: 6px 0 0;
  color: var(--wms-text-muted);
  font-size: 12px;
}

.text-btn {
  border: 0;
  background: transparent;
  color: var(--wms-primary-strong);
  cursor: pointer;
  font-weight: 800;
}

.geo-map-wrap {
  position: relative;
  flex: 1;
  min-height: 560px;
  overflow: hidden;
  border: 1px solid var(--wms-line);
  border-radius: 18px;
  background: #fff;
}

.geo-chart {
  position: relative;
  z-index: 1;
  width: 100%;
  height: 100%;
  min-height: 560px;
}

.map-legend {
  position: absolute;
  top: 14px;
  right: 14px;
  z-index: 8;
  display: grid;
  gap: 8px;
  padding: 10px 12px;
  border: 1px solid var(--wms-line);
  border-radius: 14px;
  background: rgba(255, 255, 255, 0.92);
  box-shadow: var(--wms-shadow-xs);
  backdrop-filter: blur(8px);
}

.map-legend span {
  display: flex;
  align-items: center;
  gap: 7px;
  color: var(--wms-text-muted);
  font-size: 12px;
  font-weight: 750;
  white-space: nowrap;
}

.map-legend i {
  width: 9px;
  height: 9px;
  border-radius: 999px;
}

.map-toolbar {
  position: absolute;
  top: 14px;
  left: 14px;
  z-index: 5;
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 8px 11px;
  border: 1px solid var(--wms-line);
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.9);
  box-shadow: var(--wms-shadow-xs);
}

.map-toolbar span {
  color: var(--wms-text);
  font-size: 12px;
  font-weight: 850;
}

.map-toolbar small {
  color: var(--wms-text-muted);
  font-size: 11px;
}

.map-layer {
  position: absolute;
  inset: 0;
  pointer-events: none;
}

.map-layer::before {
  content: '';
  position: absolute;
  left: 22%;
  top: 17%;
  width: 56%;
  height: 70%;
  border: 1px solid rgba(16, 185, 129, 0.22);
  border-radius: 45% 52% 42% 48%;
  background:
    linear-gradient(135deg, rgba(16, 185, 129, 0.08), rgba(96, 165, 250, 0.08)),
    rgba(255, 255, 255, 0.28);
  box-shadow: inset 0 0 0 1px rgba(255, 255, 255, 0.72);
  transform: rotate(-10deg);
}

.map-layer::after {
  content: '';
  position: absolute;
  left: 38%;
  top: 29%;
  width: 34%;
  height: 45%;
  border: 1px dashed rgba(24, 24, 27, 0.14);
  border-radius: 42% 48% 50% 44%;
  transform: rotate(14deg);
}

.district {
  position: absolute;
  z-index: 1;
  color: rgba(63, 63, 70, 0.52);
  font-size: 12px;
  font-weight: 850;
}

.district.d1 { left: 43%; top: 48%; }
.district.d2 { left: 49%; top: 45%; }
.district.d3 { left: 51%; top: 55%; }
.district.d4 { left: 56%; top: 61%; }
.district.d5 { left: 39%; top: 73%; }
.district.d6 { left: 67%; top: 59%; }
.district.d7 { left: 61%; top: 34%; }
.district.d8 { left: 71%; top: 25%; }

.station-node {
  position: absolute;
  z-index: 2;
  width: 136px;
  min-height: 82px;
  padding: 11px 12px;
  border: 1px solid rgba(16, 185, 129, 0.18);
  border-radius: 18px;
  background: rgba(255, 255, 255, 0.9);
  box-shadow: var(--wms-shadow-xs);
  transform: translate(-50%, -50%);
  backdrop-filter: blur(8px);
}

.station-node.active {
  border-color: rgba(16, 185, 129, 0.55);
  box-shadow: 0 18px 42px rgba(16, 185, 129, 0.18);
}

.station-node span,
.station-node strong,
.station-node small {
  display: block;
}

.station-node span {
  color: var(--wms-text);
  font-weight: 850;
  white-space: nowrap;
}

.station-node strong {
  margin-top: 5px;
  color: var(--station-color);
  font-size: 15px;
}

.station-node small {
  margin-top: 5px;
  color: var(--wms-text-muted);
  font-size: 11px;
  line-height: 1.45;
}

.station-node.high {
  --station-color: var(--wms-primary-strong);
}

.station-node.mid {
  --station-color: #0284c7;
}

.station-node.low {
  --station-color: #71717a;
}

.truck-pin {
  position: absolute;
  z-index: 4;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 6px 9px;
  border-radius: 999px;
  background: #18181b;
  color: #fff;
  font-size: 11px;
  font-weight: 800;
  transform: translate(-50%, -50%);
  box-shadow: 0 10px 24px rgba(24, 24, 27, 0.18);
}

.truck-pin i {
  color: var(--pin-color);
  font-size: 13px;
}

.truck-pin.loading {
  --pin-color: #38bdf8;
}

.truck-pin.running {
  --pin-color: #34d399;
}

.truck-pin.idle {
  --pin-color: #fbbf24;
}

.route-line {
  position: absolute;
  height: 2px;
  border-radius: 999px;
  background: linear-gradient(90deg, transparent, rgba(16, 185, 129, 0.72), transparent);
  transform-origin: left center;
}

.route-one {
  width: 360px;
  left: 28%;
  top: 55%;
  transform: rotate(-18deg);
}

.route-two {
  width: 310px;
  left: 39%;
  top: 67%;
  transform: rotate(16deg);
}

.map-card {
  position: absolute;
  right: 22px;
  bottom: 22px;
  z-index: 10;
  width: 250px;
  padding: 16px;
  border: 1px solid rgba(16, 185, 129, 0.3);
  border-radius: 16px;
  background: rgba(255, 255, 255, 0.94);
  box-shadow: var(--wms-shadow-md);
}

.map-card button {
  position: absolute;
  top: 8px;
  right: 10px;
  width: 24px;
  height: 24px;
  border: 0;
  border-radius: 999px;
  background: #f4f4f5;
  color: var(--wms-text-muted);
  cursor: pointer;
  font-size: 16px;
  line-height: 1;
}

.map-card button:hover {
  color: var(--wms-text);
}

.map-card span,
.map-card strong,
.map-card em,
.map-card small {
  display: block;
}

.map-card span,
.map-card small {
  color: var(--wms-text-muted);
  font-size: 12px;
}

.map-card strong {
  margin-top: 6px;
  color: #f97316;
  font-size: 18px;
  font-weight: 850;
}

.map-card em {
  margin-top: 8px;
  color: var(--wms-primary-strong);
  font-style: normal;
  font-weight: 800;
}

.plan-table,
.asset-table {
  display: grid;
  gap: 2px;
}

.plan-row,
.asset-row {
  display: grid;
  align-items: center;
  gap: 10px;
  min-height: 38px;
  padding: 0 10px;
  border-radius: 10px;
  color: var(--wms-text);
  font-size: 12px;
}

.plan-row {
  grid-template-columns: minmax(82px, 1fr) 48px 48px 68px 50px;
}

.asset-row {
  grid-template-columns: 86px 82px 1fr 54px;
}

.plan-row.header,
.asset-row.header {
  min-height: 30px;
  background: #f4f4f5;
  color: var(--wms-text-muted);
  font-weight: 850;
}

.plan-row:not(.header):hover,
.asset-row:not(.header):hover {
  background: #fafafa;
}

.plan-row strong,
.asset-row strong {
  color: #f97316;
}

.detail-btn {
  height: 26px;
  border: 1px solid var(--wms-line);
  border-radius: 999px;
  background: #fff;
  color: var(--wms-primary-strong);
  cursor: pointer;
  font-size: 12px;
  font-weight: 850;
}

.detail-btn:hover {
  border-color: rgba(16, 185, 129, 0.42);
  background: rgba(16, 185, 129, 0.08);
}

.chart {
  width: 100%;
}

.donut-chart {
  height: 250px;
}

.line-chart {
  height: 240px;
}

.dispatch-flow {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 12px;
}

.flow-card {
  min-height: 130px;
  padding: 16px;
  border: 1px solid var(--wms-line);
  border-radius: 16px;
  background: #fafafa;
}

.flow-card span,
.flow-card strong,
.flow-card small {
  display: block;
}

.flow-card span {
  color: var(--wms-primary-strong);
  font-size: 12px;
  font-weight: 850;
}

.flow-card strong {
  margin-top: 10px;
  color: var(--wms-text);
  font-size: 15px;
}

.flow-card small {
  margin-top: 8px;
  color: var(--wms-text-muted);
  line-height: 1.6;
}

.asset-summary {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 12px;
  margin-bottom: 14px;
}

.asset-summary div {
  padding: 14px;
  border: 1px solid rgba(16, 185, 129, 0.22);
  border-radius: 16px;
  background: rgba(16, 185, 129, 0.08);
}

.asset-summary span,
.asset-summary strong {
  display: block;
}

.asset-summary span {
  color: var(--wms-text-muted);
  font-size: 12px;
}

.asset-summary strong {
  margin-top: 7px;
  color: var(--wms-primary-strong);
  font-size: 20px;
  font-weight: 850;
}

.warning-list {
  display: grid;
  gap: 10px;
}

.warning-list div {
  display: grid;
  grid-template-columns: 34px 84px 1fr 48px;
  gap: 10px;
  align-items: center;
  min-height: 52px;
  padding: 10px;
  border: 1px solid var(--wms-line);
  border-radius: 14px;
  background: #fafafa;
}

.warning-list span {
  width: 26px;
  height: 26px;
  display: grid;
  place-items: center;
  border-radius: 999px;
  color: #fff;
  font-size: 12px;
  font-weight: 850;
}

.warning-list span.high {
  background: #ef4444;
}

.warning-list span.mid {
  background: #f97316;
}

.warning-list span.low {
  background: #0284c7;
}

.warning-list strong {
  color: #f97316;
}

.warning-list em,
.warning-list small {
  color: var(--wms-text-muted);
  font-style: normal;
}

@media (max-width: 1440px) {
  .board-grid {
    grid-template-columns: 1fr 1fr;
    grid-template-areas:
      "map map"
      "track track"
      "plan assets"
      "dispatch dispatch"
      "warning warning";
  }

  .geo-map-wrap,
  .geo-chart {
    min-height: 620px;
  }
}
</style>
