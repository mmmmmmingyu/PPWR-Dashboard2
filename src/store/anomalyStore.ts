import { create } from 'zustand'
import { mockAnomalies } from '../mock/data'
import type { AnomalyRecord, BaselineChangeType, BaselineImpactDetail } from '../types'

let anomalySeq = 4

function nextId() {
  anomalySeq += 1
  return `A${String(anomalySeq).padStart(3, '0')}`
}

/** 模拟影响分析：根据变更对象生成受影响明细 */
export function analyzeBaselineImpact(object: string, changeType: BaselineChangeType): BaselineImpactDetail {
  const seed = object.length
  const codes = Array.from({ length: (seed % 3) + 2 }, (_, i) => `0235${seed}${String.fromCharCode(65 + i)}${i}`)
  const contracts = Array.from({ length: (seed % 2) + 1 }, (_, i) => ({
    contractNo: `${changeType === 'country' ? 'DE' : 'PO'}-${object.slice(0, 2).toUpperCase()}-2026-${String(i + 1).padStart(3, '0')}`,
    country: changeType === 'country' ? object : undefined,
  }))
  const batches = contracts.flatMap((c, i) =>
    Array.from({ length: (seed % 2) + 1 }, (_, j) => ({
      batchNo: `B20260${seed}${i}${j}`,
      contractNo: c.contractNo,
    })),
  )
  const shipments = batches.flatMap((b, i) =>
    codes.slice(0, Math.min(codes.length, 2)).map((code, j) => ({
      code,
      contractNo: b.contractNo ?? '',
      batchNo: b.batchNo,
      quantity: 200 + seed * 10 + i * 50 + j * 30,
      shipDate: `2026-03-${String(10 + i + j).padStart(2, '0')}`,
    })),
  )
  return { codes, contracts, batches, shipments }
}

function buildImpactScope(impact: BaselineImpactDetail, object: string): string {
  const qty = impact.shipments.reduce((s, x) => s + x.quantity, 0)
  return `${object} / ${impact.contracts.length}合同 / ${impact.batches.length}批次 / 预估 ${qty}`
}

function toBaselineRecord(
  changeType: BaselineChangeType,
  object: string,
  partial?: Partial<AnomalyRecord> & { impact?: BaselineImpactDetail },
): AnomalyRecord {
  const impact = partial?.impact ?? analyzeBaselineImpact(object, changeType)
  const { impact: _impact, ...rest } = partial ?? {}
  return {
    id: nextId(),
    scene: 'baseline_change',
    changeType,
    object,
    impact,
    codes: impact.codes,
    impactScope: buildImpactScope(impact, object),
    status: 'pending',
    createdAt: new Date().toISOString().slice(0, 10),
    ...rest,
  }
}

interface AnomalyState {
  records: AnomalyRecord[]
  addBaseline: (
    changeType: BaselineChangeType,
    object: string,
    options?: { changeReason?: string; impact?: BaselineImpactDetail },
  ) => void
  addBaselines: (items: { changeType: BaselineChangeType; object: string }[]) => void
  updateRecord: (id: string, patch: Partial<AnomalyRecord>) => void
}

export const useAnomalyStore = create<AnomalyState>((set) => ({
  records: mockAnomalies.map((r) => ({ ...r })),

  addBaseline: (changeType, object, options) => {
    set((s) => ({
      records: [
        ...s.records,
        toBaselineRecord(changeType, object, {
          changeReason: options?.changeReason,
          impact: options?.impact,
        }),
      ],
    }))
  },

  addBaselines: (items) => {
    set((s) => ({
      records: [...s.records, ...items.map((item) => toBaselineRecord(item.changeType, item.object))],
    }))
  },

  updateRecord: (id, patch) => {
    set((s) => ({
      records: s.records.map((r) => (r.id === id ? { ...r, ...patch } : r)),
    }))
  },
}))

export function getBaselineMetrics(impact?: BaselineImpactDetail) {
  if (!impact) return { codeCount: 0, contractCount: 0, batchCount: 0, shipmentVolume: 0 }
  return {
    codeCount: impact.codes.length,
    contractCount: impact.contracts.length,
    batchCount: impact.batches.length,
    shipmentVolume: impact.shipments.reduce((s, x) => s + x.quantity, 0),
  }
}

export type ImpactDetailType = 'codes' | 'contracts' | 'batches' | 'shipments'
