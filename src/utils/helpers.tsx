import clsx from 'clsx'
import type { BilingualText, Language } from '../types'

export function bt(text: BilingualText, lang: Language): string {
  return text[lang]
}

export function exportCsv(filename: string, headers: string[], rows: string[][]) {
  const bom = '\uFEFF'
  const csv = [headers.join(','), ...rows.map((r) => r.map((c) => `"${c}"`).join(','))].join('\n')
  const blob = new Blob([bom + csv], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}

export const statusColors: Record<string, string> = {
  not_started: 'bg-slate-100 text-slate-600',
  in_progress: 'bg-blue-50 text-blue-700',
  completed: 'bg-primary-50 text-primary-700',
  overdue: 'bg-red-50 text-red-700',
  pending: 'bg-amber-50 text-amber-700',
  analyzing: 'bg-blue-50 text-blue-700',
  closed: 'bg-slate-100 text-slate-500',
  pending_confirm: 'bg-amber-50 text-amber-700',
  resolved: 'bg-primary-50 text-primary-700',
  verified_closed: 'bg-slate-100 text-slate-500',
}

export const severityColors: Record<string, string> = {
  critical: 'bg-red-100 text-red-800',
  high: 'bg-orange-100 text-orange-800',
  medium: 'bg-yellow-100 text-yellow-800',
  low: 'bg-slate-100 text-slate-600',
}

export function StatusBadge({ status, label }: { status: string; label: string }) {
  return (
    <span className={clsx('inline-flex px-2 py-0.5 rounded-full text-xs font-medium', statusColors[status])}>
      {label}
    </span>
  )
}
