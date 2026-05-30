import type { KpiDefinition, RegulationType, SwitchNode, BaselineChangeType } from '../types'

export const REGULATIONS: { id: RegulationType; name: { zh: string; en: string }; enabled: boolean }[] = [
  { id: 'PPWR', name: { zh: 'PPWR 包装法规', en: 'PPWR Packaging' }, enabled: true },
  { id: 'CBAM', name: { zh: 'CBAM 碳边境调节', en: 'CBAM Carbon' }, enabled: true },
  { id: 'WEEE', name: { zh: 'WEEE 电子废弃物', en: 'WEEE E-Waste' }, enabled: true },
  { id: 'BATTERY', name: { zh: '电池法规', en: 'Battery Regulation' }, enabled: true },
]

export const PPWR_KPIS: KpiDefinition[] = [
  {
    id: 'audit_pass_rate',
    name: { zh: '外部审计通过率', en: 'External Audit Pass Rate' },
    unit: '%',
    target: 95,
    description: {
      zh: '统计周期内通过外部审计的产线/国家占比',
      en: 'Percentage of production lines/countries passing external audits in the period',
    },
  },
  {
    id: 'ppwr_code_ratio',
    name: { zh: '满足PPWR编码占比', en: 'PPWR-Compliant Code Ratio' },
    unit: '%',
    target: 90,
    description: {
      zh: '已完成PPWR合规评定的产品编码占总编码比例',
      en: 'Ratio of product codes with completed PPWR compliance assessment',
    },
  },
  {
    id: 'ppwr_shipment_ratio',
    name: { zh: '满足PPWR发货量占比', en: 'PPWR-Compliant Shipment Ratio' },
    unit: '%',
    target: 85,
    description: {
      zh: '使用合规编码发货的数量占总发货量比例',
      en: 'Ratio of shipments using compliant codes to total shipments',
    },
  },
  {
    id: 'boq_reduction_rate',
    name: { zh: '存量BOQ消减率', en: 'Legacy BOQ Reduction Rate' },
    unit: '%',
    target: 80,
    description: {
      zh: '已消减的存量BOQ条目占切换前总BOQ比例',
      en: 'Ratio of reduced legacy BOQ items to pre-switch total BOQ',
    },
  },
  {
    id: 'importer_data_completeness',
    name: { zh: '进口商数据完整率', en: 'Importer Data Completeness' },
    unit: '%',
    target: 98,
    description: {
      zh: '进口商必填字段完整填写的比例',
      en: 'Percentage of importer mandatory fields fully completed',
    },
  },
  {
    id: 'doc_switch_readiness',
    name: { zh: 'DOC切换准备度', en: 'DOC Switch Readiness' },
    unit: '%',
    target: 92,
    description: {
      zh: 'DOC文件切换相关节点完成比例',
      en: 'Completion ratio of DOC file switch related nodes',
    },
  },
]

export const CBAM_KPIS: KpiDefinition[] = [
  {
    id: 'carbon_report_rate',
    name: { zh: '碳排放报告完成率', en: 'Carbon Report Completion Rate' },
    unit: '%',
    target: 90,
    description: { zh: 'CBAM碳排放报告提交完成比例', en: 'CBAM carbon emission report submission rate' },
  },
  {
    id: 'emission_data_accuracy',
    name: { zh: '排放数据准确率', en: 'Emission Data Accuracy' },
    unit: '%',
    target: 95,
    description: { zh: '经核验的排放数据准确率', en: 'Verified emission data accuracy rate' },
  },
]

export const KPI_BY_REGULATION: Record<RegulationType, KpiDefinition[]> = {
  PPWR: PPWR_KPIS,
  CBAM: CBAM_KPIS,
  WEEE: PPWR_KPIS.slice(0, 3).map((k) => ({
    ...k,
    name: { zh: k.name.zh.replace('PPWR', 'WEEE'), en: k.name.en.replace('PPWR', 'WEEE') },
  })),
  BATTERY: PPWR_KPIS.slice(0, 3).map((k) => ({
    ...k,
    name: { zh: k.name.zh.replace('PPWR', '电池'), en: k.name.en.replace('PPWR', 'Battery') },
  })),
}

export const PRODUCT_SWITCH_NODES: SwitchNode[] = [
  {
    id: 'n1',
    name: { zh: '合规评定申请', en: 'Compliance Assessment Application' },
    defaultDept: '质量部',
    leadDays: 90,
    deliverableRequired: true,
    dependencies: [],
  },
  {
    id: 'n2',
    name: { zh: '第三方测试报告', en: 'Third-party Test Report' },
    defaultDept: '质量部',
    leadDays: 75,
    deliverableRequired: true,
    dependencies: ['n1'],
  },
  {
    id: 'n3',
    name: { zh: 'DOC文件编制', en: 'DOC Document Preparation' },
    defaultDept: '合规部',
    leadDays: 60,
    deliverableRequired: true,
    dependencies: ['n2'],
  },
  {
    id: 'n4',
    name: { zh: '标签设计确认', en: 'Label Design Confirmation' },
    defaultDept: '产品部',
    leadDays: 45,
    deliverableRequired: true,
    dependencies: ['n3'],
  },
  {
    id: 'n5',
    name: { zh: '系统编码切换', en: 'System Code Switch' },
    defaultDept: 'IT部',
    leadDays: 30,
    deliverableRequired: false,
    dependencies: ['n4'],
  },
]

export const REGION_SWITCH_NODES: SwitchNode[] = [
  {
    id: 'r1',
    name: { zh: '当地注册完成', en: 'Local Registration Complete' },
    defaultDept: '海外合规部',
    leadDays: 120,
    deliverableRequired: true,
    dependencies: [],
  },
  {
    id: 'r2',
    name: { zh: '进口商协议签署', en: 'Importer Agreement Signed' },
    defaultDept: '商务部',
    leadDays: 90,
    deliverableRequired: true,
    dependencies: ['r1'],
  },
  {
    id: 'r3',
    name: { zh: '仓储合规改造', en: 'Warehouse Compliance Upgrade' },
    defaultDept: '供应链部',
    leadDays: 60,
    deliverableRequired: true,
    dependencies: ['r2'],
  },
  {
    id: 'r4',
    name: { zh: '清关流程更新', en: 'Customs Process Update' },
    defaultDept: '物流部',
    leadDays: 45,
    deliverableRequired: true,
    dependencies: ['r3'],
  },
]

export const ANOMALY_SCENES = [
  { id: 'baseline_change' as const, name: { zh: '切换对象基线例外变更风险', en: 'Baseline Exception Change Risk' } },
]

export const BASELINE_CHANGE_TYPES: { id: BaselineChangeType; name: { zh: string; en: string } }[] = [
  { id: 'country', name: { zh: '国家', en: 'Country' } },
  { id: 'product_code', name: { zh: '产品编码', en: 'Product Code' } },
  { id: 'contract', name: { zh: '合同', en: 'Contract' } },
  { id: 'batch', name: { zh: '批次', en: 'Batch' } },
]
