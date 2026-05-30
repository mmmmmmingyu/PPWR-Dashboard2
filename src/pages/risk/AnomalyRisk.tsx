import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Settings, Plus, Upload } from 'lucide-react'
import { ANOMALY_SCENES } from '../../config/regulations'
import { useAppStore } from '../../store/appStore'
import { useAnomalyStore } from '../../store/anomalyStore'
import { BaselineChangeTable } from '../../components/anomaly/BaselineChangeTable'
import { BaselineFormModal } from '../../components/anomaly/BaselineFormModal'
import { BaselineBatchImportModal } from '../../components/anomaly/BaselineBatchImportModal'

export default function AnomalyRisk() {
  const { t } = useTranslation()
  const lang = useAppStore((s) => s.language)
  const role = useAppStore((s) => s.role)
  const records = useAnomalyStore((s) => s.records)
  const [showConfig, setShowConfig] = useState(false)
  const [showBaselineForm, setShowBaselineForm] = useState(false)
  const [showBaselineImport, setShowBaselineImport] = useState(false)

  const baselineData = records.filter((a) => a.scene === 'baseline_change')

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-slate-900">{t('nav.anomalyRisk')}</h2>
          <p className="text-sm text-slate-500 mt-0.5">{ANOMALY_SCENES[0].name[lang]}</p>
        </div>
        <div className="flex items-center gap-2">
          {role === 'admin' && (
            <>
              <button
                onClick={() => setShowBaselineForm(true)}
                className="flex items-center gap-1.5 px-3 py-2 text-sm bg-primary-600 text-white rounded-lg hover:bg-primary-700"
              >
                <Plus size={14} />
                {t('anomaly.addBaseline')}
              </button>
              <button
                onClick={() => setShowBaselineImport(true)}
                className="flex items-center gap-1.5 px-3 py-2 text-sm border border-slate-200 rounded-lg hover:bg-white"
              >
                <Upload size={14} />
                {t('anomaly.batchImportBaseline')}
              </button>
            </>
          )}
          <button
            className="flex items-center gap-1.5 px-3 py-2 text-sm border border-slate-200 rounded-lg hover:bg-white"
            onClick={() => setShowConfig(!showConfig)}
          >
            <Settings size={14} />
            {t('anomaly.config')}
          </button>
        </div>
      </div>

      {showConfig && (
        <div className="bg-white rounded-xl border border-slate-200 p-5 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="text-xs text-slate-500">{t('anomaly.threshold')}</label>
            <input type="number" defaultValue={3} className="mt-1 w-full border rounded-lg px-3 py-2 text-sm" />
            <p className="text-[10px] text-slate-400 mt-1">{lang === 'zh' ? '连续出现天数' : 'Consecutive days'}</p>
          </div>
          <div>
            <label className="text-xs text-slate-500">{t('anomaly.notification')}</label>
            <select className="mt-1 w-full border rounded-lg px-3 py-2 text-sm" defaultValue="email">
              <option value="email">{lang === 'zh' ? '邮件' : 'Email'}</option>
              <option value="wecom">{lang === 'zh' ? '企微' : 'WeCom'}</option>
              <option value="internal">{lang === 'zh' ? '站内信' : 'In-app'}</option>
            </select>
          </div>
          <div>
            <label className="text-xs text-slate-500">{t('anomaly.silencePeriod')}</label>
            <input type="number" defaultValue={24} className="mt-1 w-full border rounded-lg px-3 py-2 text-sm" />
            <p className="text-[10px] text-slate-400 mt-1">{lang === 'zh' ? '小时' : 'Hours'}</p>
          </div>
        </div>
      )}

      {(role === 'admin' || role === 'domain_owner') && (
        <p className="text-xs text-slate-400">{t('anomaly.maintainSolutionHint')}</p>
      )}

      <BaselineChangeTable data={baselineData} />

      <BaselineFormModal open={showBaselineForm} onClose={() => setShowBaselineForm(false)} />
      <BaselineBatchImportModal open={showBaselineImport} onClose={() => setShowBaselineImport(false)} />
    </div>
  )
}
