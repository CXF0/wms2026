import axios, { type AxiosInstance, type AxiosResponse, type AxiosRequestConfig, type InternalAxiosRequestConfig } from 'axios'
import { message as AMessage } from 'ant-design-vue'
import { useUserStore } from '@/stores/user'
import router from '@/router'

export interface ApiResponse<T = unknown> {
  code: number
  data: T
  message?: string
  msg?: string
  valid?: boolean
}

type RequestConfig = AxiosRequestConfig & {
  silent?: boolean
}

const service: AxiosInstance = axios.create({
  baseURL: '/api',
  timeout: 15_000,
  headers: { 'Content-Type': 'application/json;charset=utf-8' },
})

service.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const { token } = useUserStore()
    if (token) config.headers.Authorization = token
    return config
  },
  (e) => Promise.reject(e),
)

service.interceptors.response.use(
  (res: AxiosResponse<ApiResponse>) => {
    const { code, message, msg, data } = res.data
    if (code === 0) return data as unknown as AxiosResponse
    if (code === 401) {
      redirectToLogin()
      return Promise.reject(new Error('请重新登录'))
    }

    const errMsg = message || msg || '操作失败'
    if (!(res.config as RequestConfig).silent) AMessage.error(errMsg)
    return Promise.reject(new Error(errMsg))
  },
  (error) => {
    const status = error?.response?.status
    const map: Record<number, string> = {
      400: '请求参数有误',
      401: '请重新登录',
      403: '无权限',
      404: '接口不存在',
      500: '服务器错误',
    }
    if (!(error?.config as RequestConfig | undefined)?.silent) {
      AMessage.error(map[status] ?? `网络错误 (${status ?? '超时'})`)
    }
    return Promise.reject(error)
  },
)

let redirecting = false
function redirectToLogin() {
  if (redirecting) return
  redirecting = true
  useUserStore().$reset()
  router.push({ name: 'Login', query: { redirect: router.currentRoute.value.fullPath } })
  setTimeout(() => (redirecting = false), 3000)
}

const http = {
  get<T = unknown>(url: string, params?: Record<string, unknown>, cfg?: RequestConfig): Promise<T> {
    return service.get(url, { params, ...cfg }) as unknown as Promise<T>
  },
  post<T = unknown>(url: string, data?: unknown, cfg?: RequestConfig): Promise<T> {
    return service.post(url, data, cfg) as unknown as Promise<T>
  },
  put<T = unknown>(url: string, data?: unknown, cfg?: RequestConfig): Promise<T> {
    return service.put(url, data, cfg) as unknown as Promise<T>
  },
  delete<T = unknown>(url: string, cfg?: RequestConfig): Promise<T> {
    return service.delete(url, cfg) as unknown as Promise<T>
  },
  upload<T = unknown>(url: string, file: File, extra?: Record<string, string>): Promise<T> {
    const form = new FormData()
    form.append('file', file)
    if (extra) Object.entries(extra).forEach(([key, value]) => form.append(key, value))
    return service.post(url, form, { headers: { 'Content-Type': 'multipart/form-data' } }) as unknown as Promise<T>
  },
}

export default http
