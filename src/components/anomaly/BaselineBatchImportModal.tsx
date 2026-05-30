import { useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { X, Download } from 'lucide-react'
import { useAnomalyStore } from '../../store/anomalyStore'
import { useAppStore } from '../../store/appStore'
import type { BaselineChangeType } from '../../types'

interface BaselineBatchImportModalProps {
  open: boolean
  onClose: () => void
}

const TYPE_MAP: Record<string, BaselineChangeType> = {
  国家: 'country',
  country: 'country',
  产品编码: 'product_code',
  product_code: 'product_code',
  合同: 'contract',
  contract: 'contract',
  批次: 'batch',
  batch: 'batch',
}

function parseCsv(text: string) {
  const lines = text.trim().split(/\r?\n/).filter(Boolean)
  if (lines.length < 2) return []
  return lines.slice(1).map((line) => line.split(',').map((c) => c.trim().replace(/^"|"$/g, '')))
}

export function BaselineBatchImportModal({ open, onClose }: BaselineBatchImportModalProps) {
  const { t } = useTranslation()
  const lang = useAppStore((s) => s.language)
  const addBaselines = useAnomalyStore((s) => s.addBaselines)
  const fileRef = useRef<HTMLInputElement>(null)
  const [error, setError] = useState('')

  if (!open) return null

  const template = lang === 'zh'
    ? '变更类型,变更对象\n国家,法国\n产品编码,02355XYZ'
    : 'Change Type,Changed Object\ncountry,France\nproduct_code,02355XYZ'

  const downloadTemplate = () => {
    const blob = new Blob(['\uFEFF' + template], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'baseline_change_import.csv'
    a.click()
    URL.revokeObjectURL(url)
  }

  const handleFile = (file: File) => {
    setError('')
    const reader = new FileReader()
    reader.onload = () => {
      try {
        const rows = parseCsv(String(reader.result))
        const items = rows
          .map(([typeRaw, object]) => ({
            changeType: TYPE_MAP[typeRaw] ?? ('country' as BaselineChangeType),
            object: object ?? '',
          }))
          .filter((i) => i.object)
        if (!items.length) {
          setError(lang === 'zh' ? '未解析到有效数据' : 'No valid rows')
          return
        }
        addBaselines(items)
        onClose()
      } catch {
        setError(lang === 'zh' ? '文件解析失败' : 'Parse failed')
      }
    }
    reader.readAsText(file, 'UTF-8')
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
      <div className="bg-white rounded-xl border border-slate-200 shadow-xl w-full max-w-md mx-4">
        <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100">
          <h3 className="text-sm font-semibold text-slate-900">{t('anomaly.batchImportBaseline')}</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 p-1"><X size={16} /></button>
        </div>
        <div className="p-4 space-y-3">
          <p className="text-xs text-slate-500">{t('anomaly.baselineImportHint')}</p>
          <button onClick={downloadTemplate} className="flex items-center gap-1 text-xs text-primary-600 hover:underline">
            <Download size={12} />{t('quality.downloadTemplate')}
          </button>
          <div
            className="border-2 border-dashed border-slate-200 rounded-lg p-6 text-center cursor-pointer hover:border-primary-300"
            onClick={() => fileRef.current?.click()}
          >
            <input ref={fileRef} type="file" accept=".csv" className="hidden" onChange={(e) => {
              const f = e.target.files?.[0]
              if (f) handleFile(f)
              e.target.value = ''
            }} />
            <p className="text-sm text-slate-600">{t('quality.uploadCsv')}</p>
          </div>
          {error && <p className="text-xs text-red-500">{error}</p>}
        </div>
        <div className="px-4 py-3 border-t border-slate-100 flex justify-end">
          <button onClick={onClose} className="px-3 py-1.5 text-sm border border-slate-200 rounded-lg">{t('common.confirm')}</button>
        </div>
      </div>
    </div>
  )
}
