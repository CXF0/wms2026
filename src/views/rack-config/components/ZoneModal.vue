<template>
  <a-modal :open="open" :title="editing ? '编辑分区' : '新建分区'" :confirm-loading="sub" ok-text="保存" @ok="submit" @cancel="$emit('update:open',false)">
    <a-form ref="formRef" :model="form" :rules="rules" layout="vertical" style="margin-top:8px">
      <a-form-item label="分区名称" name="name"><a-input v-model:value="form.name" /></a-form-item>
      <a-form-item label="分区编码" name="code"><a-input v-model:value="form.code" /></a-form-item>
      <a-form-item label="排序权重" name="sortOrder"><a-input-number v-model:value="form.sortOrder" :min="0" style="width:100%" /></a-form-item>
    </a-form>
  </a-modal>
</template>
<script setup lang="ts">
import { ref, watch } from 'vue'
import type { FormInstance } from 'ant-design-vue'
import { zoneApi } from '@/api'
import type { Zone } from '@/types/business'
const props = defineProps<{ open: boolean; editing: Zone | null; regionId: number | null }>()
const emit = defineEmits<{ 'update:open': [boolean]; saved: [Zone] }>()
const formRef = ref<FormInstance>()
const sub = ref(false)
const form = ref({ name: '', code: '', sortOrder: 0 })
const rules = { name: [{ required: true, message: '请输入名称' }], code: [{ required: true, message: '请输入编码' }] }
watch(() => props.editing, z => { form.value = z ? { name: z.name, code: z.code, sortOrder: z.sortOrder } : { name: '', code: '', sortOrder: 0 } })
async function submit() {
  await formRef.value?.validate(); sub.value = true
  try {
    const z = props.editing
      ? await zoneApi.update(props.editing.id, { ...form.value })
      : await zoneApi.create({ ...form.value, regionId: props.regionId!, regionName: '', status: 'active' })
    emit('saved', z); emit('update:open', false)
  } finally { sub.value = false }
}
</script>
