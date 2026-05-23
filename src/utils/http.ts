import axios, { type AxiosInstance, type AxiosRequestConfig, type AxiosResponse, type InternalAxiosRequestConfig } from 'axios'
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

export class AdminAuthError extends Error {
  constructor(message = '运营端登录失效') {
    super(message)
    this.name = 'AdminAuthError'
  }
}

const service: AxiosInstance = axios.create({
  baseURL: '/api',
  timeout: 15_000,
  headers: { 'Content-Type': 'application/json;charset=utf-8' },
})

const adminService: AxiosInstance = axios.create({
  baseURL: '/api/__admin',
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
    if (status === 401) redirectToLogin()
    if (!(error?.config as RequestConfig | undefined)?.silent) {
      AMessage.error(map[status] ?? `网络错误 (${status ?? '超时'})`)
    }
    return Promise.reject(error)
  },
)

adminService.interceptors.response.use(
  (res: AxiosResponse<ApiResponse>) => {
    const { code, message, msg, data } = res.data
    if (code === 0) return data as unknown as AxiosResponse
    const errMsg = message || msg || '运营端接口调用失败'
    if (code === 401) return Promise.reject(new AdminAuthError(errMsg))
    if (!(res.config as RequestConfig).silent) AMessage.error(errMsg)
    return Promise.reject(new Error(errMsg))
  },
  (error) => {
    const status = error?.response?.status
    if (status === 401 || status === 403) {
      return Promise.reject(new AdminAuthError('运营端登录失效或无权限'))
    }
    if (!(error?.config as RequestConfig | undefined)?.silent) {
      AMessage.error(`运营端接口网络错误 (${status ?? '超时'})`)
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
  adminPost<T = unknown>(url: string, data?: unknown, cfg?: RequestConfig): Promise<T> {
    return adminService.post(url, data, cfg) as unknown as Promise<T>
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
