import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Settings } from 'lucide-react'
import { mockAnomalies } from '../../mock/data'
import { ANOMALY_SCENES } from '../../config/regulations'
import { DataTable, type Column } from '../../components/common/DataTable'
import { StatusBadge } from '../../utils/helpers'
import { useAppStore } from '../../store/appStore'
import type { AnomalyRecord, AnomalyScene } from '../../types'

function useActionColumn(
  setData: React.Dispatch<React.SetStateAction<AnomalyRecord[]>>,
  t: (key: string) => string,
): Column<AnomalyRecord> {
  return {
    key: 'actions',
    label: t('common.actions'),
    render: (row) => (
      <div className="flex gap-1">
        {row.status === 'pending' && (
          <button
            className="text-xs text-primary-600 hover:underline"
            onClick={() =>
              setData((prev) =>
                prev.map((a) => (a.id === row.id ? { ...a, status: 'analyzing' as const, assignee: '当前用户' } : a)),
              )
            }
          >
            {t('anomaly.assignee')}
          </button>
        )}
        {row.status === 'analyzing' && (
          <button
            className="text-xs text-primary-600 hover:underline"
            onClick={() =>
              setData((prev) => prev.map((a) => (a.id === row.id ? { ...a, status: 'closed' as const } : a)))
            }
          >
            {t('common.confirm')}
          </button>
        )}
      </div>
    ),
  }
}

function useAnomalyColumns(
  scene: AnomalyScene | 'all',
  setData: React.Dispatch<React.SetStateAction<AnomalyRecord[]>>,
): Column<AnomalyRecord>[] {
  const { t } = useTranslation()
  const lang = useAppStore((s) => s.language)
  const actions = useActionColumn(setData, t)

  const statusCol: Column<AnomalyRecord> = {
    key: 'status',
    label: t('common.status'),
    sortable: true,
    render: (row) => <StatusBadge status={row.status} label={t(`status.${row.status}`)} />,
  }

  const assigneeCol: Column<AnomalyRecord> = {
    key: 'assignee',
    label: t('anomaly.assignee'),
    render: (row) => row.assignee ?? '—',
  }

  const changeTypeCol: Column<AnomalyRecord> = {
    key: 'changeType',
    label: t('anomaly.changeType'),
    sortable: true,
    render: (row) => (row.changeType ? t(`anomaly.changeType_${row.changeType}`) : '—'),
  }

  const changeObjectCol: Column<AnomalyRecord> = {
    key: 'object',
    label: t('anomaly.changeObject'),
    sortable: true,
    render: (row) => row.object ?? '—',
  }

  const codesCol: Column<AnomalyRecord> = {
    key: 'codes',
    label: scene === 'baseline_change' ? (lang === 'zh' ? '涉及编码' : 'Related Codes') : t('anomaly.abnormalCode'),
    render: (row) => row.codes.join(', '),
  }

  const impactCol: Column<AnomalyRecord> = {
    key: 'impactScope',
    label: t('anomaly.impactScope'),
  }

  if (scene === 'baseline_change') {
    return [
      { key: 'id', label: 'ID', sortable: true },
      changeTypeCol,
      changeObjectCol,
      codesCol,
      impactCol,
      statusCol,
      assigneeCol,
      actions,
    ]
  }

  if (scene === 'code_shipment') {
    return [
      { key: 'id', label: 'ID', sortable: true },
      codesCol,
      { key: 'shipDate', label: t('anomaly.shipDate'), sortable: true },
      { key: 'quantity', label: t('anomaly.quantity'), sortable: true },
      { key: 'contractNo', label: t('anomaly.contractPo'), sortable: true },
      {
        key: 'deviationRate',
        label: t('anomaly.deviationRate'),
        sortable: true,
        render: (row) => (row.deviationRate != null ? `${row.deviationRate}%` : '—'),
      },
      impactCol,
      statusCol,
      assigneeCol,
      actions,
    ]
  }

  if (scene === 'discontinued_code') {
    return [
      { key: 'id', label: 'ID', sortable: true },
      codesCol,
      { key: 'discontinueDate', label: t('anomaly.discontinueDate'), sortable: true },
      { key: 'docNo', label: t('anomaly.docNo'), sortable: true },
      { key: 'quantity', label: t('anomaly.quantity'), sortable: true },
      impactCol,
      statusCol,
      assigneeCol,
      actions,
    ]
  }

  // 全部场景：变更类型/变更对象仅基线场景有值
  return [
    { key: 'id', label: 'ID', sortable: true },
    {
      key: 'scene',
      label: lang === 'zh' ? '场景' : 'Scene',
      render: (row) => ANOMALY_SCENES.find((s) => s.id === row.scene)?.name[lang] ?? row.scene,
    },
    {
      ...changeTypeCol,
      render: (row) => (row.scene === 'baseline_change' && row.changeType ? t(`anomaly.changeType_${row.changeType}`) : '—'),
    },
    {
      ...changeObjectCol,
      render: (row) => (row.scene === 'baseline_change' ? (row.object ?? '—') : '—'),
    },
    codesCol,
    {
      key: 'shipDate',
      label: t('anomaly.shipDate'),
      render: (row) => (row.scene === 'code_shipment' ? (row.shipDate ?? '—') : '—'),
    },
    {
      key: 'discontinueDate',
      label: t('anomaly.discontinueDate'),
      render: (row) => (row.scene === 'discontinued_code' ? (row.discontinueDate ?? '—') : '—'),
    },
    {
      key: 'docNo',
      label: t('anomaly.docNo'),
      render: (row) => (row.scene === 'discontinued_code' ? (row.docNo ?? '—') : '—'),
    },
    {
      key: 'deviationRate',
      label: t('anomaly.deviationRate'),
      render: (row) => (row.scene === 'code_shipment' && row.deviationRate != null ? `${row.deviationRate}%` : '—'),
    },
    impactCol,
    statusCol,
    assigneeCol,
    actions,
  ]
}

export default function AnomalyRisk() {
  const { t } = useTranslation()
  const lang = useAppStore((s) => s.language)
  const [scene, setScene] = useState<AnomalyScene | 'all'>('all')
  const [showConfig, setShowConfig] = useState(false)
  const [data, setData] = useState(mockAnomalies)

  const filtered = scene === 'all' ? data : data.filter((a) => a.scene === scene)
  const columns = useAnomalyColumns(scene, setData)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-slate-900">{t('nav.anomalyRisk')}</h2>
          <p className="text-sm text-slate-500 mt-0.5">{t('anomaly.scenes')}</p>
        </div>
        <button
          className="flex items-center gap-1.5 px-3 py-2 text-sm border border-slate-200 rounded-lg hover:bg-white"
          onClick={() => setShowConfig(!showConfig)}
        >
          <Settings size={14} />
          {t('anomaly.config')}
        </button>
      </div>

      {showConfig && (
        <div className="bg-white rounded-xl border border-slate-200 p-5 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="text-xs text-slate-500">{t('anomaly.threshold')}</label>
            <input type="number" defaultValue={3} className="mt-1 w-full border rounded-lg px-3 py-2 text-sm" />
            <p className="text-[10px] text-slate-400 mt-1">{lang === 'zh' ? '连续出现天数' : 'Consecutive days'}</p>
          </div>
          <div>
            <label className="text-xs text-slate-500">{t('anomaly.notification')}</label>
            <select className="mt-1 w-full border rounded-lg px-3 py-2 text-sm" defaultValue="email">
              <option value="email">{lang === 'zh' ? '邮件' : 'Email'}</option>
              <option value="wecom">{lang === 'zh' ? '企微' : 'WeCom'}</option>
              <option value="internal">{lang === 'zh' ? '站内信' : 'In-app'}</option>
            </select>
          </div>
          <div>
            <label className="text-xs text-slate-500">{t('anomaly.silencePeriod')}</label>
            <input type="number" defaultValue={24} className="mt-1 w-full border rounded-lg px-3 py-2 text-sm" />
            <p className="text-[10px] text-slate-400 mt-1">{lang === 'zh' ? '小时' : 'Hours'}</p>
          </div>
        </div>
      )}

      <div className="flex gap-2 flex-wrap">
        <button
          className={`px-3 py-1.5 rounded-lg text-sm ${scene === 'all' ? 'bg-primary-600 text-white' : 'bg-white border text-slate-600'}`}
          onClick={() => setScene('all')}
        >
          {t('common.all')}
        </button>
        {ANOMALY_SCENES.map((s) => (
          <button
            key={s.id}
            className={`px-3 py-1.5 rounded-lg text-sm ${scene === s.id ? 'bg-primary-600 text-white' : 'bg-white border text-slate-600'}`}
            onClick={() => setScene(s.id)}
          >
            {s.name[lang]}
          </button>
        ))}
      </div>

      <DataTable
        columns={columns}
        data={filtered}
        exportFilename="anomaly_risk.csv"
        rowKey={(row) => row.id}
      />
    </div>
  )
}
