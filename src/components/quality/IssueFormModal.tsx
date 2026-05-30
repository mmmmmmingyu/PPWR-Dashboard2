import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { X } from 'lucide-react'
import { useAppStore } from '../../store/appStore'
import {
  ISSUE_CATEGORY_OPTIONS,
  QUALITY_METRIC_OPTIONS,
  SEVERITY_OPTIONS,
  useDataQualityStore,
} from '../../store/dataQualityStore'
import type { IssueCategory, Severity } from '../../types'

interface IssueFormModalProps {
  open: boolean
  onClose: () => void
}

const emptyForm = {
  description: '',
  category: 'data_missing' as IssueCategory,
  qualityMetric: '',
  dept: '',
  assignee: '',
  foundDate: new Date().toISOString().slice(0, 10),
  severity: 'medium' as Severity,
}

export function IssueFormModal({ open, onClose }: IssueFormModalProps) {
  const { t } = useTranslation()
  const lang = useAppStore((s) => s.language)
  const addIssue = useDataQualityStore((s) => s.addIssue)
  const [form, setForm] = useState(emptyForm)

  if (!open) return null

  const handleSubmit = () => {
    if (!form.description.trim() || !form.qualityMetric.trim() || !form.dept.trim()) return
    addIssue({
      ...form,
      status: 'pending_confirm',
    })
    setForm(emptyForm)
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
      <div className="bg-white rounded-xl border border-slate-200 shadow-xl w-full max-w-lg mx-4">
        <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100">
          <h3 className="text-sm font-semibold text-slate-900">{t('quality.newIssue')}</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 p-1">
            <X size={16} />
          </button>
        </div>

        <div className="p-4 space-y-3 max-h-[70vh] overflow-y-auto">
          <div>
            <label className="text-xs text-slate-500">{t('quality.issueDesc')}</label>
            <textarea
              value={form.description}
              onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
              className="mt-1 w-full border border-slate-200 rounded-lg px-3 py-2 text-sm min-h-[72px]"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-slate-500">{t('quality.issueCategory')}</label>
              <select
                value={form.category}
                onChange={(e) => setForm((f) => ({ ...f, category: e.target.value as IssueCategory }))}
                className="mt-1 w-full border border-slate-200 rounded-lg px-3 py-2 text-sm"
              >
                {ISSUE_CATEGORY_OPTIONS.map((c) => (
                  <option key={c} value={c}>{t(`category.${c}`)}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-xs text-slate-500">{t('quality.qualityMetric')}</label>
              <select
                value={form.qualityMetric}
                onChange={(e) => setForm((f) => ({ ...f, qualityMetric: e.target.value }))}
                className="mt-1 w-full border border-slate-200 rounded-lg px-3 py-2 text-sm"
              >
                <option value="">{lang === 'zh' ? '请选择' : 'Select'}</option>
                {QUALITY_METRIC_OPTIONS.map((m) => (
                  <option key={m.zh} value={m.zh}>{lang === 'zh' ? m.zh : m.en}</option>
                ))}
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-slate-500">{t('readiness.dept')}</label>
              <input
                value={form.dept}
                onChange={(e) => setForm((f) => ({ ...f, dept: e.target.value }))}
                className="mt-1 w-full border border-slate-200 rounded-lg px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="text-xs text-slate-500">{t('readiness.assignee')}</label>
              <input
                value={form.assignee}
                onChange={(e) => setForm((f) => ({ ...f, assignee: e.target.value }))}
                className="mt-1 w-full border border-slate-200 rounded-lg px-3 py-2 text-sm"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-slate-500">{t('quality.foundDate')}</label>
              <input
                type="date"
                value={form.foundDate}
                onChange={(e) => setForm((f) => ({ ...f, foundDate: e.target.value }))}
                className="mt-1 w-full border border-slate-200 rounded-lg px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="text-xs text-slate-500">{t('quality.severity')}</label>
              <select
                value={form.severity}
                onChange={(e) => setForm((f) => ({ ...f, severity: e.target.value as Severity }))}
                className="mt-1 w-full border border-slate-200 rounded-lg px-3 py-2 text-sm"
              >
                {SEVERITY_OPTIONS.map((s) => (
                  <option key={s} value={s}>{t(`severity.${s}`)}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        <div className="px-4 py-3 border-t border-slate-100 flex justify-end gap-2">
          <button onClick={onClose} className="px-3 py-1.5 text-sm border border-slate-200 rounded-lg hover:bg-slate-50">
            {t('common.cancel')}
          </button>
          <button onClick={handleSubmit} className="px-3 py-1.5 text-sm bg-primary-600 text-white rounded-lg hover:bg-primary-700">
            {t('common.save')}
          </button>
        </div>
      </div>
    </div>
  )
}
