import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Pencil, Check } from 'lucide-react'
import clsx from 'clsx'
import { useAppStore } from '../../store/appStore'
import { calcResolveDuration, useDataQualityStore } from '../../store/dataQualityStore'
import { StatusBadge, severityColors } from '../../utils/helpers'
import type { DataQualityIssue } from '../../types'

interface DataQualityTableProps {
  data: DataQualityIssue[]
}

export function DataQualityTable({ data }: DataQualityTableProps) {
  const { t } = useTranslation()
  const lang = useAppStore((s) => s.language)
  const role = useAppStore((s) => s.role)
  const updateIssue = useDataQualityStore((s) => s.updateIssue)
  const [editingId, setEditingId] = useState<string | null>(null)

  const canEditRole = role === 'admin' || role === 'domain_owner'

  return (
    <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-slate-50 text-left">
              <th className="px-3 py-2 font-medium text-slate-600 whitespace-nowrap">{t('quality.issueId')}</th>
              <th className="px-3 py-2 font-medium text-slate-600 whitespace-nowrap min-w-[160px]">{t('quality.issueDesc')}</th>
              <th className="px-3 py-2 font-medium text-slate-600 whitespace-nowrap">{t('quality.issueCategory')}</th>
              <th className="px-3 py-2 font-medium text-slate-600 whitespace-nowrap">{t('quality.qualityMetric')}</th>
              <th className="px-3 py-2 font-medium text-slate-600 whitespace-nowrap">{t('quality.metricValue')}</th>
              <th className="px-3 py-2 font-medium text-slate-600 whitespace-nowrap min-w-[140px]">{t('quality.progress')}</th>
              <th className="px-3 py-2 font-medium text-slate-600 whitespace-nowrap">{t('quality.resolveDuration')}</th>
              <th className="px-3 py-2 font-medium text-slate-600 whitespace-nowrap">{t('readiness.dept')}</th>
              <th className="px-3 py-2 font-medium text-slate-600 whitespace-nowrap">{t('readiness.assignee')}</th>
              <th className="px-3 py-2 font-medium text-slate-600 whitespace-nowrap">{t('quality.severity')}</th>
              <th className="px-3 py-2 font-medium text-slate-600 whitespace-nowrap">{t('common.status')}</th>
              <th className="px-3 py-2 font-medium text-slate-600 whitespace-nowrap">{t('quality.foundDate')}</th>
              {canEditRole && (
                <th className="px-3 py-2 font-medium text-slate-600 whitespace-nowrap sticky right-0 bg-slate-50 border-l border-slate-200 w-12">
                  {t('common.actions')}
                </th>
              )}
            </tr>
          </thead>
          <tbody>
            {data.length === 0 ? (
              <tr>
                <td colSpan={canEditRole ? 13 : 12} className="px-4 py-8 text-center text-slate-400">
                  {t('common.noData')}
                </td>
              </tr>
            ) : (
              data.map((row) => {
                const isEditing = editingId === row.id
                const { days, closed } = calcResolveDuration(row)
                return (
                  <tr
                    key={row.id}
                    className={clsx(
                      'border-t border-slate-100',
                      row.isOverdue && !isEditing && 'bg-red-50/50',
                      isEditing && 'bg-primary-50/40',
                      !row.isOverdue && !isEditing && 'hover:bg-slate-50/50',
                    )}
                  >
                    <td className="px-3 py-2 font-mono text-xs">{row.id}</td>
                    <td className="px-3 py-2 max-w-[200px]"><span className="line-clamp-2">{row.description}</span></td>
                    <td className="px-3 py-2 whitespace-nowrap">{t(`category.${row.category}`)}</td>
                    <td className="px-3 py-2 whitespace-nowrap">{row.qualityMetric}</td>
                    <td className="px-3 py-2 whitespace-nowrap">
                      {isEditing && canEditRole ? (
                        <input
                          type="number"
                          step="0.1"
                          defaultValue={row.metricValue ?? ''}
                          onBlur={(e) => {
                            const v = e.target.value ? parseFloat(e.target.value) : undefined
                            if (v !== row.metricValue) updateIssue(row.id, { metricValue: v })
                          }}
                          className="w-20 border border-slate-200 rounded px-1.5 py-0.5 text-sm"
                          placeholder="%"
                        />
                      ) : (
                        <span className="tabular-nums">{row.metricValue != null ? `${row.metricValue}%` : '—'}</span>
                      )}
                    </td>
                    <td className="px-3 py-2">
                      {isEditing && canEditRole ? (
                        <textarea
                          defaultValue={row.progress ?? ''}
                          onBlur={(e) => {
                            if (e.target.value !== (row.progress ?? '')) {
                              updateIssue(row.id, { progress: e.target.value })
                            }
                          }}
                          className="w-full min-w-[120px] border border-slate-200 rounded px-1.5 py-0.5 text-xs min-h-[48px]"
                          placeholder={t('quality.progress')}
                        />
                      ) : (
                        <span className="text-xs text-slate-600 line-clamp-2">{row.progress || '—'}</span>
                      )}
                    </td>
                    <td className="px-3 py-2 whitespace-nowrap tabular-nums">
                      {closed
                        ? `${days}${lang === 'zh' ? '天' : 'd'}`
                        : `${days}${lang === 'zh' ? '天' : 'd'} (${lang === 'zh' ? '进行中' : 'ongoing'})`}
                    </td>
                    <td className="px-3 py-2 whitespace-nowrap">{row.dept}</td>
                    <td className="px-3 py-2 whitespace-nowrap">{row.assignee}</td>
                    <td className="px-3 py-2">
                      <span className={clsx('px-2 py-0.5 rounded-full text-xs font-medium', severityColors[row.severity])}>
                        {t(`severity.${row.severity}`)}
                      </span>
                    </td>
                    <td className="px-3 py-2">
                      <StatusBadge status={row.status} label={t(`status.${row.status}`)} />
                    </td>
                    <td className="px-3 py-2 whitespace-nowrap">{row.foundDate}</td>
                    {canEditRole && (
                      <td className="px-3 py-2 sticky right-0 bg-inherit border-l border-slate-200 text-center">
                        <button
                          type="button"
                          onClick={() => setEditingId(isEditing ? null : row.id)}
                          title={isEditing ? t('readiness.finishEdit') : t('quality.maintainProgress')}
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
