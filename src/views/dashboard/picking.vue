<template>
  <div class="picking-board">
    <header class="board-header">
      <div>
        <span class="eyebrow">Picking Dashboard</span>
        <h1>配货看板</h1>
      </div>
      <a-date-picker
        v-model:value="dateValue"
        :allow-clear="false"
        format="YYYY-MM-DD"
        value-format="YYYY-MM-DD"
        class="date-picker"
      />
    </header>

    <section class="board-top">
      <article class="progress-card">
        <div class="card-title">
          <span class="title-icon"><ProfileOutlined /></span>
          <strong>配货进度</strong>
        </div>

        <div v-for="item in progressItems" :key="item.label" class="progress-item">
          <div class="progress-meta">
            <span>{{ item.label }}</span>
            <strong>{{ item.done }}</strong>
            <em>/ {{ item.total }}</em>
          </div>
          <div class="progress-track"><i :style="{ width: item.percent + '%' }" /></div>
          <small>完成率 {{ item.percent.toFixed(2) }}%</small>
        </div>
      </article>

      <div class="top-right">
        <div class="summary-area">
          <article v-for="item in summaryCards" :key="item.label" class="summary-card" :class="{ region: item.region }">
            <div class="summary-icon"><component :is="item.icon" /></div>
            <strong>{{ item.value }}</strong>
            <span>{{ item.label }}</span>
            <div v-if="item.region" class="region-meter"><i :style="{ height: item.rate + '%' }" /></div>
            <small v-if="item.region">{{ item.rate.toFixed(2) }}%</small>
          </article>
        </div>

        <section class="chart-card target-card">
          <div class="chart-head">
            <h2>配货目标时间节点</h2>
            <button type="button" class="target-pill">
              <span>98% 目标节点</span>
              <DownOutlined />
            </button>
          </div>
          <div ref="targetChartEl" class="echart target-chart" />
        </section>
      </div>
    </section>

    <section class="chart-card">
      <div class="chart-head trend-head">
        <h2>场次配货趋势</h2>
        <span>17:40 起，每 15 分钟一个刻度</span>
        <div class="legend-list">
          <span><i class="dark" />2026-05-21 场次（货量：376383 扎）</span>
          <span><i class="light" />2026-05-20 场次（货量：426196 扎）</span>
        </div>
      </div>
      <div ref="sessionChartEl" class="echart wide-chart" />
    </section>

    <section class="chart-card">
      <div class="chart-head">
        <h2>配货完成率（基地+代配）</h2>
      </div>
      <div ref="finishChartEl" class="echart finish-chart" />
    </section>

    <p class="board-note">注：数据截止至 2026-05-20 24:00</p>
  </div>
</template>

<script setup lang="ts">
import { nextTick, onBeforeUnmount, onMounted, ref, watch, type Component } from 'vue'
import dayjs from 'dayjs'
import * as echarts from 'echarts'
import {
  DownOutlined,
  ProfileOutlined,
  TeamOutlined,
  UserAddOutlined,
  UserOutlined,
  InboxOutlined,
} from '@ant-design/icons-vue'

interface ProgressItem {
  label: string
  done: number
  total: number
  percent: number
}

interface SummaryCard {
  label: string
  value: string
  icon: Component
  region?: boolean
  rate?: number
}

type EChart = echarts.ECharts

const dateValue = ref(dayjs().format('YYYY-MM-DD'))
const targetChartEl = ref<HTMLElement | null>(null)
const sessionChartEl = ref<HTMLElement | null>(null)
const finishChartEl = ref<HTMLElement | null>(null)

let targetChart: EChart | null = null
let sessionChart: EChart | null = null
let finishChart: EChart | null = null
let resizeObserver: ResizeObserver | null = null

const progressItems: ProgressItem[] = [
  { label: '全场', done: 211011, total: 376383, percent: 52.39 },
  { label: '基地货', done: 131115, total: 256391, percent: 57.52 },
  { label: '代配', done: 7698, total: 26391, percent: 29.36 },
  { label: '供应商自配货', done: 71698, total: 86391, percent: 82.56 },
]

const summaryCards: SummaryCard[] = [
  { label: '总配货人数', value: '183 人', icon: TeamOutlined },
  { label: '兼职招聘人数', value: '160 人', icon: UserAddOutlined },
  { label: '人均', value: '1545 扎', icon: UserOutlined },
  { label: '一大区（1~8区）', value: '61545 扎', icon: InboxOutlined, region: true, rate: 63.26 },
  { label: '二大区（9~16区）', value: '71693 扎', icon: InboxOutlined, region: true, rate: 63.26 },
  { label: '三大区（17~24区）', value: '76241 扎', icon: InboxOutlined, region: true, rate: 63.26 },
  { label: '四大区（24~51区）', value: '89635 扎', icon: InboxOutlined, region: true, rate: 63.26 },
]

const dateLabels = Array.from({ length: 21 }, (_, index) => `5月${index + 1}日`)
const targetMinutes = [58, 66, 68, 104, 68, 62, 92, 54, 150, 148, 144, 100, 94, 88, 38, 54, 80, 96, 72, 64, 48]
const finishRates = [
  98.86, 98.92, 98.95, 99.28, 98.92, 99.44, 98.84, 99.12, 99.08, 99.06, 99.28,
  99.2, 99.18, 99.0, 98.55, 98.92, 99.06, 99.22, 99.18, 98.96, 98.72,
]

const sessionTicks = Array.from({ length: 43 }, (_, index) =>
  dayjs('2026-05-20 17:40').add(index * 15, 'minute').format('HH:mm'),
)

const currentSessionData = sessionTicks.map((_, index) => {
  const ramp = 1 / (1 + Math.exp(-(index - 9) / 2))
  const decline = 1 / (1 + Math.exp((index - 29) / 1.5))
  const wave = Math.sin(index / 2.7) * 16 + Math.sin(index / 1.25) * 7
  return Math.max(0, Math.round((ramp * decline * 760 + wave) * 10) / 10)
})

const previousSessionData = sessionTicks.map((_, index) => {
  const ramp = 1 / (1 + Math.exp(-(index - 8) / 2.3))
  const decline = 1 / (1 + Math.exp((index - 31) / 1.4))
  const wave = Math.sin(index / 2.3) * 18 + Math.cos(index / 1.7) * 9
  return Math.max(0, Math.round((ramp * decline * 700 + wave + 18) * 10) / 10)
})

const green = '#007a1d'
const lightGreen = '#59c464'
const textMuted = '#71717a'
const gridLine = '#e5e7eb'

function minuteFormatter(value: number) {
  return dayjs('2026-05-20 22:30').add(value, 'minute').format('HH:mm')
}

function baseLineOption() {
  return {
    animationDuration: 700,
    color: [green, lightGreen],
    tooltip: {
      trigger: 'axis',
      borderWidth: 0,
      backgroundColor: 'rgba(24, 24, 27, 0.92)',
      textStyle: { color: '#fff' },
      axisPointer: { type: 'line', lineStyle: { color: 'rgba(0, 122, 29, 0.35)' } },
    },
    grid: { left: 48, right: 18, top: 18, bottom: 34, containLabel: true },
    xAxis: {
      type: 'category',
      boundaryGap: false,
      axisLine: { lineStyle: { color: gridLine } },
      axisTick: { show: false },
      axisLabel: { color: textMuted, fontSize: 11 },
      splitLine: { show: false },
    },
    yAxis: {
      type: 'value',
      axisLine: { show: false },
      axisTick: { show: false },
      axisLabel: { color: textMuted, fontSize: 11 },
      splitLine: { lineStyle: { color: gridLine, type: 'dashed' } },
    },
  }
}

function renderTargetChart() {
  if (!targetChart) return
  const option = baseLineOption()
  targetChart.setOption({
    ...option,
    grid: { left: 46, right: 14, top: 10, bottom: 28, containLabel: true },
    xAxis: { ...option.xAxis, data: dateLabels, axisLabel: { color: textMuted, fontSize: 10, interval: 1 } },
    yAxis: {
      ...option.yAxis,
      min: 0,
      max: 180,
      interval: 30,
      axisLabel: { color: textMuted, fontSize: 10, formatter: minuteFormatter },
    },
    series: [
      {
        name: '目标时间',
        type: 'line',
        smooth: true,
        symbol: 'none',
        lineStyle: { width: 5, color: green },
        areaStyle: { color: 'rgba(16, 185, 129, 0.06)' },
        markLine: {
          symbol: 'none',
          silent: true,
          label: { show: false },
          lineStyle: { color: green, type: 'dashed', width: 1 },
          data: [{ yAxis: 90 }],
        },
        data: targetMinutes,
      },
    ],
  })
}

function renderSessionChart() {
  if (!sessionChart) return
  const option = baseLineOption()
  sessionChart.setOption({
    ...option,
    legend: { show: false },
    grid: { left: 34, right: 28, top: 18, bottom: 36, containLabel: true },
    xAxis: { ...option.xAxis, data: sessionTicks, axisLabel: { color: textMuted, fontSize: 11, interval: 0 } },
    yAxis: { ...option.yAxis, axisLabel: { show: false }, splitLine: { show: false } },
    series: [
      {
        name: '2026-05-21 场次',
        type: 'line',
        smooth: true,
        symbol: 'none',
        lineStyle: { width: 5, color: green },
        areaStyle: { color: 'rgba(16, 185, 129, 0.08)' },
        data: currentSessionData,
      },
      {
        name: '2026-05-20 场次',
        type: 'line',
        smooth: true,
        symbol: 'none',
        lineStyle: { width: 5, color: lightGreen },
        data: previousSessionData,
      },
    ],
  })
}

function renderFinishChart() {
  if (!finishChart) return
  const option = baseLineOption()
  finishChart.setOption({
    ...option,
    grid: { left: 58, right: 18, top: 14, bottom: 34, containLabel: true },
    xAxis: { ...option.xAxis, data: dateLabels, axisLabel: { color: textMuted, fontSize: 11 } },
    yAxis: {
      ...option.yAxis,
      min: 98.25,
      max: 100,
      interval: 0.25,
      axisLabel: { color: textMuted, fontSize: 11, formatter: (value: number) => `${value.toFixed(2)}%` },
    },
    series: [
      {
        name: '完成率',
        type: 'line',
        smooth: true,
        symbol: 'none',
        lineStyle: { width: 5, color: green },
        markLine: {
          symbol: 'none',
          silent: true,
          label: { show: false },
          lineStyle: { color: green, type: 'dashed', width: 1 },
          data: [{ yAxis: 99.1 }],
        },
        data: finishRates,
      },
    ],
  })
}

function renderCharts() {
  renderTargetChart()
  renderSessionChart()
  renderFinishChart()
}

function resizeCharts() {
  targetChart?.resize()
  sessionChart?.resize()
  finishChart?.resize()
}

onMounted(async () => {
  await nextTick()
  if (targetChartEl.value) targetChart = echarts.init(targetChartEl.value)
  if (sessionChartEl.value) sessionChart = echarts.init(sessionChartEl.value)
  if (finishChartEl.value) finishChart = echarts.init(finishChartEl.value)
  renderCharts()

  resizeObserver = new ResizeObserver(resizeCharts)
  ;[targetChartEl.value, sessionChartEl.value, finishChartEl.value].forEach((el) => {
    if (el) resizeObserver?.observe(el)
  })
  window.addEventListener('resize', resizeCharts)
})

watch(dateValue, renderCharts)

onBeforeUnmount(() => {
  window.removeEventListener('resize', resizeCharts)
  resizeObserver?.disconnect()
  targetChart?.dispose()
  sessionChart?.dispose()
  finishChart?.dispose()
})
</script>

<style scoped>
.picking-board {
  min-height: 100%;
  padding-bottom: 24px;
  color: var(--wms-text);
}

.board-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 24px;
  margin-bottom: 18px;
}

.eyebrow {
  color: var(--wms-primary-strong);
  font-size: 13px;
  font-weight: 800;
}

.board-header h1 {
  margin: 8px 0 0;
  color: var(--wms-text);
  font-size: 34px;
  font-weight: 850;
  letter-spacing: 0;
}

.date-picker {
  width: 148px;
}

.board-top {
  display: grid;
  grid-template-columns: 260px minmax(0, 1fr);
  align-items: stretch;
  gap: 18px;
  margin-bottom: 18px;
}

.progress-card,
.summary-card,
.chart-card {
  border: 1px solid var(--wms-line);
  border-radius: 18px;
  background:
    radial-gradient(circle at 24% 0%, rgba(16, 185, 129, 0.1), transparent 32%),
    #fff;
  box-shadow: var(--wms-shadow-xs);
}

.progress-card {
  min-height: 392px;
  padding: 18px 22px;
}

.card-title {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 24px;
  color: var(--wms-primary-strong);
  font-size: 18px;
  font-weight: 850;
}

.title-icon {
  width: 32px;
  height: 32px;
  display: grid;
  place-items: center;
  border-radius: 10px;
  background: var(--wms-primary);
  color: #fff;
}

.progress-item + .progress-item {
  margin-top: 28px;
}

.progress-meta {
  display: flex;
  align-items: baseline;
  gap: 4px;
  margin-bottom: 12px;
}

.progress-meta span {
  flex: 1;
  color: var(--wms-text);
  font-weight: 800;
}

.progress-meta strong {
  color: var(--wms-primary-strong);
  font-size: 17px;
  font-weight: 850;
}

.progress-meta em {
  color: var(--wms-text-soft);
  font-style: normal;
  font-weight: 750;
}

.progress-track {
  height: 14px;
  overflow: hidden;
  border-radius: 999px;
  background: #e5e7eb;
}

.progress-track i {
  display: block;
  height: 100%;
  border-radius: inherit;
  background: linear-gradient(90deg, #00851d, var(--wms-primary));
  box-shadow: 0 8px 18px rgba(0, 133, 29, 0.22);
}

.progress-item small {
  display: block;
  margin-top: 10px;
  color: var(--wms-text-soft);
  font-size: 12px;
  text-align: center;
}

.top-right {
  min-width: 0;
  display: grid;
  grid-template-rows: 112px minmax(0, 1fr);
  gap: 12px;
}

.summary-area {
  display: grid;
  grid-template-columns: repeat(7, minmax(0, 1fr));
  gap: 10px;
}

.summary-card {
  position: relative;
  min-height: 112px;
  padding: 14px 12px;
  overflow: hidden;
}

.summary-icon {
  height: 26px;
  color: var(--wms-primary-strong);
  font-size: 24px;
}

.summary-card strong {
  display: block;
  margin-top: 10px;
  color: var(--wms-primary-strong);
  font-size: 20px;
  font-weight: 900;
}

.summary-card span {
  display: block;
  margin-top: 6px;
  color: var(--wms-text-muted);
  font-size: 12px;
  font-weight: 750;
}

.summary-card.region strong {
  padding-right: 14px;
  font-size: 16px;
}

.region-meter {
  position: absolute;
  right: 12px;
  top: 14px;
  width: 10px;
  height: 72px;
  overflow: hidden;
  border-radius: 999px;
  background: #d9f5df;
}

.region-meter i {
  position: absolute;
  left: 0;
  right: 0;
  bottom: 0;
  border-radius: inherit;
  background: linear-gradient(180deg, #7fd88e, #00851d);
}

.summary-card.region small {
  position: absolute;
  right: 12px;
  bottom: 10px;
  color: var(--wms-primary-strong);
  font-size: 11px;
  font-weight: 850;
}

.chart-card {
  padding: 20px;
}

.chart-card + .chart-card {
  margin-top: 18px;
}

.target-card {
  min-height: 0;
  padding: 16px 18px;
}

.chart-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  margin-bottom: 12px;
}

.chart-head h2 {
  margin: 0;
  color: var(--wms-text);
  font-size: 20px;
  font-weight: 850;
}

.target-card .chart-head h2 {
  font-size: 18px;
}

.target-pill {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  height: 34px;
  padding: 0 16px;
  border: 0;
  border-radius: 999px;
  background: var(--wms-primary-soft);
  color: var(--wms-primary-strong);
  cursor: pointer;
  font-weight: 850;
}

.echart {
  width: 100%;
}

.target-chart {
  height: 204px;
}

.wide-chart {
  height: 252px;
}

.finish-chart {
  height: 232px;
}

.trend-head {
  justify-content: flex-start;
}

.trend-head > span {
  color: var(--wms-text-muted);
  font-size: 13px;
  font-weight: 750;
}

.legend-list {
  display: grid;
  gap: 10px;
  margin-left: auto;
  color: var(--wms-text);
  font-size: 13px;
  font-weight: 750;
}

.legend-list span {
  display: inline-flex;
  align-items: center;
  gap: 12px;
}

.legend-list i {
  width: 30px;
  height: 5px;
  border-radius: 999px;
}

.legend-list .dark {
  background: #007a1d;
}

.legend-list .light {
  background: #59c464;
}

.board-note {
  margin: 20px 0 0 18px;
  color: var(--wms-text-muted);
  font-size: 13px;
}

@media (max-width: 1400px) {
  .board-top {
    grid-template-columns: 1fr;
  }

  .top-right {
    grid-template-rows: auto auto;
  }

  .summary-area {
    grid-template-columns: repeat(4, minmax(0, 1fr));
  }

  .target-chart {
    height: 240px;
  }
}

@media (max-width: 900px) {
  .summary-area {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .chart-head,
  .board-header {
    align-items: flex-start;
    flex-direction: column;
  }

  .legend-list {
    margin-left: 0;
  }
}
</style>
