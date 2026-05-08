<template>
  <div class="boxtype-page">
    <div class="page-tip">
      <InfoCircleOutlined /> 件型按重量区间自动匹配，配货时系统根据订单预估重量决定使用哪种箱子。
    </div>

    <div class="panel">
      <div class="panel-head">
        <span class="panel-title">件型列表</span>
        <a-button type="primary" size="small" @click="openModal()"><PlusOutlined /> 新增件型</a-button>
      </div>

      <a-table
        :columns="columns" :data-source="list" :loading="loading"
        row-key="id" :pagination="false" class="bt-table"
      >
        <template #bodyCell="{ column, record }">
          <template v-if="column.key === 'weightRange'">
            <span class="weight-range">
              {{ record.minWeightGrams / 1000 }}kg
              <ArrowRightOutlined style="font-size:10px;margin:0 4px;color:#a0a8b4" />
              {{ record.maxWeightGrams >= 999999 ? '∞' : record.maxWeightGrams / 1000 + 'kg' }}
            </span>
          </template>
          <template v-else-if="column.key === 'status'">
            <a-badge :status="record.isActive ? 'success' : 'default'" :text="record.isActive ? '启用' : '停用'" />
          </template>
          <template v-else-if="column.key === 'action'">
            <a-space>
              <a-button type="link" size="small" @click="openModal(record)">编辑</a-button>
              <a-popconfirm title="确认删除？" @confirm="remove(record.id)">
                <a-button type="link" size="small" danger>删除</a-button>
              </a-popconfirm>
            </a-space>
          </template>
        </template>
      </a-table>
    </div>

    <!-- 新增/编辑弹窗 -->
    <a-modal :open="modalOpen" :title="editing ? '编辑件型' : '新增件型'" :confirm-loading="sub" ok-text="保存" @ok="submit" @cancel="modalOpen=false">
      <a-form ref="formRef" :model="form" :rules="rules" layout="vertical" style="margin-top:8px">
        <a-form-item label="件型名称" name="name"><a-input v-model:value="form.name" placeholder="如：小件、中件" /></a-form-item>
        <a-form-item label="内部编码" name="code"><a-input v-model:value="form.code" /></a-form-item>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px">
          <a-form-item label="重量下限(g)" name="minWeightGrams" extra="含">
            <a-input-number v-model:value="form.minWeightGrams" :min="0" style="width:100%" />
          </a-form-item>
          <a-form-item label="重量上限(g)" name="maxWeightGrams" extra="不含，最大档填999999">
            <a-input-number v-model:value="form.maxWeightGrams" :min="1" style="width:100%" />
          </a-form-item>
        </div>
        <a-form-item label="箱规描述" name="boxSpec"><a-input v-model:value="form.boxSpec" placeholder="如：30×20×15cm" /></a-form-item>
        <a-form-item label="是否启用"><a-switch v-model:checked="form.isActive" /></a-form-item>
      </a-form>
    </a-modal>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { InfoCircleOutlined, PlusOutlined, ArrowRightOutlined } from '@ant-design/icons-vue'
import type { FormInstance } from 'ant-design-vue'
import { message as AMessage } from 'ant-design-vue'
import { boxTypeApi } from '@/api'
import type { BoxTypeConfig } from '@/types/business'

const loading = ref(false)
const list = ref<BoxTypeConfig[]>([])
const modalOpen = ref(false)
const sub = ref(false)
const editing = ref<BoxTypeConfig | null>(null)
const formRef = ref<FormInstance>()
const form = ref({ name: '', code: '', minWeightGrams: 0, maxWeightGrams: 500, boxSpec: '', sortOrder: 0, isActive: true })
const rules = { name: [{ required: true, message: '请输入名称' }], code: [{ required: true, message: '请输入编码' }] }

const columns = [
  { title: '排序', dataIndex: 'sortOrder', key: 'sortOrder', width: 60 },
  { title: '件型名称', dataIndex: 'name', key: 'name' },
  { title: '编码', dataIndex: 'code', key: 'code' },
  { title: '重量区间', key: 'weightRange' },
  { title: '箱规', dataIndex: 'boxSpec', key: 'boxSpec' },
  { title: '状态', key: 'status', width: 80 },
  { title: '操作', key: 'action', width: 120 },
]

async function fetchList() {
  loading.value = true
  try { list.value = await boxTypeApi.list() }
  finally { loading.value = false }
}

function openModal(item?: BoxTypeConfig) {
  editing.value = item ?? null
  form.value = item
    ? { name: item.name, code: item.code, minWeightGrams: item.minWeightGrams, maxWeightGrams: item.maxWeightGrams, boxSpec: item.boxSpec, sortOrder: item.sortOrder, isActive: item.isActive }
    : { name: '', code: '', minWeightGrams: 0, maxWeightGrams: 500, boxSpec: '', sortOrder: list.value.length, isActive: true }
  modalOpen.value = true
}

async function submit() {
  await formRef.value?.validate(); sub.value = true
  try {
    const result = editing.value
      ? await boxTypeApi.update(editing.value.id, form.value)
      : await boxTypeApi.create(form.value)
    const idx = list.value.findIndex(x => x.id === result.id)
    idx === -1 ? list.value.push(result) : (list.value[idx] = result)
    AMessage.success('保存成功')
    modalOpen.value = false
  } finally { sub.value = false }
}

async function remove(id: number) {
  await boxTypeApi.remove(id)
  list.value = list.value.filter(x => x.id !== id)
  AMessage.success('已删除')
}

onMounted(fetchList)
</script>

<style scoped>
.boxtype-page { padding: 16px 0; }
.page-tip {
  display: flex; align-items: center; gap: 6px;
  background: #e8f4ff; color: #1677ff; border-radius: 8px;
  padding: 10px 16px; font-size: 13px; margin-bottom: 16px;
}
.panel { background: #fff; border-radius: 12px; border: 1.5px solid #ebedf2; overflow: hidden; }
.panel-head { display: flex; align-items: center; justify-content: space-between; padding: 14px 16px; border-bottom: 1px solid #f0f2f5; }
.panel-title { font-size: 14px; font-weight: 600; color: #1a1d23; }
.bt-table :deep(.ant-table-thead > tr > th) { background: #fafbfc; font-size: 12px; }
.weight-range { display: flex; align-items: center; font-family: 'DM Mono', 'Menlo', monospace; font-size: 13px; }
</style>
