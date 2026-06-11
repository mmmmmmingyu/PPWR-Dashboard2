import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Settings } from 'lucide-react'
import { useAppStore } from '../store/appStore'
import { ProcessFlowCanvas } from '../components/home/ProcessFlowCanvas'
import { ProcessFlowConfigPanel } from '../components/home/ProcessFlowConfigPanel'

export default function Home() {
  const { t } = useTranslation()
  const role = useAppStore((s) => s.role)
  const [configMode, setConfigMode] = useState(false)

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold text-slate-900">{t('home.title')}</h2>
          <p className="text-sm text-slate-500 mt-0.5">{t('home.subtitle')}</p>
        </div>
        {role === 'admin' && (
          <button
            type="button"
            onClick={() => setConfigMode(!configMode)}
            className="flex items-center gap-1.5 px-3 py-2 text-sm border border-slate-200 rounded-lg hover:bg-white shrink-0"
          >
            <Settings size={14} />
            {configMode ? t('processFlow.exitConfig') : t('processFlow.openConfig')}
          </button>
        )}
      </div>

      {configMode && role === 'admin' ? (
        <ProcessFlowConfigPanel onClose={() => setConfigMode(false)} />
      ) : (
        <ProcessFlowCanvas />
      )}
    </div>
  )
}
