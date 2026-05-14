import http from '@/utils/http'

// ─── 请求参数类型 ─────────────────────────────────────────────

export interface ZoneListQo {
  roleName?: string
  userId?: number
  userName?: string
}

export interface ZoneInfoQo {
  roleName?: string
  segmentNameList?: string[]
  userId?: number
  userName?: string
  /** 0: 可配货 1: 配货完成，-1: 全部 */
  type: number
  cityFlag?: number
  /** 场次日期，如 2024-01-25 */
  date?: string
  /** 区，不传就是全部 */
  zone: string
  /** 货架，不传就是全部 */
  zoneShelf: string
  /** 物流配送方式 1：物流配送 2：自提 */
  deliveryType?: number
}

export interface ZoneItemQo {
  enterItemIds?: number[]
  /** 货架号 */
  orderNum?: number
  /** 子货架号 */
  subShelfSn?: string | number
  /** 场次日期 */
  date?: string
  isScanCode?: number
}

// ─── 响应数据类型 ─────────────────────────────────────────────

export interface ShelfSnStatus {
  deliveryType: number
  limitDistribution: number
  notRestock: number
  prepared: number
  progress: number
  segmentArea: string
  segmentName: string
  shelf: string
  shelfSn: number
  status: number          // 0:正在配货 1:配货完成
  subShelfSn: string
  total: number
  wareId: number
  wareType: number
  zone: string
  zoneShelf: string
}

export interface PrepareShelfSnVo {
  need: number
  prepared: number
  shelfSnList: ShelfSnStatus[]
}

export interface CheckInfoVo {
  createTime: string
  isConfirm: number
  mark: number
  qualifyUserName: string
  sn: string
}

export interface CheckSumNumVo {
  changeNum: number
  changedNum: number
  lackNoRestock: number
  lackRestock: number
  lowLevel: number
  refundGive: number
  refundNoRestock: number
  refundNoRestockSale: number
  refundRestock: number
  refundRestockSale: number
  timeOutSaleNum: number
}

export interface PurchaserInfoVo {
  nickName: string
  phone: string
  unqualifiedWay: number
}

export interface EnterVo {
  id: number
  supplierId: number
  supplierName: string
  supplierTag: string
  loginTel: string
  dataStatus: number
  enterTime: string
  itemNum: number
  realItemNum: number
  qualifyStatus: number   // 0:未质检 1:质检中 2:质检完成
  isQualify: number
  agencyItemNum: number
  focusFlag: number
  freezeNum: number
  qualityInspectionFlag: number
  dayFlag: number
  flag: number
  nightFlag: number
  firstChar: string
  nightDataStatus: number
  nightEnterTime: string
  nightOpen: number
  distributionOvertime: number
}

export interface ZoneItemInfo {
  id: number
  orderNum: number
  subShelfSn: string
  zone: string
  zoneShelf: string
  shelf: string
  productId: number
  productName: string
  itemNum: number
  itemPrice: number
  supplierPrice: number
  supplierId: number
  enterId: number
  enterVo: EnterVo
  purchaserInfoVo: PurchaserInfoVo
  checkSumNumVo: CheckSumNumVo
  checkInfoList: CheckInfoVo[]
  isQualify: number       // 0:未检测 1:合格 10:存在不合格 20：缺货打包
  distributionFinish: number
  prepareItemNum: number
  prepareUserName: string
  orderSn: string
  date: string
  segmentArea: string
  segmentName: string
  rankNum: number
  realItemNum: number
  lackItemNum: number
  lowerRankNum: number
  refundNum: number
  notQualifyNum: number
  maturity: string
  skuConfig: string
  isPosition: number
  focusFlag: number
  qualityInspectionFlag: number
  matchReplaceFlag: number
  limitDistributionFlag: number
  nightFlag: number
  snList: number[]
}

// ─── API ─────────────────────────────────────────────────────

export const wmsZoneApi = {
  /** 获取共有哪些区 */
  getZoneList: (qo?: ZoneListQo) =>
    http.post<string[]>('/wms/zone/list', qo ?? {}),

  /** 获取某个区的信息（货架号列表） */
  getZoneInfo: (qo: ZoneInfoQo) =>
    http.post<PrepareShelfSnVo>('/wms/zone/info/new', qo),

  /** 获取区货架号的商品信息 */
  getZoneItemInfo: (qo: ZoneItemQo) =>
    http.post<ZoneItemInfo[]>('/wms/zone/item/info', qo),
}