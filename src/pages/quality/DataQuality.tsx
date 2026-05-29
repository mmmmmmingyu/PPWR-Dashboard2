import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { Plus, Upload } from 'lucide-react'
import {
  PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer,
  LineChart, Line, CartesianGrid,
} from 'recharts'
import { mockDataQualityIssues } from '../../mock/data'
import { DataTable } from '../../components/common/DataTable'
import { StatusBadge, severityColors } from '../../utils/helpers'
import type { DataQualityIssue } from '../../types'
import clsx from 'clsx'

const PIE_COLORS = ['#059669', '#34d399', '#6ee7b7', '#a7f3d0', '#d1fae5']

export default function DataQuality() {
  const { t } = useTranslation()

  const byDept = useMemo(() => {
    const map = new Map<string, number>()
    mockDataQualityIssues.forEach((i) => map.set(i.dept, (map.get(i.dept) ?? 0) + 1))
    return Array.from(map.entries()).map(([name, value]) => ({ name, value }))
  }, [])

  const byStatusStack = useMemo(() => {
    const statuses = ['pending_confirm', 'in_progress', 'resolved', 'verified_closed'] as const
    const categories = ['data_missing', 'data_inconsistent', 'logic_error', 'other'] as const
    return categories.map((cat) => {
      const entry: Record<string, string | number> = { category: t(`category.${cat}`) }
      statuses.forEach((s) => {
        entry[s] = mockDataQualityIssues.filter((i) => i.category === cat && i.status === s).length
      })
      return entry
    })
  }, [t])

  const resolveTrend = [
    { month: '2025-12', days: 12 },
    { month: '2026-01', days: 10 },
    { month: '2026-02', days: 8 },
    { month: '2026-03', days: 7 },
  ]

  const recurrenceTrend = [
    { month: '2025-12', rate: 8 },
    { month: '2026-01', rate: 6 },
    { month: '2026-02', rate: 5 },
    { month: '2026-03', rate: 4 },
  ]

  const columns = [
    { key: 'id', label: t('quality.issueId'), sortable: true },
    { key: 'description', label: t('quality.issueDesc') },
    {
      key: 'category',
      label: t('quality.issueCategory'),
      render: (row: DataQualityIssue) => t(`category.${row.category}`),
    },
    { key: 'dept', label: t('readiness.dept'), sortable: true },
    { key: 'assignee', label: t('readiness.assignee') },
    {
      key: 'severity',
      label: t('quality.severity'),
      render: (row: DataQualityIssue) => (
        <span className={clsx('px-2 py-0.5 rounded-full text-xs font-medium', severityColors[row.severity])}>
          {t(`severity.${row.severity}`)}
        </span>
      ),
    },
    {
      key: 'status',
      label: t('common.status'),
      render: (row: DataQualityIssue) => <StatusBadge status={row.status} label={t(`status.${row.status}`)} />,
    },
    { key: 'foundDate', label: t('quality.foundDate'), sortable: true },
  ]

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-slate-900">{t('nav.dataQuality')}</h2>
        </div>
        <div className="flex gap-2">
          <button className="flex items-center gap-1.5 px-3 py-2 text-sm bg-primary-600 text-white rounded-lg hover:bg-primary-700">
            <Plus size={14} />
            {t('quality.newIssue')}
          </button>
          <button className="flex items-center gap-1.5 px-3 py-2 text-sm border border-slate-200 rounded-lg hover:bg-white">
            <Upload size={14} />
            {t('quality.batchImport')}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <h3 className="text-sm font-medium text-slate-700 mb-3">{t('quality.statsByDept')}</h3>
          <div className="flex items-center">
            <ResponsiveContainer width="50%" height={200}>
              <PieChart>
                <Pie data={byDept} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={70} label>
                  {byDept.map((_, i) => (
                    <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            <ResponsiveContainer width="50%" height={200}>
              <BarChart data={byDept}>
                <XAxis dataKey="name" tick={{ fontSize: 10 }} angle={-20} textAnchor="end" height={50} />
                <YAxis tick={{ fontSize: 10 }} />
                <Tooltip />
                <Bar dataKey="value" fill="#059669" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <h3 className="text-sm font-medium text-slate-700 mb-3">{t('quality.statsByStatus')}</h3>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={byStatusStack}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="category" tick={{ fontSize: 10 }} />
              <YAxis tick={{ fontSize: 10 }} />
              <Tooltip />
              <Legend />
              <Bar dataKey="pending_confirm" stackId="a" fill="#fbbf24" name={t('status.pending_confirm')} />
              <Bar dataKey="in_progress" stackId="a" fill="#3b82f6" name={t('status.in_progress')} />
              <Bar dataKey="resolved" stackId="a" fill="#34d399" name={t('status.resolved')} />
              <Bar dataKey="verified_closed" stackId="a" fill="#94a3b8" name={t('status.verified_closed')} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <h3 className="text-sm font-medium text-slate-700 mb-3">{t('quality.resolveTrend')}</h3>
          <ResponsiveContainer width="100%" height={180}>
            <LineChart data={resolveTrend}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="month" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip />
              <Line type="monotone" dataKey="days" stroke="#059669" strokeWidth={2} dot={{ r: 4 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <h3 className="text-sm font-medium text-slate-700 mb-3">{t('quality.recurrenceTrend')}</h3>
          <ResponsiveContainer width="100%" height={180}>
            <LineChart data={recurrenceTrend}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="month" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} unit="%" />
              <Tooltip />
              <Line type="monotone" dataKey="rate" stroke="#047857" strokeWidth={2} dot={{ r: 4 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      <DataTable
        columns={columns}
        data={mockDataQualityIssues}
        exportFilename="data_quality.csv"
        rowKey={(row) => row.id}
        rowClassName={(row) => (row.isOverdue ? 'bg-red-50/50' : '')}
      />
    </div>
  )
}
