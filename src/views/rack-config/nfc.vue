<template>
  <div class="nfc-page">
    <div class="toolbar">
      <div class="toolbar-left">
        <a-input-search v-model:value="searchText" placeholder="搜索 NFC ID 或货架号" style="width:240px" @search="search" />
        <a-select v-model:value="filterStatus" placeholder="状态筛选" allow-clear style="width:120px" @change="search">
          <a-select-option value="unbound">未绑定</a-select-option>
          <a-select-option value="bound">已绑定</a-select-option>
          <a-select-option value="disabled">已停用</a-select-option>
        </a-select>
        <a-select v-model:value="filterZoneId" placeholder="分区筛选" allow-clear style="width:140px" @change="search">
          <a-select-option v-for="z in zones" :key="z.id" :value="z.id">{{ z.name }}</a-select-option>
        </a-select>
      </div>
      <div class="toolbar-right">
        <a-upload :show-upload-list="false" accept=".xlsx,.csv" :before-upload="handleImport">
          <a-button><UploadOutlined /> 批量导入NFC</a-button>
        </a-upload>
        <a-button type="primary" @click="openBindModal"><LinkOutlined /> 绑定NFC</a-button>
      </div>
    </div>

    <a-table
      :columns="columns" :data-source="data" :loading="loading"
      :pagination="pagination" row-key="id"
      class="nfc-table" @change="onTableChange"
    >
      <template #bodyCell="{ column, record }">
        <template v-if="column.key === 'nfcId'">
          <code class="nfc-id">{{ record.nfcId }}</code>
        </template>
        <template v-else-if="column.key === 'rackCode'">
          <code v-if="record.rackCode" class="rack-code">{{ record.rackCode }}</code>
          <span v-else class="empty-cell">—</span>
        </template>
        <template v-else-if="column.key === 'status'">
          <a-badge :status="nfcBadge(record.status)" :text="nfcStatusLabel(record.status)" />
        </template>
        <template v-else-if="column.key === 'action'">
          <a-space>
            <a-button v-if="record.status === 'unbound'" type="link" size="small" @click="openBindModal(record)">绑定</a-button>
            <a-popconfirm v-if="record.status === 'bound'" title="确认解绑？" @confirm="unbind(record)">
              <a-button type="link" size="small" danger>解绑</a-button>
            </a-popconfirm>
            <a-popconfirm v-if="record.status !== 'disabled'" title="确认停用？" @confirm="disable(record)">
              <a-button type="link" size="small">停用</a-button>
            </a-popconfirm>
          </a-space>
        </template>
      </template>
    </a-table>

    <!-- 绑定弹窗 -->
    <a-modal :open="bindModalOpen" title="绑定NFC到货架" :confirm-loading="bindSub" ok-text="确认绑定" @ok="confirmBind" @cancel="bindModalOpen=false">
      <a-form layout="vertical" style="margin-top:8px">
        <a-form-item label="NFC ID">
          <a-input v-model:value="bindForm.nfcId" placeholder="输入或扫描NFC卡片ID" />
        </a-form-item>
        <a-form-item label="货架">
          <a-select v-model:value="bindForm.rackId" placeholder="选择货架" show-search option-filter-prop="label">
            <a-select-option v-for="r in allRacks" :key="r.id" :value="r.id" :label="`${r.code} (${r.zoneName})`">
              <code>{{ r.code }}</code> <span style="color:#8c92a0;font-size:12px">{{ r.zoneName }}</span>
            </a-select-option>
          </a-select>
        </a-form-item>
      </a-form>
    </a-modal>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { UploadOutlined, LinkOutlined } from '@ant-design/icons-vue'
import { message as AMessage } from 'ant-design-vue'
import type { UploadFile } from 'ant-design-vue'
import { nfcApi, zoneApi, rackApi } from '@/api'
import { nfcStatusLabel } from '@/utils/status'
import { useTable } from '@/hooks/useTable'
import type { NfcCard, Zone, PhysicalRack } from '@/types/business'

const searchText = ref('')
const filterStatus = ref<string | undefined>()
const filterZoneId = ref<number | undefined>()
const zones = ref<Zone[]>([])
const allRacks = ref<PhysicalRack[]>([])

const { loading, data, pagination, params, fetch, onTableChange, search } = useTable(
  nfcApi.list,
  { status: undefined, zoneId: undefined },
)

function nfcBadge(s: string) {
  return ({ unbound: 'default', bound: 'success', disabled: 'error' } as Record<string, 'default'|'success'|'error'>)[s] ?? 'default'
}

// 绑定
const bindModalOpen = ref(false)
const bindSub = ref(false)
const bindForm = ref({ nfcId: '', rackId: undefined as number | undefined })

function openBindModal(card?: NfcCard) {
  bindForm.value = { nfcId: card?.nfcId ?? '', rackId: undefined }
  bindModalOpen.value = true
}
async function confirmBind() {
  if (!bindForm.value.nfcId || !bindForm.value.rackId) { AMessage.warning('请填写完整'); return }
  bindSub.value = true
  try {
    await nfcApi.bind(bindForm.value.nfcId, bindForm.value.rackId)
    AMessage.success('绑定成功')
    bindModalOpen.value = false
    fetch()
  } finally { bindSub.value = false }
}

async function unbind(card: NfcCard) {
  await nfcApi.unbind(card.nfcId); AMessage.success('已解绑'); fetch()
}
async function disable(card: NfcCard) {
  await nfcApi.disable(card.nfcId); AMessage.success('已停用'); fetch()
}

async function handleImport(file: UploadFile) {
  const res = await nfcApi.batchImport(file as unknown as File)
  AMessage.success(`导入成功 ${res.imported} 条，重复 ${res.duplicates} 条`)
  fetch()
  return false
}

const columns = [
  { title: 'NFC ID', key: 'nfcId', dataIndex: 'nfcId' },
  { title: '绑定货架', key: 'rackCode' },
  { title: '分区', dataIndex: 'zoneName', key: 'zoneName' },
  { title: '状态', key: 'status', width: 90 },
  { title: '绑定时间', dataIndex: 'boundAt', key: 'boundAt', width: 160 },
  { title: '操作人', dataIndex: 'boundBy', key: 'boundBy', width: 100 },
  { title: '操作', key: 'action', width: 160 },
]

onMounted(async () => {
  [zones.value, allRacks.value] = await Promise.all([zoneApi.list(), rackApi.list()])
})
</script>

<style scoped>
.nfc-page { padding: 16px 0; }
.toolbar { display: flex; align-items: center; justify-content: space-between; margin-bottom: 16px; gap: 8px; flex-wrap: wrap; }
.toolbar-left, .toolbar-right { display: flex; gap: 8px; align-items: center; }
.nfc-table :deep(.ant-table-thead > tr > th) { background: #fafbfc; font-size: 12px; }
.nfc-id { font-family: 'DM Mono','Menlo',monospace; font-size: 12px; background: #f5f6fa; padding: 2px 6px; border-radius: 4px; color: #3d4350; }
.rack-code { font-family: 'DM Mono','Menlo',monospace; font-size: 13px; background: #e8f4ff; padding: 2px 6px; border-radius: 4px; color: #1677ff; font-weight: 600; }
.empty-cell { color: #c0c4cc; }
</style>
