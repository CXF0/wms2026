<template>
  <div class="rack-card" :class="`s-${rack.status}`">
    <div class="rack-head">
      <code class="rack-code">{{ rack.code }}</code>
      <a-tag :color="statusColor" class="s-tag">{{ statusLabel }}</a-tag>
    </div>

    <div class="rack-nfc" :class="rack.nfcBound ? 'nfc-ok' : 'nfc-no'">
      <WifiOutlined />
      <span>{{ rack.nfcBound ? rack.nfcId?.slice(-6) ?? 'NFC已绑' : '未绑定NFC' }}</span>
    </div>

    <div class="rack-cap">
      <div class="cap-item">
        <span class="cap-val">{{ (rack.capacity.maxWeightGrams / 1000).toFixed(0) }}</span>
        <span class="cap-unit">kg上限</span>
      </div>
      <div class="cap-divider" />
      <div class="cap-item">
        <span class="cap-val">{{ rack.capacity.maxBoxCount }}</span>
        <span class="cap-unit">最多件</span>
      </div>
      <div class="cap-divider" />
      <div class="cap-item">
        <span class="cap-val">{{ sizeTypeLabel }}</span>
        <span class="cap-unit">件型</span>
      </div>
    </div>

    <div class="rack-footer">
      <a-button type="text" size="small" @click="$emit('edit')"><EditOutlined /></a-button>
      <a-popconfirm title="确认删除该货架？" @confirm="$emit('delete')">
        <a-button type="text" size="small" danger><DeleteOutlined /></a-button>
      </a-popconfirm>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { EditOutlined, DeleteOutlined, WifiOutlined } from '@ant-design/icons-vue'
import { rackStatusLabel, rackStatusColor } from '@/utils/status'
import type { PhysicalRack } from '@/types/business'

const props = defineProps<{ rack: PhysicalRack }>()
defineEmits<{ edit: []; delete: [] }>()

const statusLabel = computed(() => rackStatusLabel(props.rack.status))
const statusColor = computed(() => rackStatusColor(props.rack.status))
const sizeTypeLabel = computed(() =>
  ({ small: '小件', large: '大件', mixed: '混合' }[props.rack.capacity.sizeType]),
)
</script>

<style scoped>
.rack-card {
  background: #fff; border: 1.5px solid #ebedf2; border-radius: 10px;
  padding: 12px; display: flex; flex-direction: column; gap: 8px;
  transition: box-shadow 0.15s;
}
.rack-card:hover { box-shadow: 0 4px 14px rgba(0,0,0,0.08); }
.rack-card.s-inactive { opacity: 0.55; }
.rack-card.s-maintenance { border-color: #faad14; }

.rack-head { display: flex; align-items: center; justify-content: space-between; }
.rack-code {
  font-family: 'DM Mono', 'Menlo', monospace; font-size: 14px; font-weight: 700;
  color: #1677ff; background: #e8f4ff; padding: 2px 6px; border-radius: 4px;
}
.s-tag { margin: 0; font-size: 11px; }

.rack-nfc {
  display: flex; align-items: center; gap: 4px;
  font-size: 11px; border-radius: 4px; padding: 3px 6px;
}
.nfc-ok  { color: #52c41a; background: #f6ffed; }
.nfc-no  { color: #a0a8b4; background: #f5f6fa; }

.rack-cap { display: flex; align-items: center; gap: 0; background: #f7f8fc; border-radius: 6px; padding: 6px 0; }
.cap-item { flex: 1; display: flex; flex-direction: column; align-items: center; gap: 1px; }
.cap-val  { font-size: 15px; font-weight: 700; color: #1a1d23; line-height: 1; }
.cap-unit { font-size: 10px; color: #a0a8b4; }
.cap-divider { width: 1px; height: 24px; background: #e8eaf0; }

.rack-footer { display: flex; justify-content: flex-end; gap: 0; padding-top: 2px; border-top: 1px solid #f5f6fa; }
</style>
