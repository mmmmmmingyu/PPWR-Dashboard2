import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Search } from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'
import { useAppStore } from '../../store/appStore'
import { calcReadinessFromRows, useProductReadinessStore } from '../../store/productReadinessStore'
import { ColumnManager, ColumnManagerButton } from '../../components/readiness/ColumnManager'
import { ProductReadinessTable } from '../../components/readiness/ProductReadinessTable'
import { bt } from '../../utils/helpers'

export default function ProductReadiness() {
  const { t } = useTranslation()
  const lang = useAppStore((s) => s.language)
  const role = useAppStore((s) => s.role)
  const rows = useProductReadinessStore((s) => s.rows)
  const [search, setSearch] = useState('')
  const [showColumnManager, setShowColumnManager] = useState(false)

  const overall = calcReadinessFromRows(rows)

  const byIndustry = useMemo(() => {
    const map = new Map<string, { done: number; total: number }>()
    rows.forEach((p) => {
      const cur = map.get(p.industry) ?? { done: 0, total: 0 }
      p.nodes.forEach((n) => {
        cur.total++
        if (n.status === 'completed') cur.done++
      })
      map.set(p.industry, cur)
    })
    return Array.from(map.entries()).map(([name, v]) => ({
      name,
      value: v.total ? Math.round((v.done / v.total) * 100) : 0,
    }))
  }, [rows])

  const filtered = rows.filter(
    (p) =>
      !search ||
      p.code.includes(search) ||
      p.industry.includes(search) ||
      bt(p.description, lang).toLowerCase().includes(search.toLowerCase()),
  )

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-slate-900">{t('nav.productReadiness')}</h2>
          <p className="text-xs text-slate-500 mt-0.5">{t('readiness.overallProduct')}</p>
        </div>
        {role === 'admin' && <ColumnManagerButton onClick={() => setShowColumnManager(true)} />}
      </div>

      {/* 紧凑看板 */}
      <div className="bg-white rounded-lg border border-slate-200 px-4 py-3 flex flex-col lg:flex-row lg:items-center gap-3 lg:gap-6">
        <div className="flex items-center gap-3 shrink-0">
          <div>
            <p className="text-[10px] text-slate-400 leading-tight">{t('readiness.overallProduct')}</p>
            <p className="text-2xl font-bold text-primary-700 tabular-nums leading-tight">{overall}%</p>
          </div>
          <div className="w-24 h-1.5 bg-slate-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-primary-400 to-primary-700 rounded-full"
              style={{ width: `${overall}%` }}
            />
          </div>
        </div>

        <div className="flex-1 min-w-0">
          <p className="text-[10px] text-slate-400 mb-1">{lang === 'zh' ? '按产业准备度' : 'By Industry'}</p>
          <ResponsiveContainer width="100%" height={56}>
            <BarChart data={byIndustry} layout="vertical" margin={{ left: 0, right: 8, top: 0, bottom: 0 }}>
              <XAxis type="number" domain={[0, 100]} tick={{ fontSize: 9 }} hide />
              <YAxis type="category" dataKey="name" tick={{ fontSize: 10 }} width={64} />
              <Tooltip />
              <Bar dataKey="value" fill="#059669" radius={[0, 3, 3, 0]} barSize={10} />
            </BarChart>
          </ResponsiveContainer>
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
          <span className="text-xs text-slate-400">{lang === 'zh' ? '点击单元格可直接编辑' : 'Click cells to edit'}</span>
        )}
      </div>

      <ProductReadinessTable data={filtered} />

      <ColumnManager open={showColumnManager} onClose={() => setShowColumnManager(false)} />
    </div>
  )
}
