export type RegulationType = 'PPWR' | 'CBAM' | 'WEEE' | 'BATTERY'
export type Language = 'zh' | 'en'
export type UserRole = 'admin' | 'domain_owner' | 'user'

export interface BilingualText {
  zh: string
  en: string
}

export interface KpiDefinition {
  id: string
  name: BilingualText
  unit: string
  target: number
  description: BilingualText
}

export interface KpiValue {
  kpiId: string
  current: number
  momChange: number
  target: number
  monthlyTrend: { month: string; value: number; target: number }[]
  byIndustry: { name: string; value: number }[]
  byCountry: { country: string; value: number; lat: number; lng: number }[]
}

export type AnomalyStatus = 'pending' | 'analyzing' | 'closed'
export type AnomalyScene = 'baseline_change'
export type BaselineChangeType = 'country' | 'product_code' | 'contract' | 'batch'

export interface BaselineImpactDetail {
  codes: string[]
  contracts: { contractNo: string; country?: string }[]
  batches: { batchNo: string; contractNo?: string }[]
  shipments: { code: string; contractNo: string; batchNo?: string; quantity: number; shipDate?: string }[]
}

export interface AnomalyRecord {
  id: string
  scene: AnomalyScene
  /** 仅「切换对象基线例外变更风险」场景使用 */
  changeType?: BaselineChangeType
  /** 仅「切换对象基线例外变更风险」场景使用 */
  object?: string
  /** 基线变更影响明细 */
  impact?: BaselineImpactDetail
  codes: string[]
  impactScope: string
  contractNo?: string
  batchNo?: string
  quantity?: number
  shipDate?: string
  deviationRate?: number
  discontinueDate?: string
  docNo?: string
  assignee?: string
  reasonCategory?: string
  /** 基线变更：变更原因 */
  changeReason?: string
  /** 基线变更：解决方案 */
  solution?: string
  /** 基线变更：处理进展 */
  progress?: string
  status: AnomalyStatus
  createdAt: string
}

export type NodeStatus = 'in_progress' | 'completed' | 'overdue'

export interface SwitchNode {
  id: string
  name: BilingualText
  defaultDept: string
  leadDays: number
  deliverableRequired: boolean
  dependencies: string[]
}

export interface NodeProgress {
  nodeId: string
  dept: string
  assignee: string
  dueDate: string
  status: NodeStatus
  completedAt?: string
  deliverableUrl?: string
}

export interface ProductCodeProgress {
  code: string
  description: BilingualText
  industry: string
  productLine: string
  nodes: NodeProgress[]
}

export interface CountryProgress {
  office: string
  country: string
  nodes: NodeProgress[]
}

export type IssueStatus = 'pending_confirm' | 'in_progress' | 'resolved' | 'verified_closed'
export type IssueCategory = 'data_missing' | 'data_inconsistent' | 'logic_error' | 'other'
export type Severity = 'critical' | 'high' | 'medium' | 'low'

export interface DataQualityIssue {
  id: string
  description: string
  category: IssueCategory
  qualityMetric: string
  metricValue?: number
  dept: string
  assignee: string
  foundDate: string
  resolvedDate?: string
  severity: Severity
  status: IssueStatus
  progress?: string
  isOverdue: boolean
}

export interface AgentMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
  chart?: { type: 'bar' | 'line'; data: { name: string; value: number }[] }
  timestamp: Date
}
