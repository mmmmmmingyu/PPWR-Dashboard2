/** 首页蒙板可跳转的菜单项 */
export interface NavMenuOption {
  path: string
  labelKey: string
}

export const NAV_MENU_OPTIONS: NavMenuOption[] = [
  { path: '/kpi', labelKey: 'nav.kpiDashboard' },
  { path: '/anomaly', labelKey: 'nav.anomalyRisk' },
  { path: '/importer-anomaly', labelKey: 'nav.importerAnomaly' },
  { path: '/code-shipment-anomaly', labelKey: 'nav.codeShipmentAnomaly' },
  { path: '/product-readiness', labelKey: 'nav.productReadiness' },
  { path: '/region-readiness', labelKey: 'nav.regionReadiness' },
  { path: '/data-quality', labelKey: 'nav.dataQuality' },
]
