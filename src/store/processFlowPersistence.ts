import type { ProcessFlowConfig } from '../types'
import { migrateLegacyOverlay } from '../utils/overlayLayout'
import { DEFAULT_PROCESS_FLOW } from '../mock/processFlowDefault'

export const PROCESS_FLOW_STORAGE_KEY = 'ppwr-process-flow-config'

export function cloneProcessFlowConfig(c: ProcessFlowConfig): ProcessFlowConfig {
  return JSON.parse(JSON.stringify(c)) as ProcessFlowConfig
}

export function loadProcessFlowConfig(): ProcessFlowConfig {
  try {
    const raw = localStorage.getItem(PROCESS_FLOW_STORAGE_KEY)
    if (raw) {
      const parsed = JSON.parse(raw) as ProcessFlowConfig
      if (parsed.stages && parsed.roles && parsed.activities) {
        const roles = parsed.roles.map((r, i) => ({
          ...r,
          order: typeof r.order === 'number' ? r.order : i,
        }))
        return {
          ...parsed,
          roles,
          overlays: (parsed.overlays ?? []).map((ov) => {
            const migrated = migrateLegacyOverlay(
              ov as unknown as Record<string, unknown>,
              parsed.stages,
              parsed.subPhases,
              roles,
            )
            return { ...migrated, visible: ov.visible !== false }
          }),
        }
      }
    }
  } catch {
    /* use default */
  }
  return cloneProcessFlowConfig(DEFAULT_PROCESS_FLOW)
}

export function saveProcessFlowConfig(config: ProcessFlowConfig) {
  localStorage.setItem(PROCESS_FLOW_STORAGE_KEY, JSON.stringify(config))
}

export function pickProcessFlowConfig(state: ProcessFlowConfig): ProcessFlowConfig {
  return {
    startLabel: state.startLabel,
    stages: state.stages,
    subPhases: state.subPhases,
    roles: state.roles,
    activities: state.activities,
    connections: state.connections,
    overlays: state.overlays,
  }
}

/** 从已存 id 推断序号，避免新增 id 冲突 */
export function syncSeqFromConfig(config: ProcessFlowConfig): number {
  const ids = [
    ...config.stages.map((s) => s.id),
    ...config.subPhases.map((s) => s.id),
    ...config.roles.map((s) => s.id),
    ...config.activities.map((s) => s.id),
    ...config.connections.map((s) => s.id),
    ...config.overlays.map((s) => s.id),
  ]
  let max = 100
  ids.forEach((id) => {
    const m = id.match(/_(\d+)$/)
    if (m) max = Math.max(max, Number(m[1]))
  })
  return max
}
