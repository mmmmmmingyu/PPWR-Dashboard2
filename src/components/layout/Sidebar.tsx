import { NavLink } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import {
  LayoutDashboard,
  AlertTriangle,
  FileCheck,
  Globe2,
  Database,
  ChevronRight,
} from 'lucide-react'
import clsx from 'clsx'

const navItems = [
  {
    group: 'nav.riskOps',
    items: [
      { to: '/', icon: LayoutDashboard, label: 'nav.kpiDashboard' },
      { to: '/anomaly', icon: AlertTriangle, label: 'nav.anomalyRisk' },
    ],
  },
  {
    group: 'nav.switchReadiness',
    items: [
      { to: '/product-readiness', icon: FileCheck, label: 'nav.productReadiness' },
      { to: '/region-readiness', icon: Globe2, label: 'nav.regionReadiness' },
    ],
  },
  {
    group: 'nav.dataQuality',
    items: [
      { to: '/data-quality', icon: Database, label: 'nav.dataQuality' },
    ],
  },
]

export function Sidebar() {
  const { t } = useTranslation()

  return (
    <aside className="w-56 bg-white border-r border-slate-200 shrink-0 overflow-y-auto">
      <nav className="p-3 space-y-4">
        {navItems.map((group) => (
          <div key={group.group}>
            <p className="px-3 mb-1 text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
              {t(group.group)}
            </p>
            <div className="space-y-0.5">
              {group.items.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.to === '/'}
                  className={({ isActive }) =>
                    clsx(
                      'flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-colors',
                      isActive
                        ? 'bg-primary-50 text-primary-700 font-medium'
                        : 'text-slate-600 hover:bg-slate-50',
                    )
                  }
                >
                  <item.icon size={16} />
                  <span className="flex-1">{t(item.label)}</span>
                  <ChevronRight size={12} className="opacity-0 group-hover:opacity-100" />
                </NavLink>
              ))}
            </div>
          </div>
        ))}
      </nav>
    </aside>
  )
}
