export interface FlowPoint {
  x: number
  y: number
}

export interface FlowConnectionRender {
  id: string
  d: string
}

type Side = 'left' | 'right' | 'top' | 'bottom'

interface Rect {
  x: number
  y: number
  w: number
  h: number
}

interface RoutePlan {
  id: string
  fromId: string
  toId: string
  startSide: Side
  endSide: Side
  start: FlowPoint
  end: FlowPoint
}

interface RouteMetrics {
  d: string
  length: number
  bends: number
}

const GAP = 12
const ALIGN = 8
const SIDE_SPREAD = 14

function domToRect(r: DOMRect, canvas: DOMRect): Rect {
  return {
    x: r.left - canvas.left,
    y: r.top - canvas.top,
    w: r.width,
    h: r.height,
  }
}

function centerX(r: Rect) {
  return r.x + r.w / 2
}

function centerY(r: Rect) {
  return r.y + r.h / 2
}

function anchor(rect: Rect, side: Side): FlowPoint {
  switch (side) {
    case 'left':
      return { x: rect.x, y: centerY(rect) }
    case 'right':
      return { x: rect.x + rect.w, y: centerY(rect) }
    case 'top':
      return { x: centerX(rect), y: rect.y }
    case 'bottom':
      return { x: centerX(rect), y: rect.y + rect.h }
  }
}

function outwardPoint(p: FlowPoint, side: Side, dist: number): FlowPoint {
  switch (side) {
    case 'right':
      return { x: p.x + dist, y: p.y }
    case 'left':
      return { x: p.x - dist, y: p.y }
    case 'bottom':
      return { x: p.x, y: p.y + dist }
    case 'top':
      return { x: p.x, y: p.y - dist }
  }
}

function dedupePoints(points: FlowPoint[]): FlowPoint[] {
  const out: FlowPoint[] = []
  for (const p of points) {
    const prev = out[out.length - 1]
    if (!prev || Math.abs(prev.x - p.x) > 0.5 || Math.abs(prev.y - p.y) > 0.5) {
      out.push(p)
    }
  }
  return out
}

function pathMetrics(points: FlowPoint[]): RouteMetrics {
  let length = 0
  let bends = 0
  for (let i = 1; i < points.length; i += 1) {
    length += Math.abs(points[i].x - points[i - 1].x) + Math.abs(points[i].y - points[i - 1].y)
    if (i >= 2) {
      const a = points[i - 2]
      const b = points[i - 1]
      const c = points[i]
      const h1 = Math.abs(a.x - b.x) > Math.abs(a.y - b.y)
      const h2 = Math.abs(b.x - c.x) > Math.abs(b.y - c.y)
      if (h1 !== h2) bends += 1
    }
  }
  const d = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ')
  return { d, length, bends }
}

function connectOutside(a: FlowPoint, b: FlowPoint, hFirst: boolean): FlowPoint[] {
  if (Math.abs(a.x - b.x) < 1 || Math.abs(a.y - b.y) < 1) return [a, b]
  if (hFirst) return [a, { x: b.x, y: a.y }, b]
  return [a, { x: a.x, y: b.y }, b]
}

function prefersHorizontalFirst(startSide: Side, endSide: Side, from: Rect, to: Rect): boolean {
  const dx = centerX(to) - centerX(from)
  const dy = centerY(to) - centerY(from)
  if (startSide === 'left' || startSide === 'right') {
    if (endSide === 'left' || endSide === 'right') return true
    return Math.abs(dx) >= Math.abs(dy)
  }
  if (endSide === 'top' || endSide === 'bottom') return false
  return Math.abs(dy) >= Math.abs(dx)
}

/** 构建两锚点间正交折线 */
export function buildOrthogonalPath(
  start: FlowPoint,
  end: FlowPoint,
  startSide: Side,
  endSide: Side,
  from?: Rect,
  to?: Rect,
): RouteMetrics {
  const sOut = outwardPoint(start, startSide, GAP)
  const eOut = outwardPoint(end, endSide, GAP)
  const hFirst =
    from && to
      ? prefersHorizontalFirst(startSide, endSide, from, to)
      : startSide === 'left' || startSide === 'right'
  const middle = connectOutside(sOut, eOut, hFirst)
  return pathMetrics(dedupePoints([start, sOut, ...middle.slice(1), eOut, end]))
}

function forwardExitSides(from: Rect, to: Rect): Side[] {
  const dx = centerX(to) - centerX(from)
  const dy = centerY(to) - centerY(from)

  if (dx < -ALIGN) return ['left', 'top']

  if (Math.abs(dx) <= ALIGN && dy > ALIGN) return ['bottom', 'right']
  if (dx > ALIGN && dy > ALIGN) return ['right', 'bottom']
  if (dx > ALIGN) return ['right', 'bottom']
  if (dy >= 0) return ['bottom', 'right']
  return ['right', 'bottom']
}

function forwardEntrySides(from: Rect, to: Rect): Side[] {
  const dx = centerX(to) - centerX(from)
  const dy = centerY(to) - centerY(from)

  if (dx < -ALIGN) return ['right', 'bottom']
  if (dx > ALIGN && dy > ALIGN) return ['left', 'top']
  if (dx > ALIGN) return ['left', 'top']
  if (dy >= 0) return ['top', 'left']
  return ['bottom', 'right']
}

function scoreRoute(
  from: Rect,
  to: Rect,
  startSide: Side,
  endSide: Side,
  metrics: RouteMetrics,
): number {
  const dx = centerX(to) - centerX(from)
  const dy = centerY(to) - centerY(from)
  let score = metrics.length + metrics.bends * 22

  const forward = dx >= -ALIGN
  if (forward) {
    if (startSide === 'right') score -= 36
    else if (startSide === 'bottom') score -= 28
    else if (startSide === 'left') score += 48
    else score += 16
  }

  if (dx > ALIGN && endSide === 'left') score -= 18
  if (dx > ALIGN && dy > ALIGN && endSide === 'top') score -= 8
  if (Math.abs(dx) <= ALIGN && dy > ALIGN && endSide === 'top') score -= 18
  if (Math.abs(dx) <= ALIGN && dy > ALIGN && endSide === 'left') score -= 6
  if (dx < -ALIGN && endSide === 'right') score -= 18

  if (startSide === 'right' && dx < -ALIGN) score += 40
  if (startSide === 'bottom' && dy < -ALIGN) score += 40

  return score
}

function pickBestRoute(from: Rect, to: Rect): { startSide: Side; endSide: Side; metrics: RouteMetrics } {
  const exits = forwardExitSides(from, to)
  const entries = forwardEntrySides(from, to)
  let best: { startSide: Side; endSide: Side; metrics: RouteMetrics; score: number } | null = null

  for (const startSide of exits) {
    for (const endSide of entries) {
      if (startSide === endSide) continue
      const start = anchor(from, startSide)
      const end = anchor(to, endSide)
      const metrics = buildOrthogonalPath(start, end, startSide, endSide, from, to)
      const score = scoreRoute(from, to, startSide, endSide, metrics)
      if (!best || score < best.score) {
        best = { startSide, endSide, metrics, score }
      }
    }
  }

  if (best) return best

  const startSide: Side = 'right'
  const endSide: Side = 'left'
  const start = anchor(from, startSide)
  const end = anchor(to, endSide)
  return { startSide, endSide, metrics: buildOrthogonalPath(start, end, startSide, endSide, from, to) }
}

function offsetOnSide(point: FlowPoint, side: Side, index: number, total: number): FlowPoint {
  if (total <= 1) return point
  const shift = (index - (total - 1) / 2) * SIDE_SPREAD
  if (side === 'left' || side === 'right') return { x: point.x, y: point.y + shift }
  return { x: point.x + shift, y: point.y }
}

function applyGlobalSideOffsets(plans: RoutePlan[]): RoutePlan[] {
  const exitGroups = new Map<string, RoutePlan[]>()
  const entryGroups = new Map<string, RoutePlan[]>()

  for (const plan of plans) {
    const exitKey = `${plan.fromId}:${plan.startSide}`
    const entryKey = `${plan.toId}:${plan.endSide}`
    exitGroups.set(exitKey, [...(exitGroups.get(exitKey) ?? []), plan])
    entryGroups.set(entryKey, [...(entryGroups.get(entryKey) ?? []), plan])
  }

  const exitOffset = new Map<string, FlowPoint>()
  const entryOffset = new Map<string, FlowPoint>()

  for (const [key, group] of exitGroups) {
    const side = key.split(':')[1] as Side
    group.sort((a, b) => a.id.localeCompare(b.id))
    group.forEach((plan, index) => {
      exitOffset.set(`${plan.id}:start`, offsetOnSide(plan.start, side, index, group.length))
    })
  }

  for (const [key, group] of entryGroups) {
    const side = key.split(':')[1] as Side
    group.sort((a, b) => a.id.localeCompare(b.id))
    group.forEach((plan, index) => {
      entryOffset.set(`${plan.id}:end`, offsetOnSide(plan.end, side, index, group.length))
    })
  }

  return plans.map((plan) => ({
    ...plan,
    start: exitOffset.get(`${plan.id}:start`) ?? plan.start,
    end: entryOffset.get(`${plan.id}:end`) ?? plan.end,
  }))
}

export function computeConnectionPaths(
  connections: { id: string; fromActivityId: string; toActivityId: string }[],
  nodeRefs: Map<string, HTMLDivElement>,
  canvasEl: HTMLElement,
): FlowConnectionRender[] {
  const canvasRect = canvasEl.getBoundingClientRect()

  const plans: RoutePlan[] = []

  for (const c of connections) {
    const fromEl = nodeRefs.get(c.fromActivityId)
    const toEl = nodeRefs.get(c.toActivityId)
    if (!fromEl || !toEl) continue

    const from = domToRect(fromEl.getBoundingClientRect(), canvasRect)
    const to = domToRect(toEl.getBoundingClientRect(), canvasRect)
    const route = pickBestRoute(from, to)

    plans.push({
      id: c.id,
      fromId: c.fromActivityId,
      toId: c.toActivityId,
      startSide: route.startSide,
      endSide: route.endSide,
      start: anchor(from, route.startSide),
      end: anchor(to, route.endSide),
    })
  }

  const adjusted = applyGlobalSideOffsets(plans)
  const rectById = new Map<string, Rect>()

  for (const c of connections) {
    const fromEl = nodeRefs.get(c.fromActivityId)
    const toEl = nodeRefs.get(c.toActivityId)
    if (fromEl) rectById.set(c.fromActivityId, domToRect(fromEl.getBoundingClientRect(), canvasRect))
    if (toEl) rectById.set(c.toActivityId, domToRect(toEl.getBoundingClientRect(), canvasRect))
  }

  return adjusted.map((plan) => {
    const from = rectById.get(plan.fromId)
    const to = rectById.get(plan.toId)
    const metrics = buildOrthogonalPath(plan.start, plan.end, plan.startSide, plan.endSide, from, to)
    return { id: plan.id, d: metrics.d }
  })
}
