import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Pencil, Trash2, X, Plus } from 'lucide-react'
import { bt } from '../../utils/helpers'
import { useAppStore } from '../../store/appStore'
import type { BilingualText, SwitchNode } from '../../types'

export interface ReadinessColumnStore {
  columns: SwitchNode[]
  addColumn: (name: BilingualText, defaultDept: string) => void
  updateColumn: (id: string, patch: Partial<Pick<SwitchNode, 'name' | 'defaultDept'>>) => void
  deleteColumn: (id: string) => void
}

interface ColumnManagerProps {
  open: boolean
  onClose: () => void
  store: ReadinessColumnStore
}

export function ColumnManager({ open, onClose, store }: ColumnManagerProps) {
  const { t } = useTranslation()
  const lang = useAppStore((s) => s.language)
  const { columns, addColumn, updateColumn, deleteColumn } = store
  const [editing, setEditing] = useState<SwitchNode | null>(null)
  const [form, setForm] = useState({ nameZh: '', nameEn: '', defaultDept: '' })

  if (!open) return null

  const resetForm = () => {
    setForm({ nameZh: '', nameEn: '', defaultDept: '' })
    setEditing(null)
  }

  const startEdit = (col: SwitchNode) => {
    setEditing(col)
    setForm({ nameZh: col.name.zh, nameEn: col.name.en, defaultDept: col.defaultDept })
  }

  const handleSave = () => {
    if (!form.nameZh.trim() || !form.nameEn.trim()) return
    const name = { zh: form.nameZh.trim(), en: form.nameEn.trim() }
    if (editing) {
      updateColumn(editing.id, { name, defaultDept: form.defaultDept })
    } else {
      addColumn(name, form.defaultDept || '合规部')
    }
    resetForm()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
      <div className="bg-white rounded-xl border border-slate-200 shadow-xl w-full max-w-lg mx-4 max-h-[80vh] flex flex-col">
        <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100">
          <h3 className="text-sm font-semibold text-slate-900">{t('readiness.manageColumns')}</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 p-1">
            <X size={16} />
          </button>
        </div>

        <div className="p-4 space-y-3 overflow-y-auto flex-1">
          <div className="space-y-2">
            {columns.map((col) => (
              <div key={col.id} className="flex items-center justify-between gap-2 px-3 py-2 bg-slate-50 rounded-lg">
                <span className="text-sm text-slate-700">{bt(col.name, lang)}</span>
                <div className="flex gap-1">
                  <button onClick={() => startEdit(col)} className="p-1 text-slate-400 hover:text-primary-600">
                    <Pencil size={14} />
                  </button>
                  <button
                    onClick={() => {
                      if (window.confirm(t('readiness.confirmDeleteColumn'))) deleteColumn(col.id)
                    }}
                    className="p-1 text-slate-400 hover:text-red-500"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="border-t border-slate-100 pt-3 space-y-2">
            <p className="text-xs font-medium text-slate-500">
              {editing ? t('readiness.editColumn') : t('readiness.addColumn')}
            </p>
            <input
              value={form.nameZh}
              onChange={(e) => setForm((f) => ({ ...f, nameZh: e.target.value }))}
              placeholder={t('readiness.columnNameZh')}
              className="w-full border border-slate-200 rounded-lg px-3 py-1.5 text-sm"
            />
            <input
              value={form.nameEn}
              onChange={(e) => setForm((f) => ({ ...f, nameEn: e.target.value }))}
              placeholder={t('readiness.columnNameEn')}
              className="w-full border border-slate-200 rounded-lg px-3 py-1.5 text-sm"
            />
            <input
              value={form.defaultDept}
              onChange={(e) => setForm((f) => ({ ...f, defaultDept: e.target.value }))}
              placeholder={t('readiness.defaultDept')}
              className="w-full border border-slate-200 rounded-lg px-3 py-1.5 text-sm"
            />
            <div className="flex gap-2">
              <button
                onClick={handleSave}
                className="px-3 py-1.5 text-xs bg-primary-600 text-white rounded-lg hover:bg-primary-700"
              >
                {t('common.save')}
              </button>
              {editing && (
                <button onClick={resetForm} className="px-3 py-1.5 text-xs border border-slate-200 rounded-lg">
                  {t('common.cancel')}
                </button>
              )}
            </div>
          </div>
        </div>

        <div className="px-4 py-3 border-t border-slate-100 flex justify-end">
          <button
            onClick={() => { resetForm(); onClose() }}
            className="px-3 py-1.5 text-sm border border-slate-200 rounded-lg hover:bg-slate-50"
          >
            {t('common.confirm')}
          </button>
        </div>
      </div>
    </div>
  )
}

export function ColumnManagerButton({ onClick }: { onClick: () => void }) {
  const { t } = useTranslation()
  return (
    <button
      onClick={onClick}
      className="flex items-center gap-1.5 px-3 py-1.5 text-sm border border-slate-200 rounded-lg hover:bg-white bg-slate-50"
    >
      <Plus size={14} />
      {t('readiness.manageColumns')}
    </button>
  )
}
