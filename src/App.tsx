import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AppLayout } from './components/layout/AppLayout'
import Home from './pages/Home'
import KpiDashboard from './pages/risk/KpiDashboard'
import AnomalyRisk from './pages/risk/AnomalyRisk'
import ProductReadiness from './pages/readiness/ProductReadiness'
import RegionReadiness from './pages/readiness/RegionReadiness'
import DataQuality from './pages/quality/DataQuality'
import ImporterAnomaly from './pages/risk/ImporterAnomaly'
import CodeShipmentAnomaly from './pages/risk/CodeShipmentAnomaly'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<AppLayout />}>
          <Route index element={<Home />} />
          <Route path="kpi" element={<KpiDashboard />} />
          <Route path="anomaly" element={<AnomalyRisk />} />
          <Route path="importer-anomaly" element={<ImporterAnomaly />} />
          <Route path="code-shipment-anomaly" element={<CodeShipmentAnomaly />} />
          <Route path="product-readiness" element={<ProductReadiness />} />
          <Route path="region-readiness" element={<RegionReadiness />} />
          <Route path="data-quality" element={<DataQuality />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}
