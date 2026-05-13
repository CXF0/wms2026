<template>
  <a-modal :open="open" :title="`排序规则 — ${zoneName}`" :confirm-loading="sub" ok-text="保存" width="520" @ok="submit" @cancel="$emit('update:open',false)">
    <a-spin :spinning="loading">
      <div class="rule-section">
        <div class="rule-title">配货优先级排序</div>
        <p class="rule-desc">配货时系统按以下顺序推荐货位，拖动调整优先级</p>
        <div class="priority-list">
          <div
            v-for="(field, idx) in form.priorityFields"
            :key="field"
            class="priority-item"
            draggable="true"
            @dragstart="dragStart(idx)"
            @dragover.prevent="dragOver(idx)"
            @dragend="dragEnd"
          >
            <HolderOutlined class="drag-handle" />
            <span class="pri-rank">{{ idx + 1 }}</span>
            <span class="pri-label">{{ FIELD_LABELS[field] }}</span>
            <a-button type="text" size="small" danger @click="removeField(idx)"><CloseOutlined /></a-button>
          </div>
        </div>
        <a-select
          v-if="availableFields.length"
          placeholder="+ 添加排序字段"
          style="width:200px;margin-top:8px"
          @change="addField"
        >
          <a-select-option v-for="f in availableFields" :key="f" :value="f">{{ FIELD_LABELS[f] }}</a-select-option>
        </a-select>
      </div>

      <a-divider />

      <div class="rule-section">
        <div class="rule-title">大小件分割</div>
        <a-switch v-model:checked="form.mixSizeAllowed" checked-children="允许混放" un-checked-children="大小件分货位" />
        <p class="rule-desc" style="margin-top:6px">
          {{ form.mixSizeAllowed ? '同一货位可放大件和小件' : '大件和小件分配到不同货位' }}
        </p>
      </div>
    </a-spin>
  </a-modal>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { HolderOutlined, CloseOutlined } from '@ant-design/icons-vue'
import { message as AMessage } from 'ant-design-vue'
import { zoneApi } from '@/api'
import type { SortPriorityField } from '@/types/business'

const ALL_FIELDS: SortPriorityField[] = ['logistics_company','destination_region','weight_asc','weight_desc','order_time']
const FIELD_LABELS: Record<SortPriorityField, string> = {
  logistics_company:  '物流公司',
  destination_region: '目的地区域',
  weight_asc:         '重量（轻→重）',
  weight_desc:        '重量（重→轻）',
  order_time:         '下单时间',
}

const props = defineProps<{ open: boolean; zoneId: number; zoneName: string }>()
const emit = defineEmits<{ 'update:open': [boolean] }>()

const loading = ref(false)
const sub = ref(false)
const form = ref({ priorityFields: ['logistics_company', 'destination_region'] as SortPriorityField[], mixSizeAllowed: false })

const availableFields = computed(() => ALL_FIELDS.filter(f => !form.value.priorityFields.includes(f)))

watch(() => props.open, async (v) => {
  if (!v || !props.zoneId) return
  loading.value = true
  try {
    const rule = await zoneApi.getSortRule(props.zoneId)
    form.value = { priorityFields: rule.priorityFields, mixSizeAllowed: rule.mixSizeAllowed }
  } catch {
    form.value = { priorityFields: ['logistics_company', 'destination_region'], mixSizeAllowed: false }
  } finally { loading.value = false }
})

function addField(f: SortPriorityField) { form.value.priorityFields.push(f) }
function removeField(idx: number) { form.value.priorityFields.splice(idx, 1) }

let dragIdx = -1
function dragStart(i: number) { dragIdx = i }
function dragOver(i: number) {
  if (dragIdx === i) return
  const arr = [...form.value.priorityFields]
  const [item] = arr.splice(dragIdx, 1)
  arr.splice(i, 0, item)
  form.value.priorityFields = arr
  dragIdx = i
}
function dragEnd() { dragIdx = -1 }

async function submit() {
  sub.value = true
  try {
    await zoneApi.updateSortRule(props.zoneId, { priorityFields: form.value.priorityFields, mixSizeAllowed: form.value.mixSizeAllowed })
    AMessage.success('排序规则已保存')
    emit('update:open', false)
  } finally { sub.value = false }
}
</script>

<style scoped>
.rule-section { margin-bottom: 4px; }
.rule-title { font-size: 14px; font-weight: 600; color: #1a1d23; margin-bottom: 4px; }
.rule-desc { font-size: 12px; color: #8c92a0; margin: 0 0 10px; }
.priority-list { display: flex; flex-direction: column; gap: 6px; }
.priority-item {
  display: flex; align-items: center; gap: 10px;
  background: #f7f8fc; border: 1px solid #ebedf2; border-radius: 8px;
  padding: 8px 12px; cursor: grab; transition: background 0.15s;
}
.priority-item:hover { background: #edf2ff; }
.drag-handle { color: #c0c4cc; font-size: 14px; }
.pri-rank {
  width: 20px; height: 20px; background: #1677ff; color: #fff;
  border-radius: 50%; display: flex; align-items: center; justify-content: center;
  font-size: 11px; font-weight: 700; flex-shrink: 0;
}
.pri-label { flex: 1; font-size: 13px; color: #1a1d23; }
</style>
