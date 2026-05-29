import { useState } from 'react'
import { TrendingUp, TrendingDown, Info } from 'lucide-react'
import clsx from 'clsx'
import type { BilingualText } from '../../types'
import { useAppStore } from '../../store/appStore'
import { bt } from '../../utils/helpers'

interface KpiCardProps {
  name: BilingualText
  current: number
  momChange: number
  unit: string
  description: BilingualText
  selected?: boolean
  onClick?: () => void
}

export function KpiCard({ name, current, momChange, unit, description, selected, onClick }: KpiCardProps) {
  const lang = useAppStore((s) => s.language)
  const [showDef, setShowDef] = useState(false)
  const positive = momChange >= 0

  return (
    <div
      className={clsx(
        'relative bg-white rounded-lg border px-3 py-2.5 cursor-pointer transition-all hover:shadow-sm',
        selected ? 'border-primary-500 shadow-sm ring-1 ring-primary-200' : 'border-slate-200',
      )}
      onClick={onClick}
    >
      <div className="flex items-center justify-between gap-1 mb-1">
        <h3 className="text-xs font-medium text-slate-500 leading-tight line-clamp-2">{bt(name, lang)}</h3>
        <button
          className="text-slate-400 hover:text-primary-600 p-0.5 shrink-0"
          onClick={(e) => {
            e.stopPropagation()
            setShowDef(!showDef)
          }}
        >
          <Info size={12} />
        </button>
      </div>

      <div className="flex items-baseline justify-between gap-2">
        <div className="flex items-baseline gap-1 min-w-0">
          <span className="text-xl font-bold text-slate-900 tabular-nums">{current}</span>
          <span className="text-xs text-slate-400">{unit}</span>
        </div>
        <div className={clsx('flex items-center gap-0.5 text-xs shrink-0', positive ? 'text-primary-600' : 'text-red-500')}>
          {positive ? <TrendingUp size={11} /> : <TrendingDown size={11} />}
          <span className="tabular-nums">{positive ? '+' : ''}{momChange}%</span>
        </div>
      </div>

      {showDef && (
        <div className="absolute z-10 top-full left-0 right-0 mt-1 p-2.5 bg-white border border-slate-200 rounded-lg shadow-lg text-xs text-slate-600">
          {bt(description, lang)}
        </div>
      )}
    </div>
  )
}
