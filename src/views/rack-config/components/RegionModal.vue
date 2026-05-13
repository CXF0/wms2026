<template>
  <a-modal :open="open" :title="editing ? '编辑大区' : '新建大区'" :confirm-loading="sub" ok-text="保存" @ok="submit" @cancel="$emit('update:open',false)">
    <a-form ref="formRef" :model="form" :rules="rules" layout="vertical" style="margin-top:8px">
      <a-form-item label="大区名称" name="name"><a-input v-model:value="form.name" /></a-form-item>
      <a-form-item label="大区编码" name="code"><a-input v-model:value="form.code" /></a-form-item>
    </a-form>
  </a-modal>
</template>
<script setup lang="ts">
import { ref, watch } from 'vue'
import type { FormInstance } from 'ant-design-vue'
import { regionApi } from '@/api'
import type { Region } from '@/types/business'
const props = defineProps<{ open: boolean; editing: Region | null }>()
const emit = defineEmits<{ 'update:open': [boolean]; saved: [Region] }>()
const formRef = ref<FormInstance>()
const sub = ref(false)
const form = ref({ name: '', code: '' })
const rules = { name: [{ required: true, message: '请输入名称' }], code: [{ required: true, message: '请输入编码' }] }
watch(() => props.editing, r => { form.value = r ? { name: r.name, code: r.code } : { name: '', code: '' } })
async function submit() {
  await formRef.value?.validate(); sub.value = true
  try {
    const r = props.editing
      ? await regionApi.update(props.editing.id, { ...form.value })
      : await regionApi.create({ ...form.value, status: 'active' })
    emit('saved', r); emit('update:open', false)
  } finally { sub.value = false }
}
</script>
