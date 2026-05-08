<template>
  <a-modal :open="open" title="批量添加货架" :confirm-loading="sub" ok-text="批量创建" width="480" @ok="submit" @cancel="$emit('update:open',false)">
    <a-form ref="formRef" :model="form" :rules="rules" layout="vertical" style="margin-top:8px">
      <a-form-item label="编号前缀" name="codePrefix" extra="如填 A- 则生成 A-01、A-02…">
        <a-input v-model:value="form.codePrefix" placeholder="如：A-" />
      </a-form-item>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px">
        <a-form-item label="起始编号" name="startNo"><a-input-number v-model:value="form.startNo" :min="1" style="width:100%" /></a-form-item>
        <a-form-item label="生成数量" name="count"><a-input-number v-model:value="form.count" :min="1" :max="100" style="width:100%" /></a-form-item>
      </div>
      <a-form-item label="最大承重(kg)" name="maxWeightKg"><a-input-number v-model:value="form.maxWeightKg" :min="1" style="width:100%" /></a-form-item>
      <a-form-item label="最多件数" name="maxBoxCount"><a-input-number v-model:value="form.maxBoxCount" :min="1" style="width:100%" /></a-form-item>
      <a-form-item label="件型"><a-radio-group v-model:value="form.sizeType" button-style="solid">
        <a-radio-button value="small">仅小件</a-radio-button>
        <a-radio-button value="large">仅大件</a-radio-button>
        <a-radio-button value="mixed">混合</a-radio-button>
      </a-radio-group></a-form-item>

      <div class="preview-box">
        <span class="preview-label">预览编号：</span>
        <span class="preview-val">{{ preview }}</span>
      </div>
    </a-form>
  </a-modal>
</template>
<script setup lang="ts">
import { ref, computed } from 'vue'
import type { FormInstance } from 'ant-design-vue'
import { message as AMessage } from 'ant-design-vue'
import { rackApi } from '@/api'
const props = defineProps<{ open: boolean; zoneId: number; zoneName: string }>()
const emit = defineEmits<{ 'update:open': [boolean]; saved: [] }>()
const formRef = ref<FormInstance>()
const sub = ref(false)
const form = ref({ codePrefix: '', startNo: 1, count: 5, maxWeightKg: 20, maxBoxCount: 10, sizeType: 'mixed' as const })
const rules = { codePrefix: [{ required: true, message: '请填写编号前缀' }] }
const preview = computed(() => {
  const start = form.value.startNo
  const end = start + form.value.count - 1
  const p = form.value.codePrefix
  return `${p}${String(start).padStart(2,'0')} ~ ${p}${String(end).padStart(2,'0')}`
})
async function submit() {
  await formRef.value?.validate(); sub.value = true
  try {
    const res = await rackApi.batchCreate({
      zoneId: props.zoneId, codePrefix: form.value.codePrefix,
      startNo: form.value.startNo, count: form.value.count,
      capacity: { maxWeightGrams: form.value.maxWeightKg * 1000, maxBoxCount: form.value.maxBoxCount, sizeType: form.value.sizeType },
    })
    AMessage.success(`成功创建 ${res.created} 个货架`)
    emit('saved'); emit('update:open', false)
  } finally { sub.value = false }
}
</script>
<style scoped>
.preview-box { background:#f5f6fa;border-radius:8px;padding:10px 14px;display:flex;align-items:center;gap:8px; }
.preview-label { font-size:12px;color:#8c92a0; }
.preview-val { font-family:'DM Mono','Menlo',monospace;font-size:14px;font-weight:600;color:#1677ff; }
</style>
