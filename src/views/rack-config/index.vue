<template>
  <div class="rack-page">
    <div class="page-header">
      <div>
        <h1 class="page-title">货位管理</h1>
        <p class="page-sub">仓库分区、货架配置及排序规则</p>
      </div>
      <a-tabs v-model:activeKey="activeTab" class="header-tabs">
        <a-tab-pane key="racks"    tab="分区货架配置" />
        <a-tab-pane key="box-type" tab="件型配置" />
        <a-tab-pane key="nfc"      tab="NFC管理" />
      </a-tabs>
    </div>

    <!-- 分区货架配置 -->
    <template v-if="activeTab === 'racks'">
      <div class="layout-2col">
        <!-- 左：大区 + 分区树 -->
        <div class="col-left">
          <div class="panel">
            <div class="panel-head">
              <span class="panel-title">大区 / 分区</span>
              <div class="panel-actions">
                <a-button size="small" @click="openRegionModal()"><PlusOutlined /> 大区</a-button>
                <a-button size="small" type="primary" :disabled="!selectedRegionId" @click="openZoneModal()">
                  <PlusOutlined /> 分区
                </a-button>
              </div>
            </div>

            <a-spin :spinning="loadingTree">
              <a-tree
                v-if="treeData.length"
                v-model:selectedKeys="treeSelected"
                :tree-data="treeData"
                :field-names="{ title: 'name', key: 'key', children: 'children' }"
                default-expand-all
                block-node
                class="region-tree"
                @select="onTreeSelect"
              >
                <template #title="node">
                  <div class="tree-node">
                    <span class="node-label">{{ node.name }}</span>
                    <span v-if="node.type === 'region'" class="node-badge region">大区</span>
                    <span v-else class="node-badge zone">分区</span>
                    <div class="node-actions">
                      <a-button type="text" size="small" @click.stop="editNode(node)"><EditOutlined /></a-button>
                      <a-popconfirm
                        title="确认删除？"
                        @confirm="deleteNode(node)"
                        @click.stop
                      >
                        <a-button type="text" size="small" danger><DeleteOutlined /></a-button>
                      </a-popconfirm>
                    </div>
                  </div>
                </template>
              </a-tree>
              <a-empty v-else description="暂无大区，请先创建" :image="Empty.PRESENTED_IMAGE_SIMPLE" />
            </a-spin>
          </div>
        </div>

        <!-- 右：货架列表 -->
        <div class="col-right">
          <div class="panel">
            <div class="panel-head">
              <div class="panel-title-wrap">
                <span class="panel-title">
                  {{ selectedZoneName ? `${selectedZoneName} — 货架列表` : '请选择分区' }}
                </span>
                <a-tag v-if="selectedZoneId" color="blue">{{ racks.length }} 个货架</a-tag>
              </div>
              <div class="panel-actions" v-if="selectedZoneId">
                <a-button size="small" @click="openSortRuleModal">
                  <SortAscendingOutlined /> 排序规则
                </a-button>
                <a-button size="small" @click="openBatchModal">
                  <AppstoreAddOutlined /> 批量添加
                </a-button>
                <a-button size="small" type="primary" @click="openRackModal()">
                  <PlusOutlined /> 添加货架
                </a-button>
              </div>
            </div>

            <a-spin :spinning="loadingRacks">
              <div v-if="!selectedZoneId" class="select-hint">
                <ApartmentOutlined class="hint-icon" />
                <p>从左侧选择分区查看货架</p>
              </div>

              <div v-else-if="racks.length === 0" class="select-hint">
                <InboxOutlined class="hint-icon" />
                <p>该分区暂无货架</p>
              </div>

              <div v-else class="racks-grid">
                <RackCard
                  v-for="rack in racks"
                  :key="rack.id"
                  :rack="rack"
                  @edit="openRackModal(rack)"
                  @delete="deleteRack(rack)"
                />
              </div>
            </a-spin>
          </div>
        </div>
      </div>
    </template>

    <!-- 件型配置 -->
    <BoxTypeConfig v-if="activeTab === 'box-type'" />

    <!-- NFC管理 -->
    <NfcManage v-if="activeTab === 'nfc'" />

    <!-- 弹窗 -->
    <RegionModal   v-model:open="regionModalOpen"  :editing="editingRegion"  @saved="onRegionSaved" />
    <ZoneModal     v-model:open="zoneModalOpen"    :editing="editingZone"   :region-id="selectedRegionId" @saved="onZoneSaved" />
    <RackModal     v-model:open="rackModalOpen"    :editing="editingRack"   :zone-id="selectedZoneId!"    @saved="onRackSaved" />
    <BatchRackModal v-model:open="batchModalOpen"  :zone-id="selectedZoneId!" :zone-name="selectedZoneName" @saved="fetchRacks" />
    <SortRuleModal v-model:open="sortRuleModalOpen" :zone-id="selectedZoneId!" :zone-name="selectedZoneName" />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { Empty } from 'ant-design-vue'
import {
  PlusOutlined, EditOutlined, DeleteOutlined,
  SortAscendingOutlined, AppstoreAddOutlined,
  ApartmentOutlined, InboxOutlined,
} from '@ant-design/icons-vue'
import { message as AMessage } from 'ant-design-vue'
import { regionApi, zoneApi, rackApi } from '@/api'
import type { Region, Zone, PhysicalRack } from '@/types/business'
import RackCard       from './components/RackCard.vue'
import RegionModal    from './components/RegionModal.vue'
import ZoneModal      from './components/ZoneModal.vue'
import RackModal      from './components/RackModal.vue'
import BatchRackModal from './components/BatchRackModal.vue'
import SortRuleModal  from './components/SortRuleModal.vue'
import BoxTypeConfig  from './box-type.vue'
import NfcManage      from './nfc.vue'

const activeTab = ref<'racks' | 'box-type' | 'nfc'>('racks')

// ── 树形数据 ────────────────────────────────────────────────
const loadingTree = ref(false)
const regions = ref<Region[]>([])
const zones = ref<Zone[]>([])
const treeSelected = ref<string[]>([])
const selectedRegionId = ref<number | null>(null)
const selectedZoneId = ref<number | null>(null)
const selectedZoneName = ref('')

interface TreeNode {
  key: string; name: string; type: 'region' | 'zone'
  id: number; children?: TreeNode[]
}

const treeData = computed<TreeNode[]>(() =>
  regions.value.map(r => ({
    key: `region-${r.id}`, name: r.name, type: 'region' as const, id: r.id,
    children: zones.value
      .filter(z => z.regionId === r.id)
      .map(z => ({ key: `zone-${z.id}`, name: z.name, type: 'zone' as const, id: z.id })),
  })),
)

async function fetchTree() {
  loadingTree.value = true
  try {
    [regions.value, zones.value] = await Promise.all([regionApi.list(), zoneApi.list()])
  } finally { loadingTree.value = false }
}

function onTreeSelect(_keys: unknown, { node }: { node: TreeNode }) {
  if (node.type === 'region') {
    selectedRegionId.value = node.id
    selectedZoneId.value = null
    selectedZoneName.value = ''
    racks.value = []
  } else {
    selectedRegionId.value = zones.value.find(z => z.id === node.id)?.regionId ?? null
    selectedZoneId.value = node.id
    selectedZoneName.value = node.name
    fetchRacks()
  }
}

// ── 货架列表 ────────────────────────────────────────────────
const loadingRacks = ref(false)
const racks = ref<PhysicalRack[]>([])

async function fetchRacks() {
  if (!selectedZoneId.value) return
  loadingRacks.value = true
  try {
    racks.value = await rackApi.list({ zoneId: selectedZoneId.value })
  } finally { loadingRacks.value = false }
}

async function deleteRack(rack: PhysicalRack) {
  await rackApi.remove(rack.id)
  racks.value = racks.value.filter(r => r.id !== rack.id)
  AMessage.success('已删除')
}

// ── 弹窗状态 ────────────────────────────────────────────────
const regionModalOpen  = ref(false)
const zoneModalOpen    = ref(false)
const rackModalOpen    = ref(false)
const batchModalOpen   = ref(false)
const sortRuleModalOpen= ref(false)

const editingRegion = ref<Region | null>(null)
const editingZone   = ref<Zone | null>(null)
const editingRack   = ref<PhysicalRack | null>(null)

function openRegionModal(r?: Region) { editingRegion.value = r ?? null; regionModalOpen.value = true }
function openZoneModal(z?: Zone)     { editingZone.value   = z ?? null; zoneModalOpen.value   = true }
function openRackModal(r?: PhysicalRack) { editingRack.value = r ?? null; rackModalOpen.value = true }
function openBatchModal()    { batchModalOpen.value = true }
function openSortRuleModal() { sortRuleModalOpen.value = true }

function editNode(node: TreeNode) {
  if (node.type === 'region') openRegionModal(regions.value.find(r => r.id === node.id))
  else openZoneModal(zones.value.find(z => z.id === node.id))
}
async function deleteNode(node: TreeNode) {
  if (node.type === 'region') {
    await regionApi.remove(node.id)
    regions.value = regions.value.filter(r => r.id !== node.id)
  } else {
    await zoneApi.remove(node.id)
    zones.value = zones.value.filter(z => z.id !== node.id)
  }
  AMessage.success('已删除')
}

function onRegionSaved(r: Region) {
  const idx = regions.value.findIndex(x => x.id === r.id)
  idx === -1 ? regions.value.push(r) : (regions.value[idx] = r)
}
function onZoneSaved(z: Zone) {
  const idx = zones.value.findIndex(x => x.id === z.id)
  idx === -1 ? zones.value.push(z) : (zones.value[idx] = z)
}
function onRackSaved(r: PhysicalRack) {
  const idx = racks.value.findIndex(x => x.id === r.id)
  idx === -1 ? racks.value.push(r) : (racks.value[idx] = r)
}

onMounted(fetchTree)
</script>

<style scoped>
.rack-page { padding: 24px; background: #f5f6fa; min-height: 100%; }

.page-header {
  display: flex; align-items: flex-start; justify-content: space-between;
  margin-bottom: 20px; gap: 16px;
}
.page-title { font-size: 22px; font-weight: 600; color: #1a1d23; margin: 0 0 2px; }
.page-sub   { font-size: 13px; color: #8c92a0; margin: 0; }
.header-tabs { margin: 0; }
.header-tabs :deep(.ant-tabs-nav) { margin: 0; }

/* 两列布局 */
.layout-2col { display: grid; grid-template-columns: 280px 1fr; gap: 16px; }

.panel {
  background: #fff; border-radius: 12px; border: 1.5px solid #ebedf2;
  overflow: hidden;
}
.panel-head {
  display: flex; align-items: center; justify-content: space-between;
  padding: 14px 16px; border-bottom: 1px solid #f0f2f5;
}
.panel-title { font-size: 14px; font-weight: 600; color: #1a1d23; }
.panel-title-wrap { display: flex; align-items: center; gap: 8px; }
.panel-actions { display: flex; gap: 6px; }

/* 树 */
.region-tree { padding: 8px 4px; }
.region-tree :deep(.ant-tree-node-content-wrapper) { width: 100%; }
.tree-node {
  display: flex; align-items: center; gap: 6px; width: 100%; padding-right: 4px;
}
.node-label { flex: 1; font-size: 13px; color: #1a1d23; }
.node-badge {
  font-size: 10px; padding: 1px 5px; border-radius: 3px; flex-shrink: 0;
}
.node-badge.region { background: #e8f0fe; color: #1677ff; }
.node-badge.zone   { background: #f0fef4; color: #389e0d; }
.node-actions { display: flex; gap: 0; opacity: 0; transition: opacity 0.15s; }
.tree-node:hover .node-actions { opacity: 1; }

/* 货架网格 */
.racks-grid {
  display: grid; grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
  gap: 12px; padding: 16px;
}

.select-hint {
  display: flex; flex-direction: column; align-items: center;
  justify-content: center; padding: 60px 0; color: #bdc3cc;
}
.hint-icon { font-size: 36px; margin-bottom: 10px; }
</style>
