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
export type AnomalyScene = 'baseline_change' | 'code_shipment' | 'discontinued_code'
export type BaselineChangeType = 'country' | 'product_code' | 'contract' | 'batch'

export interface AnomalyRecord {
  id: string
  scene: AnomalyScene
  /** 仅「切换对象基线例外变更风险」场景使用 */
  changeType?: BaselineChangeType
  /** 仅「切换对象基线例外变更风险」场景使用 */
  object?: string
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
  status: AnomalyStatus
  createdAt: string
}

export type NodeStatus = 'not_started' | 'in_progress' | 'completed' | 'overdue'

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
  country: string
  region: string
  nodes: NodeProgress[]
}

export type IssueStatus = 'pending_confirm' | 'in_progress' | 'resolved' | 'verified_closed'
export type IssueCategory = 'data_missing' | 'data_inconsistent' | 'logic_error' | 'other'
export type Severity = 'critical' | 'high' | 'medium' | 'low'

export interface DataQualityIssue {
  id: string
  description: string
  category: IssueCategory
  relatedKpi: string
  dept: string
  assignee: string
  foundDate: string
  severity: Severity
  status: IssueStatus
  progress?: string
  currentKpiValue?: number
  isOverdue: boolean
}

export interface AgentMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
  chart?: { type: 'bar' | 'line'; data: { name: string; value: number }[] }
  timestamp: Date
}
