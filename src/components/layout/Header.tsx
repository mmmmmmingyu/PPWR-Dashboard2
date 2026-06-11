import { Link, useLocation } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useAppStore } from '../../store/appStore'
import { REGULATIONS } from '../../config/regulations'
import { Globe, ChevronDown, Home } from 'lucide-react'
import { useState } from 'react'
import i18n from '../../i18n'

export function Header() {
  const { t } = useTranslation()
  const location = useLocation()
  const { regulation, language, role, setRegulation, setLanguage, setRole } = useAppStore()
  const [regOpen, setRegOpen] = useState(false)

  const currentReg = REGULATIONS.find((r) => r.id === regulation)!
  const showHomeLink = location.pathname !== '/'

  return (
    <header className="h-14 bg-white border-b border-slate-200 flex items-center justify-between px-6 shrink-0">
      <div className="flex items-center gap-4">
        <Link to="/" className="flex items-center gap-2 hover:opacity-90 transition-opacity">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary-500 to-primary-800 flex items-center justify-center">
            <span className="text-white text-xs font-bold">HC</span>
          </div>
          <div>
            <h1 className="text-sm font-semibold text-slate-900 leading-tight">{t('app.title')}</h1>
            <p className="text-[10px] text-slate-400 leading-tight">{t('app.subtitle')}</p>
          </div>
        </Link>

        {showHomeLink && (
          <Link
            to="/"
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-50 hover:text-primary-700 hover:border-primary-200 transition-colors"
          >
            <Home size={14} />
            {t('home.backToHome')}
          </Link>
        )}

        <div className="relative ml-4">
          <button
            className="flex items-center gap-2 px-3 py-1.5 bg-primary-50 text-primary-700 rounded-lg text-sm font-medium hover:bg-primary-100"
            onClick={() => setRegOpen(!regOpen)}
          >
            {currentReg.name[language]}
            <ChevronDown size={14} />
          </button>
          {regOpen && (
            <div className="absolute top-full left-0 mt-1 z-30 bg-white border rounded-lg shadow-lg py-1 min-w-[200px]">
              {REGULATIONS.map((r) => (
                <button
                  key={r.id}
                  className={`w-full text-left px-4 py-2 text-sm hover:bg-slate-50 ${r.id === regulation ? 'text-primary-700 font-medium' : 'text-slate-600'}`}
                  onClick={() => { setRegulation(r.id); setRegOpen(false) }}
                >
                  {r.name[language]}
                  {!r.enabled && <span className="ml-2 text-xs text-slate-400">(Soon)</span>}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="flex items-center gap-3">
        <select
          value={role}
          onChange={(e) => setRole(e.target.value as typeof role)}
          className="text-xs border border-slate-200 rounded-lg px-2 py-1.5 text-slate-600"
        >
          {(['admin', 'domain_owner', 'user'] as const).map((r) => (
            <option key={r} value={r}>{t(`roles.${r}`)}</option>
          ))}
        </select>

        <button
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs border border-slate-200 rounded-lg hover:bg-slate-50"
          onClick={() => {
            const next = language === 'zh' ? 'en' : 'zh'
            setLanguage(next)
            i18n.changeLanguage(next)
          }}
        >
          <Globe size={14} />
          {language === 'zh' ? 'EN' : '中文'}
        </button>
      </div>
    </header>
  )
}
