import { useTranslation } from 'react-i18next'
import { Construction } from 'lucide-react'

interface UnderConstructionProps {
  titleKey: string
}

export function UnderConstruction({ titleKey }: UnderConstructionProps) {
  const { t } = useTranslation()

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-lg font-semibold text-slate-900">{t(titleKey)}</h2>
      </div>
      <div className="bg-white rounded-xl border border-slate-200 p-12 text-center">
        <Construction size={36} className="mx-auto text-slate-400 mb-3" />
        <p className="text-sm text-slate-500">{t('common.underConstruction')}</p>
      </div>
    </div>
  )
}
