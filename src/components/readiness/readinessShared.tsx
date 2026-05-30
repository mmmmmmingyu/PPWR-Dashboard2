import { StatusBadge } from '../../utils/helpers'
import type { NodeProgress } from '../../types'

export const NODE_STATUS_OPTIONS: NodeProgress['status'][] = ['in_progress', 'completed', 'overdue']

export function calcRowSwitchReadiness(nodes: NodeProgress[]): number {
  if (!nodes.length) return 0
  const completed = nodes.filter((n) => n.status === 'completed').length
  return Math.round((completed / nodes.length) * 1000) / 10
}

export function SwitchReadinessCell({ value }: { value: number }) {
  return (
    <div className="min-w-[88px]">
      <span className="text-sm font-semibold text-primary-700 tabular-nums">{value}%</span>
      <div className="mt-1 h-1.5 bg-slate-100 rounded-full overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-primary-400 to-primary-700 rounded-full"
          style={{ width: `${Math.min(value, 100)}%` }}
        />
      </div>
    </div>
  )
}

export function EditableText({
  value,
  editing,
  onSave,
  className,
}: {
  value: string
  editing: boolean
  onSave: (v: string) => void
  className?: string
}) {
  if (!editing) return <span className={className}>{value || '—'}</span>
  return (
    <input
      defaultValue={value}
      onBlur={(e) => {
        if (e.target.value !== value) onSave(e.target.value)
      }}
      className={`w-full min-w-[80px] border border-slate-200 focus:border-primary-400 rounded px-1 py-0.5 text-sm bg-white outline-none ${className ?? ''}`}
    />
  )
}

export function NodeCell({
  node,
  editing,
  onUpdate,
  t,
}: {
  node: NodeProgress | undefined
  editing: boolean
  onUpdate: (patch: Partial<NodeProgress>) => void
  t: (key: string) => string
}) {
  if (!node) return <span className="text-slate-300">—</span>

  if (!editing) {
    return (
      <div className="space-y-0.5 min-w-[100px]">
        <StatusBadge status={node.status} label={t(`status.${node.status}`)} />
        <p className="text-[10px] text-slate-400 truncate">{node.dept || '—'}</p>
        <p className="text-[10px] text-slate-400 truncate">{node.assignee || '—'} · {node.dueDate || '—'}</p>
      </div>
    )
  }

  return (
    <div className="space-y-1 min-w-[120px]">
      <select
        value={node.status}
        onChange={(e) => onUpdate({ status: e.target.value as NodeProgress['status'] })}
        className="w-full text-xs border border-slate-200 rounded px-1 py-0.5"
      >
        {NODE_STATUS_OPTIONS.map((s) => (
          <option key={s} value={s}>{t(`status.${s}`)}</option>
        ))}
      </select>
      <input
        defaultValue={node.dept}
        onBlur={(e) => onUpdate({ dept: e.target.value })}
        placeholder={t('readiness.dept')}
        className="w-full text-[10px] border border-slate-200 rounded px-1 py-0.5"
      />
      <input
        defaultValue={node.assignee}
        onBlur={(e) => onUpdate({ assignee: e.target.value })}
        placeholder={t('readiness.assignee')}
        className="w-full text-[10px] border border-slate-200 rounded px-1 py-0.5"
      />
      <input
        type="date"
        defaultValue={node.dueDate}
        onBlur={(e) => onUpdate({ dueDate: e.target.value })}
        className="w-full text-[10px] border border-slate-200 rounded px-1 py-0.5"
      />
    </div>
  )
}
