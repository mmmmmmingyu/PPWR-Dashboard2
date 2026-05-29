import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import {
  ComposedChart, Line, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  BarChart,
} from 'recharts'
import { useAppStore } from '../../store/appStore'
import { KPI_BY_REGULATION } from '../../config/regulations'
import { mockKpiValues } from '../../mock/data'
import { KpiCard } from '../../components/common/KpiCard'
import { bt } from '../../utils/helpers'

const HEAT_COLORS = ['#ef4444', '#f97316', '#eab308', '#84cc16', '#22c55e', '#059669']

function heatColor(value: number) {
  const idx = Math.min(Math.floor(value / 20), HEAT_COLORS.length - 1)
  return HEAT_COLORS[Math.max(0, idx)]
}

export default function KpiDashboard() {
  const { t } = useTranslation()
  const regulation = useAppStore((s) => s.regulation)
  const lang = useAppStore((s) => s.language)
  const kpis = KPI_BY_REGULATION[regulation]
  const [selectedKpi, setSelectedKpi] = useState(kpis[0]?.id ?? '')

  const kpiData = mockKpiValues.find((k) => k.kpiId === selectedKpi) ?? mockKpiValues[0]
  const kpiDef = kpis.find((k) => k.id === selectedKpi) ?? kpis[0]

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-lg font-semibold text-slate-900">{t('nav.kpiDashboard')}</h2>
        <p className="text-sm text-slate-500 mt-0.5">{regulation} · {t('kpi.drillDown')}</p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
        {kpis.map((kpi) => {
          const val = mockKpiValues.find((v) => v.kpiId === kpi.id)
          if (!val) return null
          return (
            <KpiCard
              key={kpi.id}
              name={kpi.name}
              current={val.current}
              momChange={val.momChange}
              unit={kpi.unit}
              description={kpi.description}
              selected={selectedKpi === kpi.id}
              onClick={() => setSelectedKpi(kpi.id)}
            />
          )
        })}
      </div>

      {kpiData && kpiDef && (
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
          <div className="bg-white rounded-xl border border-slate-200 p-5">
            <h3 className="text-sm font-medium text-slate-700 mb-4">{t('kpi.trend')} — {bt(kpiDef.name, lang)}</h3>
            <ResponsiveContainer width="100%" height={280}>
              <ComposedChart data={kpiData.monthlyTrend}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} domain={[0, 100]} />
                <Tooltip />
                <Legend />
                <Bar dataKey="value" name={lang === 'zh' ? '指标值' : 'Value'} fill="#34d399" radius={[4, 4, 0, 0]} />
                <Line type="monotone" dataKey="target" name={t('common.target')} stroke="#065f46" strokeWidth={2} strokeDasharray="5 5" dot={false} />
              </ComposedChart>
            </ResponsiveContainer>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 p-5">
            <h3 className="text-sm font-medium text-slate-700 mb-4">{t('kpi.byIndustry')}</h3>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={kpiData.byIndustry} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis type="number" domain={[0, 100]} tick={{ fontSize: 11 }} />
                <YAxis type="category" dataKey="name" tick={{ fontSize: 11 }} width={80} />
                <Tooltip />
                <Bar dataKey="value" fill="url(#greenGrad)" radius={[0, 4, 4, 0]} />
                <defs>
                  <linearGradient id="greenGrad" x1="0" y1="0" x2="1" y2="0">
                    <stop offset="0%" stopColor="#34d399" />
                    <stop offset="100%" stopColor="#065f46" />
                  </linearGradient>
                </defs>
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 p-5 xl:col-span-2">
            <h3 className="text-sm font-medium text-slate-700 mb-4">{t('kpi.byCountry')}</h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
              {kpiData.byCountry.map((c) => (
                <div
                  key={c.country}
                  className="rounded-lg p-4 text-center transition-transform hover:scale-105 cursor-pointer"
                  style={{ backgroundColor: heatColor(c.value) + '20', borderLeft: `4px solid ${heatColor(c.value)}` }}
                >
                  <p className="text-xs text-slate-600 mb-1">{c.country}</p>
                  <p className="text-xl font-bold" style={{ color: heatColor(c.value) }}>{c.value}%</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
