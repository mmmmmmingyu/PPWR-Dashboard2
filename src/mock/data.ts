import type {
  AnomalyRecord,
  CountryProgress,
  DataQualityIssue,
  KpiValue,
  NodeStatus,
  ProductCodeProgress,
} from '../types'
import { PRODUCT_SWITCH_NODES, REGION_SWITCH_NODES } from '../config/regulations'

const months = ['2025-10', '2025-11', '2025-12', '2026-01', '2026-02', '2026-03']

function randomStatus(): NodeStatus {
  const statuses: NodeStatus[] = ['in_progress', 'completed', 'overdue']
  return statuses[Math.floor(Math.random() * statuses.length)]
}

export const mockKpiValues: KpiValue[] = [
  {
    kpiId: 'audit_pass_rate',
    current: 92.5,
    momChange: 2.3,
    target: 95,
    monthlyTrend: months.map((m, i) => ({ month: m, value: 85 + i * 1.2 + Math.random() * 3, target: 95 })),
    byIndustry: [
      { name: '消费电子', value: 94 },
      { name: '企业网络', value: 91 },
      { name: '运营商', value: 88 },
      { name: '云与计算', value: 96 },
    ],
    byCountry: [
      { country: '德国', value: 95, lat: 51.2, lng: 10.5 },
      { country: '法国', value: 88, lat: 46.2, lng: 2.2 },
      { country: '英国', value: 91, lat: 55.4, lng: -3.4 },
      { country: '意大利', value: 82, lat: 41.9, lng: 12.5 },
      { country: '西班牙', value: 79, lat: 40.4, lng: -3.7 },
      { country: '荷兰', value: 93, lat: 52.1, lng: 5.3 },
    ],
  },
  {
    kpiId: 'ppwr_code_ratio',
    current: 87.2,
    momChange: 3.1,
    target: 90,
    monthlyTrend: months.map((m, i) => ({ month: m, value: 78 + i * 1.5, target: 90 })),
    byIndustry: [
      { name: '消费电子', value: 89 },
      { name: '企业网络', value: 85 },
      { name: '运营商', value: 82 },
      { name: '云与计算', value: 91 },
    ],
    byCountry: [
      { country: '德国', value: 90, lat: 51.2, lng: 10.5 },
      { country: '法国', value: 85, lat: 46.2, lng: 2.2 },
      { country: '英国', value: 88, lat: 55.4, lng: -3.4 },
      { country: '意大利', value: 80, lat: 41.9, lng: 12.5 },
      { country: '西班牙', value: 76, lat: 40.4, lng: -3.7 },
      { country: '荷兰', value: 92, lat: 52.1, lng: 5.3 },
    ],
  },
  {
    kpiId: 'ppwr_shipment_ratio',
    current: 81.6,
    momChange: -1.2,
    target: 85,
    monthlyTrend: months.map((m, i) => ({ month: m, value: 75 + i * 1.1, target: 85 })),
    byIndustry: [
      { name: '消费电子', value: 83 },
      { name: '企业网络', value: 79 },
      { name: '运营商', value: 77 },
      { name: '云与计算', value: 86 },
    ],
    byCountry: [
      { country: '德国', value: 84, lat: 51.2, lng: 10.5 },
      { country: '法国', value: 80, lat: 46.2, lng: 2.2 },
      { country: '英国', value: 82, lat: 55.4, lng: -3.4 },
      { country: '意大利', value: 74, lat: 41.9, lng: 12.5 },
      { country: '西班牙', value: 71, lat: 40.4, lng: -3.7 },
      { country: '荷兰', value: 88, lat: 52.1, lng: 5.3 },
    ],
  },
  {
    kpiId: 'boq_reduction_rate',
    current: 76.3,
    momChange: 4.5,
    target: 80,
    monthlyTrend: months.map((m, i) => ({ month: m, value: 65 + i * 2, target: 80 })),
    byIndustry: [
      { name: '消费电子', value: 78 },
      { name: '企业网络', value: 74 },
      { name: '运营商', value: 72 },
      { name: '云与计算', value: 80 },
    ],
    byCountry: [
      { country: '德国', value: 79, lat: 51.2, lng: 10.5 },
      { country: '法国', value: 75, lat: 46.2, lng: 2.2 },
      { country: '英国', value: 77, lat: 55.4, lng: -3.4 },
      { country: '意大利', value: 70, lat: 41.9, lng: 12.5 },
      { country: '西班牙', value: 68, lat: 40.4, lng: -3.7 },
      { country: '荷兰', value: 82, lat: 52.1, lng: 5.3 },
    ],
  },
  {
    kpiId: 'importer_data_completeness',
    current: 96.8,
    momChange: 0.8,
    target: 98,
    monthlyTrend: months.map((m, i) => ({ month: m, value: 93 + i * 0.6, target: 98 })),
    byIndustry: [
      { name: '消费电子', value: 97 },
      { name: '企业网络', value: 96 },
      { name: '运营商', value: 95 },
      { name: '云与计算', value: 98 },
    ],
    byCountry: [
      { country: '德国', value: 98, lat: 51.2, lng: 10.5 },
      { country: '法国', value: 96, lat: 46.2, lng: 2.2 },
      { country: '英国', value: 97, lat: 55.4, lng: -3.4 },
      { country: '意大利', value: 94, lat: 41.9, lng: 12.5 },
      { country: '西班牙', value: 93, lat: 40.4, lng: -3.7 },
      { country: '荷兰', value: 99, lat: 52.1, lng: 5.3 },
    ],
  },
  {
    kpiId: 'doc_switch_readiness',
    current: 88.4,
    momChange: 1.9,
    target: 92,
    monthlyTrend: months.map((m, i) => ({ month: m, value: 80 + i * 1.4, target: 92 })),
    byIndustry: [
      { name: '消费电子', value: 90 },
      { name: '企业网络', value: 86 },
      { name: '运营商', value: 84 },
      { name: '云与计算', value: 92 },
    ],
    byCountry: [
      { country: '德国', value: 91, lat: 51.2, lng: 10.5 },
      { country: '法国', value: 87, lat: 46.2, lng: 2.2 },
      { country: '英国', value: 89, lat: 55.4, lng: -3.4 },
      { country: '意大利', value: 83, lat: 41.9, lng: 12.5 },
      { country: '西班牙', value: 80, lat: 40.4, lng: -3.7 },
      { country: '荷兰', value: 94, lat: 52.1, lng: 5.3 },
    ],
  },
]

export const mockAnomalies: AnomalyRecord[] = [
  {
    id: 'A001',
    scene: 'baseline_change',
    changeType: 'country',
    object: '德国',
    impact: {
      codes: ['02355ABC', '02355DEF', '02355GHI'],
      contracts: [
        { contractNo: 'DE-2026-001', country: '德国' },
        { contractNo: 'DE-2026-002', country: '德国' },
      ],
      batches: [
        { batchNo: 'B20260301', contractNo: 'DE-2026-001' },
        { batchNo: 'B20260302', contractNo: 'DE-2026-001' },
        { batchNo: 'B20260310', contractNo: 'DE-2026-002' },
      ],
      shipments: [
        { code: '02355ABC', contractNo: 'DE-2026-001', batchNo: 'B20260301', quantity: 500, shipDate: '2026-03-12' },
        { code: '02355DEF', contractNo: 'DE-2026-001', batchNo: 'B20260301', quantity: 400, shipDate: '2026-03-13' },
        { code: '02355GHI', contractNo: 'DE-2026-002', batchNo: 'B20260310', quantity: 300, shipDate: '2026-03-15' },
      ],
    },
    codes: ['02355ABC', '02355DEF', '02355GHI'],
    impactScope: '德国 / 2合同 / 3批次 / 预估 1200',
    contractNo: 'DE-2026-001',
    batchNo: 'B20260301',
    quantity: 1200,
    assignee: '张三',
    changeReason: '切换窗口期客户客制化需求，需调整德国区基线配置',
    reasonCategory: 'customization',
    solution: '同步更新德国区基线配置，对例外编码走客制化审批流程',
    progress: '已完成2个合同基线回退，剩余1个合同待客户确认',
    status: 'analyzing',
    createdAt: '2026-03-15',
  },
  {
    id: 'A004',
    scene: 'baseline_change',
    changeType: 'product_code',
    object: '02355GHI',
    impact: {
      codes: ['02355GHI', '02355JKL'],
      contracts: [{ contractNo: 'UK-2026-045', country: '英国' }],
      batches: [{ batchNo: 'B20260208', contractNo: 'UK-2026-045' }],
      shipments: [
        { code: '02355GHI', contractNo: 'UK-2026-045', batchNo: 'B20260208', quantity: 180, shipDate: '2026-02-20' },
        { code: '02355JKL', contractNo: 'UK-2026-045', batchNo: 'B20260208', quantity: 120, shipDate: '2026-02-21' },
      ],
    },
    codes: ['02355GHI', '02355JKL'],
    impactScope: '英国 / 1合同 / 1批次 / 预估 300',
    contractNo: 'UK-2026-045',
    quantity: 300,
    assignee: '李四',
    changeReason: '产品编码在切换窗口期发生例外变更，需追溯影响范围',
    solution: '产品编码切换窗口期锁定，禁止例外变更',
    progress: '已全部关闭并完成复盘',
    status: 'closed',
    createdAt: '2026-02-10',
  },
]

const productCodes = [
  { code: '02355ABC', desc: { zh: '企业路由器 Pro', en: 'Enterprise Router Pro' }, industry: '企业网络', line: 'AR系列' },
  { code: '02355DEF', desc: { zh: '无线AP 室内型', en: 'Indoor Wireless AP' }, industry: '企业网络', line: 'AP系列' },
  { code: '02310XYZ', desc: { zh: '5G CPE 户外型', en: '5G CPE Outdoor' }, industry: '运营商', line: 'CPE系列' },
  { code: '02320LMN', desc: { zh: '云服务器节点', en: 'Cloud Server Node' }, industry: '云与计算', line: 'Fusion系列' },
  { code: '02330PQR', desc: { zh: '智能手表 S3', en: 'Smart Watch S3' }, industry: '消费电子', line: '穿戴系列' },
]

export const mockProductProgress: ProductCodeProgress[] = productCodes.map((p) => ({
  code: p.code,
  description: p.desc,
  industry: p.industry,
  productLine: p.line,
  nodes: PRODUCT_SWITCH_NODES.map((n) => ({
    nodeId: n.id,
    dept: n.defaultDept,
    assignee: ['张三', '李四', '王五', '赵六'][Math.floor(Math.random() * 4)],
    dueDate: `2026-0${Math.floor(Math.random() * 3) + 4}-${10 + Math.floor(Math.random() * 18)}`,
    status: randomStatus(),
    deliverableUrl: Math.random() > 0.5 ? '/files/doc.pdf' : undefined,
  })),
}))

const countries = [
  { country: '德国', office: '西欧代表处' },
  { country: '法国', office: '西欧代表处' },
  { country: '英国', office: '西欧代表处' },
  { country: '意大利', office: '南欧代表处' },
  { country: '西班牙', office: '南欧代表处' },
  { country: '荷兰', office: '西欧代表处' },
]

export const mockCountryProgress: CountryProgress[] = countries.map((c) => ({
  country: c.country,
  office: c.office,
  nodes: REGION_SWITCH_NODES.map((n) => ({
    nodeId: n.id,
    dept: n.defaultDept,
    assignee: ['陈一', '刘二', '周三', '吴四'][Math.floor(Math.random() * 4)],
    dueDate: `2026-0${Math.floor(Math.random() * 4) + 3}-${5 + Math.floor(Math.random() * 20)}`,
    status: randomStatus(),
    deliverableUrl: Math.random() > 0.6 ? '/files/reg.pdf' : undefined,
  })),
}))

export const mockDataQualityIssues: DataQualityIssue[] = [
  {
    id: 'DQ-2026-001',
    description: '进口商联系人邮箱字段缺失率超过15%',
    category: 'data_missing',
    qualityMetric: '字段完整率',
    dept: '海外合规部',
    assignee: '王五',
    foundDate: '2026-03-01',
    severity: 'high',
    status: 'in_progress',
    progress: '已联系3家进口商补充，剩余2家待跟进',
    metricValue: 84.2,
    isOverdue: false,
  },
  {
    id: 'DQ-2026-002',
    description: 'BOQ消减数据与ERP系统不一致',
    category: 'data_inconsistent',
    qualityMetric: '数据一致率',
    dept: 'IT部',
    assignee: '赵六',
    foundDate: '2026-02-15',
    severity: 'critical',
    status: 'pending_confirm',
    metricValue: 72.5,
    isOverdue: true,
  },
  {
    id: 'DQ-2026-003',
    description: '发货量统计逻辑未排除退货订单',
    category: 'logic_error',
    qualityMetric: '逻辑准确率',
    dept: '供应链部',
    assignee: '张三',
    foundDate: '2026-03-10',
    resolvedDate: '2026-03-22',
    severity: 'medium',
    status: 'resolved',
    progress: '已修复统计逻辑并重新计算',
    metricValue: 98.1,
    isOverdue: false,
  },
  {
    id: 'DQ-2026-004',
    description: 'DOC文件版本号未同步更新',
    category: 'other',
    qualityMetric: '及时更新率',
    dept: '合规部',
    assignee: '李四',
    foundDate: '2026-03-18',
    resolvedDate: '2026-03-25',
    severity: 'low',
    status: 'verified_closed',
    progress: '版本号已全量同步',
    metricValue: 100,
    isOverdue: false,
  },
]

export function calcProductReadiness(data: ProductCodeProgress[]): number {
  let completed = 0
  let total = 0
  data.forEach((p) =>
    p.nodes.forEach((n) => {
      total++
      if (n.status === 'completed') completed++
    }),
  )
  return total ? Math.round((completed / total) * 1000) / 10 : 0
}

export function calcRegionReadiness(data: CountryProgress[]): number {
  let completed = 0
  let total = 0
  data.forEach((c) =>
    c.nodes.forEach((n) => {
      total++
      if (n.status === 'completed') completed++
    }),
  )
  return total ? Math.round((completed / total) * 1000) / 10 : 0
}
