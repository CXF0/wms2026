// ============================================================
//  WMS 鲜花分拣发货中心 — 完整业务类型定义
//  基于产品文档 v1.0（2024-05）
// ============================================================

// ─── 通用 ────────────────────────────────────────────────────
export interface PageResult<T> { list: T[]; total: number; page: number; pageSize: number }
export interface PageParams { page: number; pageSize: number }
export interface IdName { id: number; name: string }

// ============================================================
//  一、组织结构
// ============================================================

/** 大区（下辖多个分区） */
export interface Region {
  id: number
  name: string
  code: string
  managerId?: number
  managerName?: string
  status: 'active' | 'inactive'
}

/** 分区（对应仓库物理区域，下辖货架） */
export interface Zone {
  id: number
  regionId: number
  regionName: string
  name: string
  code: string
  supervisorId?: number
  supervisorName?: string
  sortOrder: number         // 排序权重
  status: 'active' | 'inactive'
}

/** 集货基地（花农侧，对应一个集货站） */
export interface Base {
  id: number
  name: string
  code: string
  region: string            // 地理大区（云南/广东…）
  address: string
  leaderId?: number         // 基地片区负责人
  leaderName?: string
  status: 'active' | 'inactive'
}

/** 集货站（基地下辖，驻点人员管理） */
export interface CollectionStation {
  id: number
  baseId: number
  baseName: string
  name: string
  code: string
  address: string
  contactName: string
  contactPhone: string
  status: 'active' | 'inactive'
}

// ============================================================
//  二、用户与角色
// ============================================================

// 登录请求参数（对应接口 /login/sub）
export interface LoginParams {
  userName: string
  password: string
  type: number  // 1: 兼职登录  2: 跳转登录  3: 扫码枪登录
}

// 角色信息（接口返回）
export interface RoleInfo {
  id: number
  roleName: string
}

// 供应商基本信息（接口返回）
export interface SupplierBaseInfo {
  firstChar?: string
  id: number
  latestCheckTime?: string
  loginTel?: string
  operatorType?: number   // 0: 非自运营  1: 自运营
  supplierName?: string
  supplierTag?: string
  token?: string
}

// 登录接口返回的用户信息（接口字段保持原样，方便直接使用）
export interface UserInfo {
  token: string
  id: number
  userName: string
  sex?: number            // 0: 未知  1: 男  2: 女
  nickname: string        // 姓名（展示用）
  phone?: string
  description?: string
  roleList: RoleInfo[]
  supplierBaseVo?: SupplierBaseInfo
  // 前端派生字段（登录后根据 roleList 计算）
  role: UserRole
}

/**
 * 角色枚举（与产品文档角色清单对应）
 * admin        - 场地管理员（全部权限）
 * region_mgr   - 大区负责人
 * zone_sup     - 分区主管
 * inspector    - 质检员
 * picker       - 配货员（PDA）
 * packer       - 打包员（PDA）
 * logistics    - 物流专员
 * driver       - 司机
 * inspector_patrol - 巡察员
 * supply_mgr   - 物资管理员
 * base_leader  - 基地片区负责人
 * base_staff   - 基地驻场
 */
export type UserRole =
  | 'admin'
  | 'region_mgr'
  | 'zone_sup'
  | 'inspector'
  | 'picker'
  | 'packer'
  | 'logistics'
  | 'driver'
  | 'inspector_patrol'
  | 'supply_mgr'
  | 'base_leader'
  | 'base_staff'

export type StaffType = 'fulltime' | 'parttime_listed' | 'parttime_unlisted'

/** 系统人员（账户） */
export interface Staff {
  id: number
  userId?: number
  realName: string
  phone: string
  role: UserRole
  staffType: StaffType
  groupId?: number
  groupName?: string
  regionId?: number
  zoneId?: number
  baseId?: number
  status: 'active' | 'inactive'
  joinDate?: string
  remark?: string
}

/** 人员分组 */
export interface StaffGroup {
  id: number
  name: string
  regionId?: number
  zoneId?: number
  leaderId?: number
  leaderName?: string
  memberCount: number
}

// ============================================================
//  三、货位管理（WEB核心配置模块）
// ============================================================

/**
 * 实体货架（Physical Rack）
 * 对应仓库中实际存在的货架，有实体号牌和 NFC 卡片
 */
export interface PhysicalRack {
  id: number
  code: string              // 实体号牌，如 A-01、B-03
  zoneId: number
  zoneName: string
  regionId: number
  regionName: string
  nfcId?: string            // 绑定的 NFC 卡片 ID
  nfcBound: boolean
  capacity: RackCapacity
  sortOrder: number
  status: 'active' | 'inactive' | 'maintenance'
  createdAt: string
}

/** 货架容量配置 */
export interface RackCapacity {
  maxWeightGrams: number    // 最大承重（g）
  maxBoxCount: number       // 最多放几个包裹
  sizeType: 'small' | 'large' | 'mixed'  // 大小件分割配置
}

/**
 * 件型配置（按重量区间决定使用哪种箱子）
 * 例：0-500g → S箱；500-2000g → M箱；>2000g → L箱
 */
export interface BoxTypeConfig {
  id: number
  name: string              // 件型名称，如"小件"、"中件"
  code: string              // 内部编码
  minWeightGrams: number    // 重量区间下限（g，含）
  maxWeightGrams: number    // 重量区间上限（g，不含；最大档填 999999）
  boxSpec: string           // 箱子规格描述，如 30×20×15cm
  sortOrder: number
  isActive: boolean
}

/**
 * NFC 管理——NFC 卡片与货架的绑定关系
 */
export interface NfcCard {
  id: number
  nfcId: string             // NFC 卡片唯一 ID（硬件写入）
  rackId?: number           // 绑定的货架 ID（未绑定为空）
  rackCode?: string
  zoneName?: string
  status: 'unbound' | 'bound' | 'disabled'
  boundAt?: string
  boundBy?: string
  remark?: string
}

/**
 * 分区排序规则配置
 * 配货时系统按此规则推荐货位顺序
 */
export interface ZoneSortRule {
  id: number
  zoneId: number
  zoneName: string
  // 排序优先级（数字越小越优先）
  priorityFields: SortPriorityField[]
  // 大小件分割：同货架是否允许混放
  mixSizeAllowed: boolean
  updatedAt: string
  updatedBy: string
}

export type SortPriorityField =
  | 'logistics_company'   // 物流公司
  | 'destination_region'  // 目的地省市
  | 'weight_asc'          // 重量从轻到重
  | 'weight_desc'         // 重量从重到轻
  | 'order_time'          // 下单时间

// ============================================================
//  四、场次与订单
// ============================================================

/**
 * 场次 = 时间段 × 物流公司
 * 截单后系统按货位规则生成本场次的货架分配方案
 */
export interface Session {
  id: number
  date: string
  sessionCode: string           // 如 20240520-AM-SF
  timeSlot: 'morning' | 'afternoon' | 'evening'
  timeSlotLabel: string
  logisticsCompany: string
  logisticsCode: string
  regionId?: number             // 所属大区（null=全场次）
  cutoffTime: string
  estimatedPickupTime: string
  status: SessionStatus
  stats: SessionStats
  createdAt: string
}

export interface SessionStats {
  totalOrders: number
  totalRacks: number
  completedRacks: number
  pickedOrders: number
  packedOrders: number
  shippedOrders: number
}

export type SessionStatus =
  | 'planning' | 'open' | 'picking' | 'packing' | 'dispatching' | 'closed'

/** 订单（从平台导入） */
export interface Order {
  id: number
  platformOrderNo: string
  platform: string
  sessionId?: number
  // 货源类型
  sourceType: OrderSourceType
  supplierId?: number           // 斗南供应商 ID
  supplierName?: string
  baseId?: number               // 下辖基地 ID
  baseName?: string
  // 收货信息
  receiverName: string
  receiverPhone: string
  receiverProvince: string
  receiverCity: string
  receiverDistrict: string
  receiverAddress: string
  logisticsCompany: string
  logisticsCode: string
  // 花材
  items: OrderItem[]
  totalStems: number
  estimatedWeightGrams: number
  // 状态
  status: OrderStatus
  rackId?: number
  rackCode?: string
  // 代配
  isProxy: boolean              // 是否代配
  proxyApplyId?: number
  importedAt: string
  exception?: string
}

/**
 * 货源类型：
 * base_normal  - 下辖基地普通配货（配货员扫码）
 * base_proxy   - 下辖基地代配货（供应商委托，配货员扫码）
 * supplier_self- 斗南供应商自配货
 */
export type OrderSourceType = 'base_normal' | 'base_proxy' | 'supplier_self'

export interface OrderItem {
  skuCode: string
  skuName: string
  stems: number
  bunches: number
  unitPrice?: number
}

export type OrderStatus =
  | 'pending' | 'session_assigned' | 'rack_assigned'
  | 'picking' | 'picked' | 'packing' | 'packed' | 'shipped' | 'exception'

// ============================================================
//  五、质检
// ============================================================

export interface InspectionRecord {
  id: number
  sessionId: number
  zoneId: number
  zoneName: string
  inspectorId: number
  inspectorName: string
  orderId?: number
  platformOrderNo?: string
  supplierId?: number
  supplierName?: string
  skuCode: string
  skuName: string
  totalBunches: number
  passedBunches: number
  degradedBunches: number      // 降级
  missingBunches: number       // 缺货
  returnBunches: number        // 退货
  exchangeBunches: number      // 换货（斗南供应商换货）
  rejectReason?: string
  grade: 'A' | 'B' | 'C'
  inspectedAt: string
  remark?: string
}

// ============================================================
//  六、配货（三种模式）
// ============================================================

/** 配货记录（PDA 扫码产生） */
export interface PickingRecord {
  id: number
  sessionId: number
  sessionCode: string
  orderId: number
  platformOrderNo: string
  rackId: number
  rackCode: string
  pickType: 'staff'             // 配货员配货
           | 'proxy'            // 代配
           | 'supplier_self'    // 供应商自配
  pickerId?: number             // 配货员 ID（自配时为 null）
  pickerName?: string
  supplierId?: number
  supplierName?: string
  pickedAt: string
  zoneId: number
}

/** 代配申请 */
export interface ProxyApply {
  id: number
  supplierId: number
  supplierName: string
  sessionId: number
  orderCount: number
  status: 'pending' | 'approved' | 'rejected' | 'completed'
  applyRemark?: string
  reviewerId?: number
  reviewerName?: string
  reviewedAt?: string
  rejectReason?: string
  createdAt: string
}

// ============================================================
//  七、打包
// ============================================================

/** 货架下的包裹（一个货架可多个包裹） */
export interface Package {
  id: number
  sessionId: number
  rackId: number
  rackCode: string
  seqInRack: number             // 同货架第几个包裹
  boxTypeId: number
  boxTypeName: string
  actualWeightGrams: number
  expressCompany: string
  expressNo: string
  labelPrinted: boolean
  status: 'pending' | 'packed' | 'exception'
  packedById: number
  packedByName: string
  packedAt?: string
  exceptionReason?: string
}

// ============================================================
//  八、发货
// ============================================================

export interface ShipmentRecord {
  id: number
  sessionId: number
  sessionCode: string
  logisticsCompany: string
  logisticsCode: string
  driverName?: string
  driverPhone?: string
  packages: Array<{ packageId: number; expressNo: string; weightGrams: number }>
  totalPackages: number
  totalWeightKg: number
  status: 'pending' | 'shipped' | 'exception'
  createdById: number
  createdByName: string
  shippedAt?: string
  remark?: string
}

// ============================================================
//  九、处罚管理
// ============================================================

export interface PenaltyRecord {
  id: number
  type: 'business'              // 业务处罚（自动产生）
      | 'violation'             // 违规处罚（手动创建）
  sessionId?: number
  targetId: number              // 被处罚人/供应商 ID
  targetType: 'staff' | 'supplier'
  targetName: string
  reason: string
  amount: number                // 处罚金额（分）
  patrolId?: number             // 巡察员 ID
  patrolName?: string
  status: 'pending' | 'confirmed' | 'appealed' | 'cancelled'
  createdAt: string
  confirmedAt?: string
  remark?: string
}

// ============================================================
//  十、工资管理
// ============================================================

export interface SalaryMonthly {
  id: number
  staffId: number
  staffName: string
  month: string                 // YYYY-MM
  baseSalary: number
  bonusTotal: number
  penaltyTotal: number
  overtimePay: number
  netSalary: number
  status: 'draft' | 'confirmed' | 'paid'
  confirmedAt?: string
  paidAt?: string
}

export interface SessionSettlement {
  id: number
  staffId: number
  staffName: string
  sessionId: number
  sessionCode: string
  date: string
  role: UserRole
  // 配货员
  pickedCount?: number
  pickRate?: number             // 件/小时
  // 打包员
  packedCount?: number
  packRate?: number
  baseAmount: number
  bonusAmount: number
  penaltyAmount: number
  totalAmount: number
}

export interface Bonus {
  id: number
  staffId: number
  staffName: string
  month: string
  type: string                  // 奖金类型
  amount: number
  reason: string
  status: 'pending' | 'approved' | 'paid'
  createdAt: string
}

// ============================================================
//  十一、物资管理
// ============================================================

export interface SupplyItem {
  id: number
  code: string
  name: string
  typeId: number
  typeName: string
  unit: string
  currentStock: number
  minStock: number              // 库存预警线
  remark?: string
}

export interface SupplyType {
  id: number
  name: string
  code: string
  remark?: string
}

export interface SupplyInbound {
  id: number
  itemId: number
  itemName: string
  quantity: number
  supplierId?: number
  supplierName?: string
  operatorId: number
  operatorName: string
  purchaseOrderNo?: string
  inboundAt: string
  remark?: string
}

export interface SupplyOutbound {
  id: number
  itemId: number
  itemName: string
  quantity: number
  recipientId: number
  recipientName: string
  zoneId?: number
  zoneName?: string
  operatorId: number
  operatorName: string
  outboundAt: string
  remark?: string
}

// ============================================================
//  十二、数据看板
// ============================================================

export interface DashboardOverview {
  date: string
  // 货量
  totalBunches: number
  // 货位
  racksUsed: number
  racksTotal: number
  // 件型数据（各件型包裹数）
  boxTypeStats: Array<{ boxTypeName: string; count: number }>
  // 总进度
  pickingProgress: ProgressStat
  packingProgress: ProgressStat
  shippingProgress: ProgressStat
  // 质检
  inspectionStat: {
    passed: number
    degraded: number
    missing: number
    returned: number
    exchanged: number
  }
  // 换货（斗南）
  dnExchangeStat: { applied: number; completed: number }
  // 退货
  returnStat: { count: number; bunches: number }
  // 巡查处罚
  patrolStat: { violations: number; amount: number }
  // 今日人员投入
  staffOnDuty: {
    pickers: number
    packers: number
    inspectors: number
    logistics: number
  }
}

export interface ProgressStat {
  total: number
  completed: number
  percent: number
}

export interface PickingEfficiencyStat {
  date: string
  sessionId?: number
  // 全场
  overallProgress: ProgressStat
  // 各大区
  byRegion: Array<{
    regionId: number
    regionName: string
    progress: ProgressStat
    staffCount: number
    avgPickPerPerson: number
    prevAvgPickPerPerson: number   // 环比
  }>
  // 低效分区预警（低于全场均值 30%）
  slowZoneWarnings: Array<{
    zoneId: number
    zoneName: string
    avgRate: number
    globalAvgRate: number
    gapPercent: number
  }>
  staffBreakdown: Array<{
    staffId: number
    staffName: string
    staffType: StaffType
    pickedCount: number
    rate: number
    isFromRecruitList: boolean
  }>
}

export interface PackingShippingStat {
  date: string
  packingProgress: ProgressStat
  shippingProgress: ProgressStat
  byRegion: Array<{
    regionId: number
    regionName: string
    packingProgress: ProgressStat
    shippingProgress: ProgressStat
  }>
  staffBreakdown: Array<{
    staffId: number
    staffName: string
    packedBoxCount: number
    rate: number
    prevRate: number
  }>
}

// 集货运输看板
export interface TransportStat {
  date: string
  byBase: Array<{
    baseId: number
    baseName: string
    pendingBunches: number
    inTransitBunches: number
    arrivedBunches: number
  }>
  vehicles: Array<{
    vehicleId: string
    driverName: string
    driverPhone: string
    status: 'idle' | 'dispatched' | 'arrived'
    baseId?: number
    baseName?: string
    departedAt?: string
    arrivedAt?: string
    trackingUrl?: string
  }>
}

// ============================================================
//  十三、APP版本管理
// ============================================================

export interface AppVersion {
  id: number
  appType: 'supplier' | 'pda' | 'warehouse'
  appTypeName: string
  version: string
  buildNo: number
  platform: 'android' | 'ios'
  downloadUrl: string
  releaseNote: string
  isForceUpdate: boolean
  status: 'draft' | 'released' | 'deprecated'
  releasedAt?: string
  createdAt: string
}

// ============================================================
//  十四、招聘
// ============================================================

export interface RecruitPost {
  id: number
  title: string
  sessionDate: string           // 针对哪天发布
  role: UserRole
  headcount: number
  description?: string
  status: 'draft' | 'published' | 'closed'
  publishedAt?: string
  createdAt: string
}

export interface RecruitApplicant {
  id: number
  postId: number
  realName: string
  phone: string
  idCard?: string
  status: 'applied' | 'confirmed' | 'rejected' | 'worked'
  confirmedAt?: string
  remark?: string
}

// ============================================================
//  十五、考勤
// ============================================================

export interface AttendanceRecord {
  id: number
  staffId: number
  staffName: string
  date: string
  clockIn?: string
  clockOut?: string
  duration?: number             // 工时（分钟）
  sessionIds: number[]          // 参与的场次
  status: 'normal' | 'late' | 'early_leave' | 'absent'
  remark?: string
}