import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Pencil, Check } from 'lucide-react'
import clsx from 'clsx'
import { useAppStore } from '../../store/appStore'
import { getBaselineMetrics, useAnomalyStore, type ImpactDetailType } from '../../store/anomalyStore'
import { StatusBadge } from '../../utils/helpers'
import { ImpactDetailModal } from './ImpactDetailModal'
import type { AnomalyRecord } from '../../types'

function MetricButton({ value, label, onClick }: { value: number | string; label: string; onClick: () => void }) {
  return (
    <button type="button" onClick={onClick} className="text-left group" title={label}>
      <p className="text-lg font-semibold text-primary-700 tabular-nums group-hover:text-primary-800 underline-offset-2 group-hover:underline">{value}</p>
      <p className="text-[10px] text-slate-400">{label}</p>
    </button>
  )
}

export function BaselineChangeTable({ data }: { data: AnomalyRecord[] }) {
  const { t } = useTranslation()
  const role = useAppStore((s) => s.role)
  const updateRecord = useAnomalyStore((s) => s.updateRecord)
  const [detailRecord, setDetailRecord] = useState<AnomalyRecord | null>(null)
  const [detailType, setDetailType] = useState<ImpactDetailType | null>(null)
  const [editingId, setEditingId] = useState<string | null>(null)

  const canEditRole = role === 'admin' || role === 'domain_owner'

  const openDetail = (record: AnomalyRecord, type: ImpactDetailType) => {
    setDetailRecord(record)
    setDetailType(type)
  }

  return (
    <>
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-50 text-left">
                <th className="px-3 py-2 font-medium text-slate-600 whitespace-nowrap">ID</th>
                <th className="px-3 py-2 font-medium text-slate-600 whitespace-nowrap">{t('anomaly.changeType')}</th>
                <th className="px-3 py-2 font-medium text-slate-600 whitespace-nowrap">{t('anomaly.changeObject')}</th>
                <th className="px-3 py-2 font-medium text-slate-600 whitespace-nowrap min-w-[120px]">{t('anomaly.changeReason')}</th>
                <th className="px-3 py-2 font-medium text-slate-600 whitespace-nowrap">{t('anomaly.codeCount')}</th>
                <th className="px-3 py-2 font-medium text-slate-600 whitespace-nowrap">{t('anomaly.contractCount')}</th>
                <th className="px-3 py-2 font-medium text-slate-600 whitespace-nowrap">{t('anomaly.batchCount')}</th>
                <th className="px-3 py-2 font-medium text-slate-600 whitespace-nowrap">{t('anomaly.shipmentVolume')}</th>
                <th className="px-3 py-2 font-medium text-slate-600 whitespace-nowrap min-w-[140px]">{t('anomaly.solution')}</th>
                <th className="px-3 py-2 font-medium text-slate-600 whitespace-nowrap min-w-[140px]">{t('anomaly.progress')}</th>
                <th className="px-3 py-2 font-medium text-slate-600 whitespace-nowrap">{t('common.status')}</th>
                <th className="px-3 py-2 font-medium text-slate-600 whitespace-nowrap">{t('anomaly.assignee')}</th>
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
                  const m = getBaselineMetrics(row.impact)
                  const isEditing = editingId === row.id
                  return (
                    <tr
                      key={row.id}
                      className={clsx(
                        'border-t border-slate-100',
                        isEditing ? 'bg-primary-50/40' : 'hover:bg-slate-50/50',
                      )}
                    >
                      <td className="px-3 py-2 font-mono text-xs">{row.id}</td>
                      <td className="px-3 py-2 whitespace-nowrap">{row.changeType ? t(`anomaly.changeType_${row.changeType}`) : '—'}</td>
                      <td className="px-3 py-2 whitespace-nowrap font-medium">{row.object}</td>
                      <td className="px-3 py-2 min-w-[120px]">
                        <span className="text-xs text-slate-600 line-clamp-2">{row.changeReason || '—'}</span>
                      </td>
                      <td className="px-3 py-2">
                        <MetricButton value={m.codeCount} label={t('anomaly.affectedCodes')} onClick={() => openDetail(row, 'codes')} />
                      </td>
                      <td className="px-3 py-2">
                        <MetricButton value={m.contractCount} label={t('anomaly.affectedContracts')} onClick={() => openDetail(row, 'contracts')} />
                      </td>
                      <td className="px-3 py-2">
                        <MetricButton value={m.batchCount} label={t('anomaly.affectedBatches')} onClick={() => openDetail(row, 'batches')} />
                      </td>
                      <td className="px-3 py-2">
                        <MetricButton value={m.shipmentVolume} label={t('anomaly.affectedShipments')} onClick={() => openDetail(row, 'shipments')} />
                      </td>
                      <td className="px-3 py-2 min-w-[140px]">
                        {isEditing && canEditRole ? (
                          <textarea
                            defaultValue={row.solution ?? ''}
                            onBlur={(e) => {
                              if (e.target.value !== (row.solution ?? '')) {
                                updateRecord(row.id, { solution: e.target.value })
                              }
                            }}
                            className="w-full border border-slate-200 rounded px-1.5 py-0.5 text-xs min-h-[48px]"
                            placeholder={t('anomaly.solution')}
                          />
                        ) : (
                          <span className="text-xs text-slate-600 line-clamp-2">{row.solution || '—'}</span>
                        )}
                      </td>
                      <td className="px-3 py-2 min-w-[140px]">
                        {isEditing && canEditRole ? (
                          <textarea
                            defaultValue={row.progress ?? ''}
                            onBlur={(e) => {
                              if (e.target.value !== (row.progress ?? '')) {
                                updateRecord(row.id, { progress: e.target.value })
                              }
                            }}
                            className="w-full border border-slate-200 rounded px-1.5 py-0.5 text-xs min-h-[48px]"
                            placeholder={t('anomaly.progress')}
                          />
                        ) : (
                          <span className="text-xs text-slate-600 line-clamp-2">{row.progress || '—'}</span>
                        )}
                      </td>
                      <td className="px-3 py-2">
                        <StatusBadge status={row.status} label={t(`status.${row.status}`)} />
                      </td>
                      <td className="px-3 py-2">{row.assignee ?? '—'}</td>
                      {canEditRole && (
                        <td className="px-3 py-2 sticky right-0 bg-inherit border-l border-slate-200 text-center">
                          <div className="flex flex-col items-center gap-1">
                            <button
                              type="button"
                              onClick={() => setEditingId(isEditing ? null : row.id)}
                              title={isEditing ? t('readiness.finishEdit') : t('anomaly.maintainSolutionHint')}
                              className={clsx(
                                'p-1.5 rounded-lg transition-colors',
                                isEditing
                                  ? 'bg-primary-600 text-white hover:bg-primary-700'
                                  : 'text-slate-400 hover:text-primary-600 hover:bg-primary-50',
                              )}
                            >
                              {isEditing ? <Check size={14} /> : <Pencil size={14} />}
                            </button>
                            {!isEditing && row.status === 'pending' && (
                              <button
                                className="text-[10px] text-primary-600 hover:underline whitespace-nowrap"
                                onClick={() => updateRecord(row.id, { status: 'analyzing', assignee: '当前用户' })}
                              >
                                {t('anomaly.assignee')}
                              </button>
                            )}
                            {!isEditing && row.status === 'analyzing' && (
                              <button
                                className="text-[10px] text-primary-600 hover:underline whitespace-nowrap"
                                onClick={() => updateRecord(row.id, { status: 'closed' })}
                              >
                                {t('common.confirm')}
                              </button>
                            )}
                          </div>
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
      <ImpactDetailModal
        open={!!detailRecord}
        onClose={() => { setDetailRecord(null); setDetailType(null) }}
        record={detailRecord}
        detailType={detailType}
      />
    </>
  )
}
