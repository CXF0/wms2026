import type { UserRole, SessionStatus, OrderStatus, StaffType } from '@/types/business'

// ─── 角色 ────────────────────────────────────────────────────
export const ROLE_LABELS: Record<UserRole, string> = {
  admin:             '场地管理员',
  region_mgr:        '大区负责人',
  zone_sup:          '分区主管',
  inspector:         '质检员',
  picker:            '配货员',
  packer:            '打包员',
  logistics:         '物流专员',
  driver:            '司机',
  inspector_patrol:  '巡察员',
  supply_mgr:        '物资管理员',
  base_leader:       '基地片区负责人',
  base_staff:        '基地驻场',
}
export const roleLabel = (r: UserRole) => ROLE_LABELS[r] ?? r

// ─── 员工类型 ─────────────────────────────────────────────────
export const STAFF_TYPE_LABELS: Record<StaffType, string> = {
  fulltime:          '全职',
  parttime_listed:   '兼职（名单内）',
  parttime_unlisted: '兼职（名单外）',
}
export const staffTypeLabel = (t: StaffType) => STAFF_TYPE_LABELS[t] ?? t

// ─── 场次状态 ─────────────────────────────────────────────────
const SESSION_STATUS: Record<SessionStatus, { label: string; color: string }> = {
  planning:    { label: '规划中',     color: 'default' },
  open:        { label: '开放配货',   color: 'blue' },
  picking:     { label: '配货中',     color: 'processing' },
  packing:     { label: '打包中',     color: 'purple' },
  dispatching: { label: '待物流取货', color: 'gold' },
  closed:      { label: '已完成',     color: 'success' },
}
export const sessionStatusLabel = (s: SessionStatus) => SESSION_STATUS[s]?.label ?? s
export const sessionStatusColor = (s: SessionStatus) => SESSION_STATUS[s]?.color ?? 'default'

// ─── 订单状态 ─────────────────────────────────────────────────
const ORDER_STATUS: Record<OrderStatus, { label: string; color: string }> = {
  pending:          { label: '待分配',   color: 'default' },
  session_assigned: { label: '已排场次', color: 'blue' },
  rack_assigned:    { label: '待配货',   color: 'cyan' },
  picking:          { label: '配货中',   color: 'processing' },
  picked:           { label: '已配货',   color: 'geekblue' },
  packing:          { label: '打包中',   color: 'purple' },
  packed:           { label: '待发货',   color: 'gold' },
  shipped:          { label: '已发货',   color: 'success' },
  exception:        { label: '异常',     color: 'error' },
}
export const orderStatusLabel = (s: OrderStatus) => ORDER_STATUS[s]?.label ?? s
export const orderStatusColor = (s: OrderStatus) => ORDER_STATUS[s]?.color ?? 'default'

// ─── 货架状态 ─────────────────────────────────────────────────
export const RACK_STATUS = {
  active:      { label: '正常',   color: 'success' },
  inactive:    { label: '停用',   color: 'default' },
  maintenance: { label: '维护中', color: 'warning' },
} as const
export const rackStatusLabel = (s: string) => (RACK_STATUS as Record<string, {label:string;color:string}>)[s]?.label ?? s
export const rackStatusColor = (s: string) => (RACK_STATUS as Record<string, {label:string;color:string}>)[s]?.color ?? 'default'

// ─── NFC状态 ─────────────────────────────────────────────────
export const NFC_STATUS = {
  unbound:  { label: '未绑定', color: 'default' },
  bound:    { label: '已绑定', color: 'success' },
  disabled: { label: '已停用', color: 'error' },
} as const
export const nfcStatusLabel = (s: string) => (NFC_STATUS as Record<string, {label:string;color:string}>)[s]?.label ?? s
export const nfcStatusColor = (s: string) => (NFC_STATUS as Record<string, {label:string;color:string}>)[s]?.color ?? 'default'

// ─── 时间段 ──────────────────────────────────────────────────
export const TIME_SLOT_LABELS = {
  morning: '上午场', afternoon: '下午场', evening: '晚班场',
} as const

// ─── 货源类型 ─────────────────────────────────────────────────
export const SOURCE_TYPE_LABELS = {
  base_normal:   '基地配货',
  base_proxy:    '代配货',
  supplier_self: '供应商自配',
} as const
