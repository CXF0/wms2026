<template>
  <div class="dashboard-page">
    <a-tabs v-model:activeKey="activeTab" class="board-tabs">
      <a-tab-pane v-for="board in boards" :key="board.key" :tab="board.title" />
    </a-tabs>

    <PickingBoard v-if="activeTab === 'picking'" class="embedded-picking-board" />
    <TransportBoard v-else-if="activeTab === 'transport'" class="embedded-transport-board" />

    <template v-else>
    <section class="doc-hero">
      <div>
        <span class="eyebrow">Operation Overview</span>
        <h1>{{ currentBoard.title }}</h1>
        <p>{{ currentBoard.subtitle }}</p>
      </div>
      <a-date-picker
        v-model:value="dateValue"
        :allow-clear="false"
        format="YYYY-MM-DD"
        value-format="YYYY-MM-DD"
        class="date-picker"
      />
    </section>

    <!-- <a-tabs v-model:activeKey="activeTab" class="board-tabs">
      <a-tab-pane v-for="board in boards" :key="board.key" :tab="board.title" />
    </a-tabs> -->

    <section class="kpi-grid">
      <article v-for="metric in currentBoard.metrics" :key="metric.label" class="kpi-card" :class="metric.tone">
        <span>{{ metric.label }}</span>
        <strong>{{ metric.value }}</strong>
        <small>{{ metric.hint }}</small>
      </article>
    </section>

    <section class="dashboard-grid">
      <article class="panel ranking-panel">
        <div class="panel-head">
          <div>
            <h2>{{ currentBoard.issueTitle }}</h2>
            <p>按当场次统计，供应商影响履约问题。</p>
          </div>
          <div class="mini-switch">
            <button class="active" type="button">按供应商</button>
            <button type="button">按货位</button>
          </div>
        </div>

        <table class="ranking-table">
          <thead>
            <tr>
              <th>排名</th>
              <th>负责人</th>
              <th>类型</th>
              <th>数量</th>
              <th>货位</th>
              <th>供应商</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="item in currentBoard.issues" :key="item.rank">
              <td>{{ item.rank }}</td>
              <td>
                <span class="person">
                  <span class="avatar">{{ item.person.slice(0, 1) }}</span>
                  {{ item.person }}
                </span>
              </td>
              <td>{{ item.type }}</td>
              <td>{{ item.count }}</td>
              <td>{{ item.location }}</td>
              <td class="focus-text">{{ item.supplier }}</td>
            </tr>
          </tbody>
        </table>
      </article>

      <article class="panel task-panel">
        <div class="panel-head">
          <div>
            <h2>{{ currentBoard.taskTitle }}</h2>
            <p>{{ currentBoard.taskSub }}</p>
          </div>
        </div>

        <div class="task-body">
          <div class="donut-wrap">
            <div class="donut" :style="{ '--pct': currentBoard.task.percent }">
              <span>{{ currentBoard.task.percent }}%</span>
            </div>
            <div class="legend">
              <span v-for="item in currentBoard.task.legend" :key="item.name">
                <i :style="{ background: item.color }" />
                {{ item.name }} {{ item.value }}
              </span>
            </div>
          </div>

          <div class="task-progress">
            <div>
              <span>待处理</span>
              <strong>{{ currentBoard.task.pending }}</strong>
            </div>
            <div>
              <span>已完成</span>
              <strong>{{ currentBoard.task.done }}</strong>
            </div>
            <div class="line-progress">
              <span :style="{ width: currentBoard.task.percent + '%' }" />
            </div>
            <p>完成率 {{ currentBoard.task.percent }}%，较上一场 {{ currentBoard.task.delta }}</p>
          </div>
        </div>
      </article>

      <article class="panel recommend-panel">
        <div class="panel-head">
          <div>
            <h2>{{ currentBoard.recommendTitle }}</h2>
            <p>结合问题密度、处理进度和现场反馈生成。</p>
          </div>
        </div>

        <div class="recommend-metrics">
          <div v-for="item in currentBoard.recommendMetrics" :key="item.label">
            <strong>{{ item.value }}</strong>
            <span>{{ item.label }}</span>
          </div>
        </div>

        <div class="double-rank">
          <div>
            <h3>{{ currentBoard.leftRankTitle }}</h3>
            <ol>
              <li v-for="item in currentBoard.leftRank" :key="item.name">
                <span>{{ item.name }}</span>
                <strong>{{ item.value }}</strong>
              </li>
            </ol>
          </div>
          <div>
            <h3>{{ currentBoard.rightRankTitle }}</h3>
            <ol>
              <li v-for="item in currentBoard.rightRank" :key="item.name">
                <span>{{ item.name }}</span>
                <strong>{{ item.value }}</strong>
              </li>
            </ol>
          </div>
        </div>
      </article>

      <article class="panel replenish-panel">
        <div class="panel-head">
          <div>
            <h2>{{ currentBoard.supplyTitle }}</h2>
            <p>{{ currentBoard.supplySub }}</p>
          </div>
        </div>

        <div class="supply-body">
          <div class="supply-total">
            <span>{{ currentBoard.supplyTotal.label }}</span>
            <strong>{{ currentBoard.supplyTotal.value }}</strong>
            <small>{{ currentBoard.supplyTotal.rate }}</small>
          </div>
          <div class="area-grid">
            <div v-for="area in currentBoard.areas" :key="area.name">
              <span>{{ area.name }}</span>
              <small>{{ area.rate }}</small>
              <strong>{{ area.value }}</strong>
              <em>{{ area.label }}</em>
            </div>
          </div>
        </div>
      </article>

      <article class="panel bar-panel">
        <div class="panel-head">
          <div>
            <h2>{{ currentBoard.barTitle }}</h2>
            <p>按处理量排序展示前 8 项。</p>
          </div>
        </div>

        <div class="bar-list">
          <div v-for="item in currentBoard.bars" :key="item.name" class="bar-row">
            <span>{{ item.name }}</span>
            <div>
              <i :style="{ width: item.percent + '%' }" />
            </div>
            <strong>{{ item.value }}</strong>
          </div>
        </div>
      </article>
    </section>
    </template>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import dayjs from 'dayjs'
import PickingBoard from './picking.vue'
import TransportBoard from './transport.vue'

type BoardKey = 'inspection' | 'picking' | 'packing' | 'transport'
type Tone = 'green' | 'dark' | 'warn' | 'plain'

interface BoardMetric {
  label: string
  value: string
  hint: string
  tone: Tone
}

interface RankItem {
  name: string
  value: string
}

interface IssueItem {
  rank: number
  person: string
  type: string
  count: number
  location: number
  supplier: number
}

interface BoardData {
  key: BoardKey
  title: string
  subtitle: string
  metrics: BoardMetric[]
  issueTitle: string
  taskTitle: string
  taskSub: string
  recommendTitle: string
  supplyTitle: string
  supplySub: string
  leftRankTitle: string
  rightRankTitle: string
  barTitle: string
  issues: IssueItem[]
  task: {
    percent: number
    pending: string
    done: string
    delta: string
    legend: Array<{ name: string; value: string; color: string }>
  }
  recommendMetrics: Array<{ label: string; value: string }>
  leftRank: RankItem[]
  rightRank: RankItem[]
  supplyTotal: { label: string; value: string; rate: string }
  areas: Array<{ name: string; value: string; rate: string; label: string }>
  bars: Array<RankItem & { percent: number }>
}

const activeTab = ref<BoardKey>('inspection')
const dateValue = ref(dayjs().format('YYYY-MM-DD'))

const issues: IssueItem[] = [
  { rank: 1, person: '张三', type: '退货', count: 253, location: 36, supplier: 23 },
  { rank: 2, person: '李四', type: '缺货', count: 164, location: 5, supplier: 15 },
  { rank: 3, person: '王二', type: '降级', count: 57, location: 9, supplier: 7 },
  { rank: 4, person: '陈六', type: '换货', count: 171, location: 1, supplier: 4 },
  { rank: 5, person: '花广鸽', type: '退货转到场', count: 50, location: 1, supplier: 2 },
  { rank: 6, person: '赵七', type: '退货', count: 132, location: 18, supplier: 11 },
]

const bars = [
  { name: '卡罗拉', value: '136 扎', percent: 100 },
  { name: '高原红', value: '112 扎', percent: 82 },
  { name: '自由', value: '96 扎', percent: 70 },
  { name: '蜜桃雪山', value: '91 扎', percent: 66 },
  { name: '粉红雪山', value: '85 扎', percent: 62 },
  { name: '粉荔枝', value: '77 扎', percent: 56 },
  { name: '坦尼克', value: '68 扎', percent: 49 },
  { name: '骄傲', value: '31 扎', percent: 24 },
]

const boards: BoardData[] = [
  {
    key: 'inspection',
    title: '质检看板',
    subtitle: '跟踪问题扎数、质检任务下发、补货情况与花材推荐，快速定位现场瓶颈。',
    metrics: [
      { label: '场次出勤质检', value: '53 人', hint: '根据场次系统操作记录', tone: 'green' },
      { label: '问题扎数合计', value: '1119 扎', hint: '质检标记的问题扎数', tone: 'plain' },
      { label: '降级', value: '353 扎', hint: '等级不符', tone: 'plain' },
      { label: '缺货', value: '593 扎', hint: '含缺货补货', tone: 'warn' },
      { label: '退货', value: '160 扎', hint: '含退货补货', tone: 'plain' },
      { label: '换货', value: '353 扎', hint: '斗南基地换货', tone: 'plain' },
      { label: '问题货位数', value: '193 个', hint: '全场汇总', tone: 'dark' },
      { label: '问题供应商', value: '160 家', hint: '全场汇总', tone: 'dark' },
    ],
    issueTitle: '发现问题排行',
    taskTitle: '质检任务下发与执行',
    taskSub: '任务量、完成率和品类结构',
    recommendTitle: '花材推荐',
    supplyTitle: '补货情况',
    supplySub: '按分区统计实补与需补',
    leftRankTitle: '推荐排行（货位）',
    rightRankTitle: '推荐排行（供应商）',
    barTitle: '补货品种排行',
    issues,
    task: {
      percent: 57,
      pending: '215',
      done: '117',
      delta: '+20.25%',
      legend: [
        { name: '大客户', value: '48.2%', color: '#18181b' },
        { name: '新客户', value: '31.6%', color: '#10b981' },
        { name: '重点品', value: '12.0%', color: '#86efac' },
        { name: '风险品', value: '8.2%', color: '#a1a1aa' },
      ],
    },
    recommendMetrics: [
      { label: '换货推荐', value: '60 次' },
      { label: '当前场次推荐', value: '49 次' },
      { label: '上线推荐', value: '110 次' },
      { label: '推荐供应商', value: '99 家' },
    ],
    leftRank: [
      { name: '张三', value: '136 扎' },
      { name: '李四', value: '112 扎' },
      { name: '王二', value: '96 扎' },
      { name: '陈六', value: '91 扎' },
      { name: '花广鸽', value: '85 扎' },
    ],
    rightRank: [
      { name: '陈浩', value: '77 扎' },
      { name: '郑君子', value: '68 扎' },
      { name: '张杰', value: '31 扎' },
      { name: '刘倩', value: '29 扎' },
      { name: '杨洋', value: '21 扎' },
    ],
    supplyTotal: { label: '全场实补 / 需补', value: '528 / 540', rate: '99.56%' },
    areas: [
      { name: '一区', value: '132 / 135', rate: '99.56%', label: '实补 / 需补' },
      { name: '二区', value: '132 / 135', rate: '99.56%', label: '实补 / 需补' },
      { name: '三区', value: '132 / 135', rate: '99.56%', label: '实补 / 需补' },
      { name: '四区', value: '132 / 135', rate: '99.56%', label: '实补 / 需补' },
    ],
    bars,
  },
  {
    key: 'picking',
    title: '配货看板',
    subtitle: '聚焦可配货量、货位完成率、异常卡点与人员处理效率。',
    metrics: [
      { label: '待配货', value: '1860 扎', hint: '待进入货位', tone: 'green' },
      { label: '已配货', value: '4210 扎', hint: '现场完成', tone: 'plain' },
      { label: '配货完成率', value: '69%', hint: '较上一场 +8%', tone: 'plain' },
      { label: '代配订单', value: '126 单', hint: '需复核', tone: 'warn' },
      { label: '异常货位', value: '42 个', hint: '需处理', tone: 'dark' },
      { label: '在线配货员', value: '88 人', hint: '分 6 组', tone: 'plain' },
      { label: '平均效率', value: '47 扎/时', hint: '人均', tone: 'plain' },
      { label: '超时任务', value: '18 个', hint: '重点跟进', tone: 'dark' },
    ],
    issueTitle: '配货异常排行',
    taskTitle: '配货任务执行',
    taskSub: '按任务池统计待处理与完成量',
    recommendTitle: '配货调度建议',
    supplyTitle: '分区完成情况',
    supplySub: '按区域统计已配与待配',
    leftRankTitle: '人员效率排行',
    rightRankTitle: '货位压力排行',
    barTitle: '品种配货量排行',
    issues,
    task: {
      percent: 69,
      pending: '642 扎',
      done: '1398 扎',
      delta: '+8.10%',
      legend: [
        { name: '常规单', value: '62%', color: '#10b981' },
        { name: '急单', value: '21%', color: '#18181b' },
        { name: '代配', value: '11%', color: '#86efac' },
        { name: '异常', value: '6%', color: '#a1a1aa' },
      ],
    },
    recommendMetrics: [
      { label: '调度建议', value: '34 条' },
      { label: '待复核', value: '18 单' },
      { label: '高压货位', value: '12 个' },
      { label: '可调人员', value: '9 人' },
    ],
    leftRank: [
      { name: '一组', value: '846 扎' },
      { name: '三组', value: '792 扎' },
      { name: '二组', value: '733 扎' },
      { name: '五组', value: '690 扎' },
      { name: '四组', value: '612 扎' },
    ],
    rightRank: [
      { name: 'A-12', value: '93 扎' },
      { name: 'B-07', value: '76 扎' },
      { name: 'C-03', value: '62 扎' },
      { name: 'D-11', value: '44 扎' },
      { name: 'E-09', value: '28 扎' },
    ],
    supplyTotal: { label: '已配 / 应配', value: '4210 / 6070', rate: '69.36%' },
    areas: [
      { name: '一区', value: '1180 / 1520', rate: '77.63%', label: '已配 / 应配' },
      { name: '二区', value: '960 / 1510', rate: '63.58%', label: '已配 / 应配' },
      { name: '三区', value: '1128 / 1540', rate: '73.25%', label: '已配 / 应配' },
      { name: '四区', value: '942 / 1500', rate: '62.80%', label: '已配 / 应配' },
    ],
    bars,
  },
  {
    key: 'packing',
    title: '打包发货看板',
    subtitle: '跟踪打包、面单、复核、交接和发货节奏。',
    metrics: [
      { label: '待打包', value: '742 箱', hint: '含待复核', tone: 'warn' },
      { label: '已打包', value: '2318 箱', hint: '今日完成', tone: 'green' },
      { label: '面单打印', value: '1986 张', hint: '自动同步', tone: 'plain' },
      { label: '待发货', value: '528 单', hint: '需交接物流', tone: 'warn' },
      { label: '已发货', value: '1650 单', hint: '完成交接', tone: 'plain' },
      { label: '异常包裹', value: '21 个', hint: '需拦截', tone: 'dark' },
      { label: '在线打包员', value: '46 人', hint: '分 4 组', tone: 'plain' },
      { label: '准时率', value: '94%', hint: '较昨日 +3%', tone: 'plain' },
    ],
    issueTitle: '打包异常排行',
    taskTitle: '打包发货执行',
    taskSub: '按包裹状态统计流转效率',
    recommendTitle: '发货节奏建议',
    supplyTitle: '交接情况',
    supplySub: '按班次统计交接进度',
    leftRankTitle: '班组效率排行',
    rightRankTitle: '物流承运排行',
    barTitle: '包裹品类排行',
    issues,
    task: {
      percent: 76,
      pending: '528 单',
      done: '1650 单',
      delta: '+6.40%',
      legend: [
        { name: '已发货', value: '76%', color: '#10b981' },
        { name: '待交接', value: '17%', color: '#18181b' },
        { name: '复核中', value: '5%', color: '#86efac' },
        { name: '异常', value: '2%', color: '#a1a1aa' },
      ],
    },
    recommendMetrics: [
      { label: '加急发货', value: '29 单' },
      { label: '需复核', value: '31 箱' },
      { label: '待交接', value: '18 批' },
      { label: '异常处理', value: '7 条' },
    ],
    leftRank: [
      { name: '打包一组', value: '602 箱' },
      { name: '打包三组', value: '558 箱' },
      { name: '打包二组', value: '531 箱' },
      { name: '打包四组', value: '488 箱' },
      { name: '复核组', value: '312 箱' },
    ],
    rightRank: [
      { name: '顺丰', value: '688 单' },
      { name: '京东', value: '446 单' },
      { name: '德邦', value: '282 单' },
      { name: '同城', value: '204 单' },
      { name: '自提', value: '30 单' },
    ],
    supplyTotal: { label: '已交接 / 应交接', value: '1650 / 2178', rate: '75.76%' },
    areas: [
      { name: '早班', value: '520 / 580', rate: '89.66%', label: '已交接 / 应交接' },
      { name: '中班', value: '612 / 780', rate: '78.46%', label: '已交接 / 应交接' },
      { name: '晚班', value: '418 / 620', rate: '67.42%', label: '已交接 / 应交接' },
      { name: '夜班', value: '100 / 198', rate: '50.51%', label: '已交接 / 应交接' },
    ],
    bars,
  },
  {
    key: 'transport',
    title: '集货运输看板',
    subtitle: '跟踪入场、集货、装车、发车与卸货全过程。',
    metrics: [
      { label: '待集货', value: '920 扎', hint: '基地未发车', tone: 'warn' },
      { label: '已集货', value: '3140 扎', hint: '在场可分拣', tone: 'green' },
      { label: '在途车辆', value: '18 车', hint: '含 3 车延误', tone: 'dark' },
      { label: '待卸货', value: '9 车', hint: '到场排队', tone: 'warn' },
      { label: '已卸货', value: '41 车', hint: '完成入库', tone: 'plain' },
      { label: '异常线路', value: '6 条', hint: '需调度', tone: 'dark' },
      { label: '准点率', value: '91%', hint: '较昨日 +2%', tone: 'plain' },
      { label: '平均等待', value: '18 分钟', hint: '卸货口', tone: 'plain' },
    ],
    issueTitle: '运输异常排行',
    taskTitle: '集货运输执行',
    taskSub: '按线路和车辆统计进度',
    recommendTitle: '运输调度建议',
    supplyTitle: '线路到场情况',
    supplySub: '按线路统计到场与卸货',
    leftRankTitle: '线路效率排行',
    rightRankTitle: '供应商到场排行',
    barTitle: '线路货量排行',
    issues,
    task: {
      percent: 82,
      pending: '9 车',
      done: '41 车',
      delta: '+2.80%',
      legend: [
        { name: '已卸货', value: '82%', color: '#10b981' },
        { name: '待卸货', value: '10%', color: '#18181b' },
        { name: '在途', value: '6%', color: '#86efac' },
        { name: '延误', value: '2%', color: '#a1a1aa' },
      ],
    },
    recommendMetrics: [
      { label: '调度建议', value: '16 条' },
      { label: '延误车辆', value: '3 车' },
      { label: '拥堵线路', value: '4 条' },
      { label: '可用卸货口', value: '7 个' },
    ],
    leftRank: [
      { name: '昆明线', value: '1260 扎' },
      { name: '斗南线', value: '980 扎' },
      { name: '呈贡线', value: '770 扎' },
      { name: '晋宁线', value: '621 扎' },
      { name: '宜良线', value: '429 扎' },
    ],
    rightRank: [
      { name: '陈浩', value: '410 扎' },
      { name: '郑君子', value: '388 扎' },
      { name: '张杰', value: '331 扎' },
      { name: '刘倩', value: '296 扎' },
      { name: '杨洋', value: '214 扎' },
    ],
    supplyTotal: { label: '已卸 / 应卸', value: '41 / 50', rate: '82.00%' },
    areas: [
      { name: '南线', value: '12 / 14', rate: '85.71%', label: '已卸 / 应卸' },
      { name: '北线', value: '9 / 12', rate: '75.00%', label: '已卸 / 应卸' },
      { name: '东线', value: '11 / 13', rate: '84.62%', label: '已卸 / 应卸' },
      { name: '西线', value: '9 / 11', rate: '81.82%', label: '已卸 / 应卸' },
    ],
    bars,
  },
]

const currentBoard = computed(() => boards.find((item) => item.key === activeTab.value) ?? boards[0])
</script>

<style scoped>
.dashboard-page {
  min-height: 100%;
}

.doc-hero {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 20px;
  margin-bottom: 22px;
  padding: 10px 0 10px;
  border-bottom: 1px solid var(--wms-line);
  background:
    linear-gradient(rgba(16, 185, 129, 0.08) 1px, transparent 1px),
    linear-gradient(90deg, rgba(16, 185, 129, 0.08) 1px, transparent 1px);
  background-size: 96px 96px;
}

.eyebrow {
  color: var(--wms-primary-strong);
  font-size: 16px;
  font-weight: 800;
}

.doc-hero h1 {
  margin: 14px 0 0;
  color: var(--wms-text);
  font-size: 30px;
  font-weight: 850;
  letter-spacing: 0;
}

.doc-hero p {
  max-width: 760px;
  margin: 12px 0 0;
  color: var(--wms-text-muted);
  font-size: 17px;
  line-height: 1.8;
}

.date-picker {
  width: 148px;
}

.board-tabs {
  margin-bottom: 18px;
}

.board-tabs :deep(.ant-tabs-nav) {
  margin: 0;
}

.board-tabs :deep(.ant-tabs-nav::before) {
  border-color: var(--wms-line);
}

.board-tabs :deep(.ant-tabs-tab) {
  color: var(--wms-text-muted);
  font-weight: 750;
}

.board-tabs :deep(.ant-tabs-tab-active .ant-tabs-tab-btn) {
  color: var(--wms-text) !important;
}

.board-tabs :deep(.ant-tabs-ink-bar) {
  background: var(--wms-primary);
}

.kpi-grid {
  display: grid;
  grid-template-columns: repeat(8, minmax(0, 1fr));
  gap: 12px;
  margin-bottom: 18px;
}

.kpi-card {
  min-height: 108px;
  padding: 16px;
  border: 1px solid var(--wms-line);
  border-radius: 16px;
  background: #fff;
  box-shadow: var(--wms-shadow-xs);
}

.kpi-card.green {
  background: linear-gradient(135deg, rgba(16, 185, 129, 0.12), #fff 54%);
}

.kpi-card.dark {
  background: linear-gradient(135deg, rgba(24, 24, 27, 0.08), #fff 58%);
}

.kpi-card.warn {
  background: linear-gradient(135deg, rgba(245, 158, 11, 0.12), #fff 58%);
}

.kpi-card span,
.kpi-card small {
  display: block;
  color: var(--wms-text-muted);
  font-size: 12px;
}

.kpi-card strong {
  display: block;
  margin: 9px 0 5px;
  color: var(--wms-text);
  font-size: 24px;
  font-weight: 850;
  line-height: 1;
}

.kpi-card.green strong {
  color: var(--wms-primary-strong);
}

.dashboard-grid {
  display: grid;
  grid-template-columns: minmax(460px, 1.18fr) minmax(360px, 1fr) minmax(380px, 0.96fr);
  gap: 16px;
}

.panel {
  min-width: 0;
  padding: 20px;
  border: 1px solid var(--wms-line);
  border-radius: 18px;
  background: #fff;
  box-shadow: var(--wms-shadow-xs);
}

.ranking-panel {
  grid-row: span 2;
}

.panel-head {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 14px;
  margin-bottom: 16px;
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
  font-size: 12.5px;
}

.mini-switch {
  display: flex;
  padding: 3px;
  border: 1px solid var(--wms-line);
  border-radius: 999px;
  background: #fafafa;
}

.mini-switch button {
  height: 28px;
  padding: 0 12px;
  border: 0;
  border-radius: 999px;
  background: transparent;
  color: var(--wms-text-muted);
  cursor: pointer;
  font-size: 12px;
  font-weight: 750;
}

.mini-switch .active {
  background: #fff;
  color: var(--wms-text);
  box-shadow: var(--wms-shadow-xs);
}

.ranking-table {
  width: 100%;
  border-collapse: collapse;
}

.ranking-table th,
.ranking-table td {
  padding: 12px 8px;
  border-bottom: 1px solid var(--wms-line);
  color: var(--wms-text);
  font-size: 12.5px;
  text-align: left;
  white-space: nowrap;
}

.ranking-table th {
  color: var(--wms-text-muted);
  font-weight: 800;
}

.person {
  display: inline-flex;
  align-items: center;
  gap: 8px;
}

.avatar {
  width: 24px;
  height: 24px;
  display: grid;
  place-items: center;
  border-radius: 999px;
  background: var(--wms-primary-soft);
  color: var(--wms-primary-strong);
  font-size: 12px;
  font-weight: 850;
}

.focus-text {
  color: var(--wms-primary-strong) !important;
  font-weight: 850;
}

.task-body {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 18px;
  align-items: center;
}

.donut-wrap {
  display: flex;
  align-items: center;
  gap: 16px;
}

.donut {
  --pct: 0;
  width: 112px;
  height: 112px;
  display: grid;
  place-items: center;
  flex-shrink: 0;
  border-radius: 999px;
  background:
    radial-gradient(circle closest-side, #fff 67%, transparent 68%),
    conic-gradient(var(--wms-primary) calc(var(--pct) * 1%), #e5e7eb 0);
}

.donut span {
  color: var(--wms-text);
  font-size: 18px;
  font-weight: 850;
}

.legend {
  display: grid;
  gap: 8px;
}

.legend span {
  display: flex;
  align-items: center;
  gap: 7px;
  color: var(--wms-text-muted);
  font-size: 12px;
}

.legend i {
  width: 8px;
  height: 8px;
  border-radius: 999px;
}

.task-progress {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
}

.task-progress > div:not(.line-progress) {
  padding: 14px;
  border: 1px solid var(--wms-line);
  border-radius: 14px;
  background: #fafafa;
}

.task-progress span {
  display: block;
  color: var(--wms-text-muted);
  font-size: 12px;
}

.task-progress strong {
  display: block;
  margin-top: 7px;
  color: var(--wms-text);
  font-size: 25px;
  font-weight: 850;
}

.line-progress {
  grid-column: span 2;
  height: 12px;
  overflow: hidden;
  border-radius: 999px;
  background: #e5e7eb;
}

.line-progress span {
  height: 100%;
  border-radius: inherit;
  background: linear-gradient(90deg, var(--wms-primary), #18181b);
}

.task-progress p {
  grid-column: span 2;
}

.recommend-metrics {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 8px;
  padding-bottom: 16px;
  margin-bottom: 16px;
  border-bottom: 1px solid var(--wms-line);
}

.recommend-metrics strong,
.recommend-metrics span {
  display: block;
}

.recommend-metrics strong {
  color: var(--wms-primary-strong);
  font-size: 20px;
  font-weight: 850;
}

.recommend-metrics span {
  margin-top: 3px;
  color: var(--wms-text-muted);
  font-size: 11px;
}

.double-rank {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 18px;
}

.double-rank h3 {
  margin: 0 0 10px;
  color: var(--wms-text);
  font-size: 14px;
  font-weight: 850;
}

ol {
  padding: 0;
  margin: 0;
  list-style: none;
}

li {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  padding: 8px 0;
  color: var(--wms-text-muted);
  font-size: 12.5px;
}

li strong {
  color: var(--wms-text);
}

.supply-body {
  display: grid;
  grid-template-columns: 0.85fr 1.15fr;
  gap: 20px;
  align-items: center;
}

.supply-total {
  padding-right: 20px;
  border-right: 1px solid var(--wms-line);
}

.supply-total span,
.supply-total small {
  display: block;
  color: var(--wms-text-muted);
}

.supply-total strong {
  display: block;
  margin: 10px 0 4px;
  color: var(--wms-text);
  font-size: 31px;
  font-weight: 850;
}

.area-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 12px;
}

.area-grid div {
  padding: 14px;
  border: 1px solid var(--wms-line);
  border-radius: 14px;
  background: #fafafa;
}

.area-grid span,
.area-grid small,
.area-grid strong,
.area-grid em {
  display: block;
}

.area-grid span,
.area-grid small,
.area-grid em {
  color: var(--wms-text-muted);
  font-size: 11px;
  font-style: normal;
}

.area-grid strong {
  margin: 8px 0 3px;
  color: var(--wms-text);
  font-size: 16px;
  font-weight: 600;
}

.bar-list {
  display: grid;
  gap: 12px;
}

.bar-row {
  display: grid;
  grid-template-columns: 92px 1fr 52px;
  gap: 12px;
  align-items: center;
  color: var(--wms-text-muted);
  font-size: 12.5px;
}

.bar-row > div {
  height: 9px;
  overflow: hidden;
  border-radius: 999px;
  background: #e5e7eb;
}

.bar-row i {
  display: block;
  height: 100%;
  border-radius: inherit;
  background: linear-gradient(90deg, var(--wms-primary), #18181b);
}

.bar-row strong {
  color: var(--wms-text);
  text-align: right;
}
</style>
