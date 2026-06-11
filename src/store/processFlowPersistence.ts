import type { ProcessFlowConfig } from '../types'
import { migrateLegacyOverlay } from '../utils/overlayLayout'
import { DEFAULT_PROCESS_FLOW } from '../mock/processFlowDefault'

export const PROCESS_FLOW_STORAGE_KEY = 'ppwr-process-flow-config'
export const PROCESS_FLOW_EXPORT_KIND = 'ppwr-process-flow'
export const PROCESS_FLOW_EXPORT_VERSION = 1

export interface ProcessFlowExportPayload {
  schemaVersion: number
  kind: typeof PROCESS_FLOW_EXPORT_KIND
  exportedAt: string
  config: ProcessFlowConfig
}

export class ProcessFlowImportError extends Error {
  code: 'invalid_format' | 'missing_fields' | 'invalid_reference' | 'duplicate_id'

  constructor(
    message: string,
    code: 'invalid_format' | 'missing_fields' | 'invalid_reference' | 'duplicate_id' = 'invalid_format',
  ) {
    super(message)
    this.name = 'ProcessFlowImportError'
    this.code = code
  }
}

export function cloneProcessFlowConfig(c: ProcessFlowConfig): ProcessFlowConfig {
  return JSON.parse(JSON.stringify(c)) as ProcessFlowConfig
}

function isRecord(v: unknown): v is Record<string, unknown> {
  return typeof v === 'object' && v !== null && !Array.isArray(v)
}

function isBilingualText(v: unknown): boolean {
  return isRecord(v) && typeof v.zh === 'string' && typeof v.en === 'string'
}

export function normalizeProcessFlowConfig(raw: ProcessFlowConfig): ProcessFlowConfig {
  const roles = raw.roles.map((r, i) => ({
    ...r,
    order: typeof r.order === 'number' ? r.order : i,
  }))
  return {
    startLabel: raw.startLabel,
    stages: raw.stages,
    subPhases: raw.subPhases,
    roles,
    activities: raw.activities,
    connections: raw.connections,
    overlays: (raw.overlays ?? []).map((ov) => {
      const migrated = migrateLegacyOverlay(
        ov as unknown as Record<string, unknown>,
        raw.stages,
        raw.subPhases,
        roles,
      )
      return { ...migrated, visible: ov.visible !== false }
    }),
  }
}

function assertUniqueIds(label: string, ids: string[]) {
  const seen = new Set<string>()
  for (const id of ids) {
    if (!id) throw new ProcessFlowImportError(`${label} id 不能为空`, 'duplicate_id')
    if (seen.has(id)) throw new ProcessFlowImportError(`${label} id 重复: ${id}`, 'duplicate_id')
    seen.add(id)
  }
}

export function validateProcessFlowConfig(raw: ProcessFlowConfig): ProcessFlowConfig {
  if (!isBilingualText(raw.startLabel)) {
    throw new ProcessFlowImportError('startLabel 格式无效', 'missing_fields')
  }
  for (const key of ['stages', 'subPhases', 'roles', 'activities', 'connections', 'overlays'] as const) {
    if (!Array.isArray(raw[key])) {
      throw new ProcessFlowImportError(`缺少或无效的 ${key}`, 'missing_fields')
    }
  }

  assertUniqueIds('主流程段', raw.stages.map((s) => s.id))
  assertUniqueIds('子流程段', raw.subPhases.map((s) => s.id))
  assertUniqueIds('角色', raw.roles.map((r) => r.id))
  assertUniqueIds('活动', raw.activities.map((a) => a.id))
  assertUniqueIds('连接', raw.connections.map((c) => c.id))
  assertUniqueIds('蒙板', raw.overlays.map((o) => o.id))

  const stageIds = new Set(raw.stages.map((s) => s.id))
  const subPhaseIds = new Set(raw.subPhases.map((s) => s.id))
  const roleIds = new Set(raw.roles.map((r) => r.id))
  const activityIds = new Set(raw.activities.map((a) => a.id))

  for (const sp of raw.subPhases) {
    if (!stageIds.has(sp.stageId)) {
      throw new ProcessFlowImportError(`子流程段 ${sp.id} 引用了无效主流程段`, 'invalid_reference')
    }
  }
  for (const act of raw.activities) {
    if (!subPhaseIds.has(act.subPhaseId)) {
      throw new ProcessFlowImportError(`活动 ${act.id} 引用了无效子流程段`, 'invalid_reference')
    }
    if (!roleIds.has(act.roleId)) {
      throw new ProcessFlowImportError(`活动 ${act.id} 引用了无效角色`, 'invalid_reference')
    }
  }
  for (const conn of raw.connections) {
    if (!activityIds.has(conn.fromActivityId) || !activityIds.has(conn.toActivityId)) {
      throw new ProcessFlowImportError(`连接 ${conn.id} 引用了无效活动`, 'invalid_reference')
    }
  }
  for (const ov of raw.overlays) {
    if (!subPhaseIds.has(ov.subPhaseStartId) || !subPhaseIds.has(ov.subPhaseEndId)) {
      throw new ProcessFlowImportError(`蒙板 ${ov.id} 引用了无效子流程段`, 'invalid_reference')
    }
    if (!roleIds.has(ov.roleStartId) || !roleIds.has(ov.roleEndId)) {
      throw new ProcessFlowImportError(`蒙板 ${ov.id} 引用了无效角色`, 'invalid_reference')
    }
  }

  return normalizeProcessFlowConfig(raw)
}

export function extractProcessFlowConfigFromImport(raw: unknown): ProcessFlowConfig {
  if (!isRecord(raw)) {
    throw new ProcessFlowImportError('配置文件格式无效', 'invalid_format')
  }

  if (raw.kind === PROCESS_FLOW_EXPORT_KIND || raw.schemaVersion != null) {
    if (raw.kind !== PROCESS_FLOW_EXPORT_KIND) {
      throw new ProcessFlowImportError('配置文件类型不匹配', 'invalid_format')
    }
    if (!isRecord(raw.config)) {
      throw new ProcessFlowImportError('配置文件缺少 config 字段', 'missing_fields')
    }
    return validateProcessFlowConfig(raw.config as unknown as ProcessFlowConfig)
  }

  return validateProcessFlowConfig(raw as unknown as ProcessFlowConfig)
}

export function buildProcessFlowExportPayload(config: ProcessFlowConfig): ProcessFlowExportPayload {
  return {
    schemaVersion: PROCESS_FLOW_EXPORT_VERSION,
    kind: PROCESS_FLOW_EXPORT_KIND,
    exportedAt: new Date().toISOString(),
    config: pickProcessFlowConfig(config),
  }
}

export function downloadProcessFlowConfig(config: ProcessFlowConfig) {
  const payload = buildProcessFlowExportPayload(config)
  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const anchor = document.createElement('a')
  const date = payload.exportedAt.slice(0, 10)
  anchor.href = url
  anchor.download = `ppwr-process-flow-${date}.json`
  anchor.click()
  URL.revokeObjectURL(url)
}

export function loadProcessFlowConfig(): ProcessFlowConfig {
  try {
    const raw = localStorage.getItem(PROCESS_FLOW_STORAGE_KEY)
    if (raw) {
      const parsed = JSON.parse(raw) as ProcessFlowConfig
      if (parsed.stages && parsed.roles && parsed.activities) {
        return normalizeProcessFlowConfig(parsed)
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
