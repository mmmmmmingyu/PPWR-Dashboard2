import { useState } from 'react'
import { ArrowUpDown, Download, Columns3 } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { exportCsv } from '../../utils/helpers'

export interface Column<T> {
  key: string
  label: string
  render?: (row: T) => React.ReactNode
  sortable?: boolean
}

interface DataTableProps<T> {
  columns: Column<T>[]
  data: T[]
  exportFilename?: string
  rowKey: (row: T) => string
  rowClassName?: (row: T) => string
}

export function DataTable<T>({
  columns,
  data,
  exportFilename,
  rowKey,
  rowClassName,
}: DataTableProps<T>) {
  const { t } = useTranslation()
  const [sortKey, setSortKey] = useState<string | null>(null)
  const [sortAsc, setSortAsc] = useState(true)
  const [visibleCols, setVisibleCols] = useState<Set<string>>(new Set(columns.map((c) => c.key)))
  const [showColPicker, setShowColPicker] = useState(false)

  const sorted = [...data].sort((a, b) => {
    if (!sortKey) return 0
    const av = String((a as Record<string, unknown>)[sortKey] ?? '')
    const bv = String((b as Record<string, unknown>)[sortKey] ?? '')
    return sortAsc ? av.localeCompare(bv) : bv.localeCompare(av)
  })

  const visible = columns.filter((c) => visibleCols.has(c.key))

  const handleExport = () => {
    if (!exportFilename) return
    exportCsv(
      exportFilename,
      visible.map((c) => c.label),
      sorted.map((row) => visible.map((c) => String((row as Record<string, unknown>)[c.key] ?? ''))),
    )
  }

  return (
    <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
      <div className="flex items-center justify-end gap-2 px-4 py-2 border-b border-slate-100">
        <div className="relative">
          <button
            className="flex items-center gap-1 px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-50 rounded-lg"
            onClick={() => setShowColPicker(!showColPicker)}
          >
            <Columns3 size={14} />
            {t('common.columns')}
          </button>
          {showColPicker && (
            <div className="absolute right-0 top-full mt-1 z-20 bg-white border rounded-lg shadow-lg p-2 min-w-[160px]">
              {columns.map((c) => (
                <label key={c.key} className="flex items-center gap-2 px-2 py-1 text-xs hover:bg-slate-50 rounded cursor-pointer">
                  <input
                    type="checkbox"
                    checked={visibleCols.has(c.key)}
                    onChange={() => {
                      const next = new Set(visibleCols)
                      if (next.has(c.key)) next.delete(c.key)
                      else next.add(c.key)
                      setVisibleCols(next)
                    }}
                  />
                  {c.label}
                </label>
              ))}
            </div>
          )}
        </div>
        {exportFilename && (
          <button
            className="flex items-center gap-1 px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-50 rounded-lg"
            onClick={handleExport}
          >
            <Download size={14} />
            {t('common.exportCsv')}
          </button>
        )}
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-slate-50 text-left">
              {visible.map((col) => (
                <th key={col.key} className="px-4 py-3 font-medium text-slate-600 whitespace-nowrap">
                  <button
                    className="flex items-center gap-1 hover:text-primary-600"
                    onClick={() => {
                      if (!col.sortable) return
                      if (sortKey === col.key) setSortAsc(!sortAsc)
                      else { setSortKey(col.key); setSortAsc(true) }
                    }}
                  >
                    {col.label}
                    {col.sortable && <ArrowUpDown size={12} className="opacity-40" />}
                  </button>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {sorted.length === 0 ? (
              <tr>
                <td colSpan={visible.length} className="px-4 py-8 text-center text-slate-400">
                  {t('common.noData')}
                </td>
              </tr>
            ) : (
              sorted.map((row) => (
                <tr
                  key={rowKey(row)}
                  className={`border-t border-slate-100 hover:bg-slate-50/50 ${rowClassName?.(row) ?? ''}`}
                >
                  {visible.map((col) => (
                    <td key={col.key} className="px-4 py-3 whitespace-nowrap">
                      {col.render ? col.render(row) : String((row as Record<string, unknown>)[col.key] ?? '')}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
