import { useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { X, Download } from 'lucide-react'
import { useAppStore } from '../../store/appStore'
import { useDataQualityStore } from '../../store/dataQualityStore'
import type { IssueCategory, Severity } from '../../types'

interface BatchImportModalProps {
  open: boolean
  onClose: () => void
}

const CATEGORY_MAP: Record<string, IssueCategory> = {
  数据缺失: 'data_missing',
  data_missing: 'data_missing',
  数据不一致: 'data_inconsistent',
  data_inconsistent: 'data_inconsistent',
  逻辑错误: 'logic_error',
  logic_error: 'logic_error',
  其他: 'other',
  other: 'other',
}

const SEVERITY_MAP: Record<string, Severity> = {
  严重: 'critical',
  critical: 'critical',
  高: 'high',
  high: 'high',
  中: 'medium',
  medium: 'medium',
  低: 'low',
  low: 'low',
}

function parseCsv(text: string) {
  const lines = text.trim().split(/\r?\n/).filter(Boolean)
  if (lines.length < 2) return []
  const rows = lines.slice(1)
  return rows.map((line) => {
    const cols = line.split(',').map((c) => c.trim().replace(/^"|"$/g, ''))
    return cols
  })
}

export function BatchImportModal({ open, onClose }: BatchImportModalProps) {
  const { t } = useTranslation()
  const lang = useAppStore((s) => s.language)
  const addIssues = useDataQualityStore((s) => s.addIssues)
  const fileRef = useRef<HTMLInputElement>(null)
  const [error, setError] = useState('')
  const [preview, setPreview] = useState(0)

  if (!open) return null

  const template = lang === 'zh'
    ? '问题描述,问题分类,数据质量指标,责任部门,责任人,发现日期,严重等级\n示例问题,数据缺失,字段完整率,质量部,张三,2026-03-01,高'
    : 'Description,Category,Quality Metric,Department,Assignee,Found Date,Severity\nSample issue,data_missing,Field Completeness Rate,QA,John,2026-03-01,high'

  const handleFile = (file: File) => {
    setError('')
    const reader = new FileReader()
    reader.onload = () => {
      try {
        const rows = parseCsv(String(reader.result))
        const items = rows.map((cols) => {
          const [description, categoryRaw, qualityMetric, dept, assignee, foundDate, severityRaw] = cols
          const category = CATEGORY_MAP[categoryRaw] ?? 'other'
          const severity = SEVERITY_MAP[severityRaw] ?? 'medium'
          return {
            description: description ?? '',
            category,
            qualityMetric: qualityMetric ?? '',
            dept: dept ?? '',
            assignee: assignee ?? '',
            foundDate: foundDate ?? new Date().toISOString().slice(0, 10),
            severity,
            status: 'pending_confirm' as const,
          }
        }).filter((i) => i.description && i.qualityMetric)

        if (!items.length) {
          setError(lang === 'zh' ? '未解析到有效数据，请检查文件格式' : 'No valid rows parsed')
          setPreview(0)
          return
        }
        setPreview(items.length)
        addIssues(items)
        onClose()
        setPreview(0)
      } catch {
        setError(lang === 'zh' ? '文件解析失败' : 'Failed to parse file')
      }
    }
    reader.readAsText(file, 'UTF-8')
  }

  const downloadTemplate = () => {
    const blob = new Blob(['\uFEFF' + template], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'data_quality_import_template.csv'
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
      <div className="bg-white rounded-xl border border-slate-200 shadow-xl w-full max-w-lg mx-4">
        <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100">
          <h3 className="text-sm font-semibold text-slate-900">{t('quality.batchImport')}</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 p-1">
            <X size={16} />
          </button>
        </div>

        <div className="p-4 space-y-4">
          <p className="text-xs text-slate-500">{t('quality.importHint')}</p>
          <button
            onClick={downloadTemplate}
            className="flex items-center gap-1.5 text-xs text-primary-600 hover:underline"
          >
            <Download size={12} />
            {t('quality.downloadTemplate')}
          </button>
          <div
            className="border-2 border-dashed border-slate-200 rounded-lg p-6 text-center cursor-pointer hover:border-primary-300 hover:bg-primary-50/30"
            onClick={() => fileRef.current?.click()}
          >
            <input
              ref={fileRef}
              type="file"
              accept=".csv,.txt"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0]
                if (file) handleFile(file)
                e.target.value = ''
              }}
            />
            <p className="text-sm text-slate-600">{t('quality.uploadCsv')}</p>
            <p className="text-xs text-slate-400 mt-1">CSV</p>
          </div>
          {error && <p className="text-xs text-red-500">{error}</p>}
          {preview > 0 && <p className="text-xs text-primary-600">{t('quality.importPreview', { count: preview })}</p>}
        </div>

        <div className="px-4 py-3 border-t border-slate-100 flex justify-end">
          <button onClick={onClose} className="px-3 py-1.5 text-sm border border-slate-200 rounded-lg hover:bg-slate-50">
            {t('common.confirm')}
          </button>
        </div>
      </div>
    </div>
  )
}
