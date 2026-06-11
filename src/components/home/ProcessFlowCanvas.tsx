import { Fragment, useCallback, useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Eye, EyeOff } from 'lucide-react'
import clsx from 'clsx'
import { useAppStore } from '../../store/appStore'
import {
  activitiesForCell,
  orderedSubPhases,
  sortedRoles,
  sortedStages,
  subPhasesForStage,
  useProcessFlowStore,
} from '../../store/processFlowStore'
import { OverlayLayer } from './OverlayLayer'
import { computeConnectionPaths, type FlowConnectionRender } from '../../utils/flowConnectionPath'
import { computeAllOverlayRects, type OverlayPixelRect } from '../../utils/overlayLayout'
import type { ProcessActivity } from '../../types'

interface ProcessFlowCanvasProps {
  overlayEditMode?: boolean
  selectedOverlayId?: string | null
  onSelectOverlay?: (id: string | null) => void
}

function ActivityCard({
  activity,
  lang,
  innerRef,
}: {
  activity: ProcessActivity
  lang: 'zh' | 'en'
  innerRef?: (el: HTMLDivElement | null) => void
}) {
  return (
    <div
      ref={innerRef}
      data-activity-id={activity.id}
      className={clsx(
        'rounded-lg border px-2 py-1.5 bg-white shadow-sm text-left w-full',
        activity.highlight
          ? 'border-amber-400 bg-amber-50/90 ring-2 ring-amber-300/60'
          : 'border-slate-200',
      )}
    >
      <p className="text-[11px] font-semibold text-slate-800 leading-snug">
        <span className="text-primary-600 mr-0.5">{activity.num}.</span>
        {activity.title[lang]}
      </p>
    </div>
  )
}

export function ProcessFlowCanvas({
  overlayEditMode = false,
  selectedOverlayId = null,
  onSelectOverlay,
}: ProcessFlowCanvasProps) {
  const { t } = useTranslation()
  const lang = useAppStore((s) => s.language)
  const overlaysVisible = useAppStore((s) => s.overlaysVisible)
  const toggleOverlaysVisible = useAppStore((s) => s.toggleOverlaysVisible)
  const config = useProcessFlowStore()
  const canvasRef = useRef<HTMLDivElement>(null)
  const flowGridRef = useRef<HTMLDivElement>(null)
  const nodeRefs = useRef<Map<string, HTMLDivElement>>(new Map())
  const stageRefs = useRef<Map<string, HTMLDivElement>>(new Map())
  const subPhaseRefs = useRef<Map<string, HTMLDivElement>>(new Map())
  const cellRefs = useRef<Map<string, HTMLDivElement>>(new Map())
  const observerRef = useRef<ResizeObserver | null>(null)
  const [paths, setPaths] = useState<FlowConnectionRender[]>([])
  const [overlayRects, setOverlayRects] = useState<Map<string, OverlayPixelRect>>(new Map())

  const recomputeLines = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    setPaths(computeConnectionPaths(config.connections, nodeRefs.current, canvas))
  }, [config.connections])

  const recomputeOverlays = useCallback(() => {
    const grid = flowGridRef.current
    if (!grid) return
    setOverlayRects(
      computeAllOverlayRects(
        config.overlays,
        {
          flowGrid: grid,
          stage: stageRefs.current,
          subPhase: subPhaseRefs.current,
          cell: cellRefs.current,
        },
        config.stages,
        config.subPhases,
        config.roles,
      ),
    )
  }, [config.overlays, config.stages, config.subPhases, config.roles])

  const recomputeAll = useCallback(() => {
    recomputeLines()
    recomputeOverlays()
  }, [recomputeLines, recomputeOverlays])

  const setNodeRef = useCallback(
    (id: string, el: HTMLDivElement | null) => {
      const prev = nodeRefs.current.get(id)
      if (prev && observerRef.current) observerRef.current.unobserve(prev)
      if (el) {
        nodeRefs.current.set(id, el)
        observerRef.current?.observe(el)
      } else {
        nodeRefs.current.delete(id)
      }
      window.requestAnimationFrame(recomputeAll)
    },
    [recomputeAll],
  )

  const setStageRef = useCallback(
    (id: string, el: HTMLDivElement | null) => {
      if (el) stageRefs.current.set(id, el)
      else stageRefs.current.delete(id)
      window.requestAnimationFrame(recomputeOverlays)
    },
    [recomputeOverlays],
  )

  const setSubPhaseRef = useCallback(
    (id: string, el: HTMLDivElement | null) => {
      if (el) subPhaseRefs.current.set(id, el)
      else subPhaseRefs.current.delete(id)
      window.requestAnimationFrame(recomputeOverlays)
    },
    [recomputeOverlays],
  )

  const setCellRef = useCallback(
    (key: string, el: HTMLDivElement | null) => {
      if (el) cellRefs.current.set(key, el)
      else cellRefs.current.delete(key)
      window.requestAnimationFrame(recomputeOverlays)
    },
    [recomputeOverlays],
  )

  useEffect(() => {
    observerRef.current = new ResizeObserver(recomputeAll)
    if (canvasRef.current) observerRef.current.observe(canvasRef.current)
    if (flowGridRef.current) observerRef.current.observe(flowGridRef.current)
    nodeRefs.current.forEach((el) => observerRef.current?.observe(el))
    window.addEventListener('resize', recomputeAll)
    recomputeAll()
    return () => {
      observerRef.current?.disconnect()
      window.removeEventListener('resize', recomputeAll)
    }
  }, [recomputeAll, config.activities, config.connections, config.stages, config.subPhases, config.roles, config.overlays])

  const stages = sortedStages(config.stages)
  const roleRows = sortedRoles(config.roles)
  const subPhaseCols = orderedSubPhases(config.stages, config.subPhases)
  const colCount = Math.max(subPhaseCols.length, 1)
  const roleColWidth = '7.5rem'

  return (
    <div className="space-y-3">
      {!overlayEditMode && (
        <div className="flex justify-end">
          <button
            type="button"
            onClick={toggleOverlaysVisible}
            className={clsx(
              'flex items-center gap-1.5 px-3 py-1.5 text-xs border rounded-lg transition-colors',
              overlaysVisible
                ? 'border-primary-200 bg-primary-50 text-primary-700 hover:bg-primary-100'
                : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50',
            )}
          >
            {overlaysVisible ? <Eye size={14} /> : <EyeOff size={14} />}
            {overlaysVisible ? t('processFlow.hideOverlays') : t('processFlow.showOverlays')}
          </button>
        </div>
      )}

      <div
        ref={canvasRef}
        className="relative rounded-2xl border border-slate-200 bg-white p-3 shadow-sm overflow-x-auto min-h-[360px]"
        onClick={() => overlayEditMode && onSelectOverlay?.(null)}
      >
        <svg className="absolute inset-0 w-full h-full pointer-events-none z-[8]" aria-hidden>
          {paths.map((p) => (
            <path
              key={p.id}
              d={p.d}
              fill="none"
              stroke="#94a3b8"
              strokeWidth={1.5}
              strokeDasharray="4 3"
              strokeLinejoin="round"
              strokeLinecap="round"
              markerEnd="url(#flow-arrow)"
            />
          ))}
          <defs>
            <marker id="flow-arrow" markerWidth="8" markerHeight="8" refX="6" refY="4" orient="auto">
              <path d="M0,0 L8,4 L0,8 Z" fill="#94a3b8" />
            </marker>
          </defs>
        </svg>

        {stages.length === 0 ? (
          <p className="relative z-[1] text-center text-sm text-slate-400 py-16">{t('processFlow.emptyStages')}</p>
        ) : (
          <div ref={flowGridRef} className="relative z-[1] min-w-max">
            <OverlayLayer
              lang={lang}
              editMode={overlayEditMode}
              showOverlays={overlaysVisible}
              selectedId={selectedOverlayId}
              onSelect={onSelectOverlay ?? (() => {})}
              rects={overlayRects}
            />

            <div
              style={{ display: 'grid', gridTemplateColumns: `${roleColWidth} repeat(${colCount}, minmax(88px, 1fr))`, gap: '0.5rem' }}
            >
              <div className="text-[10px] font-semibold text-slate-400 flex items-end pb-1">
                {t('processFlow.roleColumn')}
              </div>
              {stages.map((stage) => {
                const span = subPhasesForStage(config.subPhases, stage.id).length || 1
                return (
                  <div
                    key={stage.id}
                    ref={(el) => setStageRef(stage.id, el)}
                    className="text-sm font-bold text-slate-800 bg-slate-100 border border-slate-200 rounded-lg px-2 py-2 text-center"
                    style={{ gridColumn: `span ${span}` }}
                  >
                    {stage.name[lang]}
                  </div>
                )
              })}

              <div className="text-[10px] text-slate-400 flex items-center">{t('processFlow.subPhaseRow')}</div>
              {subPhaseCols.map((sp) => {
                const stage = stages.find((s) => s.id === sp.stageId)
                return (
                  <div
                    key={sp.id}
                    ref={(el) => setSubPhaseRef(sp.id, el)}
                    className="text-[11px] font-semibold text-primary-700 bg-primary-50 border border-primary-100 px-2 py-1 rounded-md text-center"
                  >
                    {sp.name[lang]}
                    {stage && subPhasesForStage(config.subPhases, stage.id).length > 1 && (
                      <span className="block text-[9px] text-primary-500/70 font-normal">{stage.name[lang]}</span>
                    )}
                  </div>
                )
              })}

              {roleRows.length === 0 ? (
                <>
                  <div className="text-xs text-slate-300 italic">{t('processFlow.noRoles')}</div>
                  {subPhaseCols.map((sp) => (
                    <div key={sp.id} className="min-h-[48px] border border-dashed border-slate-100 rounded-lg" />
                  ))}
                </>
              ) : (
                roleRows.map((role) => (
                  <Fragment key={role.id}>
                    <div className="text-xs font-medium text-slate-700 bg-slate-50 border border-slate-200 rounded-lg px-2 py-2 flex items-center">
                      {role.name[lang]}
                    </div>
                    {subPhaseCols.map((sp) => {
                      const acts = activitiesForCell(config.activities, sp.id, role.id)
                      const cellKey = `${role.id}:${sp.id}`
                      return (
                        <div
                          key={cellKey}
                          ref={(el) => setCellRef(cellKey, el)}
                          className="min-h-[52px] p-1 border border-slate-100 rounded-lg bg-slate-50/30 space-y-1"
                        >
                          {acts.map((act) => (
                            <ActivityCard
                              key={act.id}
                              activity={act}
                              lang={lang}
                              innerRef={(el) => setNodeRef(act.id, el)}
                            />
                          ))}
                        </div>
                      )
                    })}
                  </Fragment>
                ))
              )}
            </div>
          </div>
        )}
      </div>

      {overlayEditMode && (
        <p className="text-[11px] text-primary-600">{t('processFlow.overlayAnchorHint')}</p>
      )}

      <div className="flex flex-wrap gap-3 text-[11px] text-slate-500">
        <span className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded border-2 border-dashed border-primary-400/60 bg-primary-600/12" />
          {t('home.overlayLegend')}
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded border-2 border-amber-400 bg-amber-50 ring-1 ring-amber-300/60" />
          {t('home.highlightLegend')}
        </span>
      </div>
    </div>
  )
}
