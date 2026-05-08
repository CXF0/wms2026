<template>
  <a-modal
    :open="open" :title="editing ? '编辑货架' : '添加货架'"
    :confirm-loading="submitting" ok-text="保存" cancel-text="取消"
    @ok="submit" @cancel="$emit('update:open', false)"
  >
    <a-form ref="formRef" :model="form" :rules="rules" layout="vertical" style="margin-top:8px">
      <a-form-item label="货架编号" name="code">
        <a-input v-model:value="form.code" placeholder="如：A-01" />
      </a-form-item>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px">
        <a-form-item label="最大承重(kg)" name="maxWeightKg">
          <a-input-number v-model:value="form.maxWeightKg" :min="1" :max="9999" style="width:100%" />
        </a-form-item>
        <a-form-item label="最多包裹件数" name="maxBoxCount">
          <a-input-number v-model:value="form.maxBoxCount" :min="1" :max="99" style="width:100%" />
        </a-form-item>
      </div>
      <a-form-item label="件型分割" name="sizeType">
        <a-radio-group v-model:value="form.sizeType" button-style="solid">
          <a-radio-button value="small">仅小件</a-radio-button>
          <a-radio-button value="large">仅大件</a-radio-button>
          <a-radio-button value="mixed">混合</a-radio-button>
        </a-radio-group>
      </a-form-item>
      <a-form-item label="状态" name="status">
        <a-radio-group v-model:value="form.status">
          <a-radio value="active">正常</a-radio>
          <a-radio value="inactive">停用</a-radio>
          <a-radio value="maintenance">维护中</a-radio>
        </a-radio-group>
      </a-form-item>
      <a-form-item label="排序权重" name="sortOrder">
        <a-input-number v-model:value="form.sortOrder" :min="0" style="width:100%" />
      </a-form-item>
    </a-form>
  </a-modal>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import type { FormInstance } from 'ant-design-vue'
import { rackApi } from '@/api'
import type { PhysicalRack } from '@/types/business'

const props = defineProps<{ open: boolean; editing: PhysicalRack | null; zoneId: number }>()
const emit = defineEmits<{ 'update:open': [boolean]; saved: [PhysicalRack] }>()

const formRef = ref<FormInstance>()
const submitting = ref(false)
const form = ref({ code: '', maxWeightKg: 20, maxBoxCount: 10, sizeType: 'mixed' as const, status: 'active' as const, sortOrder: 0 })
const rules = {
  code: [{ required: true, message: '请输入货架编号' }],
  maxWeightKg: [{ required: true, message: '请输入最大承重' }],
  maxBoxCount: [{ required: true, message: '请输入最多件数' }],
}

watch(() => props.editing, (r) => {
  if (r) form.value = { code: r.code, maxWeightKg: r.capacity.maxWeightGrams / 1000, maxBoxCount: r.capacity.maxBoxCount, sizeType: r.capacity.sizeType, status: r.status, sortOrder: r.sortOrder }
  else form.value = { code: '', maxWeightKg: 20, maxBoxCount: 10, sizeType: 'mixed', status: 'active', sortOrder: 0 }
})

async function submit() {
  await formRef.value?.validate()
  submitting.value = true
  try {
    const payload = {
      code: form.value.code, zoneId: props.zoneId,
      regionId: 0, regionName: '', zoneName: '',
      nfcBound: false,
      capacity: { maxWeightGrams: form.value.maxWeightKg * 1000, maxBoxCount: form.value.maxBoxCount, sizeType: form.value.sizeType },
      sortOrder: form.value.sortOrder, status: form.value.status, createdAt: '',
    }
    const result = props.editing
      ? await rackApi.update(props.editing.id, payload)
      : await rackApi.create(payload)
    emit('saved', result)
    emit('update:open', false)
  } finally { submitting.value = false }
}
</script>
