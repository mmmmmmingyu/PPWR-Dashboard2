import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AppLayout } from './components/layout/AppLayout'
import KpiDashboard from './pages/risk/KpiDashboard'
import AnomalyRisk from './pages/risk/AnomalyRisk'
import ProductReadiness from './pages/readiness/ProductReadiness'
import RegionReadiness from './pages/readiness/RegionReadiness'
import DataQuality from './pages/quality/DataQuality'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<AppLayout />}>
          <Route index element={<KpiDashboard />} />
          <Route path="anomaly" element={<AnomalyRisk />} />
          <Route path="product-readiness" element={<ProductReadiness />} />
          <Route path="region-readiness" element={<RegionReadiness />} />
          <Route path="data-quality" element={<DataQuality />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}
