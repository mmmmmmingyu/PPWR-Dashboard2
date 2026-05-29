import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts'
import { mockCountryProgress, calcRegionReadiness } from '../../mock/data'
import { REGION_SWITCH_NODES } from '../../config/regulations'
import { DataTable } from '../../components/common/DataTable'
import { StatusBadge, bt } from '../../utils/helpers'
import { useAppStore } from '../../store/appStore'
import type { CountryProgress } from '../../types'

const REGION_COLORS = ['#059669', '#34d399', '#6ee7b7', '#a7f3d0']

export default function RegionReadiness() {
  const { t } = useTranslation()
  const lang = useAppStore((s) => s.language)
  const overall = calcRegionReadiness(mockCountryProgress)

  const byRegion = useMemo(() => {
    const map = new Map<string, { done: number; total: number }>()
    mockCountryProgress.forEach((c) => {
      const cur = map.get(c.region) ?? { done: 0, total: 0 }
      c.nodes.forEach((n) => {
        cur.total++
        if (n.status === 'completed') cur.done++
      })
      map.set(c.region, cur)
    })
    return Array.from(map.entries()).map(([name, v]) => ({
      name,
      value: v.total ? Math.round((v.done / v.total) * 100) : 0,
    }))
  }, [])

  const countryData = mockCountryProgress.map((c) => {
    const done = c.nodes.filter((n) => n.status === 'completed').length
    return { name: c.country, value: Math.round((done / c.nodes.length) * 100) }
  })

  const columns = [
    { key: 'country', label: t('readiness.country'), sortable: true },
    { key: 'region', label: t('readiness.region'), sortable: true },
    ...REGION_SWITCH_NODES.map((n) => ({
      key: n.id,
      label: bt(n.name, lang),
      render: (row: CountryProgress) => {
        const prog = row.nodes.find((pn) => pn.nodeId === n.id)
        if (!prog) return '—'
        return (
          <div className="space-y-0.5">
            <StatusBadge status={prog.status} label={t(`status.${prog.status}`)} />
            <p className="text-[10px] text-slate-400">{prog.assignee} · {prog.dueDate}</p>
          </div>
        )
      },
    })),
  ]

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-slate-900">{t('nav.regionReadiness')}</h2>
        <p className="text-sm text-slate-500 mt-0.5">{t('readiness.overallRegion')}</p>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl border border-slate-200 p-5 flex flex-col items-center justify-center">
          <p className="text-sm text-slate-500 mb-2">{t('readiness.overallRegion')}</p>
          <p className="text-4xl font-bold text-primary-700">{overall}%</p>
          <div className="w-full mt-3 h-3 bg-slate-100 rounded-full overflow-hidden">
            <div className="h-full bg-gradient-to-r from-primary-400 to-primary-700 rounded-full" style={{ width: `${overall}%` }} />
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <h3 className="text-sm font-medium text-slate-700 mb-3">{lang === 'zh' ? '按区域对比' : 'By Region'}</h3>
          <ResponsiveContainer width="100%" height={120}>
            <BarChart data={byRegion}>
              <XAxis dataKey="name" tick={{ fontSize: 11 }} />
              <YAxis domain={[0, 100]} tick={{ fontSize: 11 }} />
              <Tooltip />
              <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                {byRegion.map((_, i) => (
                  <Cell key={i} fill={REGION_COLORS[i % REGION_COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <h3 className="text-sm font-medium text-slate-700 mb-3">{lang === 'zh' ? '按国家对比' : 'By Country'}</h3>
          <ResponsiveContainer width="100%" height={120}>
            <BarChart data={countryData} layout="vertical">
              <XAxis type="number" domain={[0, 100]} tick={{ fontSize: 10 }} />
              <YAxis type="category" dataKey="name" tick={{ fontSize: 10 }} width={50} />
              <Tooltip />
              <Bar dataKey="value" fill="#047857" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <DataTable
        columns={columns}
        data={mockCountryProgress}
        exportFilename="region_readiness.csv"
        rowKey={(row) => row.country}
      />
    </div>
  )
}
