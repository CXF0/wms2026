import axios, { type AxiosInstance, type InternalAxiosRequestConfig, type AxiosResponse, type AxiosRequestConfig } from 'axios'
import { message as AMessage } from 'ant-design-vue'
import { useUserStore } from '@/stores/user'
import router from '@/router'

export interface ApiResponse<T = unknown> { code: number; message: string; data: T }

const service: AxiosInstance = axios.create({
  baseURL: '/api', timeout: 15_000,
  headers: { 'Content-Type': 'application/json;charset=utf-8' },
})

service.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const { token } = useUserStore()
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
}, (e) => Promise.reject(e))

service.interceptors.response.use(
  (res: AxiosResponse<ApiResponse>) => {
    const { code, message, data } = res.data
    if (code === 200) return data as unknown as AxiosResponse
    if (code === 401) { redirectToLogin(); return Promise.reject(new Error('请重新登录')) }
    AMessage.error(message || '操作失败')
    return Promise.reject(new Error(message))
  },
  (error) => {
    const s = error?.response?.status
    const m: Record<number, string> = { 400: '请求参数有误', 401: '请重新登录', 403: '无权限', 404: '接口不存在', 500: '服务器错误' }
    AMessage.error(m[s] ?? `网络错误 (${s ?? '超时'})`)
    return Promise.reject(error)
  },
)

let _r = false
function redirectToLogin() {
  if (_r) return; _r = true
  useUserStore().clear()
  router.push({ name: 'Login', query: { redirect: router.currentRoute.value.fullPath } })
  setTimeout(() => (_r = false), 3000)
}

const http = {
  get<T = unknown>(url: string, params?: Record<string, unknown>, cfg?: AxiosRequestConfig): Promise<T> {
    return service.get(url, { params, ...cfg }) as unknown as Promise<T>
  },
  post<T = unknown>(url: string, data?: unknown, cfg?: AxiosRequestConfig): Promise<T> {
    return service.post(url, data, cfg) as unknown as Promise<T>
  },
  put<T = unknown>(url: string, data?: unknown, cfg?: AxiosRequestConfig): Promise<T> {
    return service.put(url, data, cfg) as unknown as Promise<T>
  },
  delete<T = unknown>(url: string, cfg?: AxiosRequestConfig): Promise<T> {
    return service.delete(url, cfg) as unknown as Promise<T>
  },
  upload<T = unknown>(url: string, file: File, extra?: Record<string, string>): Promise<T> {
    const form = new FormData()
    form.append('file', file)
    if (extra) Object.entries(extra).forEach(([k, v]) => form.append(k, v))
    return service.post(url, form, { headers: { 'Content-Type': 'multipart/form-data' } }) as unknown as Promise<T>
  },
}

export default http
