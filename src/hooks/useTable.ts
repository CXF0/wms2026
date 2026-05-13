import { reactive, ref } from 'vue'
import type { TablePaginationConfig } from 'ant-design-vue'
import type { PageResult } from '@/types/business'

type FetchFn<T, P> = (p: P & { page: number; pageSize: number }) => Promise<PageResult<T>>

export function useTable<T, P extends Record<string, unknown>>(
  fetchFn: FetchFn<T, P>,
  defaultParams?: Partial<P>,
  opts?: { immediate?: boolean; pageSize?: number },
) {
  const { immediate = true, pageSize = 20 } = opts ?? {}
  const loading = ref(false)
  const data = ref<T[]>([]) as { value: T[] }
  const params = reactive<Partial<P>>({ ...defaultParams }) as Partial<P>
  const pagination = reactive<TablePaginationConfig>({
    current: 1, pageSize, total: 0,
    showSizeChanger: true, showQuickJumper: true,
    showTotal: (t: number) => `共 ${t} 条`,
  })

  async function fetch() {
    loading.value = true
    try {
      const res = await fetchFn({ ...(params as P), page: pagination.current!, pageSize: pagination.pageSize! })
      data.value = res.list
      pagination.total = res.total
    } finally { loading.value = false }
  }

  const onTableChange = (p: TablePaginationConfig) => { pagination.current = p.current; pagination.pageSize = p.pageSize; fetch() }
  const search = () => { pagination.current = 1; fetch() }
  const reset  = () => { Object.assign(params, defaultParams); pagination.current = 1; fetch() }

  if (immediate) fetch()
  return { loading, data, pagination, params, fetch, onTableChange, search, reset }
}
