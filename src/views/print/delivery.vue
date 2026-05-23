<template>
  <div class="delivery-print-page">
    <section class="page-head">
      <div>
        <span class="eyebrow">Print Center</span>
        <h1>发货单打印</h1>
        <p>按场次、物流、货架和收货信息查询物流包裹，支持勾选后批量打印发货单。</p>
      </div>
    </section>

    <a-alert
      v-if="adminAuthMessage"
      class="auth-alert"
      type="warning"
      show-icon
      message="运营端接口需要独立鉴权"
      :description="adminAuthMessage"
    />

    <a-tabs v-model:activeKey="query.sceneType" class="scene-tabs" @change="handleSceneChange">
      <a-tab-pane :key="1" tab="到店发货单（普通仓&城市仓）" />
      <a-tab-pane :key="3" tab="到店自营仓" />
    </a-tabs>

    <section class="filter-panel">
      <a-form layout="vertical" class="filter-form">
        <a-form-item label="场次">
          <a-date-picker
            v-model:value="query.roundNo"
            :allow-clear="false"
            value-format="YYYY-MM-DD"
            format="YYYY-MM-DD"
            class="control"
          />
        </a-form-item>

        <a-form-item label="包裹状态">
          <a-select v-model:value="query.expressStatus" allow-clear placeholder="全部状态" class="control">
            <a-select-option :value="0">待打包</a-select-option>
            <a-select-option :value="10">打包完成</a-select-option>
            <a-select-option :value="20">发货完成</a-select-option>
          </a-select>
        </a-form-item>

        <a-form-item label="收货人/电话">
          <a-input v-model:value="query.receiveNameTel" allow-clear placeholder="收货人名称或电话" />
        </a-form-item>

        <a-form-item label="发货单号">
          <a-input v-model:value="query.sendNo" allow-clear placeholder="发货单号" />
        </a-form-item>

        <a-form-item label="货架号">
          <a-input-number v-model:value="query.shelfSn" :min="0" class="control" placeholder="货架号" />
        </a-form-item>

        <a-form-item label="区-货架">
          <a-input v-model:value="query.zoneShelf" allow-clear placeholder="如：A-12" />
        </a-form-item>

        <a-form-item label="区号">
          <a-input v-model:value="zoneListText" allow-clear placeholder="多个以英文逗号分隔" />
        </a-form-item>

        <a-form-item label="物流 ID">
          <a-input-number v-model:value="query.expressId" :min="0" class="control" placeholder="物流 ID" />
        </a-form-item>
      </a-form>

      <div class="filter-actions">
        <a-button type="primary" :loading="loading" @click="search">
          <SearchOutlined />
          搜索
        </a-button>
        <a-button :disabled="loading" @click="reset">
          <ClearOutlined />
          重置
        </a-button>
      </div>
    </section>

    <section class="table-panel">
      <div class="table-toolbar">
        <div>
          <strong>发货单列表</strong>
          <span>共 {{ pagination.total }} 条</span>
        </div>
        <a-space>
          <a-button :disabled="selectedRowKeys.length === 0" @click="batchPrint">批量打印</a-button>
          <a-button :loading="loading" @click="fetchList">刷新</a-button>
        </a-space>
      </div>

      <a-table
        row-key="id"
        :columns="columns"
        :data-source="records"
        :loading="loading"
        :pagination="tablePagination"
        :row-selection="rowSelection"
        size="middle"
        class="delivery-table"
        @change="handleTableChange"
      >
        <template #bodyCell="{ column, record }">
          <template v-if="column.key === 'receiver'">
            <div class="receiver-cell">
              <strong>{{ record.receiverInfo?.receiveName || '-' }}</strong>
              <span>{{ record.receiverInfo?.receiveTel || '-' }}</span>
            </div>
          </template>

          <template v-else-if="column.key === 'express'">
            <div class="stack-cell">
              <strong>{{ record.expressInfo?.logisticsName || '-' }}</strong>
              <span>{{ record.packageInfo || '未生成包裹名称' }}</span>
            </div>
          </template>

          <template v-else-if="column.key === 'location'">
            <div class="mono-cell">{{ record.zoneShelf || joinShelf(record) }}</div>
          </template>

          <template v-else-if="column.key === 'itemNum'">
            <div class="stack-cell">
              <strong>{{ record.itemNumInfo?.allItemNum ?? record.itemNum ?? 0 }} 扎</strong>
              <span>包裹 {{ record.packageNum ?? 0 }} 件</span>
            </div>
          </template>

          <template v-else-if="column.key === 'status'">
            <a-tag :color="statusMeta(record.expressStatus).color">
              {{ statusMeta(record.expressStatus).label }}
            </a-tag>
          </template>

          <template v-else-if="column.key === 'action'">
            <a-space>
              <a-button type="link" size="small" @click="printOne(record)">打印</a-button>
              <a-button type="link" size="small" @click="preview(record)">预览</a-button>
            </a-space>
          </template>
        </template>
      </a-table>
    </section>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, reactive, ref } from 'vue'
import dayjs from 'dayjs'
import { message as AMessage } from 'ant-design-vue'
import { ClearOutlined, SearchOutlined } from '@ant-design/icons-vue'
import http, { AdminAuthError } from '@/utils/http'

type SceneType = 1 | 3

interface ExpressPackageQuery {
  zone?: string
  zoneList: string[]
  index: number
  size: number
  searchCount: boolean
  ids?: number[]
  roundNo: string
  sceneType: SceneType
  serialNum: number
  type?: number
  wareFlag?: number
  wareId?: number
  wareIdList: number[]
  partnerId?: number
  partnerIdList: number[]
  sendNo?: string
  shelfSn?: number
  zoneShelf?: string
  zoneShelfList: string[]
  expressId?: number
  expressStatus?: number
  receiveNameTel?: string
}

interface PageDto<T> {
  index: number
  size: number
  total: number
  records: T[]
}

interface LogisticsInfo {
  id?: number
  logisticsName?: string
  logisticsType?: number
  deliveryTime?: string
  phone?: string
  regionPickerName?: string
  regionPickerMobile?: string
}

interface ReceiverInfo {
  receiveName?: string
  receiveTel?: string
  province?: string
  city?: string
  district?: string
  detail?: string
}

interface ItemNumInfo {
  allItemNum?: number
  itemNumComplete?: number
  itemNumPayed?: number
  itemNumSend?: number
}

interface ExpressPackageRecord {
  id: number
  roundNo?: string
  sendNo?: string
  serialNum?: number
  type?: number
  expressStatus?: number
  expressId?: number
  expressInfo?: LogisticsInfo
  packageInfo?: string
  packageNum?: number
  packageTime?: string
  packageUserName?: string
  receiverInfo?: ReceiverInfo
  itemNum?: number
  itemNumInfo?: ItemNumInfo
  totalWeight?: number
  shelf?: string
  shelfSn?: number
  subShelfSn?: string
  zone?: string
  zoneShelf?: string
  partnerName?: string
  wareId?: number
  wareInfo?: { name?: string }
  createTime?: string
  updateTime?: string
}

const loading = ref(false)
const records = ref<ExpressPackageRecord[]>([])
const selectedRowKeys = ref<number[]>([])
const zoneListText = ref('')
const adminAuthMessage = ref('')

const query = reactive<ExpressPackageQuery>(createDefaultQuery())
const pagination = reactive({ current: 1, pageSize: 10, total: 0 })

const columns = [
  { title: '序号', dataIndex: 'serialNum', key: 'serialNum', width: 72 },
  { title: '发货单号', dataIndex: 'sendNo', key: 'sendNo', width: 150 },
  { title: '收货人', key: 'receiver', width: 170 },
  { title: '物流/包裹', key: 'express', width: 190 },
  { title: '货位', key: 'location', width: 120 },
  { title: '扎数/包裹', key: 'itemNum', width: 130 },
  { title: '重量(kg)', dataIndex: 'totalWeight', key: 'totalWeight', width: 100 },
  { title: '包裹状态', key: 'status', width: 110 },
  { title: '打包人', dataIndex: 'packageUserName', key: 'packageUserName', width: 110 },
  { title: '打包时间', dataIndex: 'packageTime', key: 'packageTime', width: 170 },
  { title: '操作', key: 'action', width: 120, fixed: 'right' },
]

const rowSelection = computed(() => ({
  selectedRowKeys: selectedRowKeys.value,
  onChange: (keys: (string | number)[]) => {
    selectedRowKeys.value = keys.map(Number)
  },
}))

const tablePagination = computed(() => ({
  current: pagination.current,
  pageSize: pagination.pageSize,
  total: pagination.total,
  showSizeChanger: true,
  pageSizeOptions: ['10', '20', '50', '100'],
  showTotal: (total: number) => `共 ${total} 条`,
}))

function createDefaultQuery(sceneType: SceneType = 1): ExpressPackageQuery {
  return {
    zoneList: [],
    index: 1,
    size: 10,
    searchCount: true,
    roundNo: dayjs().format('YYYY-MM-DD'),
    sceneType,
    serialNum: 1,
    wareIdList: [],
    partnerIdList: [],
    zoneShelfList: [],
  }
}

function cleanPayload(): ExpressPackageQuery {
  const payload = {
    ...query,
    index: pagination.current,
    size: pagination.pageSize,
    zoneList: parseCsv(zoneListText.value),
    zoneShelfList: parseCsv(query.zoneShelf),
  }

  Object.keys(payload).forEach((key) => {
    const value = payload[key as keyof ExpressPackageQuery]
    if (value === '' || value === null || value === undefined) {
      delete payload[key as keyof ExpressPackageQuery]
    }
  })

  return payload
}

function parseCsv(value?: string) {
  return (value ?? '')
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean)
}

async function fetchList() {
  loading.value = true
  adminAuthMessage.value = ''
  try {
    const result = await http.adminPost<PageDto<ExpressPackageRecord>>(
      '/order/wmsExpressPackage/list',
      cleanPayload(),
      { silent: true },
    )
    records.value = result.records ?? []
    pagination.current = result.index ?? pagination.current
    pagination.pageSize = result.size ?? pagination.pageSize
    pagination.total = Number(result.total ?? 0)
    selectedRowKeys.value = []
  } catch (error) {
    if (error instanceof AdminAuthError) {
      records.value = []
      pagination.total = 0
      adminAuthMessage.value = '当前登录态是仓库管理端，不能直接访问运营端接口。建议后端提供仓库端转发接口，或把该列表能力开放到仓库端鉴权下。'
      return
    }
    AMessage.error(error instanceof Error ? error.message : '查询失败')
  } finally {
    loading.value = false
  }
}

function handleTableChange(page: { current?: number; pageSize?: number }) {
  pagination.current = page.current ?? 1
  pagination.pageSize = page.pageSize ?? 10
  fetchList()
}

function handleSceneChange() {
  pagination.current = 1
  selectedRowKeys.value = []
  fetchList()
}

function search() {
  pagination.current = 1
  fetchList()
}

function reset() {
  const sceneType = query.sceneType
  Object.assign(query, createDefaultQuery(sceneType))
  zoneListText.value = ''
  pagination.current = 1
  pagination.pageSize = 10
  fetchList()
}

function statusMeta(status?: number) {
  const map: Record<number, { label: string; color: string }> = {
    0: { label: '待打包', color: 'orange' },
    10: { label: '打包完成', color: 'green' },
    20: { label: '发货完成', color: 'blue' },
  }
  return map[status ?? -1] ?? { label: '未知', color: 'default' }
}

function joinShelf(record: ExpressPackageRecord) {
  const zone = record.zone ? `${record.zone}区` : ''
  const shelf = record.shelf ?? record.shelfSn ?? ''
  return [zone, shelf].filter(Boolean).join('-') || '-'
}

function batchPrint() {
  if (!selectedRowKeys.value.length) return
  AMessage.success(`已选择 ${selectedRowKeys.value.length} 条发货单，等待接入打印动作`)
}

function printOne(record: ExpressPackageRecord) {
  selectedRowKeys.value = [record.id]
  AMessage.success(`已选择发货单 ${record.sendNo || record.id}，等待接入打印动作`)
}

function preview(record: ExpressPackageRecord) {
  AMessage.info(`预览发货单 ${record.sendNo || record.id}`)
}

onMounted(fetchList)
</script>

<style scoped>
.delivery-print-page {
  min-height: 100%;
}

.page-head {
  padding: 32px 0 26px;
  border-bottom: 1px solid var(--wms-line);
}

.eyebrow {
  color: var(--wms-primary-strong);
  font-size: 13px;
  font-weight: 800;
}

.page-head h1 {
  margin: 12px 0 0;
  color: var(--wms-text);
  font-size: 36px;
  font-weight: 850;
}

.page-head p {
  max-width: 720px;
  margin: 10px 0 0;
  color: var(--wms-text-muted);
  line-height: 1.8;
}

.auth-alert {
  margin-top: 16px;
}

.scene-tabs {
  margin-top: 18px;
}

.scene-tabs :deep(.ant-tabs-nav) {
  margin-bottom: 14px;
}

.filter-panel,
.table-panel {
  border: 1px solid var(--wms-line);
  border-radius: 18px;
  background: #fff;
  box-shadow: var(--wms-shadow-xs);
}

.filter-panel {
  padding: 18px;
}

.filter-form {
  display: grid;
  grid-template-columns: repeat(4, minmax(180px, 1fr));
  gap: 12px 14px;
}

.filter-form :deep(.ant-form-item) {
  margin-bottom: 0;
}

.control {
  width: 100%;
}

.filter-actions {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  margin-top: 16px;
}

.table-panel {
  margin-top: 16px;
  overflow: hidden;
}

.table-toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  padding: 16px 18px;
  border-bottom: 1px solid var(--wms-line);
}

.table-toolbar strong,
.table-toolbar span {
  display: block;
}

.table-toolbar strong {
  color: var(--wms-text);
  font-size: 16px;
  font-weight: 850;
}

.table-toolbar span {
  margin-top: 3px;
  color: var(--wms-text-muted);
  font-size: 12px;
}

.delivery-table :deep(.ant-table) {
  border-radius: 0;
}

.delivery-table :deep(.ant-table-thead > tr > th) {
  background: #fafafa;
  color: var(--wms-text-muted);
  font-weight: 750;
}

.receiver-cell,
.stack-cell {
  display: grid;
  gap: 3px;
}

.receiver-cell strong,
.stack-cell strong {
  color: var(--wms-text);
  font-size: 13px;
}

.receiver-cell span,
.stack-cell span {
  color: var(--wms-text-muted);
  font-size: 12px;
}

.mono-cell {
  color: var(--wms-text);
  font-family: Menlo, Consolas, monospace;
  font-size: 12px;
}

@media (max-width: 1280px) {
  .filter-form {
    grid-template-columns: repeat(2, minmax(180px, 1fr));
  }
}
</style>
