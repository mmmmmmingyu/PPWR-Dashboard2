import { Link } from 'react-router-dom'
import clsx from 'clsx'
import type { Language } from '../../types'
import type { OverlayPixelRect } from '../../utils/overlayLayout'
import { useProcessFlowStore } from '../../store/processFlowStore'

interface OverlayLayerProps {
  lang: Language
  editMode: boolean
  showOverlays: boolean
  selectedId: string | null
  onSelect: (id: string | null) => void
  rects: Map<string, OverlayPixelRect>
}

export function OverlayLayer({
  lang,
  editMode,
  showOverlays,
  selectedId,
  onSelect,
  rects,
}: OverlayLayerProps) {
  const overlays = useProcessFlowStore((s) => s.overlays)

  return (
    <>
      {overlays.map((ov) => {
        const rect = rects.get(ov.id)
        if (!rect) return null

        const isHidden = ov.visible === false
        if (!editMode && (!showOverlays || isHidden)) return null

        const selected = selectedId === ov.id
        const style = {
          left: rect.left,
          top: rect.top,
          width: rect.width,
          height: rect.height,
        }

        if (editMode) {
          return (
            <div
              key={ov.id}
              data-overlay={ov.id}
              style={style}
              className={clsx(
                'absolute z-20 flex items-center justify-center rounded-xl p-1 box-border cursor-pointer',
                'border-2 border-dashed',
                isHidden
                  ? 'bg-slate-200/40 border-slate-300/60 opacity-60'
                  : 'bg-primary-600/12 border-primary-400/50',
                selected && 'ring-2 ring-primary-500 bg-primary-600/20 border-primary-500',
              )}
              onClick={(e) => {
                e.stopPropagation()
                onSelect(ov.id)
              }}
            >
              <span
                className={clsx(
                  'px-2 py-1 rounded-lg shadow-sm text-xs font-semibold text-center leading-snug pointer-events-none select-none',
                  isHidden ? 'bg-slate-100 text-slate-400 line-through' : 'bg-white/95 text-primary-700',
                )}
              >
                {ov.label[lang]}
              </span>
            </div>
          )
        }

        return (
          <Link
            key={ov.id}
            to={ov.menuPath}
            data-overlay={ov.id}
            style={style}
            className="absolute z-20 flex items-center justify-center rounded-xl p-1 box-border bg-primary-600/12 border-2 border-dashed border-primary-400/50 hover:bg-primary-600/22 hover:border-primary-500/70 cursor-pointer transition-colors"
          >
            <span className="px-2 py-1 bg-white/95 rounded-lg shadow-sm text-xs font-semibold text-primary-700 text-center leading-snug">
              {ov.label[lang]}
            </span>
          </Link>
        )
      })}
    </>
  )
}
