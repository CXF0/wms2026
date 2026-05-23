import http from '@/utils/http'
import type {
  LoginParams, UserInfo, Staff, StaffGroup,
  Region, Zone, Base, CollectionStation, StationPageResult,
  PhysicalRack, BoxTypeConfig, NfcCard, ZoneSortRule,
  Session, Order, PageResult, PageParams,
  InspectionRecord, PickingRecord, ProxyApply,
  Package, ShipmentRecord,
  PenaltyRecord,
  SalaryMonthly, SessionSettlement, Bonus,
  SupplyItem, SupplyType, SupplyInbound, SupplyOutbound,
  DashboardOverview, PickingEfficiencyStat, PackingShippingStat, TransportStat,
  AppVersion, RecruitPost, RecruitApplicant, AttendanceRecord,
} from '@/types/business'

// ─── 认证 ────────────────────────────────────────────────────
export const authApi = {
  /**
   * 子账号密码登录
   * POST /xm-bulky-supplier/login/sub
   * type: 1=兼职登录（WEB端固定传 1）
   */
  login: (data: LoginParams) =>
    http.post<UserInfo>('/login/sub', data),

  logout: () =>
    http.post('/auth/logout'),
}

// ─── 组织结构 ─────────────────────────────────────────────────
export const regionApi = {
  list:   ()                              => http.get<Region[]>('/regions'),
  create: (data: Omit<Region, 'id'>)      => http.post<Region>('/regions', data),
  update: (id: number, data: Partial<Region>) => http.put<Region>(`/regions/${id}`, data),
  remove: (id: number)                    => http.delete(`/regions/${id}`),
}

export const zoneApi = {
  list:   (params?: { regionId?: number; status?: string }) => http.get<Zone[]>('/zones', params),
  create: (data: Omit<Zone, 'id'>)        => http.post<Zone>('/zones', data),
  update: (id: number, data: Partial<Zone>) => http.put<Zone>(`/zones/${id}`, data),
  remove: (id: number)                    => http.delete(`/zones/${id}`),
  // 分区排序规则
  getSortRule:    (zoneId: number)        => http.get<ZoneSortRule>(`/zones/${zoneId}/sort-rule`),
  updateSortRule: (zoneId: number, data: Omit<ZoneSortRule, 'id' | 'zoneId' | 'zoneName' | 'updatedAt' | 'updatedBy'>) =>
    http.put<ZoneSortRule>(`/zones/${zoneId}/sort-rule`, data),
}

export const baseApi = {
  list:   ()                           => http.get<Base[]>('/bases'),
  create: (data: Omit<Base, 'id'>)     => http.post<Base>('/bases', data),
  update: (id: number, d: Partial<Base>) => http.put<Base>(`/bases/${id}`, d),
}

export const stationApi = {
  list:   (params?: { baseId?: number }) => http.get<CollectionStation[]>('/stations', params),
  create: (data: Omit<CollectionStation, 'id'>) => http.post<CollectionStation>('/stations', data),
  update: (id: number, d: Partial<CollectionStation>) => http.put(`/stations/${id}`, d),

  // 带经纬度的集货站分页列表（运输看板使用）
  page: (index = 1, size = 200) =>
    http.post<StationPageResult>('/station/page', { index, size, searchCount: false }),
}

// ─── 货位管理 ─────────────────────────────────────────────────
export const rackApi = {
  list: (params?: { zoneId?: number; regionId?: number; status?: string; nfcBound?: boolean }) =>
    http.get<PhysicalRack[]>('/racks', params),

  detail: (id: number) =>
    http.get<PhysicalRack>(`/racks/${id}`),

  create: (data: Omit<PhysicalRack, 'id' | 'nfcBound' | 'createdAt'>) =>
    http.post<PhysicalRack>('/racks', data),

  update: (id: number, data: Partial<PhysicalRack>) =>
    http.put<PhysicalRack>(`/racks/${id}`, data),

  remove: (id: number) =>
    http.delete(`/racks/${id}`),

  batchCreate: (data: {
    zoneId: number
    codePrefix: string
    startNo: number
    count: number
    capacity: PhysicalRack['capacity']
  }) => http.post<{ created: number }>('/racks/batch', data),
}

// ─── 件型配置 ─────────────────────────────────────────────────
export const boxTypeApi = {
  list:   ()                                    => http.get<BoxTypeConfig[]>('/box-types'),
  create: (data: Omit<BoxTypeConfig, 'id'>)     => http.post<BoxTypeConfig>('/box-types', data),
  update: (id: number, d: Partial<BoxTypeConfig>) => http.put<BoxTypeConfig>(`/box-types/${id}`, d),
  remove: (id: number)                          => http.delete(`/box-types/${id}`),
  // 拖拽排序
  reorder: (ids: number[])                      => http.put('/box-types/reorder', { ids }),
}

// ─── NFC 管理 ────────────────────────────────────────────────
export const nfcApi = {
  list: (params?: { status?: string; zoneId?: number } & PageParams) =>
    http.get<PageResult<NfcCard>>('/nfc', params),

  bind: (nfcId: string, rackId: number) =>
    http.post('/nfc/bind', { nfcId, rackId }),

  unbind: (nfcId: string) =>
    http.post('/nfc/unbind', { nfcId }),

  disable: (nfcId: string) =>
    http.post('/nfc/disable', { nfcId }),

  // 批量导入 NFC ID（从硬件设备导出的清单）
  batchImport: (file: File) =>
    http.upload<{ imported: number; duplicates: number }>('/nfc/import', file),
}

// ─── 场次 ────────────────────────────────────────────────────
export const sessionApi = {
  list: (p?: { date?: string; regionId?: number; status?: string }) =>
    http.get<Session[]>('/sessions', p),
  detail: (id: number)       => http.get<Session>(`/sessions/${id}`),
  create: (data: Pick<Session, 'date' | 'timeSlot' | 'logisticsCompany' | 'logisticsCode' | 'regionId' | 'cutoffTime' | 'estimatedPickupTime'>) =>
    http.post<Session>('/sessions', data),
  generateRacks: (id: number) =>
    http.post<{ racksCreated: number; unassigned: number }>(`/sessions/${id}/generate-racks`),
  updateStatus: (id: number, status: Session['status']) =>
    http.put(`/sessions/${id}/status`, { status }),
}

// ─── 订单 ────────────────────────────────────────────────────
export const orderApi = {
  list: (p: PageParams & { sessionId?: number; status?: string; sourceType?: string; date?: string; keyword?: string }) =>
    http.get<PageResult<Order>>('/orders', p),
  detail:       (id: number)                     => http.get<Order>(`/orders/${id}`),
  importExcel:  (file: File, date: string)       => http.upload<{ imported: number; failed: number }>('/orders/import', file, { date }),
  assignSession:(orderIds: number[], sessionId: number) => http.post('/orders/assign-session', { orderIds, sessionId }),
  markException:(id: number, reason: string)     => http.post(`/orders/${id}/exception`, { reason }),
}

// ─── 质检 ────────────────────────────────────────────────────
export const inspectionApi = {
  list: (p: PageParams & { sessionId?: number; zoneId?: number; date?: string }) =>
    http.get<PageResult<InspectionRecord>>('/inspections', p),
  // 标记/取消标记降级、缺货、退货、换货
  update: (id: number, data: Partial<InspectionRecord>) =>
    http.put(`/inspections/${id}`, data),
}

// ─── 配货记录 ─────────────────────────────────────────────────
export const pickingApi = {
  list: (p: PageParams & { sessionId?: number; zoneId?: number; pickType?: string; date?: string }) =>
    http.get<PageResult<PickingRecord>>('/pickings', p),
  // 代配申请审核
  proxyList:   (p: PageParams & { status?: string; sessionId?: number }) =>
    http.get<PageResult<ProxyApply>>('/proxy-applies', p),
  proxyReview: (id: number, approved: boolean, reason?: string) =>
    http.post(`/proxy-applies/${id}/review`, { approved, reason }),
}

// ─── 打包记录 ─────────────────────────────────────────────────
export const packingApi = {
  list: (p: PageParams & { sessionId?: number; zoneId?: number; date?: string }) =>
    http.get<PageResult<Package>>('/packages', p),
  // 面单打印
  printLabel: (packageId: number) =>
    http.post(`/packages/${packageId}/print-label`),
}

// ─── 发货记录 ─────────────────────────────────────────────────
export const shipmentApi = {
  list: (p: PageParams & { sessionId?: number; date?: string; status?: string }) =>
    http.get<PageResult<ShipmentRecord>>('/shipments', p),
  create: (data: Omit<ShipmentRecord, 'id' | 'status' | 'createdById' | 'createdByName' | 'shippedAt'>) =>
    http.post<ShipmentRecord>('/shipments', data),
  confirm: (id: number) =>
    http.post(`/shipments/${id}/confirm`),
  // 发货单打印
  printDelivery: (id: number) =>
    http.post(`/shipments/${id}/print-delivery`),
}

// ─── 处罚管理 ─────────────────────────────────────────────────
export const penaltyApi = {
  list: (p: PageParams & { type?: string; sessionId?: number; date?: string; status?: string }) =>
    http.get<PageResult<PenaltyRecord>>('/penalties', p),
  // 违规处罚手动创建（巡察员操作）
  createViolation: (data: Omit<PenaltyRecord, 'id' | 'type' | 'status' | 'createdAt'>) =>
    http.post<PenaltyRecord>('/penalties/violation', data),
  confirm: (id: number)  => http.post(`/penalties/${id}/confirm`),
  cancel:  (id: number)  => http.post(`/penalties/${id}/cancel`),
}

// ─── 人员管理 ─────────────────────────────────────────────────
export const staffApi = {
  list: (p: PageParams & { role?: string; groupId?: number; zoneId?: number; status?: string }) =>
    http.get<PageResult<Staff>>('/staff', p),
  create: (data: Omit<Staff, 'id' | 'groupName'>) => http.post<Staff>('/staff', data),
  update: (id: number, d: Partial<Staff>)          => http.put<Staff>(`/staff/${id}`, d),
  remove: (id: number)                             => http.delete(`/staff/${id}`),
  resetPwd: (id: number)                           => http.post(`/staff/${id}/reset-password`),

  groupList:   ()                              => http.get<StaffGroup[]>('/staff/groups'),
  groupCreate: (d: Omit<StaffGroup, 'id' | 'memberCount'>) => http.post<StaffGroup>('/staff/groups', d),
  groupUpdate: (id: number, d: Partial<StaffGroup>) => http.put(`/staff/groups/${id}`, d),

  attendance: (p: PageParams & { date?: string; staffId?: number }) =>
    http.get<PageResult<AttendanceRecord>>('/attendance', p),
}

// ─── 招聘 ────────────────────────────────────────────────────
export const recruitApi = {
  posts:           (p?: PageParams)                    => http.get<PageResult<RecruitPost>>('/recruit/posts', p),
  createPost:      (d: Omit<RecruitPost, 'id' | 'createdAt'>) => http.post<RecruitPost>('/recruit/posts', d),
  publishPost:     (id: number)                        => http.post(`/recruit/posts/${id}/publish`),
  applicants:      (postId: number, p?: PageParams)    => http.get<PageResult<RecruitApplicant>>(`/recruit/posts/${postId}/applicants`, p),
  confirmApplicant:(id: number)                        => http.post(`/recruit/applicants/${id}/confirm`),
  rejectApplicant: (id: number, reason?: string)       => http.post(`/recruit/applicants/${id}/reject`, { reason }),
}

// ─── 工资管理 ─────────────────────────────────────────────────
export const salaryApi = {
  monthly: (p: PageParams & { month?: string; staffId?: number }) =>
    http.get<PageResult<SalaryMonthly>>('/salary/monthly', p),
  confirm: (id: number)  => http.post(`/salary/monthly/${id}/confirm`),
  markPaid:(id: number)  => http.post(`/salary/monthly/${id}/paid`),

  settlements: (p: PageParams & { sessionId?: number; staffId?: number; date?: string }) =>
    http.get<PageResult<SessionSettlement>>('/salary/settlements', p),

  bonusList:   (p: PageParams & { month?: string; status?: string }) =>
    http.get<PageResult<Bonus>>('/salary/bonuses', p),
  createBonus: (d: Omit<Bonus, 'id' | 'status' | 'createdAt'>) =>
    http.post<Bonus>('/salary/bonuses', d),
  approveBonus:(id: number) => http.post(`/salary/bonuses/${id}/approve`),
}

// ─── 物资管理 ─────────────────────────────────────────────────
export const supplyApi = {
  items:        (p: PageParams & { typeId?: number; keyword?: string }) =>
    http.get<PageResult<SupplyItem>>('/supply/items', p),
  createItem:   (d: Omit<SupplyItem, 'id' | 'currentStock'>) =>
    http.post<SupplyItem>('/supply/items', d),
  updateItem:   (id: number, d: Partial<SupplyItem>) =>
    http.put(`/supply/items/${id}`, d),

  types:        () => http.get<SupplyType[]>('/supply/types'),
  createType:   (d: Omit<SupplyType, 'id'>) => http.post<SupplyType>('/supply/types', d),

  inboundList:  (p: PageParams & { date?: string }) =>
    http.get<PageResult<SupplyInbound>>('/supply/inbound', p),
  createInbound:(d: Omit<SupplyInbound, 'id'>) =>
    http.post<SupplyInbound>('/supply/inbound', d),

  outboundList: (p: PageParams & { date?: string }) =>
    http.get<PageResult<SupplyOutbound>>('/supply/outbound', p),
  createOutbound:(d: Omit<SupplyOutbound, 'id'>) =>
    http.post<SupplyOutbound>('/supply/outbound', d),
}

// ─── 看板 ────────────────────────────────────────────────────
export const dashboardApi = {
  overview:        (date: string) => http.get<DashboardOverview>('/dashboard/overview', { date }),
  pickingEfficiency:(p: { date: string; sessionId?: number }) =>
    http.get<PickingEfficiencyStat>('/dashboard/picking-efficiency', p),
  packingShipping: (date: string) => http.get<PackingShippingStat>('/dashboard/packing-shipping', { date }),
  transport:       (date: string) => http.get<TransportStat>('/dashboard/transport', { date }),
}

// ─── APP版本管理 ─────────────────────────────────────────────
export const appVersionApi = {
  list:    (p?: { appType?: string; platform?: string }) =>
    http.get<AppVersion[]>('/app-versions', p),
  create:  (d: Omit<AppVersion, 'id' | 'createdAt'>) =>
    http.post<AppVersion>('/app-versions', d),
  release: (id: number) => http.post(`/app-versions/${id}/release`),
  deprecate:(id: number)=> http.post(`/app-versions/${id}/deprecate`),
}