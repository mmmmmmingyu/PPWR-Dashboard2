import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Plus, Trash2, RotateCcw, Save, ChevronUp, ChevronDown } from 'lucide-react'
import clsx from 'clsx'
import { NAV_MENU_OPTIONS } from '../../config/navMenus'
import { useAppStore } from '../../store/appStore'
import {
  activityLabel,
  orderedSubPhases,
  sortedStages,
  sortedRoles,
  subPhasesForStage,
  useProcessFlowStore,
} from '../../store/processFlowStore'
import { ProcessFlowCanvas } from './ProcessFlowCanvas'
import type { Language } from '../../types'

type ConfigTab = 'stages' | 'subPhases' | 'roles' | 'activities' | 'connections' | 'overlays'

const TABS: ConfigTab[] = ['stages', 'subPhases', 'roles', 'activities', 'connections', 'overlays']

function BilingualInputs({
  zh,
  en,
  onChange,
  lang,
}: {
  zh: string
  en: string
  onChange: (field: 'zh' | 'en', value: string) => void
  lang: Language
}) {
  return (
    <div className="grid grid-cols-2 gap-2">
      <input
        value={lang === 'zh' ? zh : en}
        onChange={(e) => onChange(lang, e.target.value)}
        className="border border-slate-200 rounded-lg px-2 py-1.5 text-sm col-span-2"
        placeholder={lang === 'zh' ? '中文名称' : 'English name'}
      />
      <input
        value={zh}
        onChange={(e) => onChange('zh', e.target.value)}
        className="border border-slate-200 rounded-lg px-2 py-1.5 text-xs"
        placeholder="中文"
      />
      <input
        value={en}
        onChange={(e) => onChange('en', e.target.value)}
        className="border border-slate-200 rounded-lg px-2 py-1.5 text-xs"
        placeholder="English"
      />
    </div>
  )
}

export function ProcessFlowConfigPanel({ onClose }: { onClose: () => void }) {
  const { t } = useTranslation()
  const lang = useAppStore((s) => s.language)
  const store = useProcessFlowStore()
  const [tab, setTab] = useState<ConfigTab>('stages')
  const [selectedOverlayId, setSelectedOverlayId] = useState<string | null>(null)
  const [connFrom, setConnFrom] = useState('')
  const [connTo, setConnTo] = useState('')
  const [saveTip, setSaveTip] = useState(false)

  const stages = sortedStages(store.stages)
  const roleList = sortedRoles(store.roles)
  const subPhaseList = orderedSubPhases(store.stages, store.subPhases)
  const selectedOverlay = store.overlays.find((o) => o.id === selectedOverlayId)

  const handleSave = () => {
    store.saveConfig()
    setSaveTip(true)
    window.setTimeout(() => setSaveTip(false), 2000)
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h3 className="text-sm font-semibold text-slate-900">{t('processFlow.configTitle')}</h3>
          <p className="text-xs text-slate-500 mt-0.5">{t('processFlow.configDesc')}</p>
        </div>
        <div className="flex gap-2 items-center flex-wrap justify-end">
          {saveTip && (
            <span className="text-xs text-primary-600">{t('processFlow.savedOk')}</span>
          )}
          {store.lastSavedAt && (
            <span className="text-[10px] text-slate-400 hidden sm:inline">
              {t('processFlow.lastSaved')}: {new Date(store.lastSavedAt).toLocaleString()}
            </span>
          )}
          <button
            type="button"
            onClick={handleSave}
            className="flex items-center gap-1 px-3 py-1.5 text-xs bg-primary-600 text-white rounded-lg hover:bg-primary-700"
          >
            <Save size={12} />
            {t('processFlow.saveConfig')}
          </button>
          <button
            type="button"
            onClick={() => store.resetToDefault()}
            className="flex items-center gap-1 px-3 py-1.5 text-xs border border-slate-200 rounded-lg hover:bg-slate-50"
          >
            <RotateCcw size={12} />
            {t('processFlow.resetDefault')}
          </button>
          <button
            type="button"
            onClick={onClose}
            className="px-3 py-1.5 text-xs border border-slate-200 rounded-lg hover:bg-slate-50"
          >
            {t('processFlow.finishConfig')}
          </button>
        </div>
      </div>

      <div className="flex flex-wrap gap-1 border-b border-slate-200 pb-2">
        {TABS.map((key) => (
          <button
            key={key}
            type="button"
            onClick={() => setTab(key)}
            className={clsx(
              'px-3 py-1.5 text-xs rounded-lg transition-colors',
              tab === key ? 'bg-primary-100 text-primary-800 font-medium' : 'text-slate-500 hover:bg-slate-50',
            )}
          >
            {t(`processFlow.tab_${key}`)}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        <div className="bg-white rounded-xl border border-slate-200 p-4 max-h-[520px] overflow-y-auto space-y-3">
          {tab === 'stages' && (
            <>
              <button
                type="button"
                onClick={() =>
                  store.addStage({
                    name: { zh: '新主流程段', en: 'New Stage' },
                    order: store.stages.length,
                  })
                }
                className="flex items-center gap-1 text-xs text-primary-600 hover:underline"
              >
                <Plus size={12} />
                {t('processFlow.addStage')}
              </button>
              {stages.map((stage) => (
                <div key={stage.id} className="border border-slate-100 rounded-lg p-3 space-y-2">
                  <BilingualInputs
                    zh={stage.name.zh}
                    en={stage.name.en}
                    lang={lang}
                    onChange={(field, value) =>
                      store.updateStage(stage.id, { name: { ...stage.name, [field]: value } })
                    }
                  />
                  <div className="flex items-center gap-2">
                    <label className="text-xs text-slate-500">{t('processFlow.order')}</label>
                    <input
                      type="number"
                      value={stage.order}
                      onChange={(e) => store.updateStage(stage.id, { order: Number(e.target.value) })}
                      className="w-16 border rounded px-2 py-1 text-xs"
                    />
                    <button
                      type="button"
                      onClick={() => store.removeStage(stage.id)}
                      className="ml-auto text-red-400 hover:text-red-600 p-1"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              ))}
            </>
          )}

          {tab === 'subPhases' && (
            <>
              <button
                type="button"
                onClick={() => {
                  const stageId = stages[0]?.id ?? ''
                  if (!stageId) return
                  store.addSubPhase({
                    stageId,
                    name: { zh: '新子流程段', en: 'New Sub-phase' },
                    order: store.subPhases.filter((sp) => sp.stageId === stageId).length,
                  })
                }}
                className="flex items-center gap-1 text-xs text-primary-600 hover:underline"
              >
                <Plus size={12} />
                {t('processFlow.addSubPhase')}
              </button>
              {stages.map((stage) => (
                <div key={stage.id} className="space-y-2">
                  <p className="text-xs font-medium text-slate-600">{stage.name[lang]}</p>
                  {subPhasesForStage(store.subPhases, stage.id).map((sp) => (
                    <div key={sp.id} className="border border-slate-100 rounded-lg p-3 space-y-2 ml-2">
                      <BilingualInputs
                        zh={sp.name.zh}
                        en={sp.name.en}
                        lang={lang}
                        onChange={(field, value) =>
                          store.updateSubPhase(sp.id, { name: { ...sp.name, [field]: value } })
                        }
                      />
                      <div className="flex items-center gap-2 flex-wrap">
                        <select
                          value={sp.stageId}
                          onChange={(e) => store.updateSubPhase(sp.id, { stageId: e.target.value })}
                          className="text-xs border rounded-lg px-2 py-1"
                        >
                          {stages.map((s) => (
                            <option key={s.id} value={s.id}>
                              {s.name[lang]}
                            </option>
                          ))}
                        </select>
                        <input
                          type="number"
                          value={sp.order}
                          onChange={(e) => store.updateSubPhase(sp.id, { order: Number(e.target.value) })}
                          className="w-16 border rounded px-2 py-1 text-xs"
                          title={t('processFlow.order')}
                        />
                        <button
                          type="button"
                          onClick={() => store.removeSubPhase(sp.id)}
                          className="ml-auto text-red-400 hover:text-red-600 p-1"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ))}
            </>
          )}

          {tab === 'roles' && (
            <>
              <button
                type="button"
                onClick={() =>
                  store.addRole({
                    name: { zh: '新角色', en: 'New Role' },
                    order: store.roles.length,
                  })
                }
                className="flex items-center gap-1 text-xs text-primary-600 hover:underline"
              >
                <Plus size={12} />
                {t('processFlow.addRole')}
              </button>
              {roleList.map((role, index) => (
                <div key={role.id} className="border border-slate-100 rounded-lg p-3 space-y-2">
                  <BilingualInputs
                    zh={role.name.zh}
                    en={role.name.en}
                    lang={lang}
                    onChange={(field, value) =>
                      store.updateRole(role.id, { name: { ...role.name, [field]: value } })
                    }
                  />
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      disabled={index === 0}
                      onClick={() => store.moveRole(role.id, 'up')}
                      title={t('processFlow.moveUp')}
                      className="p-1 rounded border border-slate-200 text-slate-500 hover:bg-slate-50 disabled:opacity-30 disabled:cursor-not-allowed"
                    >
                      <ChevronUp size={14} />
                    </button>
                    <button
                      type="button"
                      disabled={index === roleList.length - 1}
                      onClick={() => store.moveRole(role.id, 'down')}
                      title={t('processFlow.moveDown')}
                      className="p-1 rounded border border-slate-200 text-slate-500 hover:bg-slate-50 disabled:opacity-30 disabled:cursor-not-allowed"
                    >
                      <ChevronDown size={14} />
                    </button>
                    <span className="text-[10px] text-slate-400 ml-1">
                      {t('processFlow.order')} {index + 1}
                    </span>
                    <button
                      type="button"
                      onClick={() => store.removeRole(role.id)}
                      className="ml-auto text-red-400 hover:text-red-600 p-1"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              ))}
            </>
          )}

          {tab === 'activities' && (
            <>
              <button
                type="button"
                onClick={() => {
                  const sp = store.subPhases[0]
                  const role = sortedRoles(store.roles)[0]
                  if (!sp || !role) return
                  store.addActivity({
                    subPhaseId: sp.id,
                    roleId: role.id,
                    num: String(store.activities.length + 1),
                    title: { zh: '新活动', en: 'New Activity' },
                    sortOrder: store.activities.filter((a) => a.subPhaseId === sp.id).length,
                  })
                }}
                className="flex items-center gap-1 text-xs text-primary-600 hover:underline"
              >
                <Plus size={12} />
                {t('processFlow.addActivity')}
              </button>
              {store.activities.map((act) => (
                <div key={act.id} className="border border-slate-100 rounded-lg p-3 space-y-2">
                  <div className="flex gap-2">
                    <input
                      value={act.num}
                      onChange={(e) => store.updateActivity(act.id, { num: e.target.value })}
                      className="w-12 border rounded px-2 py-1 text-xs"
                      placeholder="#"
                    />
                    <BilingualInputs
                      zh={act.title.zh}
                      en={act.title.en}
                      lang={lang}
                      onChange={(field, value) =>
                        store.updateActivity(act.id, { title: { ...act.title, [field]: value } })
                      }
                    />
                  </div>
                  <div className="flex flex-wrap gap-2 items-center">
                    <select
                      value={act.subPhaseId}
                      onChange={(e) => store.updateActivity(act.id, { subPhaseId: e.target.value })}
                      className="text-xs border rounded-lg px-2 py-1 flex-1 min-w-[120px]"
                    >
                      {store.subPhases.map((sp) => {
                        const st = store.stages.find((s) => s.id === sp.stageId)
                        return (
                          <option key={sp.id} value={sp.id}>
                            {st?.name[lang]} / {sp.name[lang]}
                          </option>
                        )
                      })}
                    </select>
                    <select
                      value={act.roleId}
                      onChange={(e) => store.updateActivity(act.id, { roleId: e.target.value })}
                      className="text-xs border rounded-lg px-2 py-1 flex-1 min-w-[100px]"
                    >
                      {sortedRoles(store.roles).map((r) => (
                        <option key={r.id} value={r.id}>
                          {r.name[lang]}
                        </option>
                      ))}
                    </select>
                    <label className="flex items-center gap-1 text-xs text-slate-600">
                      <input
                        type="checkbox"
                        checked={!!act.highlight}
                        onChange={(e) => store.updateActivity(act.id, { highlight: e.target.checked })}
                      />
                      {t('processFlow.highlight')}
                    </label>
                    <button
                      type="button"
                      onClick={() => store.removeActivity(act.id)}
                      className="text-red-400 hover:text-red-600 p-1"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              ))}
            </>
          )}

          {tab === 'connections' && (
            <>
              <p className="text-xs text-slate-500">{t('processFlow.connectionHint')}</p>
              <div className="flex flex-wrap gap-2 items-end border border-slate-100 rounded-lg p-3">
                <div className="flex-1 min-w-[140px]">
                  <label className="text-[10px] text-slate-400">{t('processFlow.fromActivity')}</label>
                  <select
                    value={connFrom}
                    onChange={(e) => setConnFrom(e.target.value)}
                    className="w-full text-xs border rounded-lg px-2 py-1.5 mt-0.5"
                  >
                    <option value="">—</option>
                    {store.activities.map((a) => (
                      <option key={a.id} value={a.id}>
                        {activityLabel(store.activities, a.id, lang)}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="flex-1 min-w-[140px]">
                  <label className="text-[10px] text-slate-400">{t('processFlow.toActivity')}</label>
                  <select
                    value={connTo}
                    onChange={(e) => setConnTo(e.target.value)}
                    className="w-full text-xs border rounded-lg px-2 py-1.5 mt-0.5"
                  >
                    <option value="">—</option>
                    {store.activities.map((a) => (
                      <option key={a.id} value={a.id}>
                        {activityLabel(store.activities, a.id, lang)}
                      </option>
                    ))}
                  </select>
                </div>
                <button
                  type="button"
                  disabled={!connFrom || !connTo || connFrom === connTo}
                  onClick={() => {
                    store.addConnection({ fromActivityId: connFrom, toActivityId: connTo })
                    setConnFrom('')
                    setConnTo('')
                  }}
                  className="px-3 py-1.5 text-xs bg-primary-600 text-white rounded-lg disabled:opacity-40"
                >
                  {t('processFlow.addConnection')}
                </button>
              </div>
              {store.connections.map((c) => (
                <div
                  key={c.id}
                  className="flex items-center justify-between text-xs border border-slate-100 rounded-lg px-3 py-2"
                >
                  <span className="text-slate-600">
                    {activityLabel(store.activities, c.fromActivityId, lang)}
                    <span className="mx-2 text-slate-300">→</span>
                    {activityLabel(store.activities, c.toActivityId, lang)}
                  </span>
                  <button
                    type="button"
                    onClick={() => store.removeConnection(c.id)}
                    className="text-red-400 hover:text-red-600 p-1"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              ))}
            </>
          )}

          {tab === 'overlays' && (
            <>
              <p className="text-xs text-slate-500">{t('processFlow.overlayHint')}</p>
              <button
                type="button"
                onClick={() => {
                  const id = store.addOverlay({
                    label: { zh: '新蒙板', en: 'New Overlay' },
                    menuPath: NAV_MENU_OPTIONS[0]?.path ?? '/kpi',
                    subPhaseStartId: subPhaseList[0]?.id ?? '',
                    subPhaseEndId: subPhaseList[0]?.id ?? '',
                    roleStartId: roleList[0]?.id ?? '',
                    roleEndId: roleList[0]?.id ?? '',
                  })
                  setSelectedOverlayId(id)
                }}
                className="flex items-center gap-1 text-xs text-primary-600 hover:underline"
              >
                <Plus size={12} />
                {t('processFlow.addOverlay')}
              </button>
              {store.overlays.map((ov) => (
                <div
                  key={ov.id}
                  className={clsx(
                    'border rounded-lg p-3 space-y-2 cursor-pointer',
                    selectedOverlayId === ov.id ? 'border-primary-400 bg-primary-50/30' : 'border-slate-100',
                  )}
                  onClick={() => setSelectedOverlayId(ov.id)}
                >
                  <BilingualInputs
                    zh={ov.label.zh}
                    en={ov.label.en}
                    lang={lang}
                    onChange={(field, value) =>
                      store.updateOverlay(ov.id, { label: { ...ov.label, [field]: value } })
                    }
                  />
                  <div>
                    <label className="text-[10px] text-slate-400">{t('processFlow.menuPath')}</label>
                    <select
                      value={ov.menuPath}
                      onChange={(e) => store.updateOverlay(ov.id, { menuPath: e.target.value })}
                      className="w-full text-xs border rounded-lg px-2 py-1.5 mt-0.5"
                    >
                      {NAV_MENU_OPTIONS.map((m) => (
                        <option key={m.path} value={m.path}>
                          {t(m.labelKey)}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-[10px] text-slate-400">{t('processFlow.subPhaseStart')}</label>
                      <select
                        value={ov.subPhaseStartId}
                        onChange={(e) => store.updateOverlay(ov.id, { subPhaseStartId: e.target.value })}
                        className="w-full text-xs border rounded-lg px-2 py-1.5 mt-0.5"
                      >
                        {subPhaseList.map((sp) => {
                          const st = stages.find((s) => s.id === sp.stageId)
                          return (
                            <option key={sp.id} value={sp.id}>
                              {st?.name[lang]} · {sp.name[lang]}
                            </option>
                          )
                        })}
                      </select>
                    </div>
                    <div>
                      <label className="text-[10px] text-slate-400">{t('processFlow.subPhaseEnd')}</label>
                      <select
                        value={ov.subPhaseEndId}
                        onChange={(e) => store.updateOverlay(ov.id, { subPhaseEndId: e.target.value })}
                        className="w-full text-xs border rounded-lg px-2 py-1.5 mt-0.5"
                      >
                        {subPhaseList.map((sp) => {
                          const st = stages.find((s) => s.id === sp.stageId)
                          return (
                            <option key={sp.id} value={sp.id}>
                              {st?.name[lang]} · {sp.name[lang]}
                            </option>
                          )
                        })}
                      </select>
                    </div>
                    <div>
                      <label className="text-[10px] text-slate-400">{t('processFlow.roleStart')}</label>
                      <select
                        value={ov.roleStartId}
                        onChange={(e) => store.updateOverlay(ov.id, { roleStartId: e.target.value })}
                        className="w-full text-xs border rounded-lg px-2 py-1.5 mt-0.5"
                      >
                        {roleList.map((r) => (
                          <option key={r.id} value={r.id}>{r.name[lang]}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="text-[10px] text-slate-400">{t('processFlow.roleEnd')}</label>
                      <select
                        value={ov.roleEndId}
                        onChange={(e) => store.updateOverlay(ov.id, { roleEndId: e.target.value })}
                        className="w-full text-xs border rounded-lg px-2 py-1.5 mt-0.5"
                      >
                        {roleList.map((r) => (
                          <option key={r.id} value={r.id}>{r.name[lang]}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-3 text-xs text-slate-600">
                    <label className="flex items-center gap-1">
                      <input
                        type="checkbox"
                        checked={ov.visible !== false}
                        onChange={(e) => store.updateOverlay(ov.id, { visible: e.target.checked })}
                      />
                      {t('processFlow.overlayVisible')}
                    </label>
                    <label className="flex items-center gap-1">
                      <input
                        type="checkbox"
                        checked={!!ov.coverStageRow}
                        onChange={(e) => store.updateOverlay(ov.id, { coverStageRow: e.target.checked })}
                      />
                      {t('processFlow.coverStageRow')}
                    </label>
                    <label className="flex items-center gap-1">
                      <input
                        type="checkbox"
                        checked={!!ov.coverSubPhaseRow}
                        onChange={(e) => store.updateOverlay(ov.id, { coverSubPhaseRow: e.target.checked })}
                      />
                      {t('processFlow.coverSubPhaseRow')}
                    </label>
                  </div>
                  <div className="grid grid-cols-4 gap-2">
                    {(['padTop', 'padRight', 'padBottom', 'padLeft'] as const).map((key) => (
                      <div key={key}>
                        <label className="text-[10px] text-slate-400">{t(`processFlow.${key}`)}</label>
                        <input
                          type="number"
                          min={0}
                          max={40}
                          value={ov[key] ?? 0}
                          onChange={(e) => store.updateOverlay(ov.id, { [key]: Number(e.target.value) })}
                          className="w-full border rounded px-2 py-1 text-xs mt-0.5"
                        />
                      </div>
                    ))}
                  </div>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation()
                      store.removeOverlay(ov.id)
                      if (selectedOverlayId === ov.id) setSelectedOverlayId(null)
                    }}
                    className="text-red-400 hover:text-red-600 p-1"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              ))}
              {selectedOverlay && (
                <p className="text-[10px] text-primary-600">{t('processFlow.overlaySelected')}</p>
              )}
            </>
          )}
        </div>

        <div className="xl:sticky xl:top-0 self-start">
          <p className="text-xs text-slate-500 mb-2">{t('processFlow.livePreview')}</p>
          <ProcessFlowCanvas
            overlayEditMode={tab === 'overlays'}
            selectedOverlayId={tab === 'overlays' ? selectedOverlayId : null}
            onSelectOverlay={tab === 'overlays' ? setSelectedOverlayId : undefined}
          />
        </div>
      </div>
    </div>
  )
}
