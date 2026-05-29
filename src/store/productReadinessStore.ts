import { create } from 'zustand'
import { PRODUCT_SWITCH_NODES } from '../config/regulations'
import { mockProductProgress } from '../mock/data'
import type { BilingualText, NodeProgress, NodeStatus, ProductCodeProgress, SwitchNode } from '../types'

function defaultNode(col: SwitchNode): NodeProgress {
  return {
    nodeId: col.id,
    dept: col.defaultDept,
    assignee: '',
    dueDate: '',
    status: 'not_started',
  }
}

interface ProductReadinessState {
  columns: SwitchNode[]
  rows: ProductCodeProgress[]
  addColumn: (name: BilingualText, defaultDept: string) => void
  updateColumn: (id: string, patch: Partial<Pick<SwitchNode, 'name' | 'defaultDept'>>) => void
  deleteColumn: (id: string) => void
  updateRow: (code: string, patch: Partial<Pick<ProductCodeProgress, 'industry' | 'code' | 'description'>>) => void
  updateNode: (code: string, nodeId: string, patch: Partial<NodeProgress>) => void
}

let colSeq = 100

export const useProductReadinessStore = create<ProductReadinessState>((set) => ({
  columns: PRODUCT_SWITCH_NODES.map((c) => ({ ...c })),
  rows: mockProductProgress.map((r) => ({ ...r, nodes: r.nodes.map((n) => ({ ...n })) })),

  addColumn: (name, defaultDept) => {
    const id = `col_${++colSeq}`
    const col: SwitchNode = {
      id,
      name,
      defaultDept,
      leadDays: 30,
      deliverableRequired: false,
      dependencies: [],
    }
    set((s) => ({
      columns: [...s.columns, col],
      rows: s.rows.map((r) => ({ ...r, nodes: [...r.nodes, defaultNode(col)] })),
    }))
  },

  updateColumn: (id, patch) => {
    set((s) => ({
      columns: s.columns.map((c) => (c.id === id ? { ...c, ...patch } : c)),
    }))
  },

  deleteColumn: (id) => {
    set((s) => ({
      columns: s.columns.filter((c) => c.id !== id),
      rows: s.rows.map((r) => ({ ...r, nodes: r.nodes.filter((n) => n.nodeId !== id) })),
    }))
  },

  updateRow: (code, patch) => {
    set((s) => ({
      rows: s.rows.map((r) => (r.code === code ? { ...r, ...patch } : r)),
    }))
  },

  updateNode: (code, nodeId, patch) => {
    set((s) => ({
      rows: s.rows.map((r) =>
        r.code !== code
          ? r
          : {
              ...r,
              nodes: r.nodes.map((n) => (n.nodeId === nodeId ? { ...n, ...patch } : n)),
            },
      ),
    }))
  },
}))

export function calcReadinessFromRows(rows: ProductCodeProgress[]): number {
  let completed = 0
  let total = 0
  rows.forEach((p) =>
    p.nodes.forEach((n) => {
      total++
      if (n.status === 'completed') completed++
    }),
  )
  return total ? Math.round((completed / total) * 1000) / 10 : 0
}

export const NODE_STATUS_OPTIONS: NodeStatus[] = ['not_started', 'in_progress', 'completed', 'overdue']
