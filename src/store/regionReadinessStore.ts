import { create } from 'zustand'
import { REGION_SWITCH_NODES } from '../config/regulations'
import { mockCountryProgress } from '../mock/data'
import type { BilingualText, CountryProgress, NodeProgress, SwitchNode } from '../types'

function defaultNode(col: SwitchNode): NodeProgress {
  return {
    nodeId: col.id,
    dept: col.defaultDept,
    assignee: '',
    dueDate: '',
    status: 'in_progress',
  }
}

interface RegionReadinessState {
  columns: SwitchNode[]
  rows: CountryProgress[]
  addColumn: (name: BilingualText, defaultDept: string) => void
  updateColumn: (id: string, patch: Partial<Pick<SwitchNode, 'name' | 'defaultDept'>>) => void
  deleteColumn: (id: string) => void
  updateRow: (country: string, patch: Partial<Pick<CountryProgress, 'office' | 'country'>>) => void
  updateNode: (country: string, nodeId: string, patch: Partial<NodeProgress>) => void
}

let regionColSeq = 200

export const useRegionReadinessStore = create<RegionReadinessState>((set) => ({
  columns: REGION_SWITCH_NODES.map((c) => ({ ...c })),
  rows: mockCountryProgress.map((r) => ({ ...r, nodes: r.nodes.map((n) => ({ ...n })) })),

  addColumn: (name, defaultDept) => {
    const id = `rcol_${++regionColSeq}`
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

  updateRow: (country, patch) => {
    set((s) => ({
      rows: s.rows.map((r) => (r.country === country ? { ...r, ...patch } : r)),
    }))
  },

  updateNode: (country, nodeId, patch) => {
    set((s) => ({
      rows: s.rows.map((r) =>
        r.country !== country
          ? r
          : { ...r, nodes: r.nodes.map((n) => (n.nodeId === nodeId ? { ...n, ...patch } : n)) },
      ),
    }))
  },
}))

export function calcRegionReadinessFromRows(rows: CountryProgress[]): number {
  let completed = 0
  let total = 0
  rows.forEach((c) =>
    c.nodes.forEach((n) => {
      total++
      if (n.status === 'completed') completed++
    }),
  )
  return total ? Math.round((completed / total) * 1000) / 10 : 0
}
