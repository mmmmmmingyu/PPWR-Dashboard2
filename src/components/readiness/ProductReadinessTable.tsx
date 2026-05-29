import { useTranslation } from 'react-i18next'
import { useAppStore } from '../../store/appStore'
import { useProductReadinessStore, NODE_STATUS_OPTIONS } from '../../store/productReadinessStore'
import { StatusBadge, bt } from '../../utils/helpers'
import type { NodeProgress, ProductCodeProgress } from '../../types'

function EditableText({
  value,
  onSave,
  canEdit,
  className,
}: {
  value: string
  onSave: (v: string) => void
  canEdit: boolean
  className?: string
}) {
  if (!canEdit) return <span className={className}>{value || '—'}</span>
  return (
    <input
      defaultValue={value}
      onBlur={(e) => {
        if (e.target.value !== value) onSave(e.target.value)
      }}
      className={`w-full min-w-[80px] border border-transparent hover:border-slate-200 focus:border-primary-400 rounded px-1 py-0.5 text-sm bg-transparent focus:bg-white outline-none ${className ?? ''}`}
    />
  )
}

function NodeCell({
  node,
  canEdit,
  onUpdate,
  t,
}: {
  node: NodeProgress | undefined
  canEdit: boolean
  onUpdate: (patch: Partial<NodeProgress>) => void
  t: (key: string) => string
}) {
  if (!node) return <span className="text-slate-300">—</span>

  if (!canEdit) {
    return (
      <div className="space-y-0.5 min-w-[100px]">
        <StatusBadge status={node.status} label={t(`status.${node.status}`)} />
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

interface ProductReadinessTableProps {
  data: ProductCodeProgress[]
}

export function ProductReadinessTable({ data }: ProductReadinessTableProps) {
  const { t } = useTranslation()
  const lang = useAppStore((s) => s.language)
  const role = useAppStore((s) => s.role)
  const { columns, updateRow, updateNode } = useProductReadinessStore()

  const canEdit = role === 'admin' || role === 'domain_owner'

  return (
    <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-slate-50 text-left">
              <th className="px-3 py-2 font-medium text-slate-600 whitespace-nowrap sticky left-0 z-10 bg-slate-50 border-r border-slate-100">
                {t('readiness.industry')}
              </th>
              <th className="px-3 py-2 font-medium text-slate-600 whitespace-nowrap sticky left-[88px] z-10 bg-slate-50 border-r border-slate-100">
                {t('readiness.code')}
              </th>
              <th className="px-3 py-2 font-medium text-slate-600 whitespace-nowrap sticky left-[200px] z-10 bg-slate-50 border-r border-slate-200 shadow-[2px_0_4px_-2px_rgba(0,0,0,0.06)]">
                {t('readiness.description')}
              </th>
              {columns.map((col) => (
                <th key={col.id} className="px-3 py-2 font-medium text-slate-600 whitespace-nowrap min-w-[130px]">
                  {bt(col.name, lang)}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.length === 0 ? (
              <tr>
                <td colSpan={3 + columns.length} className="px-4 py-8 text-center text-slate-400">
                  {t('common.noData')}
                </td>
              </tr>
            ) : (
              data.map((row) => (
                <tr key={row.code} className="border-t border-slate-100 hover:bg-slate-50/50">
                  <td className="px-3 py-2 sticky left-0 z-[1] bg-white border-r border-slate-100">
                    <EditableText
                      value={row.industry}
                      canEdit={canEdit}
                      onSave={(v) => updateRow(row.code, { industry: v })}
                    />
                  </td>
                  <td className="px-3 py-2 sticky left-[88px] z-[1] bg-white border-r border-slate-100 font-mono text-xs">
                    <EditableText
                      value={row.code}
                      canEdit={canEdit && role === 'admin'}
                      onSave={(v) => updateRow(row.code, { code: v })}
                    />
                  </td>
                  <td className="px-3 py-2 sticky left-[200px] z-[1] bg-white border-r border-slate-200 shadow-[2px_0_4px_-2px_rgba(0,0,0,0.06)]">
                    <EditableText
                      value={bt(row.description, lang)}
                      canEdit={canEdit}
                      onSave={(v) =>
                        updateRow(row.code, {
                          description: { ...row.description, [lang]: v },
                        })
                      }
                    />
                  </td>
                  {columns.map((col) => {
                    const node = row.nodes.find((n) => n.nodeId === col.id)
                    return (
                      <td key={col.id} className="px-3 py-2 align-top">
                        <NodeCell
                          node={node}
                          canEdit={canEdit}
                          onUpdate={(patch) => updateNode(row.code, col.id, patch)}
                          t={t}
                        />
                      </td>
                    )
                  })}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
