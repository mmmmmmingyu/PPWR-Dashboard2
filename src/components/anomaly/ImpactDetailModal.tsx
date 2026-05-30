import { useTranslation } from 'react-i18next'
import { X } from 'lucide-react'
import { useAppStore } from '../../store/appStore'
import type { AnomalyRecord } from '../../types'
import type { ImpactDetailType } from '../../store/anomalyStore'

interface ImpactDetailModalProps {
  open: boolean
  onClose: () => void
  record: AnomalyRecord | null
  detailType: ImpactDetailType | null
}

export function ImpactDetailModal({ open, onClose, record, detailType }: ImpactDetailModalProps) {
  const { t } = useTranslation()
  const lang = useAppStore((s) => s.language)

  if (!open || !record || !detailType || !record.impact) return null

  const titleMap: Record<ImpactDetailType, string> = {
    codes: t('anomaly.affectedCodes'),
    contracts: t('anomaly.affectedContracts'),
    batches: t('anomaly.affectedBatches'),
    shipments: t('anomaly.affectedShipments'),
  }

  const { impact } = record

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
      <div className="bg-white rounded-xl border border-slate-200 shadow-xl w-full max-w-lg mx-4 max-h-[80vh] flex flex-col">
        <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100 shrink-0">
          <div>
            <h3 className="text-sm font-semibold text-slate-900">{titleMap[detailType]}</h3>
            <p className="text-xs text-slate-400 mt-0.5">{record.object} · {record.id}</p>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 p-1"><X size={16} /></button>
        </div>
        <div className="p-4 overflow-y-auto flex-1">
          {detailType === 'codes' && (
            <ul className="space-y-1">
              {impact.codes.map((code) => (
                <li key={code} className="px-3 py-2 bg-slate-50 rounded-lg text-sm font-mono">{code}</li>
              ))}
            </ul>
          )}
          {detailType === 'contracts' && (
            <table className="w-full text-sm">
              <thead><tr className="text-left text-slate-500 border-b"><th className="py-2">{t('anomaly.contractPo')}</th><th className="py-2">{t('readiness.country')}</th></tr></thead>
              <tbody>
                {impact.contracts.map((c) => (
                  <tr key={c.contractNo} className="border-b border-slate-100">
                    <td className="py-2 font-mono text-xs">{c.contractNo}</td>
                    <td className="py-2">{c.country ?? '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
          {detailType === 'batches' && (
            <table className="w-full text-sm">
              <thead><tr className="text-left text-slate-500 border-b"><th className="py-2">{lang === 'zh' ? '批次号' : 'Batch No.'}</th><th className="py-2">{t('anomaly.contractPo')}</th></tr></thead>
              <tbody>
                {impact.batches.map((b) => (
                  <tr key={b.batchNo} className="border-b border-slate-100">
                    <td className="py-2 font-mono text-xs">{b.batchNo}</td>
                    <td className="py-2">{b.contractNo ?? '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
          {detailType === 'shipments' && (
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-slate-500 border-b">
                  <th className="py-2 pr-2">{t('readiness.code')}</th>
                  <th className="py-2 pr-2">{t('anomaly.contractPo')}</th>
                  <th className="py-2 pr-2">{lang === 'zh' ? '批次' : 'Batch'}</th>
                  <th className="py-2 pr-2">{t('anomaly.quantity')}</th>
                  <th className="py-2">{t('anomaly.shipDate')}</th>
                </tr>
              </thead>
              <tbody>
                {impact.shipments.map((s, i) => (
                  <tr key={i} className="border-b border-slate-100">
                    <td className="py-2 font-mono text-xs">{s.code}</td>
                    <td className="py-2">{s.contractNo}</td>
                    <td className="py-2">{s.batchNo ?? '—'}</td>
                    <td className="py-2 tabular-nums">{s.quantity}</td>
                    <td className="py-2">{s.shipDate ?? '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
        <div className="px-4 py-3 border-t border-slate-100 flex justify-end shrink-0">
          <button onClick={onClose} className="px-3 py-1.5 text-sm border border-slate-200 rounded-lg">{t('common.confirm')}</button>
        </div>
      </div>
    </div>
  )
}
