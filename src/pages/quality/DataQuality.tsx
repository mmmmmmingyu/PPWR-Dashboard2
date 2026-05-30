import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Plus, Upload } from 'lucide-react'
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer,
  LineChart, Line, CartesianGrid,
} from 'recharts'
import { useAppStore } from '../../store/appStore'
import { useDataQualityStore } from '../../store/dataQualityStore'
import { IssueFormModal } from '../../components/quality/IssueFormModal'
import { BatchImportModal } from '../../components/quality/BatchImportModal'
import { DataQualityTable } from '../../components/quality/DataQualityTable'

export default function DataQuality() {
  const { t } = useTranslation()
  const role = useAppStore((s) => s.role)
  const issues = useDataQualityStore((s) => s.issues)
  const [showForm, setShowForm] = useState(false)
  const [showImport, setShowImport] = useState(false)

  const byDept = useMemo(() => {
    const map = new Map<string, number>()
    issues.forEach((i) => map.set(i.dept, (map.get(i.dept) ?? 0) + 1))
    return Array.from(map.entries()).map(([name, value]) => ({ name, value }))
  }, [issues])

  const byStatusStack = useMemo(() => {
    const statuses = ['pending_confirm', 'in_progress', 'resolved', 'verified_closed'] as const
    const categories = ['data_missing', 'data_inconsistent', 'logic_error', 'other'] as const
    return categories.map((cat) => {
      const entry: Record<string, string | number> = { category: t(`category.${cat}`) }
      statuses.forEach((s) => {
        entry[s] = issues.filter((i) => i.category === cat && i.status === s).length
      })
      return entry
    })
  }, [issues, t])

  const resolveTrend = [
    { month: '2025-12', days: 12 },
    { month: '2026-01', days: 10 },
    { month: '2026-02', days: 8 },
    { month: '2026-03', days: 7 },
  ]

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-slate-900">{t('nav.dataQuality')}</h2>
        </div>
        {role === 'admin' && (
          <div className="flex gap-2">
            <button
              onClick={() => setShowForm(true)}
              className="flex items-center gap-1.5 px-3 py-2 text-sm bg-primary-600 text-white rounded-lg hover:bg-primary-700"
            >
              <Plus size={14} />
              {t('quality.newIssue')}
            </button>
            <button
              onClick={() => setShowImport(true)}
              className="flex items-center gap-1.5 px-3 py-2 text-sm border border-slate-200 rounded-lg hover:bg-white"
            >
              <Upload size={14} />
              {t('quality.batchImport')}
            </button>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl border border-slate-200 p-4">
          <h3 className="text-sm font-medium text-slate-700 mb-2">{t('quality.statsByDept')}</h3>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={byDept} margin={{ left: 0, right: 8, top: 4, bottom: 4 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="name" tick={{ fontSize: 10 }} interval={0} angle={-15} textAnchor="end" height={48} />
              <YAxis tick={{ fontSize: 10 }} allowDecimals={false} width={28} />
              <Tooltip />
              <Bar dataKey="value" fill="#059669" radius={[4, 4, 0, 0]} barSize={24} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-4">
          <h3 className="text-sm font-medium text-slate-700 mb-2">{t('quality.statsByStatus')}</h3>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={byStatusStack} margin={{ left: 0, right: 8, top: 4, bottom: 4 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="category" tick={{ fontSize: 10 }} />
              <YAxis tick={{ fontSize: 10 }} allowDecimals={false} width={28} />
              <Tooltip />
              <Legend wrapperStyle={{ fontSize: 10 }} />
              <Bar dataKey="pending_confirm" stackId="a" fill="#fbbf24" name={t('status.pending_confirm')} />
              <Bar dataKey="in_progress" stackId="a" fill="#3b82f6" name={t('status.in_progress')} />
              <Bar dataKey="resolved" stackId="a" fill="#34d399" name={t('status.resolved')} />
              <Bar dataKey="verified_closed" stackId="a" fill="#94a3b8" name={t('status.verified_closed')} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-4">
          <h3 className="text-sm font-medium text-slate-700 mb-2">{t('quality.resolveTrend')}</h3>
          <ResponsiveContainer width="100%" height={180}>
            <LineChart data={resolveTrend} margin={{ left: 0, right: 8, top: 4, bottom: 4 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="month" tick={{ fontSize: 10 }} />
              <YAxis tick={{ fontSize: 10 }} width={28} />
              <Tooltip />
              <Line type="monotone" dataKey="days" stroke="#059669" strokeWidth={2} dot={{ r: 3 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {(role === 'admin' || role === 'domain_owner') && (
        <p className="text-xs text-slate-400">{t('quality.maintainHint')}</p>
      )}

      <DataQualityTable data={issues} />

      <IssueFormModal open={showForm} onClose={() => setShowForm(false)} />
      <BatchImportModal open={showImport} onClose={() => setShowImport(false)} />
    </div>
  )
}
