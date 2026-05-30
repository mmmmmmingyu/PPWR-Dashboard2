import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Pencil, Check } from 'lucide-react'
import clsx from 'clsx'
import { useAppStore } from '../../store/appStore'
import { useRegionReadinessStore } from '../../store/regionReadinessStore'
import { EditableText, NodeCell, SwitchReadinessCell, calcRowSwitchReadiness } from './readinessShared'
import { bt } from '../../utils/helpers'
import type { CountryProgress } from '../../types'

interface RegionReadinessTableProps {
  data: CountryProgress[]
}

export function RegionReadinessTable({ data }: RegionReadinessTableProps) {
  const { t } = useTranslation()
  const lang = useAppStore((s) => s.language)
  const role = useAppStore((s) => s.role)
  const { columns, updateRow, updateNode } = useRegionReadinessStore()
  const [editingCountry, setEditingCountry] = useState<string | null>(null)

  const canEditRole = role === 'admin' || role === 'domain_owner'

  const toggleEdit = (country: string) => {
    setEditingCountry((prev) => (prev === country ? null : country))
  }

  return (
    <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-slate-50 text-left">
              <th className="px-3 py-2 font-medium text-slate-600 whitespace-nowrap sticky left-0 z-10 bg-slate-50 border-r border-slate-100">
                {t('readiness.office')}
              </th>
              <th className="px-3 py-2 font-medium text-slate-600 whitespace-nowrap sticky left-[100px] z-10 bg-slate-50 border-r border-slate-100">
                {t('readiness.country')}
              </th>
              <th className="px-3 py-2 font-medium text-slate-600 whitespace-nowrap sticky left-[180px] z-10 bg-slate-50 border-r border-slate-200 shadow-[2px_0_4px_-2px_rgba(0,0,0,0.06)]">
                {t('readiness.switchReadiness')}
              </th>
              {columns.map((col) => (
                <th key={col.id} className="px-3 py-2 font-medium text-slate-600 whitespace-nowrap min-w-[130px]">
                  {bt(col.name, lang)}
                </th>
              ))}
              {canEditRole && (
                <th className="px-3 py-2 font-medium text-slate-600 whitespace-nowrap sticky right-0 z-10 bg-slate-50 border-l border-slate-200 w-12">
                  {t('common.actions')}
                </th>
              )}
            </tr>
          </thead>
          <tbody>
            {data.length === 0 ? (
              <tr>
                <td colSpan={3 + columns.length + (canEditRole ? 1 : 0)} className="px-4 py-8 text-center text-slate-400">
                  {t('common.noData')}
                </td>
              </tr>
            ) : (
              data.map((row) => {
                const isEditing = editingCountry === row.country
                return (
                  <tr
                    key={row.country}
                    className={clsx(
                      'border-t border-slate-100',
                      isEditing ? 'bg-primary-50/40' : 'hover:bg-slate-50/50',
                    )}
                  >
                    <td className="px-3 py-2 sticky left-0 z-[1] bg-inherit border-r border-slate-100">
                      <EditableText
                        value={row.office}
                        editing={isEditing && canEditRole}
                        onSave={(v) => updateRow(row.country, { office: v })}
                      />
                    </td>
                    <td className="px-3 py-2 sticky left-[100px] z-[1] bg-inherit border-r border-slate-100">
                      <EditableText
                        value={row.country}
                        editing={isEditing && canEditRole && role === 'admin'}
                        onSave={(v) => updateRow(row.country, { country: v })}
                      />
                    </td>
                    <td className="px-3 py-2 sticky left-[180px] z-[1] bg-inherit border-r border-slate-200 shadow-[2px_0_4px_-2px_rgba(0,0,0,0.06)]">
                      <SwitchReadinessCell value={calcRowSwitchReadiness(row.nodes)} />
                    </td>
                    {columns.map((col) => {
                      const node = row.nodes.find((n) => n.nodeId === col.id)
                      return (
                        <td key={col.id} className="px-3 py-2 align-top">
                          <NodeCell
                            node={node}
                            editing={isEditing && canEditRole}
                            onUpdate={(patch) => updateNode(row.country, col.id, patch)}
                            t={t}
                          />
                        </td>
                      )
                    })}
                    {canEditRole && (
                      <td className="px-3 py-2 sticky right-0 z-[1] bg-inherit border-l border-slate-200 text-center">
                        <button
                          type="button"
                          onClick={() => toggleEdit(row.country)}
                          title={isEditing ? t('readiness.finishEdit') : t('common.actions')}
                          className={clsx(
                            'p-1.5 rounded-lg transition-colors',
                            isEditing
                              ? 'bg-primary-600 text-white hover:bg-primary-700'
                              : 'text-slate-400 hover:text-primary-600 hover:bg-primary-50',
                          )}
                        >
                          {isEditing ? <Check size={14} /> : <Pencil size={14} />}
                        </button>
                      </td>
                    )}
                  </tr>
                )
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
