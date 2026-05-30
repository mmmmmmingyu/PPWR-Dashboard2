import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Loader2, X } from 'lucide-react'
import clsx from 'clsx'
import { BASELINE_CHANGE_TYPES } from '../../config/regulations'
import { analyzeBaselineImpact, getBaselineMetrics, useAnomalyStore } from '../../store/anomalyStore'
import { useAppStore } from '../../store/appStore'
import type { BaselineChangeType, BaselineImpactDetail } from '../../types'

interface BaselineFormModalProps {
  open: boolean
  onClose: () => void
}

type Step = 'input' | 'analyzing' | 'confirm'

const STEPS: Step[] = ['input', 'analyzing', 'confirm']

function StepIndicator({ step, t }: { step: Step; t: (key: string) => string }) {
  const labels = [t('anomaly.stepFillInfo'), t('anomaly.stepAnalyze'), t('anomaly.stepConfirm')]
  const activeIndex = step === 'input' ? 0 : step === 'analyzing' ? 1 : 2

  return (
    <div className="flex items-center gap-2 px-4 py-3 border-b border-slate-100 bg-slate-50/50">
      {STEPS.map((_, i) => (
        <div key={i} className="flex items-center gap-2 flex-1 min-w-0">
          <div
            className={clsx(
              'w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium shrink-0',
              i < activeIndex && 'bg-primary-600 text-white',
              i === activeIndex && 'bg-primary-600 text-white ring-2 ring-primary-200',
              i > activeIndex && 'bg-slate-200 text-slate-500',
            )}
          >
            {i + 1}
          </div>
          <span
            className={clsx(
              'text-xs truncate',
              i <= activeIndex ? 'text-slate-700 font-medium' : 'text-slate-400',
            )}
          >
            {labels[i]}
          </span>
          {i < STEPS.length - 1 && (
            <div className={clsx('h-px flex-1 mx-1', i < activeIndex ? 'bg-primary-300' : 'bg-slate-200')} />
          )}
        </div>
      ))}
    </div>
  )
}

export function BaselineFormModal({ open, onClose }: BaselineFormModalProps) {
  const { t } = useTranslation()
  const lang = useAppStore((s) => s.language)
  const addBaseline = useAnomalyStore((s) => s.addBaseline)
  const [step, setStep] = useState<Step>('input')
  const [changeType, setChangeType] = useState<BaselineChangeType>('country')
  const [object, setObject] = useState('')
  const [changeReason, setChangeReason] = useState('')
  const [impact, setImpact] = useState<BaselineImpactDetail | null>(null)

  useEffect(() => {
    if (!open) {
      setStep('input')
      setChangeType('country')
      setObject('')
      setChangeReason('')
      setImpact(null)
    }
  }, [open])

  useEffect(() => {
    if (step !== 'analyzing') return
    const timer = window.setTimeout(() => {
      const result = analyzeBaselineImpact(object.trim(), changeType)
      setImpact(result)
      setStep('confirm')
    }, 600)
    return () => window.clearTimeout(timer)
  }, [step, object, changeType])

  if (!open) return null

  const canAnalyze = object.trim().length > 0 && changeReason.trim().length > 0
  const metrics = impact ? getBaselineMetrics(impact) : null

  const handleAnalyze = () => {
    if (!canAnalyze) return
    setStep('analyzing')
  }

  const handleConfirm = () => {
    if (!impact) return
    addBaseline(changeType, object.trim(), { changeReason: changeReason.trim(), impact })
    onClose()
  }

  const handleBack = () => {
    setImpact(null)
    setStep('input')
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
      <div className="bg-white rounded-xl border border-slate-200 shadow-xl w-full max-w-lg mx-4">
        <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100">
          <h3 className="text-sm font-semibold text-slate-900">{t('anomaly.addBaseline')}</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 p-1">
            <X size={16} />
          </button>
        </div>

        <StepIndicator step={step} t={t} />

        {step === 'input' && (
          <>
            <div className="p-4 space-y-3">
              <div>
                <label className="text-xs text-slate-500">{t('anomaly.changeType')}</label>
                <select
                  value={changeType}
                  onChange={(e) => setChangeType(e.target.value as BaselineChangeType)}
                  className="mt-1 w-full border border-slate-200 rounded-lg px-3 py-2 text-sm"
                >
                  {BASELINE_CHANGE_TYPES.map((ct) => (
                    <option key={ct.id} value={ct.id}>
                      {ct.name[lang]}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-xs text-slate-500">{t('anomaly.changeObject')}</label>
                <input
                  value={object}
                  onChange={(e) => setObject(e.target.value)}
                  placeholder={lang === 'zh' ? '如：德国、02355ABC' : 'e.g. Germany, 02355ABC'}
                  className="mt-1 w-full border border-slate-200 rounded-lg px-3 py-2 text-sm"
                />
              </div>
              <div>
                <label className="text-xs text-slate-500">{t('anomaly.changeReason')}</label>
                <textarea
                  value={changeReason}
                  onChange={(e) => setChangeReason(e.target.value)}
                  placeholder={t('anomaly.changeReasonPlaceholder')}
                  rows={3}
                  className="mt-1 w-full border border-slate-200 rounded-lg px-3 py-2 text-sm resize-none"
                />
              </div>
              <p className="text-xs text-slate-400">{t('anomaly.analyzeHint')}</p>
            </div>
            <div className="px-4 py-3 border-t border-slate-100 flex justify-end gap-2">
              <button
                onClick={onClose}
                className="px-3 py-1.5 text-sm border border-slate-200 rounded-lg"
              >
                {t('common.cancel')}
              </button>
              <button
                onClick={handleAnalyze}
                disabled={!canAnalyze}
                className="px-3 py-1.5 text-sm bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {t('anomaly.analyzeImpact')}
              </button>
            </div>
          </>
        )}

        {step === 'analyzing' && (
          <div className="p-10 flex flex-col items-center justify-center gap-3">
            <Loader2 size={32} className="text-primary-600 animate-spin" />
            <p className="text-sm text-slate-600">{t('anomaly.analyzingImpact')}</p>
            <p className="text-xs text-slate-400">
              {t(`anomaly.changeType_${changeType}`)} · {object}
            </p>
          </div>
        )}

        {step === 'confirm' && impact && metrics && (
          <>
            <div className="p-4 space-y-4 max-h-[60vh] overflow-y-auto">
              <p className="text-xs text-slate-500">{t('anomaly.confirmAddHint')}</p>

              <div className="rounded-lg border border-slate-200 bg-slate-50 p-3 space-y-2 text-sm">
                <div className="flex gap-2">
                  <span className="text-slate-400 shrink-0 w-16">{t('anomaly.changeType')}</span>
                  <span className="text-slate-800">{t(`anomaly.changeType_${changeType}`)}</span>
                </div>
                <div className="flex gap-2">
                  <span className="text-slate-400 shrink-0 w-16">{t('anomaly.changeObject')}</span>
                  <span className="text-slate-800 font-medium">{object}</span>
                </div>
                <div className="flex gap-2">
                  <span className="text-slate-400 shrink-0 w-16">{t('anomaly.changeReason')}</span>
                  <span className="text-slate-800">{changeReason}</span>
                </div>
              </div>

              <div>
                <h4 className="text-xs font-medium text-slate-600 mb-2">{t('anomaly.impactPreview')}</h4>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { label: t('anomaly.codeCount'), value: metrics.codeCount },
                    { label: t('anomaly.contractCount'), value: metrics.contractCount },
                    { label: t('anomaly.batchCount'), value: metrics.batchCount },
                    { label: t('anomaly.shipmentVolume'), value: metrics.shipmentVolume },
                  ].map(({ label, value }) => (
                    <div key={label} className="rounded-lg border border-slate-200 p-3 bg-white">
                      <p className="text-lg font-semibold text-primary-700 tabular-nums">{value}</p>
                      <p className="text-[10px] text-slate-400 mt-0.5">{label}</p>
                    </div>
                  ))}
                </div>
              </div>

              {impact.codes.length > 0 && (
                <div>
                  <p className="text-xs text-slate-500 mb-1.5">{t('anomaly.affectedCodes')}</p>
                  <div className="flex flex-wrap gap-1.5">
                    {impact.codes.map((code) => (
                      <span
                        key={code}
                        className="px-2 py-0.5 bg-slate-100 rounded text-xs font-mono text-slate-700"
                      >
                        {code}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {impact.contracts.length > 0 && (
                <div>
                  <p className="text-xs text-slate-500 mb-1.5">{t('anomaly.affectedContracts')}</p>
                  <ul className="text-xs space-y-1">
                    {impact.contracts.map((c) => (
                      <li key={c.contractNo} className="font-mono text-slate-700">
                        {c.contractNo}
                        {c.country ? ` · ${c.country}` : ''}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
            <div className="px-4 py-3 border-t border-slate-100 flex justify-between gap-2">
              <button
                onClick={handleBack}
                className="px-3 py-1.5 text-sm border border-slate-200 rounded-lg"
              >
                {t('anomaly.backToEdit')}
              </button>
              <div className="flex gap-2">
                <button
                  onClick={onClose}
                  className="px-3 py-1.5 text-sm border border-slate-200 rounded-lg"
                >
                  {t('common.cancel')}
                </button>
                <button
                  onClick={handleConfirm}
                  className="px-3 py-1.5 text-sm bg-primary-600 text-white rounded-lg hover:bg-primary-700"
                >
                  {t('anomaly.confirmAddToList')}
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
