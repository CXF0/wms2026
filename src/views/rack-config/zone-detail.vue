<template>
  <div class="zone-detail-page">
    <!-- 顶部导航栏 -->
    <div class="detail-header">
      <button class="back-btn" @click="router.back()">
        <LeftOutlined />
        <span>返回</span>
      </button>
      <div class="header-center">
        <h2 class="header-title">{{ zoneName }} · 货位详情</h2>
        <div class="header-summary" v-if="zoneInfo">
          <span class="summary-item need">
            <span class="dot"></span>可配货 {{ zoneInfo.need }}
          </span>
          <span class="summary-item done">
            <span class="dot"></span>配货完成 {{ zoneInfo.prepared }}
          </span>
        </div>
      </div>
      <div class="header-right">
        <a-segmented
          v-model:value="filterType"
          :options="[
            { label: '全部', value: -1 },
            { label: '可配货', value: 0 },
            { label: '已完成', value: 1 },
          ]"
          size="small"
          @change="fetchZoneInfo"
        />
        <a-date-picker
          v-model:value="dateVal"
          size="small"
          style="width:130px"
          :allow-clear="false"
          format="YYYY-MM-DD"
          value-format="YYYY-MM-DD"
          @change="fetchZoneInfo"
        />
      </div>
    </div>

    <!-- 货架卡片区域 -->
    <div class="detail-content">
      <a-spin :spinning="loadingInfo" tip="加载中...">
        <div v-if="!loadingInfo && shelfList.length === 0" class="empty-wrap">
          <a-empty description="暂无货位数据" />
        </div>

        <div v-else class="shelf-grid">
          <div
            v-for="shelf in shelfList"
            :key="shelf.zoneShelf + shelf.shelfSn"
            class="shelf-card"
            :class="{ 'is-done': shelf.status === 1, 'is-picking': shelf.status === 0 }"
            @click="openItemDrawer(shelf)"
          >
            <!-- 状态角标 -->
            <span class="shelf-status-tag" :class="shelf.status === 1 ? 'tag-done' : 'tag-picking'">
              {{ shelf.status === 1 ? '配货完成' : '配货中' }}
            </span>

            <div class="shelf-zone-label">{{ shelf.zoneShelf }}</div>
            <div class="shelf-sn">
              <span class="sn-number">#{{ shelf.shelfSn }}</span>
              <span v-if="shelf.subShelfSn" class="sub-sn">{{ shelf.subShelfSn }}</span>
            </div>

            <div class="shelf-segment" v-if="shelf.segmentArea">
              <TagOutlined style="font-size:11px;" />
              {{ shelf.segmentArea }}{{ shelf.segmentName ? ' · ' + shelf.segmentName : '' }}
            </div>

            <!-- 进度条 -->
            <div class="shelf-progress-wrap">
              <div class="progress-bar">
                <div
                  class="progress-fill"
                  :style="{ width: Math.min(Math.round((shelf.progress ?? 0) * 100), 100) + '%' }"
                  :class="shelf.status === 1 ? 'fill-done' : 'fill-picking'"
                ></div>
              </div>
              <span class="progress-text">
                {{ shelf.prepared }}/{{ shelf.total }}
              </span>
            </div>

            <!-- 底部标签 -->
            <div class="shelf-tags">
              <span v-if="shelf.deliveryType === 1" class="mini-tag logistics">物流</span>
              <span v-if="shelf.deliveryType === 2" class="mini-tag pickup">自提</span>
              <span v-if="shelf.limitDistribution" class="mini-tag limit">限制</span>
              <span v-if="shelf.notRestock" class="mini-tag no-restock">不补货 {{ shelf.notRestock }}</span>
            </div>

            <div class="shelf-click-hint">点击查看商品 <RightOutlined /></div>
          </div>
        </div>
      </a-spin>
    </div>

    <!-- 货位商品抽屉 -->
    <a-drawer
      v-model:open="drawerOpen"
      :title="drawerTitle"
      placement="right"
      :width="560"
      :body-style="{ padding: '0', background: '#f5f6fa' }"
      @close="drawerOpen = false"
    >
      <template #extra>
        <a-tag color="blue">货架 {{ activeShelf?.zoneShelf }}</a-tag>
      </template>

      <div class="drawer-body">
        <a-spin :spinning="loadingItems" tip="加载商品...">
          <!-- 汇总 -->
          <div v-if="!loadingItems && itemList.length > 0" class="item-summary-row">
            <div class="summary-stat">
              <div class="stat-num">{{ itemList.length }}</div>
              <div class="stat-label">商品种数</div>
            </div>
            <div class="summary-stat">
              <div class="stat-num">{{ totalItemNum }}</div>
              <div class="stat-label">总数量</div>
            </div>
            <div class="summary-stat">
              <div class="stat-num">{{ preparedCount }}</div>
              <div class="stat-label">已配货</div>
            </div>
            <div class="summary-stat">
              <div class="stat-num text-warn">{{ qualifyIssueCount }}</div>
              <div class="stat-label">质检异常</div>
            </div>
          </div>

          <div v-if="!loadingItems && itemList.length === 0" class="empty-wrap" style="padding:60px 0;">
            <a-empty description="暂无商品数据" />
          </div>

          <div v-else class="item-list">
            <div
              v-for="item in itemList"
              :key="item.id"
              class="item-card"
              :class="{ 'item-qualify-issue': item.isQualify === 10 }"
            >
              <!-- 顶部：商品名 + 质检状态 -->
              <div class="item-card-head">
                <div class="item-name-wrap">
                  <span class="item-name">{{ item.productName || '未知商品' }}</span>
                  <span v-if="item.maturity" class="item-maturity">{{ item.maturity }}</span>
                </div>
                <a-tag :color="qualifyColor(item.isQualify)" size="small">
                  {{ qualifyLabel(item.isQualify) }}
                </a-tag>
              </div>

              <!-- 中部：数量信息 -->
              <div class="item-numbers">
                <div class="num-item">
                  <span class="num-val">{{ item.itemNum }}</span>
                  <span class="num-label">总数</span>
                </div>
                <div class="num-item">
                  <span class="num-val">{{ item.prepareItemNum }}</span>
                  <span class="num-label">已配</span>
                </div>
                <div class="num-item" v-if="item.lackItemNum">
                  <span class="num-val text-warn">{{ item.lackItemNum }}</span>
                  <span class="num-label">缺货</span>
                </div>
                <div class="num-item" v-if="item.refundNum">
                  <span class="num-val text-danger">{{ item.refundNum }}</span>
                  <span class="num-label">退货</span>
                </div>
                <div class="num-item" v-if="item.lowerRankNum">
                  <span class="num-val text-orange">{{ item.lowerRankNum }}</span>
                  <span class="num-label">降级</span>
                </div>
              </div>

              <!-- 供应商 & 用户 -->
              <div class="item-meta">
                <div class="meta-row" v-if="item.enterVo?.supplierName">
                  <ShopOutlined />
                  <span>{{ item.enterVo.supplierName }}</span>
                  <span v-if="item.enterVo.supplierTag" class="supplier-tag">{{ item.enterVo.supplierTag }}</span>
                </div>
                <div class="meta-row" v-if="item.purchaserInfoVo?.nickName">
                  <UserOutlined />
                  <span>{{ item.purchaserInfoVo.nickName }}</span>
                  <span class="meta-phone">{{ item.purchaserInfoVo.phone }}</span>
                </div>
                <div class="meta-row" v-if="item.prepareUserName">
                  <CheckCircleOutlined />
                  <span>配货人：{{ item.prepareUserName }}</span>
                </div>
              </div>

              <!-- 底部标签行 -->
              <div class="item-foot">
                <span v-if="item.orderSn" class="order-sn">单号：{{ item.orderSn }}</span>
                <div class="item-mini-tags">
                  <span v-if="item.distributionFinish === 1" class="mini-tag done-tag">配货完成</span>
                  <span v-if="item.limitDistributionFlag" class="mini-tag limit">限制配货</span>
                  <span v-if="item.matchReplaceFlag" class="mini-tag replace">代配</span>
                  <span v-if="item.nightFlag" class="mini-tag night">晚场</span>
                  <span v-if="item.focusFlag" class="mini-tag focus">重点关注</span>
                </div>
              </div>

              <!-- 质检汇总（有异常时） -->
              <div v-if="hasQualifyIssue(item)" class="qualify-summary">
                <div class="qs-title">质检汇总</div>
                <div class="qs-items">
                  <span v-if="item.checkSumNumVo?.lowLevel" class="qs-item">降级 {{ item.checkSumNumVo.lowLevel }}</span>
                  <span v-if="item.checkSumNumVo?.lackRestock" class="qs-item">缺货补货 {{ item.checkSumNumVo.lackRestock }}</span>
                  <span v-if="item.checkSumNumVo?.lackNoRestock" class="qs-item">缺货不补 {{ item.checkSumNumVo.lackNoRestock }}</span>
                  <span v-if="item.checkSumNumVo?.refundRestock" class="qs-item">退货补货 {{ item.checkSumNumVo.refundRestock }}</span>
                  <span v-if="item.checkSumNumVo?.refundNoRestock" class="qs-item">退货不补 {{ item.checkSumNumVo.refundNoRestock }}</span>
                  <span v-if="item.checkSumNumVo?.changeNum" class="qs-item">换货 {{ item.checkSumNumVo.changeNum }}</span>
                </div>
              </div>
            </div>
          </div>
        </a-spin>
      </div>
    </a-drawer>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import dayjs, { type Dayjs } from 'dayjs'
import {
  LeftOutlined, TagOutlined, RightOutlined,
  ShopOutlined, UserOutlined, CheckCircleOutlined,
} from '@ant-design/icons-vue'
import { wmsZoneApi, type ShelfSnStatus, type ZoneItemInfo, type PrepareShelfSnVo } from '@/api/wmsZone'

const route  = useRoute()
const router = useRouter()

const zoneName   = computed(() => (route.query.zone as string) || '未知区')
const filterType = ref<number>(-1)
const dateVal    = ref<string>(dayjs().format('YYYY-MM-DD'))

const loadingInfo = ref(false)
const zoneInfo    = ref<PrepareShelfSnVo | null>(null)
const shelfList   = computed<ShelfSnStatus[]>(() => zoneInfo.value?.shelfSnList ?? [])

async function fetchZoneInfo() {
  loadingInfo.value = true
  try {
    zoneInfo.value = await wmsZoneApi.getZoneInfo({
      zone:      zoneName.value,
      zoneShelf: '',
      type:      filterType.value,
      date:      dateVal.value,
    })
  } catch {
    // 错误已由 http 拦截器统一 toast
  } finally {
    loadingInfo.value = false
  }
}

// ── 抽屉 ────────────────────────────────────────────────────
const drawerOpen   = ref(false)
const loadingItems = ref(false)
const itemList     = ref<ZoneItemInfo[]>([])
const activeShelf  = ref<ShelfSnStatus | null>(null)

const drawerTitle = computed(() =>
  activeShelf.value
    ? `${activeShelf.value.zoneShelf} · #${activeShelf.value.shelfSn} 商品列表`
    : '商品列表'
)

const totalItemNum    = computed(() => itemList.value.reduce((s, i) => s + (i.itemNum ?? 0), 0))
const preparedCount   = computed(() => itemList.value.reduce((s, i) => s + (i.prepareItemNum ?? 0), 0))
const qualifyIssueCount = computed(() => itemList.value.filter(i => i.isQualify === 10).length)

async function openItemDrawer(shelf: ShelfSnStatus) {
  activeShelf.value  = shelf
  drawerOpen.value   = true
  loadingItems.value = true
  itemList.value     = []
  try {
    itemList.value = await wmsZoneApi.getZoneItemInfo({
      orderNum:    shelf.shelfSn,
      subShelfSn:  shelf.subShelfSn || undefined,
      date:        dateVal.value,
    })
  } catch {
    // 统一处理
  } finally {
    loadingItems.value = false
  }
}

function qualifyLabel(v: number) {
  const map: Record<number, string> = { 0: '未检测', 1: '合格', 10: '不合格', 20: '缺货打包' }
  return map[v] ?? '未知'
}
function qualifyColor(v: number) {
  const map: Record<number, string> = { 0: 'default', 1: 'green', 10: 'red', 20: 'orange' }
  return map[v] ?? 'default'
}
function hasQualifyIssue(item: ZoneItemInfo) {
  const s = item.checkSumNumVo
  if (!s) return false
  return (s.lowLevel || s.lackRestock || s.lackNoRestock || s.refundRestock || s.refundNoRestock || s.changeNum)
}

onMounted(fetchZoneInfo)
</script>

<style scoped>
/* ─── 页面整体 ─────────────────────────────────────────────── */
.zone-detail-page {
  min-height: 100vh;
  background: #f5f6fa;
  display: flex;
  flex-direction: column;
}

/* ─── 顶部导航 ─────────────────────────────────────────────── */
.detail-header {
  position: sticky;
  top: 0;
  z-index: 100;
  background: #fff;
  border-bottom: 1.5px solid #ebedf2;
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 12px 24px;
  box-shadow: 0 2px 8px rgba(0,0,0,.06);
}
.back-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 14px;
  color: #595f6e;
  background: #f5f6fa;
  border: 1.5px solid #e4e7ef;
  border-radius: 8px;
  padding: 6px 14px;
  cursor: pointer;
  transition: all .15s;
  flex-shrink: 0;
}
.back-btn:hover { background: #eef2ff; border-color: #5b72ee; color: #5b72ee; }

.header-center { flex: 1; }
.header-title  { font-size: 18px; font-weight: 600; color: #1a1d23; margin: 0 0 4px; }
.header-summary { display: flex; gap: 16px; }
.summary-item  { display: flex; align-items: center; gap: 5px; font-size: 13px; color: #595f6e; }
.dot { width: 7px; height: 7px; border-radius: 50%; background: currentColor; }
.summary-item.need .dot { background: #1677ff; }
.summary-item.done .dot { background: #52c41a; }

.header-right { display: flex; align-items: center; gap: 10px; flex-shrink: 0; }

/* ─── 货架网格 ─────────────────────────────────────────────── */
.detail-content { flex: 1; padding: 20px 24px; }
.empty-wrap     { display: flex; justify-content: center; padding: 80px 0; }

.shelf-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 14px;
}

.shelf-card {
  position: relative;
  background: #fff;
  border-radius: 12px;
  border: 1.5px solid #ebedf2;
  padding: 14px 14px 10px;
  cursor: pointer;
  transition: all .2s;
  overflow: hidden;
}
.shelf-card:hover {
  border-color: #5b72ee;
  box-shadow: 0 4px 16px rgba(91,114,238,.15);
  transform: translateY(-2px);
}
.shelf-card.is-done  { border-left: 3px solid #52c41a; }
.shelf-card.is-picking { border-left: 3px solid #1677ff; }

.shelf-status-tag {
  position: absolute;
  top: 0; right: 0;
  font-size: 10px;
  padding: 2px 8px;
  border-radius: 0 10px 0 8px;
}
.tag-done    { background: #f6ffed; color: #52c41a; }
.tag-picking { background: #e6f4ff; color: #1677ff; }

.shelf-zone-label {
  font-size: 13px;
  color: #8c92a0;
  margin-bottom: 4px;
}
.shelf-sn {
  display: flex;
  align-items: baseline;
  gap: 6px;
  margin-bottom: 6px;
}
.sn-number { font-size: 20px; font-weight: 700; color: #1a1d23; }
.sub-sn    { font-size: 12px; color: #8c92a0; background: #f5f6fa; padding: 1px 6px; border-radius: 4px; }

.shelf-segment {
  font-size: 11px;
  color: #8c92a0;
  margin-bottom: 8px;
  display: flex;
  align-items: center;
  gap: 4px;
}

.shelf-progress-wrap {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
}
.progress-bar  { flex: 1; height: 6px; background: #f0f2f5; border-radius: 3px; overflow: hidden; }
.progress-fill { height: 100%; border-radius: 3px; transition: width .4s; }
.fill-done     { background: #52c41a; }
.fill-picking  { background: #1677ff; }
.progress-text { font-size: 11px; color: #595f6e; white-space: nowrap; }

.shelf-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
  margin-bottom: 6px;
  min-height: 18px;
}

.shelf-click-hint {
  font-size: 11px;
  color: #bdc3cc;
  text-align: right;
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 3px;
}
.shelf-card:hover .shelf-click-hint { color: #5b72ee; }

/* ─── 迷你标签 ─────────────────────────────────────────────── */
.mini-tag {
  font-size: 10px;
  padding: 1px 6px;
  border-radius: 3px;
  background: #f5f6fa;
  color: #8c92a0;
}
.mini-tag.logistics  { background: #e6f4ff; color: #1677ff; }
.mini-tag.pickup     { background: #fff7e6; color: #fa8c16; }
.mini-tag.limit      { background: #fff1f0; color: #ff4d4f; }
.mini-tag.no-restock { background: #f9f0ff; color: #722ed1; }

/* ─── 抽屉 ─────────────────────────────────────────────────── */
.drawer-body { padding: 16px; display: flex; flex-direction: column; gap: 12px; }

.item-summary-row {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 10px;
  background: #fff;
  border-radius: 10px;
  padding: 14px;
  border: 1.5px solid #ebedf2;
}
.summary-stat  { text-align: center; }
.stat-num      { font-size: 22px; font-weight: 700; color: #1a1d23; }
.stat-label    { font-size: 11px; color: #8c92a0; margin-top: 2px; }

.item-list { display: flex; flex-direction: column; gap: 10px; }

.item-card {
  background: #fff;
  border-radius: 10px;
  border: 1.5px solid #ebedf2;
  padding: 12px 14px;
  transition: border-color .15s;
}
.item-card:hover { border-color: #d0d5e0; }
.item-card.item-qualify-issue { border-left: 3px solid #ff4d4f; }

.item-card-head {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  margin-bottom: 10px;
  gap: 8px;
}
.item-name-wrap { display: flex; align-items: center; gap: 6px; flex: 1; min-width: 0; }
.item-name {
  font-size: 15px;
  font-weight: 600;
  color: #1a1d23;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.item-maturity {
  font-size: 11px;
  padding: 1px 6px;
  border-radius: 3px;
  background: #fff7e6;
  color: #fa8c16;
  flex-shrink: 0;
}

.item-numbers {
  display: flex;
  gap: 16px;
  padding: 8px 0;
  border-top: 1px solid #f5f6fa;
  border-bottom: 1px solid #f5f6fa;
  margin-bottom: 10px;
}
.num-item   { text-align: center; min-width: 36px; }
.num-val    { display: block; font-size: 16px; font-weight: 700; color: #1a1d23; }
.num-label  { font-size: 10px; color: #8c92a0; }
.text-warn  { color: #fa8c16; }
.text-danger{ color: #ff4d4f; }
.text-orange{ color: #fa8c16; }

.item-meta { display: flex; flex-direction: column; gap: 4px; margin-bottom: 8px; }
.meta-row  { display: flex; align-items: center; gap: 6px; font-size: 12px; color: #595f6e; }
.supplier-tag {
  font-size: 10px;
  padding: 1px 5px;
  border-radius: 3px;
  background: #f9f0ff;
  color: #722ed1;
}
.meta-phone { color: #8c92a0; margin-left: 4px; }

.item-foot {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 6px;
}
.order-sn { font-size: 11px; color: #8c92a0; }
.item-mini-tags { display: flex; flex-wrap: wrap; gap: 4px; }
.mini-tag.done-tag { background: #f6ffed; color: #52c41a; }
.mini-tag.replace  { background: #e6f4ff; color: #1677ff; }
.mini-tag.night    { background: #1a1d23; color: #fff; }
.mini-tag.focus    { background: #fff1f0; color: #ff4d4f; }

.qualify-summary {
  margin-top: 8px;
  padding: 8px 10px;
  background: #fff1f0;
  border-radius: 6px;
}
.qs-title { font-size: 11px; font-weight: 600; color: #ff4d4f; margin-bottom: 4px; }
.qs-items { display: flex; flex-wrap: wrap; gap: 6px; }
.qs-item  { font-size: 11px; color: #cf1322; background: #fff; padding: 1px 7px; border-radius: 3px; border: 1px solid #ffa39e; }
</style>