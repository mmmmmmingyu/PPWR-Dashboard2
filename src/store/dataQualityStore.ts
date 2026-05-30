import { create } from 'zustand'
import { mockDataQualityIssues } from '../mock/data'
import type { DataQualityIssue, IssueCategory, IssueStatus, Severity } from '../types'

export const QUALITY_METRIC_OPTIONS = [
  { zh: '字段完整率', en: 'Field Completeness Rate' },
  { zh: '数据一致率', en: 'Data Consistency Rate' },
  { zh: '逻辑准确率', en: 'Logic Accuracy Rate' },
  { zh: '及时更新率', en: 'Timely Update Rate' },
  { zh: '编码匹配率', en: 'Code Match Rate' },
]

let issueSeq = 10

function nextId() {
  issueSeq += 1
  return `DQ-2026-${String(issueSeq).padStart(3, '0')}`
}

function calcOverdue(foundDate: string, status: IssueStatus): boolean {
  if (status === 'resolved' || status === 'verified_closed') return false
  const days = Math.floor((Date.now() - new Date(foundDate).getTime()) / 86400000)
  return days > 14
}

interface DataQualityState {
  issues: DataQualityIssue[]
  addIssue: (issue: Omit<DataQualityIssue, 'id' | 'isOverdue'>) => void
  addIssues: (issues: Omit<DataQualityIssue, 'id' | 'isOverdue'>[]) => void
  updateIssue: (id: string, patch: Partial<DataQualityIssue>) => void
}

export const useDataQualityStore = create<DataQualityState>((set) => ({
  issues: mockDataQualityIssues.map((i) => ({ ...i })),

  addIssue: (issue) => {
    set((s) => ({
      issues: [
        ...s.issues,
        {
          ...issue,
          id: nextId(),
          isOverdue: calcOverdue(issue.foundDate, issue.status),
        },
      ],
    }))
  },

  addIssues: (items) => {
    set((s) => ({
      issues: [
        ...s.issues,
        ...items.map((issue) => ({
          ...issue,
          id: nextId(),
          isOverdue: calcOverdue(issue.foundDate, issue.status),
        })),
      ],
    }))
  },

  updateIssue: (id, patch) => {
    set((s) => ({
      issues: s.issues.map((item) => {
        if (item.id !== id) return item
        const next = { ...item, ...patch }
        if (patch.status === 'resolved' || patch.status === 'verified_closed') {
          next.resolvedDate = patch.resolvedDate ?? new Date().toISOString().slice(0, 10)
        }
        next.isOverdue = calcOverdue(next.foundDate, next.status)
        return next
      }),
    }))
  },
}))

export function calcResolveDuration(issue: DataQualityIssue): { days: number; closed: boolean } {
  const found = new Date(issue.foundDate).getTime()
  const closed = issue.status === 'resolved' || issue.status === 'verified_closed'
  const end = closed
    ? new Date(issue.resolvedDate ?? new Date()).getTime()
    : Date.now()
  const days = Math.max(0, Math.floor((end - found) / 86400000))
  return { days, closed }
}

export const ISSUE_CATEGORY_OPTIONS: IssueCategory[] = ['data_missing', 'data_inconsistent', 'logic_error', 'other']
export const SEVERITY_OPTIONS: Severity[] = ['critical', 'high', 'medium', 'low']
export const ISSUE_STATUS_OPTIONS: IssueStatus[] = ['pending_confirm', 'in_progress', 'resolved', 'verified_closed']
