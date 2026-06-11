import { create } from 'zustand'
import { DEFAULT_PROCESS_FLOW } from '../mock/processFlowDefault'
import type {
  ProcessActivity,
  ProcessConnection,
  ProcessFlowConfig,
  ProcessOverlay,
  ProcessRole,
  ProcessStage,
  ProcessSubPhase,
} from '../types'
import {
  cloneProcessFlowConfig,
  downloadProcessFlowConfig,
  extractProcessFlowConfigFromImport,
  loadProcessFlowConfig,
  pickProcessFlowConfig,
  ProcessFlowImportError,
  saveProcessFlowConfig,
  syncSeqFromConfig,
} from './processFlowPersistence'

let seq = syncSeqFromConfig(loadProcessFlowConfig())

function nextId(prefix: string) {
  seq += 1
  return `${prefix}_${seq}`
}

interface ProcessFlowState extends ProcessFlowConfig {
  lastSavedAt: string | null
  setStartLabel: (label: ProcessFlowConfig['startLabel']) => void
  resetToDefault: () => void
  saveConfig: () => void
  exportConfig: () => void
  importConfig: (file: File) => Promise<{ ok: true } | { ok: false; message: string }>

  addStage: (stage: Omit<ProcessStage, 'id'>) => string
  updateStage: (id: string, patch: Partial<ProcessStage>) => void
  removeStage: (id: string) => void

  addSubPhase: (sub: Omit<ProcessSubPhase, 'id'>) => string
  updateSubPhase: (id: string, patch: Partial<ProcessSubPhase>) => void
  removeSubPhase: (id: string) => void

  addRole: (role: Omit<ProcessRole, 'id'>) => string
  updateRole: (id: string, patch: Partial<ProcessRole>) => void
  removeRole: (id: string) => void
  moveRole: (id: string, direction: 'up' | 'down') => void

  addActivity: (act: Omit<ProcessActivity, 'id'>) => string
  updateActivity: (id: string, patch: Partial<ProcessActivity>) => void
  removeActivity: (id: string) => void

  addConnection: (conn: Omit<ProcessConnection, 'id'>) => string
  removeConnection: (id: string) => void

  addOverlay: (ov: Omit<ProcessOverlay, 'id'>) => string
  updateOverlay: (id: string, patch: Partial<ProcessOverlay>) => void
  removeOverlay: (id: string) => void
}

const initialConfig = loadProcessFlowConfig()

export const useProcessFlowStore = create<ProcessFlowState>((set, get) => ({
  ...cloneProcessFlowConfig(initialConfig),
  lastSavedAt: localStorage.getItem('ppwr-process-flow-saved-at'),

  setStartLabel: (startLabel) => set({ startLabel }),

  resetToDefault: () => {
    seq = syncSeqFromConfig(DEFAULT_PROCESS_FLOW)
    set({ ...cloneProcessFlowConfig(DEFAULT_PROCESS_FLOW), lastSavedAt: null })
  },

  saveConfig: () => {
    const config = pickProcessFlowConfig(get())
    saveProcessFlowConfig(config)
    const at = new Date().toISOString()
    localStorage.setItem('ppwr-process-flow-saved-at', at)
    set({ lastSavedAt: at })
  },

  exportConfig: () => {
    downloadProcessFlowConfig(pickProcessFlowConfig(get()))
  },

  importConfig: async (file) => {
    try {
      const text = await file.text()
      const parsed = JSON.parse(text) as unknown
      const config = extractProcessFlowConfigFromImport(parsed)
      seq = syncSeqFromConfig(config)
      set({ ...cloneProcessFlowConfig(config), lastSavedAt: null })
      return { ok: true }
    } catch (err) {
      if (err instanceof ProcessFlowImportError) {
        return { ok: false, message: err.message }
      }
      if (err instanceof SyntaxError) {
        return { ok: false, message: 'JSON 解析失败' }
      }
      return { ok: false, message: '导入失败' }
    }
  },

  addStage: (stage) => {
    const id = nextId('stage')
    set((s) => ({ stages: [...s.stages, { ...stage, id }] }))
    return id
  },
  updateStage: (id, patch) => {
    set((s) => ({ stages: s.stages.map((x) => (x.id === id ? { ...x, ...patch } : x)) }))
  },
  removeStage: (id) => {
    const subIds = get().subPhases.filter((sp) => sp.stageId === id).map((sp) => sp.id)
    set((s) => ({
      stages: s.stages.filter((x) => x.id !== id),
      subPhases: s.subPhases.filter((sp) => sp.stageId !== id),
      activities: s.activities.filter((a) => !subIds.includes(a.subPhaseId)),
      connections: s.connections.filter((c) => {
        const actIds = new Set(s.activities.filter((a) => !subIds.includes(a.subPhaseId)).map((a) => a.id))
        return actIds.has(c.fromActivityId) && actIds.has(c.toActivityId)
      }),
    }))
  },

  addSubPhase: (sub) => {
    const id = nextId('sp')
    set((s) => ({ subPhases: [...s.subPhases, { ...sub, id }] }))
    return id
  },
  updateSubPhase: (id, patch) => {
    set((s) => ({ subPhases: s.subPhases.map((x) => (x.id === id ? { ...x, ...patch } : x)) }))
  },
  removeSubPhase: (id) => {
    set((s) => {
      const remainActs = s.activities.filter((a) => a.subPhaseId !== id)
      const remainIds = new Set(remainActs.map((a) => a.id))
      return {
        subPhases: s.subPhases.filter((x) => x.id !== id),
        activities: remainActs,
        connections: s.connections.filter(
          (c) => remainIds.has(c.fromActivityId) && remainIds.has(c.toActivityId),
        ),
      }
    })
  },

  addRole: (role) => {
    const id = nextId('role')
    set((s) => ({
      roles: [...s.roles, { ...role, id, order: role.order ?? s.roles.length }],
    }))
    return id
  },
  updateRole: (id, patch) => {
    set((s) => ({ roles: s.roles.map((x) => (x.id === id ? { ...x, ...patch } : x)) }))
  },
  removeRole: (id) => {
    set((s) => {
      const remain = s.roles.filter((x) => x.id !== id).sort((a, b) => a.order - b.order)
      return { roles: remain.map((r, i) => ({ ...r, order: i })) }
    })
  },
  moveRole: (id, direction) => {
    set((s) => {
      const sorted = [...s.roles].sort((a, b) => a.order - b.order)
      const idx = sorted.findIndex((r) => r.id === id)
      if (idx < 0) return s
      const target = direction === 'up' ? idx - 1 : idx + 1
      if (target < 0 || target >= sorted.length) return s
      ;[sorted[idx], sorted[target]] = [sorted[target], sorted[idx]]
      return { roles: sorted.map((r, i) => ({ ...r, order: i })) }
    })
  },

  addActivity: (act) => {
    const id = nextId('act')
    set((s) => ({ activities: [...s.activities, { ...act, id }] }))
    return id
  },
  updateActivity: (id, patch) => {
    set((s) => ({ activities: s.activities.map((x) => (x.id === id ? { ...x, ...patch } : x)) }))
  },
  removeActivity: (id) => {
    set((s) => ({
      activities: s.activities.filter((x) => x.id !== id),
      connections: s.connections.filter((c) => c.fromActivityId !== id && c.toActivityId !== id),
    }))
  },

  addConnection: (conn) => {
    const id = nextId('conn')
    set((s) => ({ connections: [...s.connections, { ...conn, id }] }))
    return id
  },
  removeConnection: (id) => {
    set((s) => ({ connections: s.connections.filter((x) => x.id !== id) }))
  },

  addOverlay: (ov) => {
    const id = nextId('ov')
    set((s) => ({ overlays: [...s.overlays, { ...ov, id }] }))
    return id
  },
  updateOverlay: (id, patch) => {
    set((s) => ({ overlays: s.overlays.map((x) => (x.id === id ? { ...x, ...patch } : x)) }))
  },
  removeOverlay: (id) => {
    set((s) => ({ overlays: s.overlays.filter((x) => x.id !== id) }))
  },
}))

export function sortedStages(stages: ProcessStage[]) {
  return [...stages].sort((a, b) => a.order - b.order)
}

export function subPhasesForStage(subPhases: ProcessSubPhase[], stageId: string) {
  return [...subPhases].filter((sp) => sp.stageId === stageId).sort((a, b) => a.order - b.order)
}

export function orderedSubPhases(stages: ProcessStage[], subPhases: ProcessSubPhase[]) {
  return sortedStages(stages).flatMap((stage) => subPhasesForStage(subPhases, stage.id))
}

export function activitiesForSubPhase(activities: ProcessActivity[], subPhaseId: string) {
  return [...activities]
    .filter((a) => a.subPhaseId === subPhaseId)
    .sort((a, b) => a.sortOrder - b.sortOrder)
}

export function activitiesForCell(
  activities: ProcessActivity[],
  subPhaseId: string,
  roleId: string,
) {
  return activities
    .filter((a) => a.subPhaseId === subPhaseId && a.roleId === roleId)
    .sort((a, b) => a.sortOrder - b.sortOrder)
}

export function sortedRoles(roles: ProcessRole[]) {
  return [...roles].sort((a, b) => a.order - b.order)
}

export function roleName(roles: ProcessRole[], roleId: string, lang: 'zh' | 'en') {
  return roles.find((r) => r.id === roleId)?.name[lang] ?? '—'
}

export function activityLabel(activities: ProcessActivity[], id: string, lang: 'zh' | 'en') {
  const a = activities.find((x) => x.id === id)
  if (!a) return id
  return `${a.num}. ${a.title[lang]}`
}
