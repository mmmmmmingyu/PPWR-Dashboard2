import { NavLink } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import {
  Home,
  LayoutDashboard,
  AlertTriangle,
  FileCheck,
  Globe2,
  Database,
  Building2,
  Ship,
  PanelLeftClose,
  PanelLeftOpen,
} from 'lucide-react'
import clsx from 'clsx'
import { useAppStore } from '../../store/appStore'

const navItems = [
  {
    group: 'nav.homeGroup',
    items: [{ to: '/', icon: Home, label: 'nav.home', end: true }],
  },
  {
    group: 'nav.riskOps',
    items: [
      { to: '/kpi', icon: LayoutDashboard, label: 'nav.kpiDashboard' },
      { to: '/anomaly', icon: AlertTriangle, label: 'nav.anomalyRisk' },
      { to: '/importer-anomaly', icon: Building2, label: 'nav.importerAnomaly' },
      { to: '/code-shipment-anomaly', icon: Ship, label: 'nav.codeShipmentAnomaly' },
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
    items: [{ to: '/data-quality', icon: Database, label: 'nav.dataQuality' }],
  },
]

export function Sidebar() {
  const { t } = useTranslation()
  const sidebarExpanded = useAppStore((s) => s.sidebarExpanded)
  const toggleSidebar = useAppStore((s) => s.toggleSidebar)

  return (
    <aside
      className={clsx(
        'bg-white border-r border-slate-200 shrink-0 overflow-y-auto overflow-x-hidden transition-[width] duration-200 flex flex-col',
        sidebarExpanded ? 'w-56' : 'w-14',
      )}
    >
      <div className={clsx('shrink-0 border-b border-slate-100', sidebarExpanded ? 'p-2' : 'p-1.5')}>
        <button
          type="button"
          onClick={toggleSidebar}
          title={sidebarExpanded ? t('nav.collapseSidebar') : t('nav.expandSidebar')}
          className={clsx(
            'flex items-center rounded-lg text-slate-500 hover:text-primary-700 hover:bg-slate-50 transition-colors',
            sidebarExpanded ? 'w-full gap-2 px-3 py-2 text-xs' : 'w-full justify-center p-2',
          )}
        >
          {sidebarExpanded ? <PanelLeftClose size={16} className="shrink-0" /> : <PanelLeftOpen size={16} />}
          {sidebarExpanded && <span>{t('nav.collapseSidebar')}</span>}
        </button>
      </div>

      <nav className={clsx('flex-1', sidebarExpanded ? 'p-3 space-y-4' : 'p-1.5 space-y-2')}>
        {navItems.map((group) => (
          <div key={group.group}>
            {sidebarExpanded && (
              <p className="px-3 mb-1 text-[10px] font-semibold text-slate-400 uppercase tracking-wider truncate">
                {t(group.group)}
              </p>
            )}
            <div className="space-y-0.5">
              {group.items.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={'end' in item ? item.end : false}
                  title={!sidebarExpanded ? t(item.label) : undefined}
                  className={({ isActive }) =>
                    clsx(
                      'flex items-center rounded-lg text-sm transition-colors',
                      sidebarExpanded ? 'gap-2.5 px-3 py-2' : 'justify-center p-2.5',
                      isActive
                        ? 'bg-primary-50 text-primary-700 font-medium'
                        : 'text-slate-600 hover:bg-slate-50',
                    )
                  }
                >
                  <item.icon size={16} className="shrink-0" />
                  {sidebarExpanded && (
                    <span className="flex-1 leading-snug truncate">{t(item.label)}</span>
                  )}
                </NavLink>
              ))}
            </div>
          </div>
        ))}
      </nav>
    </aside>
  )
}
