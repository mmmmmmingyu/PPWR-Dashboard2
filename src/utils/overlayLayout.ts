import type { ProcessOverlay, ProcessRole, ProcessStage, ProcessSubPhase } from '../types'
import { orderedSubPhases, sortedRoles } from '../store/processFlowStore'

export interface OverlayLayoutRefs {
  flowGrid: HTMLElement
  stage: Map<string, HTMLElement>
  subPhase: Map<string, HTMLElement>
  cell: Map<string, HTMLElement>
}

export interface OverlayPixelRect {
  left: number
  top: number
  width: number
  height: number
}

function mergeRects(rects: DOMRect[]): DOMRect | null {
  if (rects.length === 0) return null
  let left = Infinity
  let top = Infinity
  let right = -Infinity
  let bottom = -Infinity
  rects.forEach((r) => {
    left = Math.min(left, r.left)
    top = Math.min(top, r.top)
    right = Math.max(right, r.right)
    bottom = Math.max(bottom, r.bottom)
  })
  return new DOMRect(left, top, right - left, bottom - top)
}

function subPhaseSlice(
  stages: ProcessStage[],
  subPhases: ProcessSubPhase[],
  startId: string,
  endId: string,
) {
  const ordered = orderedSubPhases(stages, subPhases)
  const startIdx = ordered.findIndex((sp) => sp.id === startId)
  const endIdx = ordered.findIndex((sp) => sp.id === endId)
  if (startIdx < 0 || endIdx < 0) return []
  const [from, to] = startIdx <= endIdx ? [startIdx, endIdx] : [endIdx, startIdx]
  return ordered.slice(from, to + 1)
}

function roleSlice(roles: ProcessRole[], startId: string, endId: string) {
  const ordered = sortedRoles(roles)
  const startIdx = ordered.findIndex((r) => r.id === startId)
  const endIdx = ordered.findIndex((r) => r.id === endId)
  if (startIdx < 0 || endIdx < 0) return []
  const [from, to] = startIdx <= endIdx ? [startIdx, endIdx] : [endIdx, startIdx]
  return ordered.slice(from, to + 1)
}

/** 根据锚定的子流程段/角色区域计算蒙板像素位置（相对流程网格） */
export function computeOverlayRect(
  overlay: ProcessOverlay,
  refs: OverlayLayoutRefs,
  stages: ProcessStage[],
  subPhases: ProcessSubPhase[],
  roles: ProcessRole[],
): OverlayPixelRect | null {
  const gridRect = refs.flowGrid.getBoundingClientRect()
  const boxes: DOMRect[] = []
  const spSlice = subPhaseSlice(stages, subPhases, overlay.subPhaseStartId, overlay.subPhaseEndId)
  const roleSliceItems = roleSlice(roles, overlay.roleStartId, overlay.roleEndId)

  if (spSlice.length === 0 || roleSliceItems.length === 0) return null

  if (overlay.coverStageRow) {
    const stageIds = [...new Set(spSlice.map((sp) => sp.stageId))]
    stageIds.forEach((stageId) => {
      const el = refs.stage.get(stageId)
      if (el) boxes.push(el.getBoundingClientRect())
    })
  }

  if (overlay.coverSubPhaseRow) {
    spSlice.forEach((sp) => {
      const el = refs.subPhase.get(sp.id)
      if (el) boxes.push(el.getBoundingClientRect())
    })
  }

  roleSliceItems.forEach((role) => {
    spSlice.forEach((sp) => {
      const el = refs.cell.get(`${role.id}:${sp.id}`)
      if (el) boxes.push(el.getBoundingClientRect())
    })
  })

  const union = mergeRects(boxes)
  if (!union) return null

  let left = union.left - gridRect.left
  let top = union.top - gridRect.top
  let width = union.width
  let height = union.height

  const pt = ((overlay.padTop ?? 0) / 100) * height
  const pr = ((overlay.padRight ?? 0) / 100) * width
  const pb = ((overlay.padBottom ?? 0) / 100) * height
  const pl = ((overlay.padLeft ?? 0) / 100) * width

  left += pl
  top += pt
  width = Math.max(4, width - pl - pr)
  height = Math.max(4, height - pt - pb)

  return { left, top, width, height }
}

export function computeAllOverlayRects(
  overlays: ProcessOverlay[],
  refs: OverlayLayoutRefs,
  stages: ProcessStage[],
  subPhases: ProcessSubPhase[],
  roles: ProcessRole[],
): Map<string, OverlayPixelRect> {
  const map = new Map<string, OverlayPixelRect>()
  overlays.forEach((ov) => {
    const rect = computeOverlayRect(ov, refs, stages, subPhases, roles)
    if (rect) map.set(ov.id, rect)
  })
  return map
}

/** 旧版 canvas 百分比蒙板迁移为锚定格式 */
export function migrateLegacyOverlay(
  ov: Record<string, unknown>,
  stages: ProcessStage[],
  subPhases: ProcessSubPhase[],
  roles: ProcessRole[],
): ProcessOverlay {
  if (ov.subPhaseStartId && ov.subPhaseEndId && ov.roleStartId && ov.roleEndId) {
    return ov as unknown as ProcessOverlay
  }

  const orderedSp = orderedSubPhases(stages, subPhases)
  const orderedRoles = sortedRoles(roles as ProcessRole[])
  const y = typeof ov.y === 'number' ? ov.y : 0
  const h = typeof ov.height === 'number' ? ov.height : 20

  const spCount = orderedSp.length
  const startSpIdx = spCount ? Math.min(spCount - 1, Math.floor((y / 100) * spCount)) : 0
  const endSpIdx = spCount
    ? Math.min(spCount - 1, Math.max(startSpIdx, Math.floor(((y + h) / 100) * spCount)))
    : 0

  return {
    id: String(ov.id),
    label: ov.label as ProcessOverlay['label'],
    menuPath: String(ov.menuPath ?? '/kpi'),
    subPhaseStartId: orderedSp[startSpIdx]?.id ?? orderedSp[0]?.id ?? '',
    subPhaseEndId: orderedSp[endSpIdx]?.id ?? orderedSp[orderedSp.length - 1]?.id ?? '',
    roleStartId: orderedRoles[0]?.id ?? '',
    roleEndId: orderedRoles[orderedRoles.length - 1]?.id ?? '',
    coverStageRow: y < 18,
    coverSubPhaseRow: y < 28,
    padTop: 0,
    padRight: 0,
    padBottom: 0,
    padLeft: 0,
    visible: ov.visible !== false,
  }
}
