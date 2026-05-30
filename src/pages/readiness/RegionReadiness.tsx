import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Search } from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts'
import { useAppStore } from '../../store/appStore'
import { calcRegionReadinessFromRows, useRegionReadinessStore } from '../../store/regionReadinessStore'
import { ColumnManager, ColumnManagerButton } from '../../components/readiness/ColumnManager'
import { RegionReadinessTable } from '../../components/readiness/RegionReadinessTable'

const OFFICE_COLORS = ['#059669', '#34d399', '#047857', '#6ee7b7']

export default function RegionReadiness() {
  const { t } = useTranslation()
  const lang = useAppStore((s) => s.language)
  const role = useAppStore((s) => s.role)
  const store = useRegionReadinessStore()
  const rows = store.rows
  const [search, setSearch] = useState('')
  const [showColumnManager, setShowColumnManager] = useState(false)

  const overall = calcRegionReadinessFromRows(rows)

  const byOffice = useMemo(() => {
    const map = new Map<string, { done: number; total: number }>()
    rows.forEach((c) => {
      const cur = map.get(c.office) ?? { done: 0, total: 0 }
      c.nodes.forEach((n) => {
        cur.total++
        if (n.status === 'completed') cur.done++
      })
      map.set(c.office, cur)
    })
    return Array.from(map.entries()).map(([name, v]) => ({
      name,
      value: v.total ? Math.round((v.done / v.total) * 100) : 0,
    }))
  }, [rows])

  const byCountry = useMemo(() => {
    return rows.map((c) => {
      const done = c.nodes.filter((n) => n.status === 'completed').length
      return { name: c.country, value: Math.round((done / c.nodes.length) * 100) }
    })
  }, [rows])

  const filtered = rows.filter(
    (r) =>
      !search ||
      r.country.includes(search) ||
      r.office.includes(search),
  )

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-slate-900">{t('nav.regionReadiness')}</h2>
          <p className="text-xs text-slate-500 mt-0.5">{t('readiness.overallRegion')}</p>
        </div>
        {role === 'admin' && <ColumnManagerButton onClick={() => setShowColumnManager(true)} />}
      </div>

      <div className="bg-white rounded-xl border border-slate-200 p-5 w-full max-h-[50vh]">
        <div className="flex flex-col lg:flex-row gap-6 items-stretch max-h-[calc(50vh-2.5rem)]">
          <div className="lg:w-48 shrink-0 flex flex-col justify-center gap-3">
            <div>
              <p className="text-sm text-slate-500 mb-1">{t('readiness.overallRegion')}</p>
              <p className="text-4xl font-bold text-primary-700 tabular-nums">{overall}%</p>
            </div>
            <div className="h-2.5 bg-slate-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-primary-400 to-primary-700 rounded-full transition-all"
                style={{ width: `${overall}%` }}
              />
            </div>
          </div>

          <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-5 min-w-0">
            <div className="flex flex-col">
              <p className="text-sm text-slate-500 mb-2">{lang === 'zh' ? '按代表处' : 'By Office'}</p>
              <div className="h-[min(200px,calc(50vh-10rem))]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={byOffice} margin={{ left: 0, right: 8, top: 8, bottom: 8 }}>
                    <XAxis dataKey="name" tick={{ fontSize: 11 }} interval={0} />
                    <YAxis domain={[0, 100]} tick={{ fontSize: 11 }} width={32} />
                    <Tooltip />
                    <Bar dataKey="value" radius={[4, 4, 0, 0]} barSize={24}>
                      {byOffice.map((_, i) => (
                        <Cell key={i} fill={OFFICE_COLORS[i % OFFICE_COLORS.length]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
            <div className="flex flex-col">
              <p className="text-sm text-slate-500 mb-2">{lang === 'zh' ? '按国家' : 'By Country'}</p>
              <div className="h-[min(200px,calc(50vh-10rem))]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={byCountry} layout="vertical" margin={{ left: 0, right: 8, top: 8, bottom: 8 }}>
                    <XAxis type="number" domain={[0, 100]} tick={{ fontSize: 11 }} />
                    <YAxis type="category" dataKey="name" tick={{ fontSize: 11 }} width={52} />
                    <Tooltip />
                    <Bar dataKey="value" fill="#047857" radius={[0, 4, 4, 0]} barSize={14} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-xs">
          <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={`${t('common.search')}...`}
            className="w-full pl-8 pr-3 py-1.5 border border-slate-200 rounded-lg text-sm"
          />
        </div>
        {(role === 'admin' || role === 'domain_owner') && (
          <span className="text-xs text-slate-400">{t('readiness.clickToEdit')}</span>
        )}
      </div>

      <RegionReadinessTable data={filtered} />

      <ColumnManager open={showColumnManager} onClose={() => setShowColumnManager(false)} store={store} />
    </div>
  )
}
